"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createChapter(workspaceId: string, courseId: string, name: string, description?: string) {
  try {
    const chapter = await db.chapter.create({
      data: {
        workspaceId,
        courseId,
        name,
        description
      }
    });
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true, data: chapter };
  } catch (error: any) {
    console.error("Failed to create chapter", error);
    return { success: false, error: error.message };
  }
}

export async function addManualQuestion(
  workspaceId: string, 
  chapterId: string, 
  data: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
  }
) {
  try {
    const question = await db.questionBank.create({
      data: {
        workspaceId,
        chapterId,
        ...data
      }
    });
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true, data: question };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkImportQuestions(
  workspaceId: string, 
  chapterId: string, 
  questions: Array<{
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
  }>
) {
  try {
    const data = questions.map(q => ({
      workspaceId,
      chapterId,
      ...q
    }));

    await db.questionBank.createMany({
      data,
      skipDuplicates: true
    });
    
    revalidatePath(`/app/[tenant]/admin/exam-generator`, "page");
    return { success: true, count: data.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
