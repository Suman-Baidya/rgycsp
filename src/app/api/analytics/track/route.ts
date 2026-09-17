import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

function parseUserAgent(ua: string) {
  let device = "Desktop";
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? "Tablet" : "Mobile";
  }

  let browser = "Other";
  if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

// In-memory lightweight rate limiter (per IP) to protect database in production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    
    // 1. Production Defense: Ignore automated search engine crawlers & scraping bots
    const isBot = /bot|crawler|spider|crawling|slurp|facebookexternalhit|bingbot|googlebot|semrush|ahrefs|yandex|baidu|bytespider/i.test(userAgent);

    const body = await req.json().catch(() => ({}));
    const { 
      type = "PAGE_VIEW", 
      visitorId, 
      workspaceId: providedWorkspaceId, 
      tenant,
      path = "/", 
      title = "",
      courseId,
      referrer = "",
      landingPage = "",
      durationSeconds = 0,
      // For leads:
      source = "WHATSAPP_CLICK",
      intent,
      name,
      phone,
      email,
      metadata = {}
    } = body;

    // Skip bot visits unless it's a real lead submission
    if (isBot && type !== "LEAD_INTENT") {
      return NextResponse.json({ success: true, ignored: "bot" });
    }

    if (!visitorId || typeof visitorId !== "string") {
      return NextResponse.json({ success: false, message: "Missing visitorId" }, { status: 400 });
    }

    // IP & Geolocation
    const forwardedFor = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "127.0.0.1";
    const rawIp = forwardedFor.split(",")[0].trim();
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

    // 2. Production Rate Limiter: Max 60 hits / min per IP hash
    const now = Date.now();
    const clientLimit = rateLimitMap.get(ipHash);
    if (clientLimit && clientLimit.resetAt > now) {
      if (clientLimit.count > 60 && type !== "LEAD_INTENT") {
        return NextResponse.json({ success: false, message: "Rate limit exceeded" }, { status: 429 });
      }
      clientLimit.count += 1;
    } else {
      if (rateLimitMap.size > 5000) rateLimitMap.clear(); // Periodic cleanup
      rateLimitMap.set(ipHash, { count: 1, resetAt: now + 60000 });
    }

    // Resolve workspace ID if tenant is passed
    let workspaceId = providedWorkspaceId || null;
    if (!workspaceId && tenant && tenant !== "super-admin" && tenant !== "root") {
      const ws = await db.workspace.findUnique({
        where: { subdomain: tenant.toLowerCase() },
        select: { id: true }
      });
      if (ws) {
        workspaceId = ws.id;
      }
    }

    const city = req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity") || undefined;
    const state = req.headers.get("x-vercel-ip-country-region") || req.headers.get("cf-region") || undefined;
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "India";

    const { device, browser, os } = parseUserAgent(userAgent);

    // Look for active session in the past 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let session = await db.visitorSession.findFirst({
      where: {
        visitorId,
        workspaceId: workspaceId ?? null,
        createdAt: { gte: yesterday }
      }
    });

    if (!session) {
      session = await db.visitorSession.create({
        data: {
          visitorId,
          workspaceId: workspaceId ?? null,
          ipHash,
          city,
          state,
          country,
          device,
          browser,
          os,
          referrer: referrer.slice(0, 500) || undefined,
          landingPage: (landingPage || path).slice(0, 500),
          totalVisits: 1
        }
      });
    } else {
      // Update session lastSeen & increment totalVisits
      await db.visitorSession.update({
        where: { id: session.id },
        data: {
          lastSeen: new Date(),
          totalVisits: { increment: 1 }
        }
      });
    }

    if (type === "LEAD_INTENT") {
      // Record captured lead
      await db.visitorLead.create({
        data: {
          sessionId: session.id,
          workspaceId: workspaceId ?? null,
          visitorId,
          name: name?.trim() || undefined,
          phone: phone?.trim() || undefined,
          email: email?.trim() || undefined,
          source: source.slice(0, 50),
          intent: intent?.slice(0, 255) || `Action: ${source} on ${path}`,
          metadata: metadata || {},
          status: "NEW"
        }
      });

      return NextResponse.json({ success: true, leadCaptured: true });
    }

    if (type === "PAGE_DURATION") {
      const duration = Math.max(1, Math.min(Number(durationSeconds) || 0, 7200));
      const latestVisit = await db.pageVisit.findFirst({
        where: {
          sessionId: session.id,
          path: path.slice(0, 255),
        },
        orderBy: { createdAt: "desc" },
      });

      if (latestVisit) {
        await db.pageVisit.update({
          where: { id: latestVisit.id },
          data: { durationSeconds: duration },
        });
      }
      return NextResponse.json({ success: true, durationRecorded: true });
    }

    // Default: Record Page Visit
    // Avoid duplicate logging of admin internal navigation
    const isAdminPath = path.startsWith("/admin") || path.startsWith("/super-admin") || path.includes("/admin/");
    if (!isAdminPath) {
      await db.pageVisit.create({
        data: {
          sessionId: session.id,
          workspaceId: workspaceId ?? null,
          path: path.slice(0, 255),
          title: title?.slice(0, 255) || undefined,
          courseId: courseId || undefined,
          durationSeconds: Math.max(0, Math.min(Number(durationSeconds) || 0, 7200))
        }
      });
    }

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ success: false, error: "Tracking failed" }, { status: 500 });
  }
}
