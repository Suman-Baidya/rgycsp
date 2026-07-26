"use server";

import { db } from "@/lib/prisma";

export async function getStudyCenters() {
  try {
    const centers = await db.workspace.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        centerCode: true,
        logoUrl: true,
        pinCode: true,
        state: true,
        district: true,
        siteSettings: {
          select: {
            address: true,
            googleMapLink: true
          }
        },
        isSubdomainEnabled: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, centers };
  } catch (error: any) {
    console.error("Failed to fetch study centers:", error);
    return { success: false, error: "Failed to fetch study centers" };
  }
}

export async function getStudyCenterCourses(workspaceId: string) {
  try {
    const courses = await db.course.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        category: true,
        duration: true,
        priceDisplay: true,
        showFee: true,
        feeAmount: true,
      },
      orderBy: {
        title: 'asc'
      }
    });
    return { success: true, courses };
  } catch (error: any) {
    console.error("Failed to fetch study center courses:", error);
    return { success: false, error: "Failed to fetch study center courses" };
  }
}
