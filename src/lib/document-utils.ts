import { RegistrationConfig } from "@prisma/client";
import { isValidIssueGap, isValidMarksheetGap, getRequiredMarksheetCount, getExpectedUnitsForSemester } from "@/lib/course-utils";

export function isMarksheetAutoIssued(semester: any, config: RegistrationConfig | null | undefined, studentProfile?: any): boolean {
  // 1. Check strict time gap based on admission date
  if (studentProfile?.admissionDate && studentProfile?.course?.duration) {
    const gapCheck = isValidMarksheetGap(studentProfile.admissionDate, semester.semesterNumber, studentProfile.course.duration);
    if (!gapCheck.valid) return false;
  }

  if (studentProfile?.semesters && semester.semesterNumber > 1) {
    const prevSem = studentProfile.semesters.find((s: any) => s.semesterNumber === semester.semesterNumber - 1);
    if (!prevSem || (!prevSem.marksheetIssuedToStudent && !isMarksheetAutoIssued(prevSem, config, studentProfile))) {
      return false; // Previous semester not issued yet
    }
  }

  // 3. Validate that all unit marks have been entered for this semester
  if (studentProfile?.course) {
    const expectedUnits = getExpectedUnitsForSemester(studentProfile.course, semester.semesterNumber);
    if (!semester.marks || semester.marks.length < expectedUnits) {
      return false; // Marks for all units not yet entered
    }
  }

  if (studentProfile?.documentIssueRequestedAt && checkRequestedAutoIssue(studentProfile.documentIssueRequestedAt, config)) {
    return true;
  }
  if (!config?.autoMarksheetIssueEnabled) return false;
  if (!semester?.marksFinalizedAt) return false;

  const finalizedDate = new Date(semester.marksFinalizedAt);
  const now = new Date();
  
  const autoIssueDate = new Date(finalizedDate);
  autoIssueDate.setDate(autoIssueDate.getDate() + (config.autoMarksheetDays || 0));

  return now >= autoIssueDate;
}

function checkRequestedAutoIssue(requestedAt: Date | null | undefined, config: RegistrationConfig | null | undefined): boolean {
  if (!requestedAt || !config || !config.autoQuickIssueEnabled || (config.autoIssueAfterRequestMinutes || 0) <= 0) return false;
  
  const autoIssueTime = new Date(requestedAt);
  autoIssueTime.setMinutes(autoIssueTime.getMinutes() + config.autoIssueAfterRequestMinutes);
  
  return new Date() >= autoIssueTime;
}

export function isCertificateAutoIssued(student: any, config: RegistrationConfig | null | undefined): boolean {
  // 1. Strict time gap validation based on course duration
  if (student?.admissionDate && student?.course?.duration) {
    const gapCheck = isValidIssueGap(student.admissionDate, student.course.duration);
    if (!gapCheck.valid) return false;
  }

  // 2. Validate Marksheet Count based on Course Duration
  if (student?.course?.duration) {
    const requiredCount = getRequiredMarksheetCount(student.course.duration);
    const issuedCount = (student.semesters || []).filter((sem: any) => 
      sem.marksheetIssuedToStudent || isMarksheetAutoIssued(sem, config, student)
    ).length;
    
    if (issuedCount < requiredCount) return false;
  }

  if (student?.documentIssueRequestedAt && checkRequestedAutoIssue(student.documentIssueRequestedAt, config)) {
    return true;
  }
  if (!config?.autoCertificateIssueEnabled) return false;
  if (!student?.semesters || student.semesters.length === 0) return false;

  let latestFinalizeDate: Date | null = null;
  let allSemestersPassedAndIssued = true;

  for (const sem of student.semesters) {
    const autoIssued = isMarksheetAutoIssued(sem, config, student);
    const manuallyIssued = sem.marksheetIssuedToStudent; 

    if (!manuallyIssued && !autoIssued) {
      allSemestersPassedAndIssued = false;
      break;
    }

    if (sem.marksFinalizedAt) {
      const semDate = new Date(sem.marksFinalizedAt);
      if (!latestFinalizeDate || semDate > latestFinalizeDate) {
        latestFinalizeDate = semDate;
      }
    }
  }

  if (!allSemestersPassedAndIssued || !latestFinalizeDate) {
    return false;
  }

  const autoIssueDate = new Date(latestFinalizeDate);
  autoIssueDate.setDate(autoIssueDate.getDate() + (config.autoMarksheetDays || 0) + (config.autoCertificateDays || 0));

  const now = new Date();
  return now >= autoIssueDate;
}

export function getDocumentStatus(student: any, semester: any, config: RegistrationConfig | null | undefined) {
  const isMarksheetAuto = semester ? isMarksheetAutoIssued(semester, config, student) : false;
  const isCertAuto = isCertificateAutoIssued(student, config);

  return {
    isMarksheetAuto,
    finalMarksheetIssued: semester?.marksheetIssuedToStudent || isMarksheetAuto,
    finalMarksheetApproved: semester?.marksheetApproved || isMarksheetAuto,
    
    isCertAuto,
    finalCertIssued: student?.certificateIssuedToStudent || isCertAuto,
    finalCertApproved: student?.certificateApproved || isCertAuto,
  };
}
