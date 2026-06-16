"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalCoursesForFranchise(workspaceId: string) {
  try {
    const globalCourses = await db.globalCourse.findMany({
      where: { isActive: true },
      include: {
        courses: {
          where: { workspaceId },
          include: {
            batches: {
              select: { id: true, name: true }
            },
            _count: {
              select: { admissionApps: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: globalCourses };
  } catch (error: any) {
    console.error("Failed to fetch global courses:", error);
    return { success: false, error: error.message || "Failed to fetch global courses" };
  }
}

export async function toggleCourseActivation(workspaceId: string, globalCourseId: string, isActive: boolean) {
  try {
    let course = await db.course.findFirst({
      where: { workspaceId, globalCourseId }
    });

    if (course) {
      course = await db.course.update({
        where: { id: course.id },
        data: { isActive }
      });
    } else {
      const gc = await db.globalCourse.findUnique({ where: { id: globalCourseId } });
      if (!gc) throw new Error("Global Course not found");

      course = await db.course.create({
        data: {
          workspaceId,
          globalCourseId,
          title: gc.name,
          code: gc.short || "",
          description: gc.description || "",
          image: gc.banner || "",
          feeAmount: gc.price,
          priceDisplay: gc.priceDisplay,
          discountText: gc.discountText,
          showFee: gc.showFee,
          duration: gc.duration || "",
          topics: gc.syllabus || [],
          isActive: isActive
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to toggle course activation:", error);
    return { success: false, error: error.message || "Failed to toggle activation" };
  }
}

export async function updateFranchiseCoursePricing(courseId: string, data: { feeAmount: number, priceDisplay: string, discountText: string, showFee: boolean }) {
  try {
    const course = await db.course.update({
      where: { id: courseId },
      data: {
        feeAmount: data.feeAmount,
        priceDisplay: data.priceDisplay,
        discountText: data.discountText,
        showFee: data.showFee
      }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to update franchise course pricing:", error);
    return { success: false, error: error.message || "Failed to update pricing" };
  }
}

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
    const { 
      title, code, description, feeAmount, 
      category, level, duration, topics, image 
    } = data;

    const course = await db.course.create({
      data: {
        workspaceId,
        title,
        code,
        description,
        image,
        feeAmount: parseFloat(feeAmount) || 0,
        category,
        level,
        duration,
        topics: topics || [],
        isActive: true
      }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to create course:", error);
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function updateCourse(courseId: string, data: any) {
  try {
    const { 
      title, code, description, feeAmount, 
      category, level, duration, topics, isActive, image 
    } = data;

    const course = await db.course.update({
      where: { id: courseId },
      data: {
        title,
        code,
        description,
        image,
        feeAmount: parseFloat(feeAmount) || 0,
        category,
        level,
        duration,
        topics: topics || [],
        isActive: isActive !== undefined ? isActive : true
      }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to update course:", error);
    return { success: false, error: error.message || "Failed to update course" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await db.course.delete({
      where: { id: courseId }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete course:", error);
    return { success: false, error: error.message || "Failed to delete course" };
  }
}

export async function deleteMultipleCourses(courseIds: string[]) {
  try {
    await db.course.deleteMany({
      where: { id: { in: courseIds } }
    });

    revalidatePath(`/app/[tenant]/admin/courses`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete multiple courses:", error);
    return { success: false, error: error.message || "Failed to delete courses" };
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
