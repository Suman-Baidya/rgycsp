import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintExamPaperClient from "../../PrintExamPaperClient";

export default async function PrintQuestionPaperPage({
  params
}: {
  params: Promise<{ tenant: string, examId: string }>;
}) {
  const { tenant, examId } = await params;
  
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant },
    include: { siteSettings: true }
  });

  if (!workspace) notFound();

  const exam = await db.exam.findUnique({
    where: { id: examId, workspaceId: workspace.id },
    include: {
      course: true,
      questions: true
    }
  });

  if (!exam) notFound();

  return (
    <PrintExamPaperClient 
      exam={exam} 
      workspace={workspace} 
      showAnswers={false}
    />
  );
}
