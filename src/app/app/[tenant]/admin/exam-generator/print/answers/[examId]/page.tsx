import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintExamPaperClient from "../../PrintExamPaperClient";

export default async function PrintAnswersPage({
  params
}: {
  params: Promise<{ tenant: string, examId: string }>;
}) {
  const { tenant, examId } = await params;
  
  const normalizedTenant = tenant?.toLowerCase()?.trim();

  const workspace = await db.workspace.findFirst({
    where: {
      OR: [
        { subdomain: normalizedTenant },
        { centerCode: { equals: normalizedTenant, mode: 'insensitive' } },
        { id: tenant }
      ]
    },
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
      showAnswers={true}
    />
  );
}
