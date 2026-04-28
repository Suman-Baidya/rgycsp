"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCourses(workspaceId: string) {
  try {
    const courses = await db.course.findMany({
      where: { workspaceId },
      include: {
        batches: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: courses };
  } catch (error: any) {
    console.error("Failed to fetch courses:", error);
    return { success: false, error: error.message || "Failed to fetch courses" };
  }
}

export async function createCourse(workspaceId: string, data: any) {
  try {
    const { name, code, description, price } = data;

    const course = await db.course.create({
      data: {
        workspaceId,
        title: name,
        code,
        description,
        feeAmount: parseFloat(price) || 0,
      }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to create course:", error);
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function createBatch(workspaceId: string, courseId: string, name: string) {
  try {
    const batch = await db.batch.create({
      data: {
        workspaceId,
        courseId,
        name
      }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true, data: batch };
  } catch (error: any) {
    console.error("Failed to create batch:", error);
    return { success: false, error: error.message || "Failed to create batch" };
  }
}
