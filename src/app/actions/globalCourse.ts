"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalCourses(search?: string, group?: string, page = 1, limit = 10, activeOnly = false) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (activeOnly) {
    where.isActive = true;
  }
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (group && group !== "all") {
    where.groupId = group;
  }

  const [courses, total] = await Promise.all([
    db.globalCourse.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.globalCourse.count({ where }),
  ]);

  return { courses, total, totalPages: Math.ceil(total / limit) };
}

export async function getGlobalCourse(id: string) {
  return await db.globalCourse.findUnique({ where: { id } });
}

export async function createGlobalCourse(data: any) {
  try {
    const course = await db.globalCourse.create({ data });
    revalidatePath("/super-admin/courses");
    revalidatePath("/");
    revalidatePath("/courses");
    return { success: true, course };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGlobalCourse(id: string, data: any) {
  try {
    const course = await db.globalCourse.update({ where: { id }, data });
    revalidatePath("/super-admin/courses");
    revalidatePath("/");
    revalidatePath("/courses");
    return { success: true, course };
  } catch (error: any) {
    console.error("Error updating course:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGlobalCourse(id: string) {
  try {
    await db.globalCourse.delete({ where: { id } });
    revalidatePath("/super-admin/courses");
    revalidatePath("/");
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return { success: false, error: error.message };
  }
}

export async function getGlobalCourseStats() {
  try {
    const [total, active, groups] = await Promise.all([
      db.globalCourse.count(),
      db.globalCourse.count({ where: { isActive: true } }),
      db.globalCourseGroup.count({ where: { isActive: true } }),
    ]);
    return {
      total,
      active,
      inactive: Math.max(0, total - active),
      categories: groups,
    };
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return { total: 0, active: 0, inactive: 0, categories: 0 };
  }
}

