/**
 * Utility functions for calculating student fee dues and tenure/semester pro-rated payments
 */

export interface StudentDueCalculation {
  totalDues: number;
  semesterTenureDues: number;
  isDue: boolean;
  dueReason?: string;
  overdueCount: number;
  elapsedMonths: number;
  paymentType: "ONE_TIME" | "EMI" | string;
}

/**
 * Calculates whether a student has pending fee dues up to a specific examination date.
 * For EMI students, it evaluates installments scheduled up to the elapsed exam tenure (e.g. 6 months for Semester 1)
 * rather than requiring full 100% course payment upfront.
 */
export function calculateStudentExamFeeDues(
  student: any,
  examDate?: Date | string | null
): StudentDueCalculation {
  if (!student) {
    return {
      totalDues: 0,
      semesterTenureDues: 0,
      isDue: false,
      overdueCount: 0,
      elapsedMonths: 0,
      paymentType: "ONE_TIME"
    };
  }

  const targetDate = examDate ? new Date(examDate) : new Date();
  const admissionDate = student.admissionDate ? new Date(student.admissionDate) : (student.createdAt ? new Date(student.createdAt) : new Date());

  // Calculate elapsed months between admission date and target exam date
  let elapsedMonths = (targetDate.getFullYear() - admissionDate.getFullYear()) * 12 + (targetDate.getMonth() - admissionDate.getMonth());
  if (elapsedMonths < 1) elapsedMonths = 1;

  const invoices = student.invoices || [];
  const unpaidInvoices = invoices.filter((inv: any) => inv.status !== "PAID" && inv.status !== "CANCELLED");

  const totalDues = unpaidInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
  const paymentType = (student.paymentType || "ONE_TIME").toUpperCase();

  if (paymentType === "ONE_TIME") {
    const isDue = totalDues > 0;
    return {
      totalDues,
      semesterTenureDues: totalDues,
      isDue,
      dueReason: isDue ? `₹${totalDues.toLocaleString()} Course Fee Pending` : undefined,
      overdueCount: unpaidInvoices.length,
      elapsedMonths,
      paymentType: "ONE_TIME"
    };
  }

  // EMI / Installment logic:
  // Invoices whose dueDate is on or before the target exam date
  const tenureDueInvoices = unpaidInvoices.filter((inv: any) => {
    if (!inv.dueDate) return true;
    return new Date(inv.dueDate) <= targetDate;
  });

  const semesterTenureDues = tenureDueInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
  const isDue = semesterTenureDues > 0;

  return {
    totalDues,
    semesterTenureDues,
    isDue,
    dueReason: isDue
      ? `₹${semesterTenureDues.toLocaleString()} pending for Month 1–${elapsedMonths} installments`
      : undefined,
    overdueCount: tenureDueInvoices.length,
    elapsedMonths,
    paymentType: "EMI"
  };
}
