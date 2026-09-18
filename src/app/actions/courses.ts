"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";

import { db } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function getGlobalCoursesForFranchise(workspaceId: string) {
  try {
    const globalCourses = await unstable_cache(
      () => db.globalCourse.findMany({
        where: { isActive: true },
        include: {
          courses: {
            where: { workspaceId },
            include: {
              batches: { select: { id: true, name: true } },
              _count: { select: { admissionApps: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      [`global-courses-franchise-${workspaceId}`],
      { revalidate: 60, tags: [`courses-${workspaceId}`, "global-courses"] }
    )();
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

    await revalidateWorkspacePath(workspaceId, "/admin/courses", "page");
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to toggle course activation:", error);
    return { success: false, error: error.message || "Failed to toggle activation" };
  }
}

export async function updateFranchiseCoursePricing(
  identifier: string, 
  second: any, 
  third?: any
) {
  try {
    let workspaceId: string | null = null;
    let course: any = null;

    if (third !== undefined) {
      // Called with (workspaceId, globalCourseId, data)
      workspaceId = identifier;
      const globalCourseId = second;
      const data = third;

      const existingCourse = await db.course.findFirst({
        where: { workspaceId, globalCourseId }
      });

      if (existingCourse) {
        course = await db.course.update({
          where: { id: existingCourse.id },
          data: {
            feeAmount: data.feeAmount ?? existingCourse.feeAmount,
            priceDisplay: data.priceDisplay ?? existingCourse.priceDisplay,
            discountText: data.discountText ?? existingCourse.discountText,
            showFee: data.showFee ?? existingCourse.showFee,
            admissionFee: data.admissionFee ?? existingCourse.admissionFee,
            registrationFee: data.registrationFee ?? existingCourse.registrationFee,
            examFee: data.examFee ?? existingCourse.examFee,
            isInstallmentBased: data.isInstallmentBased ?? existingCourse.isInstallmentBased,
            installmentAmount: data.isInstallmentBased ? data.installmentAmount : null,
            totalInstallments: data.isInstallmentBased ? data.totalInstallments : null,
            totalCourseFee: data.totalCourseFee ?? existingCourse.totalCourseFee,
            ...(data.isActive !== undefined ? { isActive: data.isActive } : {})
          }
        });
      } else {
        const gc = await db.globalCourse.findUnique({
          where: { id: globalCourseId }
        });
        if (!gc) throw new Error("Global course not found");

        course = await db.course.create({
          data: {
            workspaceId,
            globalCourseId,
            title: gc.name,
            code: gc.short || "",
            description: gc.description || "",
            image: gc.banner || "",
            feeAmount: data.feeAmount ?? gc.price,
            priceDisplay: data.priceDisplay ?? gc.priceDisplay ?? "",
            discountText: data.discountText ?? gc.discountText ?? "",
            showFee: data.showFee ?? gc.showFee ?? true,
            admissionFee: data.admissionFee ?? 0,
            registrationFee: data.registrationFee ?? 0,
            examFee: data.examFee ?? 0,
            isInstallmentBased: !!data.isInstallmentBased,
            installmentAmount: data.isInstallmentBased ? data.installmentAmount : null,
            totalInstallments: data.isInstallmentBased ? data.totalInstallments : null,
            totalCourseFee: data.totalCourseFee ?? data.feeAmount ?? gc.price,
            duration: gc.duration || "",
            topics: gc.syllabus || [],
            isActive: data.isActive !== undefined ? data.isActive : true
          }
        });
      }
    } else {
      // Legacy signature: (courseId, data)
      const courseId = identifier;
      const data = second;

      course = await db.course.update({
        where: { id: courseId },
        data: {
          feeAmount: data.feeAmount,
          priceDisplay: data.priceDisplay,
          discountText: data.discountText,
          showFee: data.showFee,
          admissionFee: data.admissionFee,
          registrationFee: data.registrationFee,
          examFee: data.examFee,
          isInstallmentBased: data.isInstallmentBased,
          installmentAmount: data.installmentAmount,
          totalInstallments: data.totalInstallments,
          totalCourseFee: data.totalCourseFee,
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {})
        }
      });
      workspaceId = course.workspaceId;
    }

    if (workspaceId) {
      await revalidateWorkspacePath(workspaceId, "/admin/courses", "page");
    }
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to update franchise course pricing:", error);
    return { success: false, error: error.message || "Failed to update pricing" };
  }
}

export async function getCourses(workspaceId: string) {
  try {
    const courses = await unstable_cache(
      () => db.course.findMany({
        where: { workspaceId },
        include: { batches: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      [`courses-${workspaceId}`],
      { revalidate: 60, tags: [`courses-${workspaceId}`, "courses"] }
    )();
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

    (revalidateTag as any)(`courses-${workspaceId}`);
    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/courses", "page");
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

    if (course.workspaceId) {
      (revalidateTag as any)(`courses-${course.workspaceId}`);
      await revalidateWorkspacePath(course.workspaceId, "/admin/courses", "page");
    }
    return { success: true, data: course };
  } catch (error: any) {
    console.error("Failed to update course:", error);
    return { success: false, error: error.message || "Failed to update course" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const course = await db.course.delete({
      where: { id: courseId }
    });

    if (course.workspaceId) {
      (revalidateTag as any)(`courses-${course.workspaceId}`);
      await revalidateWorkspacePath(course.workspaceId, "/admin/courses", "page");
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete course:", error);
    return { success: false, error: error.message || "Failed to delete course" };
  }
}

export async function deleteMultipleCourses(courseIds: string[]) {
  try {
    const firstCourse = await db.course.findFirst({
      where: { id: { in: courseIds } },
      select: { workspaceId: true }
    });

    await db.course.deleteMany({
      where: { id: { in: courseIds } }
    });

    if (firstCourse?.workspaceId) {
      await revalidateWorkspacePath(firstCourse.workspaceId, "/admin/courses", "page");
    }
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

    await revalidateWorkspacePath(workspaceId, "/admin/courses", "page");
    return { success: true, data: batch };
  } catch (error: any) {
    console.error("Failed to create batch:", error);
    return { success: false, error: error.message || "Failed to create batch" };
  }
}
