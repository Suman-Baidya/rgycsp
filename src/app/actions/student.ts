"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStudentProfile(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        workspaceRoles: {
          where: { workspaceId }
        },
        studentProfile: {
          include: {
            invoices: {
              orderBy: { createdAt: 'desc' }
            },
            batch: {
              include: {
                course: true
              }
            },
            attendances: {
              orderBy: { date: 'desc' },
              take: 5
            },
            admissionApp: true
          }
        }
      }
    });

    if (!user) return { success: false, error: "User not found" };

    const isStudent = user.workspaceRoles.some(r => r.role === "STUDENT");
    if (!isStudent) {
      return { success: false, error: "Access denied. Not a student of this workspace." };
    }

    return { success: true, data: user };
  } catch (error: any) {
    console.error("Error fetching student profile:", error);
    return { success: false, error: "Failed to fetch profile." };
  }
}

export async function getWorkspaceRole(workspaceId: string, userId: string) {
  try {
    const role = await db.workspaceRole.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId
        }
      }
    });
    return role?.role || null;
  } catch (error) {
    console.error("Error fetching workspace role:", error);
    return null;
  }
}
