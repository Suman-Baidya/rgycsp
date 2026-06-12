"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalCourseGroups() {
  try {
    const groups = await db.globalCourseGroup.findMany({
      orderBy: { label: "asc" },
    });
    return { success: true, groups };
  } catch (error) {
    console.error("Error fetching course groups:", error);
    return { success: false, error: "Failed to fetch course groups" };
  }
}

export async function createGlobalCourseGroup(data: { value: string; label: string; isActive?: boolean }) {
  try {
    const group = await db.globalCourseGroup.create({
      data,
    });
    revalidatePath("/super-admin/courses");
    revalidatePath("/courses");
    return { success: true, group };
  } catch (error: any) {
    console.error("Error creating course group:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "A category with this ID already exists." };
    }
    return { success: false, error: "Failed to create course group" };
  }
}

export async function updateGlobalCourseGroup(id: string, data: { value?: string; label?: string; isActive?: boolean }) {
  try {
    const group = await db.globalCourseGroup.update({
      where: { id },
      data,
    });
    revalidatePath("/super-admin/courses");
    revalidatePath("/courses");
    return { success: true, group };
  } catch (error) {
    console.error("Error updating course group:", error);
    return { success: false, error: "Failed to update course group" };
  }
}

export async function deleteGlobalCourseGroup(id: string) {
  try {
    await db.globalCourseGroup.delete({
      where: { id },
    });
    revalidatePath("/super-admin/courses");
    revalidatePath("/courses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course group:", error);
    return { success: false, error: "Failed to delete course group" };
  }
}

// Seed the initial hardcoded groups to database
export async function seedInitialCourseGroups() {
  const initialGroups = [
    { value: "all", label: "All Categories" },
    { value: "diploma", label: "Diploma Courses" },
    { value: "office", label: "Office & Computer" },
    { value: "kids", label: "Kids Computer" },
    { value: "ai", label: "AI Courses" },
    { value: "programming", label: "Programming & Web" },
    { value: "design", label: "Designing Courses" },
    { value: "degree", label: "Degree Courses" },
    { value: "special", label: "Special Courses" },
  ];

  try {
    for (const group of initialGroups) {
      await db.globalCourseGroup.upsert({
        where: { value: group.value },
        update: {},
        create: {
          value: group.value,
          label: group.label,
          isActive: true
        }
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to seed initial groups:", error);
    return { success: false };
  }
}
