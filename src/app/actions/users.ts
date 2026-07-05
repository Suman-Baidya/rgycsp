"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getUsers() {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;

    const whereClause = isDev ? {} : {
      email: {
        not: devEmail
      }
    };

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        workspaceRoles: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                subdomain: true
              }
            }
          }
        },
        studentProfile: {
          select: {
            id: true,
            enrollmentNo: true,
            status: true
          }
        },
        _count: {
          select: {
            workspaceRoles: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: error.message || "Failed to fetch users" };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  // Logic for suspension could be a new field or logic
  // For now we'll revalidate path
  revalidatePath("/(admin)/super-admin/users");
  return { success: true };
}
