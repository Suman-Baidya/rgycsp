"use client";

import React, { useState } from "react";
import { IndianRupee, Receipt, AlertCircle, CheckCircle2, ShieldCheck, Upload, Loader2, Calendar, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
// Need a small server action to save proof
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

  const downloadReceipt = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Receipt No: REC-${invoice.id.substring(0, 8).toUpperCase()}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.paidDate).toLocaleDateString()}`, 20, 50);
    
    doc.text(`Student Name: ${student.fullName}`, 20, 70);
    doc.text(`Enrollment No: ${student.enrollmentNo}`, 20, 80);
    doc.text(`Course: ${student.course?.title || "N/A"}`, 20, 90);
    
    doc.text(`Fee Details: ${invoice.notes || invoice.feeType}`, 20, 110);
    doc.text(`Payment Method: ${invoice.paymentMethod || "Offline"}`, 20, 120);
    
    doc.setFontSize(16);
    doc.text(`Amount Paid: Rs. ${invoice.amount}`, 20, 140);
    
    doc.setFontSize(10);
    doc.text("Thank you for your payment.", 105, 180, { align: "center" });
    
    doc.save(`Receipt_${student.enrollmentNo}_${invoice.feeType}.pdf`);
  };

  if (invoices.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 max-w-lg mx-auto bg-white dark:bg-zinc-950 rounded-[3rem] border border-border/40 shadow-sm p-10">
        <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-muted-foreground/30">
          <Receipt className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">No Fees Structure Found</h2>
          <p className="text-muted-foreground">Your payment structure has not been generated yet. Please contact your center administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
          <Receipt className="w-8 h-8 text-primary" /> Fees & Invoices
        </h2>
        <p className="text-muted-foreground">Manage your course payments and download receipts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-8 rounded-3xl relative overflow-hidden">
          <CheckCircle2 className="absolute -right-6 -bottom-6 w-32 h-32 text-green-500/10" />
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">Total Paid</p>
            <p className="text-5xl font-black text-slate-900 dark:text-white flex items-center">
              <IndianRupee className="w-10 h-10 mr-1 text-slate-400" /> {totalPaid}
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-8 rounded-3xl relative overflow-hidden">
          <AlertCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-500/10" />
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Total Pending</p>
            <p className="text-5xl font-black text-slate-900 dark:text-white flex items-center">
              <IndianRupee className="w-10 h-10 mr-1 text-slate-400" /> {totalPending}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-border/60 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-border/50">
              <th className="px-6 py-5 text-left font-bold text-slate-500">Invoice Details</th>
              <th className="px-6 py-5 text-left font-bold text-slate-500">Due Date</th>
              <th className="px-6 py-5 text-left font-bold text-slate-500">Status</th>
              <th className="px-6 py-5 text-right font-bold text-slate-500">Amount</th>
              <th className="px-6 py-5 text-right font-bold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900 dark:text-white text-base">{inv.notes || inv.feeType}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <Badge variant="outline" className={cn(
                    "border-none px-3 py-1 font-bold",
                    inv.status === "PAID" ? "bg-green-500/10 text-green-600" :
                    inv.status === "OVERDUE" ? "bg-red-500/10 text-red-600" :
                    "bg-amber-500/10 text-amber-600"
                  )}>
                    {inv.status}
                  </Badge>
                  {inv.paymentProof && inv.status !== "PAID" && (
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">Verification Pending</p>
                  )}
                </td>
                <td className="px-6 py-5 text-right font-black font-mono text-lg">
                  ₹{inv.amount}
                </td>
                <td className="px-6 py-5 text-right">
                  {inv.status === "PAID" ? (
                    <Button variant="outline" size="sm" onClick={() => downloadReceipt(inv)} className="rounded-xl font-bold text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50">
                      <Download className="w-4 h-4 mr-2" /> Receipt
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => openPayModal(inv)} className="rounded-xl font-bold shadow-lg shadow-primary/20">
                      Pay Now
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" /> Pay Offline
            </DialogTitle>
          </DialogHeader>

          {!paymentConfig ? (
            <div className="text-center py-10 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-4" />
              <p className="font-bold text-lg">Payment Details Not Configured</p>
              <p className="text-sm opacity-80 mt-1">Please pay directly at the center in cash.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-3xl flex justify-between items-center border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Amount to Pay</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                    <IndianRupee className="w-6 h-6 mr-1" /> {selectedInvoice?.amount}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold px-3 py-1 text-sm">
                  {selectedInvoice?.feeType}
                </Badge>
              </div>

              {/* Instructions */}
              {paymentConfig.instructions && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                    <FileText className="inline w-4 h-4 mr-1" /> {paymentConfig.instructions}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentConfig.qrCodeUrl && (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-3xl space-y-4">
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Scan to Pay</h4>
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg border border-border/50">
                      <Image src={paymentConfig.qrCodeUrl} alt="QR Code" fill className="object-cover" />
                    </div>
                    {paymentConfig.upiId && <p className="font-mono text-xs font-bold text-center">{paymentConfig.upiId}</p>}
                  </div>
                )}

                {paymentConfig.bankName && (
                  <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-border/50 space-y-4">
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest border-b border-border/50 pb-2">Bank Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{paymentConfig.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{paymentConfig.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">A/C:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{paymentConfig.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IFSC:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{paymentConfig.ifscCode}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={handleProofUpload}>
                  {({ open }) => (
                    <Button onClick={(e) => { e.preventDefault(); open(); }} disabled={isUploading} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                      {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                      Upload Payment Screenshot
                    </Button>
                  )}
                </CldUploadWidget>
                <p className="text-center text-xs text-muted-foreground mt-3">
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
