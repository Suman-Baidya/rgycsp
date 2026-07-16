import { RegistrationConfig } from "@prisma/client";

export function isMarksheetAutoIssued(semester: any, config: RegistrationConfig | null | undefined, studentProfile?: any): boolean {
  if (studentProfile?.documentIssueRequestedAt && checkRequestedAutoIssue(studentProfile.documentIssueRequestedAt, config)) {
    return true;
  }
  if (!config?.autoDocumentIssueEnabled) return false;
  if (!semester?.marksFinalizedAt) return false;

  const finalizedDate = new Date(semester.marksFinalizedAt);
  const now = new Date();
  
  const autoIssueDate = new Date(finalizedDate);
  autoIssueDate.setDate(autoIssueDate.getDate() + (config.autoMarksheetDays || 0));

  return now >= autoIssueDate;
}

function checkRequestedAutoIssue(requestedAt: Date | null | undefined, config: RegistrationConfig | null | undefined): boolean {
  if (!requestedAt || !config || (config.autoIssueAfterRequestHours || 0) <= 0) return false;
  
  const autoIssueTime = new Date(requestedAt);
  autoIssueTime.setHours(autoIssueTime.getHours() + config.autoIssueAfterRequestHours);
  
  return new Date() >= autoIssueTime;
}

export function isCertificateAutoIssued(student: any, config: RegistrationConfig | null | undefined): boolean {
  if (student?.documentIssueRequestedAt && checkRequestedAutoIssue(student.documentIssueRequestedAt, config)) {
    return true;
  }
  if (!config?.autoDocumentIssueEnabled) return false;
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
