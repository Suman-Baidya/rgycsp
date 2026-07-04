"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get system logs with optional severity filter
 */
export async function getLogs(filter = "ALL") {
  try {
    const whereClause = filter !== "ALL" ? { level: filter } : {};
    
    const logs = await db.systemLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 200, // Limit to 200 to prevent overwhelming the UI
    });
    
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
 * Clears logs based on the timeframe
 */
export async function clearLogs(timeframe: 'WEEKLY' | 'MONTHLY' | 'ALL') {
  try {
    let whereClause = {};
    const now = new Date();
    
    if (timeframe === 'WEEKLY') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      whereClause = {
        createdAt: {
          lt: oneWeekAgo
        }
      };
    } else if (timeframe === 'MONTHLY') {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      whereClause = {
        createdAt: {
          lt: oneMonthAgo
        }
      };
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
 * Fetch the developer email from environment variables securely
 */
export async function getDeveloperEmail() {
  return process.env.DEVELOPER_EMAIL || "";
}
