export function parseCourseDuration(durationStr: string | null | undefined): { type: "MONTHS" | "HOURS", value: number } {
  if (!durationStr) return { type: "MONTHS", value: 0 };
  
  const lowerStr = durationStr.toLowerCase().trim();
  
  // Hours parsing
  if (lowerStr.includes("hour") || lowerStr.includes("hr")) {
    const match = lowerStr.match(/(\d+)/);
    if (match) return { type: "HOURS", value: parseInt(match[1]) };
  }
  
  // Years parsing
  if (lowerStr.includes("year") || lowerStr.includes("yr")) {
    const match = lowerStr.match(/(\d+(\.\d+)?)/);
    if (match) return { type: "MONTHS", value: Math.round(parseFloat(match[1]) * 12) };
  }
  
  // Months parsing (default)
  const match = lowerStr.match(/(\d+)/);
  if (match) return { type: "MONTHS", value: parseInt(match[1]) };

  return { type: "MONTHS", value: 0 };
}

export function getExpectedUnitsForSemester(course: any, semesterNumber: number): number {
  if (!course || !course.topics) return 6; // Default to 6 units if no syllabus defined

  let topicsObj = null;
  if (typeof course.topics === 'string') {
    try { topicsObj = JSON.parse(course.topics); } catch (e) {}
  } else {
    topicsObj = course.topics;
  }

  if (!topicsObj || Object.keys(topicsObj).length === 0) return 6;

  if (Array.isArray(topicsObj)) {
    const semData = topicsObj[semesterNumber - 1];
    if (semData) {
      const units = Array.isArray(semData.items) ? semData.items : (Array.isArray(semData.units) ? semData.units : semData);
      return Array.isArray(units) ? units.length : 0;
    }
    return 0;
  }

  if (typeof topicsObj === 'object' && topicsObj !== null) {
    const keys = Object.keys(topicsObj).filter(k => k.toLowerCase().startsWith('sem'));
    if (keys.length > 0) {
      const targetSemKey = keys.find(k => {
        const numMatch = k.match(/\d+/);
        return numMatch && parseInt(numMatch[0]) === semesterNumber;
      });
      if (targetSemKey) {
        const unitsList = topicsObj[targetSemKey];
        return Array.isArray(unitsList) ? unitsList.length : 0;
      }
      return 0;
    }
    
    // If no 'sem' keys but object exists, assume it's all sem 1
    if (semesterNumber === 1) {
      const flatList = Array.isArray(topicsObj) ? topicsObj : Object.values(topicsObj).flat();
      return Array.isArray(flatList) ? flatList.length : 0;
    }
  }

  return 0;
}

export function getRequiredMarksheetCount(durationStr: string | null | undefined): number {
  const duration = parseCourseDuration(durationStr);
  
  if (duration.type === "HOURS") {
    return 1; // Short term courses get 1 marksheet by default
  }
  
  if (duration.value === 0) return 0;
  
  // For months, 1 marksheet per 6 months. (e.g. 6 -> 1, 12 -> 2, 18 -> 3)
  // If it's a 3 month course, it will be ceil(3/6) = 1.
  return Math.max(1, Math.ceil(duration.value / 6));
}

export function getRequiredDateForCertificate(admissionDate: Date | string | null | undefined, durationStr: string | null | undefined): Date {
  const date = admissionDate ? new Date(admissionDate) : new Date();
  const duration = parseCourseDuration(durationStr);
  
  if (duration.type === "HOURS") {
    date.setHours(date.getHours() + duration.value);
  } else {
    date.setMonth(date.getMonth() + duration.value);
  }
  
  return date;
}

export function isValidIssueGap(admissionDate: Date | string | null | undefined, durationStr: string | null | undefined): { valid: boolean, requiredDate: Date } {
  const requiredDate = getRequiredDateForCertificate(admissionDate, durationStr);
  const now = new Date();
  
  return {
    valid: now >= requiredDate,
    requiredDate
  };
}

export function getRequiredDateForMarksheet(admissionDate: Date | string | null | undefined, semesterNumber: number): Date {
  // Marksheet issue timing: (Semester Number * 6) - 1 months
  // e.g., Sem 1 -> 5 months, Sem 2 -> 11 months
  const date = admissionDate ? new Date(admissionDate) : new Date();
  const monthsToAdd = (semesterNumber * 6) - 1;
  date.setMonth(date.getMonth() + Math.max(0, monthsToAdd));
  return date;
}

export function isValidMarksheetGap(admissionDate: Date | string | null | undefined, semesterNumber: number, durationStr: string | null | undefined): { valid: boolean, requiredDate: Date } {
  const duration = parseCourseDuration(durationStr);
  
  if (duration.type === "HOURS") {
    // For short-term courses (hours), marksheet can be issued at the end of the course
    const requiredDate = getRequiredDateForCertificate(admissionDate, durationStr);
    const now = new Date();
    return { valid: now >= requiredDate, requiredDate };
  }
  
  const requiredDate = getRequiredDateForMarksheet(admissionDate, semesterNumber);
  const now = new Date();
  return { valid: now >= requiredDate, requiredDate };
}
