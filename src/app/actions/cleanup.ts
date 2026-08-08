"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";


import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cleanupRejectedApplications(workspaceId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.admissionApplication.deleteMany({
      where: {
        workspaceId,
        status: "REJECTED",
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin", "layout");
    
    return { success: true, count: result.count };
  } catch (error: any) {
    console.error("Error cleaning up applications:", error);
    return { success: false, error: "Failed to cleanup applications." };
  }
}
