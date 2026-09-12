"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertCircle, 
  IndianRupee, 
  Loader2, 
  CheckCircle2, 
  User, 
  Calendar, 
  ExternalLink, 
  Search, 
  XCircle, 
  Clock,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { recordManualOfflinePayment, rejectInvoiceProof } from "@/app/actions/payments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PaymentRequestsTab({ 
  workspaceId, 
  pendingFees = [] 
}: { 
  workspaceId: string;
  pendingFees?: any[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Payment approval modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ method: "UPI", notes: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return pendingFees;
    const q = searchTerm.toLowerCase();
    return pendingFees.filter(inv => 
      inv.student?.fullName?.toLowerCase().includes(q) ||
      inv.student?.enrollmentNo?.toLowerCase().includes(q) ||
      inv.feeType?.toLowerCase().includes(q) ||
      inv.notes?.toLowerCase().includes(q)
    );
  }, [pendingFees, searchTerm]);

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentForm({ method: "UPI", notes: "" });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    const res = await recordManualOfflinePayment(selectedInvoice.id, paymentForm.method, paymentForm.notes);
    setIsProcessing(false);
    
    if (res.success) {
      toast.success("Payment verified and recorded successfully!");
      setPaymentModalOpen(false);
      router.refresh();
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
      router.refresh();
    } else {
      toast.error(res.error || "Failed to reject payment proof");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Payment Verifications
                </h3>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded-full border-none">
                  {pendingFees.length} Pending
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve student offline payment screenshot proofs.
              </p>
            </div>

            {pendingFees.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 my-auto" />
                <Input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Filter by student or ID..."
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-xs placeholder:text-slate-400"
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pendingFees.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Caught Up!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                There are no pending offline payment verification requests. When students upload payment screenshots, they will appear here.
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-xs text-slate-500">No payment requests match your search query.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredRequests.map((inv) => (
                <div 
                  key={inv.id} 
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px] border-amber-500"
                >
                  {/* Student Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {inv.student?.fullName ? inv.student.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {inv.student?.fullName || "Unnamed Student"}
                        </span>
                        <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-amber-500/10 text-amber-600">
                          {inv.feeType || "Fee"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{inv.student?.enrollmentNo || "N/A"}</span>
                        {inv.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-400 font-sans">{inv.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end text-xs">
                    {/* Upload Proof Link */}
                    {inv.paymentProof ? (
                      <a 
                        href={inv.paymentProof} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2.5 py-1 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View Proof
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No receipt file</span>
                    )}

                    {/* Upload Timestamp */}
                    <div className="text-left lg:text-right shrink-0">
                      <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center lg:justify-end gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {inv.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(inv.updatedAt)) : "N/A"}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {inv.updatedAt ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(inv.updatedAt)) : ""}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-left lg:text-right shrink-0 min-w-[75px]">
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-center lg:justify-end">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> {inv.amount}
                      </span>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        Claimed
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setRejectReason("");
                          setRejectModalOpen(true);
                        }} 
                        className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => openPaymentModal(inv)} 
                        className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Approval Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approve & Record Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Amount to Record</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center font-mono">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> {selectedInvoice?.amount}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[9px] font-bold">
                  {selectedInvoice?.feeType}
                </Badge>
                <p className="text-[10px] text-slate-500 font-medium mt-1 truncate max-w-[150px]">
                  {selectedInvoice?.student?.fullName}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Payment Mode</Label>
              <select 
                value={paymentForm.method} 
                onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                className="w-full h-8 sm:h-9 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-xs font-medium"
              >
                <option value="UPI">UPI Transfer</option>
                <option value="CASH">Cash in Hand</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Notes / Transaction ID (Optional)</Label>
              <Input 
                value={paymentForm.notes} 
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="e.g. UPI Ref # / Receipt Note" 
                className="h-8 sm:h-9 text-xs rounded-lg"
              />
            </div>

            {selectedInvoice?.paymentProof && (
              <div className="text-xs">
                <a 
                  href={selectedInvoice.paymentProof} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary hover:underline inline-flex items-center gap-1 text-[11px] font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> View student's uploaded proof screenshot
                </a>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPaymentModalOpen(false)} 
                className="flex-1 h-8 sm:h-9 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRecordPayment} 
                disabled={isProcessing} 
                className="flex-1 h-8 sm:h-9 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                Confirm Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Reject Payment Proof
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide a clear reason for rejecting this payment proof. The student will be notified and can re-upload valid proof.
            </p>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Rejection Reason</Label>
              <textarea 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)}
                className="w-full h-20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 text-xs"
                placeholder="e.g. Screenshot blurry, Transaction ID mismatch, payment not received in bank..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setRejectModalOpen(false)} 
                className="flex-1 h-8 sm:h-9 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRejectProof} 
                disabled={isRejecting} 
                className="flex-1 h-8 sm:h-9 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                {isRejecting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
