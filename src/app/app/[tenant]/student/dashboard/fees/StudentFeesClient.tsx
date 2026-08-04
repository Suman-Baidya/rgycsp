"use client";

import React, { useState } from "react";
import { IndianRupee, Receipt, AlertCircle, CheckCircle2, ShieldCheck, Upload, Loader2, Calendar, FileText, Download, Info, QrCode, Landmark, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateInvoiceProof } from "@/app/actions/payments";

export default function StudentFeesClient({
  workspaceId,
  student,
  invoices,
  paymentConfig,
  workspaceInfo
}: {
  workspaceId: string;
  student: any;
  invoices: any[];
  paymentConfig: any;
  workspaceInfo: any;
}) {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [payMethod, setPayMethod] = useState<"upi" | "bank" | "instructions">("upi");
  const router = useRouter();

  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((sum, i) => sum + i.amount, 0);

  const openPayModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPayModalOpen(true);
  };

  const handleProofUpload = async (url: string) => {
    if (url && selectedInvoice) {
      setIsUploading(true);
      const res = await updateInvoiceProof(selectedInvoice.id, url);
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
    const { generateInvoicePDF } = await import("@/lib/invoiceUtils");
    await generateInvoicePDF({
      workspaceInfo,
      student,
      invoice,
      allInvoices: invoices
    });
  };

  const pendingInvoices = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE");
  const sortedPending = [...pendingInvoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const nextPayment = sortedPending[0];

  const emiInvoices = invoices.filter(i => i.feeType === "INSTALLMENT");
  const totalEmis = emiInvoices.length;
  const paidEmis = emiInvoices.filter(i => i.status === "PAID").length;
  const emiProgress = totalEmis > 0 ? Math.round((paidEmis / totalEmis) * 100) : 0;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Fees & Invoices</h1>
          <p className="text-slate-500 font-medium text-lg">Manage your course payments and view your payment history.</p>
        </div>
        
        <div className={cn(
          "px-4 py-2 rounded-xl border-2 font-black text-sm tracking-wider uppercase flex items-center gap-2",
          student.paymentType === "EMI" 
            ? "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400" 
            : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
        )}>
          {student.paymentType === "EMI" ? "EMI Plan" : "One-Time Payment"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Paid</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <IndianRupee className="w-6 h-6 mr-1 opacity-50" /> {totalPaid}
              </p>
            </div>
            
            <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Pending</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <IndianRupee className="w-6 h-6 mr-1 opacity-50" /> {totalPending}
              </p>
            </div>

            {nextPayment ? (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400 p-6 rounded-[2rem] shadow-md shadow-indigo-500/20 flex flex-col justify-between lg:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-white/20"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-100 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Next Upcoming Payment
                    </p>
                    <Badge variant="outline" className={cn("text-xs font-bold border-none", nextPayment.status === "OVERDUE" ? "bg-red-500 text-white" : "bg-white/20 text-white")}>
                      {nextPayment.status === "OVERDUE" ? "OVERDUE" : `Due ${new Date(nextPayment.dueDate).toLocaleDateString()}`}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-100 mb-1">{nextPayment.notes || nextPayment.feeType}</p>
                      <p className="text-3xl font-black text-white flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1 opacity-80" /> {nextPayment.amount}
                      </p>
                    </div>
                    <Button onClick={() => openPayModal(nextPayment)} className="bg-white text-indigo-600 hover:bg-slate-50 rounded-xl font-bold shadow-lg">
                      Pay Now
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 p-6 rounded-[2rem] flex items-center justify-center lg:col-span-2">
                <p className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> No pending payments
                </p>
              </div>
            )}
          </div>

          {student.paymentType === "EMI" && totalEmis > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">EMI Progress Tracker</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You have paid {paidEmis} out of {totalEmis} installments.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{emiProgress}%</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Completed</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-900 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${emiProgress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                </div>
              </div>
            </div>
          )}

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
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] bg-white dark:bg-zinc-950">
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header Gradient */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-primary to-purple-700 px-8 py-10 overflow-hidden sticky top-0 z-50 shadow-md">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              
              <button 
                onClick={() => setPayModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm z-20"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  {selectedInvoice?.feeType && (
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-md mb-3 px-3 py-1 uppercase tracking-widest text-[10px] font-black shadow-sm">
                      {selectedInvoice.feeType.replace("_", " ")}
                    </Badge>
                  )}
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-3xl md:text-4xl font-black text-white flex items-center gap-2 drop-shadow-md">
                      Complete Payment
                    </DialogTitle>
                  </div>
                  <p className="text-indigo-100 font-medium mt-2 max-w-sm">
                    Scan the QR code or use the bank details below to make your payment securely.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[160px]">
                  <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-4xl font-black text-white flex items-center drop-shadow-md">
                    <IndianRupee className="w-7 h-7 mr-1 opacity-80" /> {selectedInvoice?.amount}
                  </p>
                </div>
              </div>
            </div>

            {!paymentConfig ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-500" />
                </div>
                <p className="font-black text-2xl text-slate-900 dark:text-white mb-2">Payment Details Not Configured</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Please pay directly at the center in cash or contact administration.</p>
              </div>
            ) : (
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Payment Method
                    {paymentConfig.instructions && (
                      <button
                        onClick={() => toast.info(
                          <div className="whitespace-pre-wrap text-sm">
                            <strong className="block mb-2">Important Instructions:</strong>
                            {paymentConfig.instructions}
                          </div>, 
                          { duration: 8000 }
                        )}
                        className="text-slate-400 hover:text-blue-500 transition-colors bg-slate-100 hover:bg-blue-50 p-1.5 rounded-full"
                        title="View Instructions"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </h3>
                </div>
                
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      className="w-4 h-4 text-primary bg-slate-100 border-slate-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-slate-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600" 
                      checked={payMethod === "upi"} 
                      onChange={() => setPayMethod("upi")} 
                    />
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                      <QrCode className="w-4 h-4" />
                      <span className="font-bold text-sm">UPI Details</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600" 
                      checked={payMethod === "bank"} 
                      onChange={() => setPayMethod("bank")} 
                    />
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                      <Landmark className="w-4 h-4" />
                      <span className="font-bold text-sm">Bank Details</span>
                    </div>
                  </label>
                </div>

                <div className="min-h-[300px]">
                  {/* QR Code Section */}
                  {payMethod === "upi" && (
                    paymentConfig.qrCodeUrl || paymentConfig.upiId ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
                        <h4 className="font-black text-xs text-primary uppercase tracking-widest mb-6 relative z-10">Scan to Pay</h4>
                        
                        {paymentConfig.qrCodeUrl && (
                          <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-zinc-800 bg-white group-hover:scale-105 transition-transform duration-300 z-10">
                            <Image src={paymentConfig.qrCodeUrl} alt="QR Code" fill className="object-cover p-2" />
                          </div>
                        )}
                        
                        {paymentConfig.upiId && (
                          <div className="mt-6 flex items-center justify-center gap-2 bg-white dark:bg-zinc-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-primary/50 transition-colors z-10"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentConfig.upiId);
                              toast.success("UPI ID copied!");
                            }}
                          >
                            <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{paymentConfig.upiId}</span>
                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400 font-medium">
                        UPI payment details not available.
                      </div>
                    )
                  )}

                  {/* Bank Details Section */}
                  {payMethod === "bank" && (
                    paymentConfig.bankName ? (
                      <div className="p-8 bg-slate-50 dark:bg-zinc-900/50 rounded-[2rem] border border-slate-100 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -ml-10 -mb-10 transition-all group-hover:bg-indigo-500/10"></div>
                        <h4 className="font-black text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800 pb-4 mb-6 relative z-10">Bank Transfer Details</h4>
                        
                        <div className="space-y-5 text-sm relative z-10">
                          <div className="flex flex-col">
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Bank Name</span>
                            <span className="font-bold text-slate-900 dark:text-white text-base">{paymentConfig.bankName}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Account Holder</span>
                            <span className="font-bold text-slate-900 dark:text-white text-base">{paymentConfig.accountHolderName}</span>
                          </div>
                          <div className="flex justify-between items-end bg-white dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentConfig.accountNumber);
                              toast.success("Account number copied!");
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Account Number</span>
                              <span className="font-mono font-black text-slate-900 dark:text-white text-lg">{paymentConfig.accountNumber}</span>
                            </div>
                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            </div>
                          </div>
                          <div className="flex justify-between items-end bg-white dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentConfig.ifscCode);
                              toast.success("IFSC code copied!");
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">IFSC Code</span>
                              <span className="font-mono font-black text-slate-900 dark:text-white text-base">{paymentConfig.ifscCode}</span>
                            </div>
                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400 font-medium">
                        Bank details not available.
                      </div>
                    )
                  )}
                </div>

              {/* Upload Section */}
              <div className="pt-8 border-t border-slate-200 dark:border-zinc-800">
                <div className="bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900/50 dark:to-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2 mb-2">
                    <Upload className="w-5 h-5 text-primary" /> Upload Payment Proof
                  </h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Please upload a clear screenshot of your successful transaction. Once verified by our administration, your invoice will be marked as paid.
                  </p>
                  
                  <div className="max-w-xs mx-auto">
                    <ImageUpload
                      value={null}
                      onChange={handleProofUpload}
                      folder={`RGYCSP/${workspaceId}/payment-proofs`}
                      label="Upload Screenshot"
                    />
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
