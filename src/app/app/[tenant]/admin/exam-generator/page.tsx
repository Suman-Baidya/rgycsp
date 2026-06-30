import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExamGeneratorClient from "./ExamGeneratorClient";

export default async function AIExamGeneratorPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant },
    select: { id: true, tokensBalance: true, name: true, logoUrl: true }
  });

  const superAdminSettings = await db.siteSettings.findFirst({
    where: { workspaceId: null }
  });
  const superAdminName = superAdminSettings?.siteName || "RGYCSP";

  if (!workspace) notFound();

  const exams = await db.exam.findMany({
    where: { workspaceId: workspace.id },
    include: {
      shifts: {
        include: { _count: { select: { enrollments: true } } }
      },
      course: { select: { title: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const courses = await db.course.findMany({
    where: { workspaceId: workspace.id, isActive: true },
    select: { id: true, title: true, topics: true }
  });

  const batches = await db.batch.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true, courseId: true }
  });

  const students = await db.studentProfile.findMany({
    where: { workspaceId: workspace.id },
    include: {
      semesters: {
        include: { marks: true }
      },
      user: true,
      batch: true,
      course: true,
      workspace: true,
      examEnrollments: true
    },
    orderBy: { createdAt: "desc" }
  });

  const chapters = await db.chapter.findMany({
    where: { workspaceId: workspace.id },
    include: {
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <ExamGeneratorClient 
      workspaceId={workspace.id}
      workspaceTokens={workspace.tokensBalance}
      workspace={workspace}
      superAdminName={superAdminName}
      exams={exams}
      courses={courses}
      batches={batches}
      students={students}
      chapters={chapters}
    />
  );
}
