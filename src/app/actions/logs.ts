"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isDeveloperEmail, getDeveloperEmails } from "@/lib/developer";

export type LogClearTimeframe = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL';

/**
 * Get system logs with optional severity and category filter
 */
export async function getLogs(filter = "ALL", category = "ALL") {
  try {
    const session = await auth();
    const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
    const conditions: any[] = [];
    
    // Conceal developer activity from non-developers
    if (!isDev) {
      const devEmails = getDeveloperEmails();
      conditions.push({
        NOT: [
          { user: { in: devEmails, mode: "insensitive" } },
          ...devEmails.map(email => ({ message: { contains: email, mode: "insensitive" as const } }))
        ]
      });
    }
    
    // Severity filter
    if (filter !== "ALL") {
      conditions.push({ level: filter });
    }

    // Category filter for Developer monitoring
    if (category === "SECURITY") {
      conditions.push({
        OR: [
          { module: { in: ["SECURITY", "BOT_DETECT", "FORM_COMPROMISE", "SUSPICIOUS", "RATE_LIMIT", "TAMPER_DETECT"] } },
          { level: "CRITICAL" },
          { message: { contains: "bot", mode: "insensitive" } },
          { message: { contains: "attack", mode: "insensitive" } },
          { message: { contains: "compromise", mode: "insensitive" } },
          { message: { contains: "honeypot", mode: "insensitive" } },
          { message: { contains: "illegal", mode: "insensitive" } },
        ]
      });
    } else if (category === "SUSPICIOUS") {
      conditions.push({
        OR: [
          { module: { in: ["SUSPICIOUS", "TAMPER_DETECT", "AUTH_TAMPER"] } },
          { message: { contains: "suspicious", mode: "insensitive" } },
          { message: { contains: "unauthorized", mode: "insensitive" } },
          { message: { contains: "illegal", mode: "insensitive" } },
          { message: { contains: "privilege", mode: "insensitive" } },
          { message: { contains: "bypass", mode: "insensitive" } },
        ]
      });
    } else if (category === "ERRORS") {
      conditions.push({
        level: { in: ["ERROR", "CRITICAL"] }
      });
    }
    
    const whereClause = conditions.length > 0 ? { AND: conditions } : {};
    
    let logs = await db.systemLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 250, // Limit to 250 to ensure high density while keeping UI ultra responsive
      select: {
        id: true,
        level: true,
        module: true,
        message: true,
        user: true,
        createdAt: true,
      }
    });

    if (!isDev) {
      const devEmails = getDeveloperEmails();
      logs = logs.filter(log => {
        if (isDeveloperEmail(log.user)) return false;
        const msg = (log.message || "").toLowerCase();
        if (devEmails.some(dev => msg.includes(dev))) return false;
        return true;
      });
    }
    
    return logs;
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}

/**
 * Creates a new log entry.
 * Can be called from any server context.
 */
