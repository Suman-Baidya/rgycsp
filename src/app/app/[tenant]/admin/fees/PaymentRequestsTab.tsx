"use client";

import React, { useState } from "react";
import { AlertCircle, IndianRupee, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { recordManualOfflinePayment, rejectInvoiceProof } from "@/app/actions/payments";
import { toast } from "sonner";

export default function PaymentRequestsTab({ 
  workspaceId, 
  pendingFees 
}: { 
  workspaceId: string;
  pendingFees?: any[];
}) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ method: "CASH", notes: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentForm({ method: "CASH", notes: "" });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    const res = await recordManualOfflinePayment(selectedInvoice.id, paymentForm.method, paymentForm.notes);
    setIsProcessing(false);
    
    if (res.success) {
      toast.success("Payment recorded successfully!");
      setPaymentModalOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to record payment");
    }
  };

  const handleRejectProof = async () => {
    if (!selectedInvoice) return;
    if (!rejectReason.trim()) return toast.error("Please provide a reason for rejection");
    
    setIsRejecting(true);
    const res = await rejectInvoiceProof(selectedInvoice.id, rejectReason);
    setIsRejecting(false);
    
    if (res.success) {
      toast.success("Payment proof rejected");
      setRejectModalOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to reject payment proof");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="font-black text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Payment Verifications
        </h4>
        
        {!pendingFees || pendingFees.length === 0 ? (
          <div className="bg-slate-50 dark:bg-zinc-900/40 p-8 rounded-3xl border border-dashed border-border text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h5 className="font-bold text-lg">No Pending Requests</h5>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">All payment proofs have been verified. When students upload new screenshots, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-500/10 border-b border-amber-500/20">
                  <th className="px-6 py-4 text-left font-bold text-amber-900/70 dark:text-amber-500/70">Student</th>
                  <th className="px-6 py-4 text-left font-bold text-amber-900/70 dark:text-amber-500/70">Fee Details</th>
                  <th className="px-6 py-4 text-left font-bold text-amber-900/70 dark:text-amber-500/70">Uploaded On</th>
                  <th className="px-6 py-4 text-right font-bold text-amber-900/70 dark:text-amber-500/70">Amount</th>
                  <th className="px-6 py-4 text-right font-bold text-amber-900/70 dark:text-amber-500/70">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {pendingFees.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.student.fullName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{inv.student.enrollmentNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.notes || inv.feeType}</p>
                      {inv.paymentProof && (
                        <a href={inv.paymentProof} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                          View Uploaded Proof
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {inv.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(inv.updatedAt)) : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {inv.updatedAt ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(inv.updatedAt)) : ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-black font-mono">
                      ₹{inv.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setRejectReason("");
                            setRejectModalOpen(true);
                          }} 
                          className="rounded-lg h-8 border-red-500/20 text-red-600 hover:bg-red-500/10"
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => openPaymentModal(inv)} 
                          className="rounded-lg h-8 font-bold shadow-md shadow-primary/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Amount to Collect</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" /> {selectedInvoice?.amount}
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                {selectedInvoice?.feeType}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select 
                value={paymentForm.method} 
                onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-zinc-950 border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI Transfer</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Notes / Transaction ID (Optional)</Label>
              <Input 
                value={paymentForm.notes} 
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="e.g. TXN123456" 
                className="h-12 rounded-xl"
              />
            </div>

            <Button onClick={handleRecordPayment} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white text-red-600">Reject Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">Please provide a reason for rejecting this payment proof. The student will be notified to upload a valid proof again.</p>
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <textarea 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)}
                className="w-full h-24 p-4 rounded-xl border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 text-sm"
                placeholder="e.g. Screenshot is blurry, Transaction ID not matching..."
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setRejectModalOpen(false)} variant="outline" className="flex-1 h-12 rounded-xl">Cancel</Button>
              <Button onClick={handleRejectProof} disabled={isRejecting} className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20">
                {isRejecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
