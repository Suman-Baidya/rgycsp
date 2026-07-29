"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// Practical Configuration & Slots
// ==========================================

export async function getPracticalConfig(workspaceId: string) {
  try {
    let config = await db.practicalConfig.findUnique({
      where: { workspaceId },
      include: {
        slots: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!config) {
      config = await db.practicalConfig.create({
        data: { workspaceId },
        include: { slots: true },
      });
    }

    return { success: true, config };
  } catch (error) {
    console.error("Error getting practical config:", error);
    return { success: false, error: "Failed to get configuration" };
  }
}

export async function updatePracticalConfig(workspaceId: string, data: { slotDuration?: number, capacityPerSlot?: number, offDays?: number[] }) {
  try {
    const config = await db.practicalConfig.upsert({
      where: { workspaceId },
      create: { workspaceId, ...data },
      update: data,
    });
    revalidatePath(`/app/[tenant]/admin/attendance`, "page");
    return { success: true, config };
  } catch (error) {
    console.error("Error updating practical config:", error);
    return { success: false, error: (error as any).message || "Failed to update configuration" };
  }
}

export async function createPracticalSlot(workspaceId: string, data: { startTime: string, endTime: string, order: number }) {
  try {
    let config = await db.practicalConfig.findUnique({ where: { workspaceId } });
    if (!config) {
      config = await db.practicalConfig.create({ data: { workspaceId } });
    }

    const slot = await db.practicalSlot.create({
      data: {
        configId: config.id,
        workspaceId,
        ...data,
      },
    });
    revalidatePath(`/app/[tenant]/admin/attendance`, "page");
    return { success: true, slot };
  } catch (error) {
    console.error("Error creating slot:", error);
    return { success: false, error: error.message || "Failed to create slot" };
  }
}

export async function deletePracticalSlot(slotId: string, workspaceId: string) {
  try {
    await db.practicalSlot.delete({
      where: { id: slotId, workspaceId },
    });
    revalidatePath(`/app/[tenant]/admin/attendance`, "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting slot:", error);
    return { success: false, error: "Failed to delete slot" };
  }
}

// ==========================================
// Practical Schedules (Weekly Grid)
// ==========================================

export async function getWeeklySchedules(workspaceId: string) {
  try {
    const schedules = await db.studentPracticalSchedule.findMany({
      where: { workspaceId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            enrollmentNo: true,
            photoUrl: true,
          }
        },
        slot: true,
      },
    });
    return { success: true, schedules };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return { success: false, error: "Failed to fetch schedules" };
  }
}

export async function assignStudentToSlot(workspaceId: string, enrollmentNo: string, slotId: string, dayOfWeek: number) {
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Find the student
      console.log(`[DEBUG] Looking for student: workspaceId='${workspaceId}', enrollmentNo='${enrollmentNo.trim()}'`);
      const student = await tx.studentProfile.findFirst({
        where: {
          workspaceId,
          enrollmentNo: {
            equals: enrollmentNo.trim(),
            mode: "insensitive"
          }
        },
      });
      console.log(`[DEBUG] Found student:`, student ? student.id : "null");

      if (!student) {
        throw new Error("Student not found with this enrollment number");
      }

      // 2. Check if student already has a slot for this day
      const existing = await tx.studentPracticalSchedule.findFirst({
        where: {
          studentProfileId: student.id,
          dayOfWeek,
        },
      });

      if (existing) {
        if (existing.slotId === slotId) {
          return { success: true, schedule: existing };
        }
        throw new Error("Student already has a slot on this day");
      }

      // 3. Check Capacity
      const config = await tx.practicalConfig.findUnique({ where: { workspaceId } });
      const capacity = config?.capacityPerSlot || 30;
      
      const currentCount = await tx.studentPracticalSchedule.count({
        where: { slotId, dayOfWeek },
      });

      if (currentCount >= capacity) {
        throw new Error(`This time slot is already full (Capacity: ${capacity})`);
      }

      // 4. Assign
      const schedule = await tx.studentPracticalSchedule.create({
        data: {
          studentProfileId: student.id,
          workspaceId,
          slotId,
          dayOfWeek,
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              enrollmentNo: true,
              photoUrl: true,
            }
          }
        }
      });

      return { success: true, schedule };
    });

    revalidatePath(`/app/[tenant]/admin/attendance`, "page");
    return result;
  } catch (error: any) {
    console.error("Error assigning student to slot:", error);
    return { success: false, error: error.message || "Failed to assign student" };
  }
}

export async function updateStudentSchedule(scheduleId: string, workspaceId: string, newSlotId: string, newDayOfWeek: number) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Check if moving to the same slot/day
      const current = await tx.studentPracticalSchedule.findUnique({ where: { id: scheduleId } });
      if (!current || current.workspaceId !== workspaceId) {
        throw new Error("Schedule not found");
      }

      if (current.slotId === newSlotId && current.dayOfWeek === newDayOfWeek) {
        return { success: true };
      }

      // Check if student already has a different slot on the NEW day
      if (current.dayOfWeek !== newDayOfWeek) {
        const existingOnNewDay = await tx.studentPracticalSchedule.findFirst({
          where: {
            studentProfileId: current.studentProfileId,
            dayOfWeek: newDayOfWeek,
          }
        });

        if (existingOnNewDay) {
          throw new Error("Student already has a slot on the target day");
        }
      }

      // Check Capacity
      const config = await tx.practicalConfig.findUnique({ where: { workspaceId } });
      const capacity = config?.capacityPerSlot || 30;
      
      const currentCount = await tx.studentPracticalSchedule.count({
        where: { slotId: newSlotId, dayOfWeek: newDayOfWeek },
      });

      if (currentCount >= capacity) {
        throw new Error(`The target time slot is already full (Capacity: ${capacity})`);
      }

      const updated = await tx.studentPracticalSchedule.update({
        where: { id: scheduleId },
        data: {
          slotId: newSlotId,
          dayOfWeek: newDayOfWeek,
        },
      });

      return { success: true, updated };
    });

    revalidatePath(`/app/[tenant]/admin/attendance`, "page");
    return result;
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return { success: false, error: error.message || "Failed to move student" };
  }
}

export async function removeStudentFromSlot(scheduleId: string, workspaceId: string) {
  try {
    await db.studentPracticalSchedule.delete({
      where: { id: scheduleId, workspaceId },
    });
    revalidatePath(`/app/[tenant]/admin/attendance`, "page");
    return { success: true };
  } catch (error) {
    console.error("Error removing schedule:", error);
    return { success: false, error: "Failed to remove student" };
  }
}
