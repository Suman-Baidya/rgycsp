"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExam(workspaceId: string, data: { title: string, type: string, date?: Date, courseId?: string, duration?: string, syllabus?: string }) {
  try {
    const exam = await db.exam.create({
      data: {
        workspaceId,
        title: data.title,
        type: data.type,
        date: data.date,
        duration: data.duration,
        syllabus: data.syllabus,
        courseId: data.courseId,
      }
    });
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true, data: exam };
  } catch (error: any) {
    console.error("Failed to create exam", error);
    return { success: false, error: error.message };
  }
}

export async function updateExam(id: string, data: { title: string, type: string, date?: Date, courseId?: string, duration?: string, syllabus?: string }, shifts: { name: string, startTime: string, endTime: string, capacity: number }[]) {
  try {
    const exam = await db.exam.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        date: data.date,
        duration: data.duration,
        syllabus: data.syllabus,
        courseId: data.courseId,
      }
    });

    // Replace shifts
    await db.examShift.deleteMany({ where: { examId: id } });
    for (const shift of shifts) {
      await db.examShift.create({
        data: {
          examId: id,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          capacity: shift.capacity,
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true, data: exam };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExamShift(examId: string, data: { name: string, startTime: string, endTime: string, capacity: number }) {
  try {
    const shift = await db.examShift.create({
      data: {
        examId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
      }
    });
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true, data: shift };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExam(id: string) {
  try {
    await db.exam.delete({ where: { id } });
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExamShift(id: string) {
  try {
    await db.examShift.delete({ where: { id } });
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function enrollStudentsToExam(examId: string, studentIds: string[], options?: { shiftId?: string, strategy?: 'sequential' | 'equal' }) {
  try {
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: { shifts: { include: { _count: { select: { enrollments: true } } } } }
    });

    if (!exam || exam.shifts.length === 0) {
      return { success: false, error: "No shifts available for this exam." };
    }

    // Check for students already assigned to this exam (in any shift)
    const existingEnrollments = await db.examEnrollment.findMany({
      where: {
        examShiftId: { in: exam.shifts.map(s => s.id) },
        studentProfileId: { in: studentIds }
      },
      select: { studentProfileId: true }
    });

    const alreadyEnrolledStudentIds = new Set(existingEnrollments.map(e => e.studentProfileId));
    let unassignedStudents = studentIds.filter(id => !alreadyEnrolledStudentIds.has(id));
    const skippedCount = alreadyEnrolledStudentIds.size;

    if (unassignedStudents.length === 0) {
      return { success: false, error: `All ${skippedCount} selected students are already assigned to this exam.` };
    }

    const strategy = options?.strategy || 'sequential';
    const enrollmentsToCreate: any[] = [];

    if (options?.shiftId) {
      // Manual Assignment
      const shift = exam.shifts.find(s => s.id === options.shiftId);
      if (!shift) return { success: false, error: "Selected shift not found." };
      
      const availableCapacity = shift.capacity - shift._count.enrollments;
      if (availableCapacity < unassignedStudents.length) {
        return { success: false, error: `Shift capacity exceeded. Available: ${availableCapacity}, Requested: ${unassignedStudents.length}` };
      }

      unassignedStudents.forEach(studentId => {
        enrollmentsToCreate.push({
          examShiftId: shift.id,
          studentProfileId: studentId,
          rollNo: `EXM-${Math.floor(Math.random() * 100000)}`
        });
      });
      unassignedStudents = [];
    } else {
      // Auto Assignment
      let availableShifts = exam.shifts.map(s => ({ ...s, available: s.capacity - s._count.enrollments })).filter(s => s.available > 0);
      
      if (strategy === 'equal') {
        // Round Robin distribution
        while (unassignedStudents.length > 0 && availableShifts.length > 0) {
          for (let i = 0; i < availableShifts.length; i++) {
            if (unassignedStudents.length === 0) break;
            if (availableShifts[i].available > 0) {
              const studentId = unassignedStudents.shift();
              enrollmentsToCreate.push({
                examShiftId: availableShifts[i].id,
                studentProfileId: studentId,
                rollNo: `EXM-${Math.floor(Math.random() * 100000)}`
              });
              availableShifts[i].available--;
            }
          }
          availableShifts = availableShifts.filter(s => s.available > 0);
        }
      } else {
        // Sequential Fill
        for (const shift of availableShifts) {
          while (shift.available > 0 && unassignedStudents.length > 0) {
            const studentId = unassignedStudents.shift();
            enrollmentsToCreate.push({
              examShiftId: shift.id,
              studentProfileId: studentId,
              rollNo: `EXM-${Math.floor(Math.random() * 100000)}`
            });
            shift.available--;
          }
          if (unassignedStudents.length === 0) break;
        }
      }
    }

    if (enrollmentsToCreate.length > 0) {
      await db.examEnrollment.createMany({
        data: enrollmentsToCreate,
        skipDuplicates: true
      });
    }

    if (unassignedStudents.length > 0) {
      return { success: false, error: `Not enough capacity in shifts. ${unassignedStudents.length} students were not assigned.` };
    }

    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { 
      success: true, 
      message: `Successfully enrolled ${enrollmentsToCreate.length} students.${skippedCount > 0 ? ` (${skippedCount} already assigned)` : ''}` 
    };

  } catch (error: any) {
    console.error("Enrollment error", error);
    return { success: false, error: error.message };
  }
}

export async function saveStudentMarks(studentSemesterId: string, unitName: string, marksObtained: number, maxMarks: number) {
  try {
    // Upsert logic for marks based on semester and unit
    const existingMark = await db.studentMarks.findFirst({
      where: { studentSemesterId, unitName }
    });

    if (existingMark) {
      await db.studentMarks.update({
        where: { id: existingMark.id },
        data: { marksObtained, maxMarks }
      });
    } else {
      await db.studentMarks.create({
        data: {
          studentSemesterId,
          unitName,
          marksObtained,
          maxMarks
        }
      });
    }
    
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveStudentMarksBatch(
  studentProfileId: string,
  marksData: { semesterNumber: number; unitName: string; marksObtained: number; maxMarks: number }[]
) {
  try {
    for (const mark of marksData) {
      // Find or create semester
      let semester = await db.studentSemester.findUnique({
        where: { studentProfileId_semesterNumber: { studentProfileId, semesterNumber: mark.semesterNumber } }
      });
      if (!semester) {
        semester = await db.studentSemester.create({
          data: { studentProfileId, semesterNumber: mark.semesterNumber }
        });
      }
      
      const existingMark = await db.studentMarks.findFirst({
        where: { studentSemesterId: semester.id, unitName: mark.unitName }
      });

      if (existingMark) {
        await db.studentMarks.update({
          where: { id: existingMark.id },
          data: { marksObtained: mark.marksObtained, maxMarks: mark.maxMarks }
        });
      } else {
        await db.studentMarks.create({
          data: {
            studentSemesterId: semester.id,
            unitName: mark.unitName,
            marksObtained: mark.marksObtained,
            maxMarks: mark.maxMarks
          }
        });
      }
    }
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
