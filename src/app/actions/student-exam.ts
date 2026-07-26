"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

// Fetch exams for a student based on their enrolled course
export async function getStudentExams(workspaceId: string, courseId: string | null) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const studentProfile = await db.studentProfile.findFirst({
      where: { userId: session.user.id, workspaceId }
    });

    if (!studentProfile) return { success: false, error: "Student profile not found" };

    const conditions = [{ courseId: null }];
    if (courseId) {
      conditions.push({ courseId: courseId } as any);
    }

    // Fetch exams assigned to this course, or exams not assigned to any specific course (general)
    // and are active and online
    const exams = await db.exam.findMany({
      where: {
        workspaceId,
        isActive: true,
        type: "ONLINE",
        OR: conditions
      },
      include: {
        course: true,
        results: {
          where: { studentProfileId: studentProfile.id }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: exams };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Fetch a single exam to take
export async function getExamToTake(examId: string, workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const studentProfile = await db.studentProfile.findFirst({
      where: { userId: session.user.id, workspaceId }
    });

    if (!studentProfile) return { success: false, error: "Student profile not found" };

    // Check if result already exists (already taken)
    const existingResult = await db.examResult.findUnique({
      where: {
        examId_studentProfileId: {
          examId,
          studentProfileId: studentProfile.id
        }
      }
    });

    if (existingResult) {
      return { success: false, error: "You have already completed this exam.", result: existingResult };
    }

    const exam = await db.exam.findUnique({
      where: { id: examId, workspaceId, isActive: true },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true
            // intentionally NOT selecting correctOption so the client can't cheat easily by inspecting state
          }
        }
      }
    });

    if (!exam) return { success: false, error: "Exam not found or inactive" };

    return { success: true, data: { exam, studentProfileId: studentProfile.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Submit the exam
export async function submitExam(examId: string, workspaceId: string, answers: Record<string, string>) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const studentProfile = await db.studentProfile.findFirst({
      where: { userId: session.user.id, workspaceId }
    });

    if (!studentProfile) return { success: false, error: "Student profile not found" };

    const exam = await db.exam.findUnique({
      where: { id: examId, workspaceId },
      include: { questions: true }
    });

    if (!exam) return { success: false, error: "Exam not found" };

    // Prevent double submission
    const existingResult = await db.examResult.findUnique({
      where: {
        examId_studentProfileId: {
          examId,
          studentProfileId: studentProfile.id
        }
      }
    });

    if (existingResult) {
      return { success: false, error: "You have already completed this exam." };
    }

    // Auto grade
    const marksPerQuestion = exam.marksPerQuestion || 1;
    let totalMarksObtained = 0;

    exam.questions.forEach((q) => {
      const studentAnswer = answers[q.id];
      if (studentAnswer === q.correctOption) {
        totalMarksObtained += marksPerQuestion;
      }
    });

    const isPassed = totalMarksObtained >= (exam.passingMarks || 0);

    // Save Result
    const result = await db.examResult.create({
      data: {
        examId,
        studentProfileId: studentProfile.id,
        marksObtained: totalMarksObtained,
        isPassed
      }
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
