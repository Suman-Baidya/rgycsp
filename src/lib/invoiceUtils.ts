import { jsPDF } from "jspdf";

const getBase64ImageFromUrl = async (imageUrl: string) => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image for PDF:', error);
    return null;
  }
};

export const generateInvoicePDF = async (data: {
  workspaceInfo: any;
  student: any;
  invoice: any;
  allInvoices?: any[];
}) => {
  const { workspaceInfo, student, invoice, allInvoices = [] } = data;
  const doc = new jsPDF();

  const themeColor = workspaceInfo?.primaryColor || "#0056b3"; // Default blue
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 86, b: 179 };
  };
  const rgb = hexToRgb(themeColor);

  // Constants
  const startX = 20;
  const rightX = 130;
  const rightValX = 190;

  // 1. Watermark (Background)
  const shortName = "RGYCSP";
  doc.setTextColor(245, 245, 245); // Very light gray so it stays a watermark
  doc.setFontSize(120); // Huge font for the middle of the page
  doc.setFont("helvetica", "bold");

  // Since older jsPDF versions ignore baseline: 'middle', we manually offset the pivot point.
  // A4 center is (105, 148.5). Font size 100pt is ~35mm height. Half height is ~17.5mm.
  // Rotated at 45 degrees clockwise, the visual center shifts +12.4mm in X and -12.4mm in Y relative to the baseline pivot.
  // To make the visual center hit exactly (105, 148.5), the pivot must be exactly at:
  // X = 105 - 12.4 = 92.6
  // Y = 148.5 + 12.4 = 160.9
  doc.text(shortName, 140, 200, { align: "center", angle: 45 });

  // 1b. INVOICE Title
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", startX, 25);

  // 2. Company Details (Left)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(workspaceInfo?.name?.toUpperCase() || "FRANCHISE NAME", startX, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const addressLines = doc.splitTextToSize(workspaceInfo?.address || "Address not provided", 90);
  doc.text(addressLines, startX, 51);

  let currentYContact = 51 + (addressLines.length * 4);
  if (workspaceInfo?.phone) {
    doc.text(`Phone: ${workspaceInfo.phone}`, startX, currentYContact);
    currentYContact += 4;
  }
  if (workspaceInfo?.email) {
    doc.text(`Email: ${workspaceInfo.email}`, startX, currentYContact);
  }

  // 3. Invoice Details (Right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text("Invoice Date :", rightX, 45);
  doc.text("Invoice No. :", rightX, 52);

  doc.setTextColor(0, 0, 0);
  const formatDDMMYYYY = (dStr: any) => {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return "N/A";
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  const invoiceDateStr = invoice.paidDate ? formatDDMMYYYY(invoice.paidDate) : formatDDMMYYYY(invoice.createdAt || new Date());
  const invoiceNo = invoice.id ? invoice.id.substring(0, 8).toUpperCase() : "INV-1000";

  doc.setFont("helvetica", "bold");
  doc.text(invoiceDateStr, rightValX, 45, { align: "right" });
  doc.text(invoiceNo, rightValX, 52, { align: "right" });

  // 4. Middle Section (Client Details & Additional Invoice Details)
  const midY = 85;

  // Client Details -> Student Details
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.setFontSize(10);
  doc.text("Student Details", startX, midY);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("This invoice is sent to:", startX, midY + 7);
  doc.setFont("helvetica", "bold");
  doc.text(`Name: ${student.fullName || 'N/A'}`, startX, midY + 14);
  doc.text(`Course: ${student.course?.title || 'N/A'}`, startX, midY + 21);
  doc.text(`Enrollment No: ${student.enrollmentNo || 'N/A'}`, startX, midY + 28);

  // Right side Details
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text("Invoice Details", rightX, midY);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Mode of Payment :", rightX, midY + 7);
  doc.text("Due Date :", rightX, midY + 14);
  doc.text("Status :", rightX, midY + 21);

  doc.setFont("helvetica", "normal");
  doc.text(invoice.paymentMethod || "Cash/Online", rightValX, midY + 7, { align: "right" });
  doc.text(invoice.dueDate ? formatDDMMYYYY(invoice.dueDate) : "N/A", rightValX, midY + 14, { align: "right" });
  doc.text(invoice.status || "PENDING", rightValX, midY + 21, { align: "right" });

  // 5. Disclaimer
  const disclaimerY = 125;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const disclaimerText = "The clients understand that late payment has an additional penalty, which will reflect in the following invoice. For this reason, we are reminding the clients to pay on or before the due date to avoid charges. Thank you very much.";
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, 170);
  doc.text(splitDisclaimer, startX, disclaimerY);

  // 6. Table Header
  const tableY = 145;
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(startX, tableY, 170, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("Item#", startX + 5, tableY + 6.5);
  doc.text("Description", startX + 25, tableY + 6.5);
  doc.text("Price", 130, tableY + 6.5, { align: "right" });
  doc.text("Amount", 185, tableY + 6.5, { align: "right" });

  // 7. Table Row(s)
  let currentY = tableY + 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // Row 1 Background
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, currentY, 170, 12, 'F');

  const desc = invoice.notes || invoice.feeType || "Fee Payment";
  const amount = Number(invoice.amount) || 0;

  doc.text("1", startX + 5, currentY + 7.5);
  doc.text(desc.length > 50 ? desc.substring(0, 47) + '...' : desc, startX + 25, currentY + 7.5);
  doc.text(`${amount.toFixed(2)}`, 130, currentY + 7.5, { align: "right" });
  doc.text(`${amount.toFixed(2)}`, 185, currentY + 7.5, { align: "right" });

  currentY += 12;

  // 8. Summary Footer
  const summaryY = currentY + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal", 145, summaryY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Rs. ${amount.toFixed(2)}`, 185, summaryY, { align: "right" });

  // Total Payment Box
  const totalBoxY = summaryY + 8;
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(110, totalBoxY, 80, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Total Payment", 145, totalBoxY + 7, { align: "right" });
  doc.text(`Rs. ${amount.toFixed(2)}`, 185, totalBoxY + 7, { align: "right" });

  // Remaining Due Balance
  // Remaining Due Balance is simply the sum of all unpaid/pending invoices
  const remainingBalance = allInvoices
    .filter((i: any) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((sum: number, i: any) => sum + Number(i.amount), 0);

  const remainBoxY = totalBoxY + 14;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Remain Due balance", 145, remainBoxY + 6.5, { align: "right" });
  doc.setTextColor(220, 38, 38); // Red color for due balance
  doc.text(`Rs. ${remainingBalance.toFixed(2)}`, 185, remainBoxY + 6.5, { align: "right" });

  // 9. Extra info box (Very bottom)
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const bottomNote = "* If you find any discrepancies, please contact the accounting department.";
  doc.text(bottomNote, startX, 285);

  doc.save(`Invoice_${student.enrollmentNo}_${invoice.feeType}.pdf`);
};
