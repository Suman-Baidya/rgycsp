import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCachedGlobalSettings } from "@/lib/settings";
import { getStudents } from "@/app/actions/students";
import { getCourses } from "@/app/actions/courses";
import { getBatches } from "@/app/actions/batches";
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

  if (!workspace) notFound();

  const [
    superAdminSettings,
    exams,
    coursesResult,
    batchesResult,
    studentsResult,
    chapters
  ] = await Promise.all([
    getCachedGlobalSettings(),
    db.exam.findMany({
      where: { workspaceId: workspace.id },
      include: {
        shifts: { include: { _count: { select: { enrollments: true } } } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    getCourses(workspace.id),
    getBatches(workspace.id),
    getStudents(workspace.id),
    db.chapter.findMany({
      where: { workspaceId: workspace.id },
      include: {
        questions: { orderBy: { createdAt: "desc" } },
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const superAdminName = superAdminSettings?.siteName || "RGYCSP";
  const courses = (coursesResult.data ?? [])
    .filter((c: any) => c.isActive)
    .map((c: any) => ({ id: c.id, title: c.title, topics: c.topics }));
  const batches = (batchesResult.data ?? [])
    .map((b: any) => ({ id: b.id, name: b.name, courseId: b.courseId }));

  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <ExamGeneratorClient 
        workspaceId={workspace.id}
        workspaceTokens={workspace.tokensBalance}
        workspace={workspace}
        superAdminName={superAdminName}
        exams={exams}
        courses={courses}
        batches={batches}
        students={studentsResult.data ?? []}
        chapters={chapters}
      />
    </Suspense>
  );
}