export async function createLog(level: string, module: string, message: string, user?: string) {
  try {
    await db.systemLog.create({
      data: {
        level,
        module,
        message,
        user,
      }
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

/**
 * Fetch log statistics and storage breakdown for developer monitoring
 */
export async function getLogStatistics() {
  try {
    const totalLogs = await db.systemLog.count();
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneQuarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [
      criticalCount,
      errorCount,
      warningCount,
      securityAlertsCount,
      suspiciousCount,
      olderThanWeek,
      olderThanMonth,
      olderThanQuarter,
      olderThanYear,
      oldestLog
    ] = await Promise.all([
      db.systemLog.count({ where: { level: "CRITICAL" } }),
      db.systemLog.count({ where: { level: "ERROR" } }),
      db.systemLog.count({ where: { level: "WARNING" } }),
      db.systemLog.count({
        where: {
          OR: [
            { module: { in: ["SECURITY", "BOT_DETECT", "FORM_COMPROMISE", "SUSPICIOUS", "RATE_LIMIT"] } },
            { level: "CRITICAL" },
            { message: { contains: "bot", mode: "insensitive" } },
            { message: { contains: "attack", mode: "insensitive" } },
            { message: { contains: "compromise", mode: "insensitive" } },
            { message: { contains: "honeypot", mode: "insensitive" } },
          ]
        }
      }),
      db.systemLog.count({
        where: {
          OR: [
            { module: { in: ["SUSPICIOUS", "TAMPER_DETECT", "AUTH_TAMPER"] } },
            { message: { contains: "suspicious", mode: "insensitive" } },
            { message: { contains: "unauthorized", mode: "insensitive" } },
            { message: { contains: "illegal", mode: "insensitive" } }
          ]
        }
      }),
      db.systemLog.count({ where: { createdAt: { lt: oneWeekAgo } } }),
      db.systemLog.count({ where: { createdAt: { lt: oneMonthAgo } } }),
      db.systemLog.count({ where: { createdAt: { lt: oneQuarterAgo } } }),
      db.systemLog.count({ where: { createdAt: { lt: oneYearAgo } } }),
      db.systemLog.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true }
      })
    ]);

    return {
      totalLogs,
      criticalCount,
      errorCount,
      warningCount,
      securityAlertsCount,
      suspiciousCount,
      olderThanWeek,
      olderThanMonth,
      olderThanQuarter,
      olderThanYear,
      oldestDate: oldestLog?.createdAt ? oldestLog.createdAt.toISOString() : null,
    };
  } catch (error) {
    console.error("Failed to get log statistics:", error);
    return {
      totalLogs: 0,
      criticalCount: 0,
      errorCount: 0,
      warningCount: 0,
      securityAlertsCount: 0,
      suspiciousCount: 0,
      olderThanWeek: 0,
      olderThanMonth: 0,
      olderThanQuarter: 0,
      olderThanYear: 0,
      oldestDate: null,
    };
  }
}

/**
 * Clears logs based on the timeframe (Monthly, Quarterly, Yearly, Weekly, or All)
 */
export async function clearLogs(timeframe: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL') {
  try {
    let whereClause = {};
    const now = new Date();
    
    if (timeframe === 'WEEKLY') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      whereClause = { createdAt: { lt: oneWeekAgo } };
    } else if (timeframe === 'MONTHLY') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      whereClause = { createdAt: { lt: oneMonthAgo } };
    } else if (timeframe === 'QUARTERLY') {
      const oneQuarterAgo = new Date();
      oneQuarterAgo.setDate(oneQuarterAgo.getDate() - 90);
      whereClause = { createdAt: { lt: oneQuarterAgo } };
    } else if (timeframe === 'YEARLY') {
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      whereClause = { createdAt: { lt: oneYearAgo } };
    }
    
    const result = await db.systemLog.deleteMany({
      where: whereClause
    });
    
    revalidatePath("/super-admin/logs");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to clear logs:", error);
    return { success: false, error: "Failed to clear logs" };
  }
}

/**
 * Record a suspicious, bot detection, or form compromise event
 */
export async function recordSecurityAlert(
  type: 'BOT_DETECT' | 'FORM_COMPROMISE' | 'SUSPICIOUS' | 'RATE_LIMIT',
  message: string,
  user?: string
) {
  try {
    const level = type === 'BOT_DETECT' || type === 'FORM_COMPROMISE' ? 'CRITICAL' : 'WARNING';
    await createLog(level, type, message, user || "SECURITY_AGENT");
    revalidatePath("/super-admin/logs");
    return { success: true };
  } catch (error) {
    console.error("Failed to record security alert:", error);
    return { success: false };
  }
}

/**
 * Fetch the developer email from environment variables securely
 */
export async function getDeveloperEmail() {
  const session = await auth();
  const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
  if (!isDev) return "";
  return process.env.DEVELOPER_EMAIL || "suman.baidya.pro@gmail.com";
}
