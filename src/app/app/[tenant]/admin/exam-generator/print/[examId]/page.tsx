import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintClient from "./PrintClient";

export default async function AdmitCardPrintPage({
  params,
  searchParams
}: {
  params: Promise<{ tenant: string, examId: string }>;
  searchParams: Promise<{ studentId: string, download?: string }>;
}) {
  const { tenant, examId } = await params;
  const { studentId, download } = await searchParams;
  
  if (!studentId) notFound();

  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant },
    include: { siteSettings: true }
  });

  if (!workspace) notFound();

  const exam = await db.exam.findUnique({
    where: { id: examId, workspaceId: workspace.id },
    include: {
      shifts: {
        include: {
          enrollments: {
            where: { studentProfileId: studentId }
          }
        }
      }
    }
  });

  if (!exam) notFound();

  const student = await db.studentProfile.findUnique({
    where: { id: studentId, workspaceId: workspace.id },
    include: {
      user: true,
      batch: true,
      course: true,
      workspace: true
    }
  });

  if (!student) notFound();

  // Find the specific shift the student is enrolled in for this exam
  const enrolledShift = exam.shifts.find(s => s.enrollments && s.enrollments.length > 0);
  const rollNo = enrolledShift?.enrollments[0]?.rollNo || student.enrollmentNo;

  const examData = {
    title: exam.title,
    date: exam.date,
    duration: exam.duration,
    syllabus: exam.syllabus,
    time: enrolledShift ? `${enrolledShift.startTime || ""} - ${enrolledShift.endTime || ""}` : "",
    rollNo: rollNo
  };

  return (
    <PrintClient 
      student={student} 
      examData={examData} 
      workspaceId={null} // null gets the global super-admin admit-card template
      autoDownload={download === "true"}
    />
  );
}
