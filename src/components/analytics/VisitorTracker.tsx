"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "rgycsp_visitor_id";

function getOrGenerateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem(STORAGE_KEY);
    if (!vid) {
      vid = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(STORAGE_KEY, vid);
    }
    return vid;
  } catch (e) {
    return "v_anon_" + Math.random().toString(36).substring(2, 9);
  }
}

function detectTenantFromUrl(pathname: string): string | null {
  if (typeof window === "undefined") return null;
  // 1. Subdirectory check: /app/[tenant]
  if (pathname.startsWith("/app/")) {
    const parts = pathname.split("/");
    if (parts.length >= 3 && parts[2]) {
      return parts[2];
    }
  }

  // 2. Subdomain check
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length > 2 && !hostname.includes("localhost") && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "app" && sub !== "admin") {
      return sub;
    }
  }

  return null;
}

export function trackLeadEvent(payload: {
  source: string;
  intent?: string;
  name?: string;
  phone?: string;
  email?: string;
  metadata?: Record<string, any>;
  tenant?: string | null;
}) {
  if (typeof window === "undefined") return;
  const visitorId = getOrGenerateVisitorId();
  const pathname = window.location.pathname;
  const resolvedTenant = payload.tenant || detectTenantFromUrl(pathname);

  const data = JSON.stringify({
    type: "LEAD_INTENT",
    visitorId,
    path: pathname,
    title: document.title,
    tenant: resolvedTenant,
    ...payload,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([data], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
  } else {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
      keepalive: true,
    }).catch(() => {});
  }
}

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");
  const pageStartTime = useRef<number>(Date.now());

  const sendDuration = (targetPath: string, durationSec: number) => {
    if (!targetPath || durationSec <= 0) return;
    const visitorId = getOrGenerateVisitorId();
    const tenant = detectTenantFromUrl(targetPath);
    const data = JSON.stringify({
      type: "PAGE_DURATION",
      visitorId,
      path: targetPath,
      tenant,
      durationSeconds: durationSec,
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/track", blob);
    } else if (typeof fetch !== "undefined") {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  };

  useEffect(() => {
    // Ignore internal admin dashboards
    const isAdmin = pathname.startsWith("/super-admin") || pathname.startsWith("/admin") || pathname.includes("/admin/");
    if (isAdmin) return;

    // Send duration for previously viewed page
    if (lastTrackedPath.current && lastTrackedPath.current !== pathname) {
      const elapsed = Math.round((Date.now() - pageStartTime.current) / 1000);
      sendDuration(lastTrackedPath.current, elapsed);
    }

    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    pageStartTime.current = Date.now();

    const visitorId = getOrGenerateVisitorId();
    const tenant = detectTenantFromUrl(pathname);

    const payload = JSON.stringify({
      type: "PAGE_VIEW",
      visitorId,
      path: pathname,
      title: typeof document !== "undefined" ? document.title : "",
      tenant,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      landingPage: pathname,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }

    const handleBeforeUnload = () => {
      if (lastTrackedPath.current) {
        const elapsed = Math.round((Date.now() - pageStartTime.current) / 1000);
        sendDuration(lastTrackedPath.current, elapsed);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  // Global delegated click listener to detect WhatsApp & Call clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href") || "";
      const isWhatsApp = href.startsWith("https://wa.me") || href.includes("whatsapp.com") || target.hasAttribute("data-whatsapp");
      const isCall = href.startsWith("tel:") || target.hasAttribute("data-call");

      if (isWhatsApp) {
        trackLeadEvent({
          source: "WHATSAPP_CLICK",
          intent: `Clicked WhatsApp Contact on ${pathname}`,
          metadata: { link: href, pageTitle: document.title },
        });
      } else if (isCall) {
        const phone = href.replace("tel:", "").trim();
        trackLeadEvent({
          source: "CALL_CLICK",
          phone: phone || undefined,
          intent: `Clicked Phone Call on ${pathname}`,
          metadata: { phone, pageTitle: document.title },
        });
      }
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}
