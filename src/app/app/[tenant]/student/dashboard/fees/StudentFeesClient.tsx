"use client";

import React, { useState } from "react";
import { IndianRupee, Receipt, AlertCircle, CheckCircle2, ShieldCheck, Upload, Loader2, Calendar, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateInvoiceProof } from "@/app/actions/payments";

export default function StudentFeesClient({
  workspaceId,
  student,
  invoices,
  paymentConfig
}: {
  workspaceId: string;
  student: any;
  invoices: any[];
  paymentConfig: any;
}) {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((sum, i) => sum + i.amount, 0);

  const openPayModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPayModalOpen(true);
  };

  const handleProofUpload = async (result: any) => {
    if (result?.info?.secure_url && selectedInvoice) {
      setIsUploading(true);
      const res = await updateInvoiceProof(selectedInvoice.id, result.info.secure_url);
      setIsUploading(false);
      if (res.success) {
        toast.success("Payment proof uploaded successfully! Awaiting admin verification.");
        setPayModalOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to upload proof");
      }
    }
  };

  const downloadReceipt = async (invoice: any) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Receipt No: REC-${invoice.id.substring(0, 8).toUpperCase()}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.paidDate || invoice.createdAt).toLocaleDateString()}`, 20, 50);
    
    doc.text(`Student Name: ${student.fullName}`, 20, 70);
    doc.text(`Enrollment No: ${student.enrollmentNo || 'N/A'}`, 20, 80);
    doc.text(`Course: ${student.course?.title || "N/A"}`, 20, 90);
    
    doc.text(`Fee Details: ${invoice.notes || invoice.feeType}`, 20, 110);
    doc.text(`Payment Method: ${invoice.paymentMethod || "Offline"}`, 20, 120);
    
    doc.setFontSize(16);
    doc.text(`Amount Paid: Rs. ${invoice.amount}`, 20, 140);
    
    doc.setFontSize(10);
    doc.text("Thank you for your payment.", 105, 180, { align: "center" });
    
    doc.save(`Receipt_${student.enrollmentNo || 'Student'}_${invoice.feeType}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-950 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Fees & Invoices</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Manage your course payments</p>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="py-20 text-center space-y-6 max-w-lg mx-auto bg-white dark:bg-zinc-950 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-sm p-10">
          <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
            <Receipt className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">No Fees Structure Found</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your payment structure has not been generated yet. Please contact your center administrator.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Paid</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white flex items-center">
                  <IndianRupee className="w-8 h-8 mr-1 text-slate-400 dark:text-slate-600" /> {totalPaid}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Pending</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white flex items-center">
                  <IndianRupee className="w-8 h-8 mr-1 text-slate-400 dark:text-slate-600" /> {totalPending}
                </p>
              </div>
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-900 dark:bg-zinc-900 text-white p-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black">Fee Structure & History</CardTitle>
                  <CardDescription className="text-slate-400 dark:text-zinc-400 font-medium">View your pending and paid invoices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/50">
                      <th className="px-8 py-6 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Invoice Details</th>
                      <th className="px-8 py-6 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Due Date</th>
                      <th className="px-8 py-6 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                      <th className="px-8 py-6 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                      <th className="px-8 py-6 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-900 dark:text-white text-base">{inv.notes || inv.feeType}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className={cn(
                            "border-none px-3 py-1 font-bold tracking-widest uppercase text-[10px]",
                            inv.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            inv.status === "OVERDUE" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}>
                            {inv.status}
                          </Badge>
                          {inv.paymentProof && inv.status !== "PAID" && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 font-bold uppercase tracking-widest">Verification Pending</p>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right font-black font-mono text-lg text-slate-900 dark:text-white">
                          ₹{inv.amount}
                        </td>
                        <td className="px-8 py-6 text-right">
                          {inv.status === "PAID" ? (
                            <Button variant="outline" size="sm" onClick={() => downloadReceipt(inv)} className="rounded-xl font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 h-10 px-4">
                              <Download className="w-4 h-4 mr-2" /> Receipt
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => openPayModal(inv)} className="rounded-xl font-bold shadow-lg shadow-primary/20 h-10 px-6">
                              Pay Now
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl bg-white dark:bg-zinc-950">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" /> Pay Offline
            </DialogTitle>
          </DialogHeader>

          {!paymentConfig ? (
            <div className="text-center py-10 bg-amber-50 dark:bg-amber-500/10 rounded-3xl border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-4" />
              <p className="font-bold text-lg">Payment Details Not Configured</p>
              <p className="text-sm opacity-80 mt-1 font-medium">Please pay directly at the center in cash.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-3xl flex justify-between items-center border border-slate-100 dark:border-zinc-800">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">Amount to Pay</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                    <IndianRupee className="w-6 h-6 mr-1" /> {selectedInvoice?.amount}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold px-4 py-2 text-xs uppercase tracking-widest">
                  {selectedInvoice?.feeType}
                </Badge>
              </div>

              {/* Instructions */}
              {paymentConfig.instructions && (
                <div className="p-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                  <p className="text-sm font-bold text-indigo-800 dark:text-indigo-400 flex items-start gap-2">
                    <FileText className="w-5 h-5 shrink-0" /> {paymentConfig.instructions}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentConfig.qrCodeUrl && (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl space-y-4">
                    <h4 className="font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Scan to Pay</h4>
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-800">
                      <Image src={paymentConfig.qrCodeUrl} alt="QR Code" fill className="object-cover" />
                    </div>
                    {paymentConfig.upiId && <p className="font-mono text-xs font-bold text-center text-slate-700 dark:text-slate-300">{paymentConfig.upiId}</p>}
                  </div>
                )}

                {paymentConfig.bankName && (
                  <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-zinc-800 space-y-4">
                    <h4 className="font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800 pb-3">Bank Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Bank</span>
                        <span className="font-bold text-slate-900 dark:text-white">{paymentConfig.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Name</span>
                        <span className="font-bold text-slate-900 dark:text-white">{paymentConfig.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">A/C</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{paymentConfig.accountNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">IFSC</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{paymentConfig.ifscCode}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={handleProofUpload}>
                  {({ open }) => (
                    <Button onClick={(e) => { e.preventDefault(); open(); }} disabled={isUploading} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                      {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                      Upload Payment Screenshot
                    </Button>
                  )}
                </CldUploadWidget>
                <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
                  Upload screenshot of your transaction for admin verification.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
