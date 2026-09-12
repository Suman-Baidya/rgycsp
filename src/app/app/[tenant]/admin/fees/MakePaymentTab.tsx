"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  IndianRupee, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  BookOpen, 
  Clock, 
  Loader2, 
  Calendar, 
  Receipt, 
  Settings2, 
  Edit3, 
  Download, 
  X,
  CreditCard,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  generateStudentPaymentStructure, 
  getStudentInvoices, 
  recordManualOfflinePayment, 
  updateInvoiceInfo 
} from "@/app/actions/payments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MakePaymentTab({ 
  workspaceId, 
  students = [],
  workspaceInfo
}: { 
  workspaceId: string;
  students: any[];
  workspaceInfo?: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ method: "CASH", notes: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ amount: 0, dueDate: "" });
  const [isEditing, setIsEditing] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase();
    return students.filter(s => 
      s.fullName?.toLowerCase().includes(lower) || 
      s.enrollmentNo?.toLowerCase().includes(lower) ||
      (s.registrations?.[0]?.registrationNo && s.registrations[0].registrationNo.toLowerCase().includes(lower))
    ).slice(0, 6); // show top 6 matches
  }, [searchTerm, students]);

  const fetchInvoices = async (studentId: string) => {
    setIsLoadingInvoices(true);
    const res = await getStudentInvoices(studentId);
    setIsLoadingInvoices(false);
    if (res.success) {
      setInvoices(res.data || []);
    } else {
      toast.error(res.error || "Failed to fetch invoices");
    }
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchTerm("");
    fetchInvoices(student.id);
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setInvoices([]);
    setSearchTerm("");
  };

  const handleGenerateStructure = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    const res = await generateStudentPaymentStructure(selectedStudent.id, workspaceId);
    setIsGenerating(false);
    
    if (res.success) {
      toast.success(res.message || "Payment structure generated successfully!");
      fetchInvoices(selectedStudent.id);
    } else {
      toast.error(res.error || "Failed to generate structure");
    }
  };

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
      fetchInvoices(selectedStudent.id);
    } else {
      toast.error(res.error || "Failed to record payment");
    }
  };

  const openEditModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEditForm({ 
      amount: invoice.amount, 
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "" 
    });
    setEditModalOpen(true);
  };

  const handleEditInvoice = async () => {
    if (!selectedInvoice) return;
    setIsEditing(true);
    const res = await updateInvoiceInfo(selectedInvoice.id, editForm);
    setIsEditing(false);
    
    if (res.success) {
      toast.success("Invoice updated successfully!");
      setEditModalOpen(false);
      fetchInvoices(selectedStudent.id);
    } else {
      toast.error(res.error || "Failed to update invoice");
    }
  };

  const downloadReceipt = async (invoice: any) => {
    try {
      const { generateInvoicePDF } = await import("@/lib/invoiceUtils");
      await generateInvoicePDF({
        workspaceInfo,
        student: selectedStudent,
        invoice,
        allInvoices: invoices
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF receipt");
    }
  };

  const courseFee = selectedStudent?.course?.feeAmount || 0;
  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPending = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((sum, i) => sum + (i.amount || 0), 0);
  const hasInvoices = invoices.length > 0;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Student Selector Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Select Student for Fee Payment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Search enrolled student by name, enrollment ID, or registration number.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <div className="relative">
                <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 my-auto" />
                <Input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Type student name or ID..."
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-xs placeholder:text-slate-400"
                />
              </div>

              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-30">
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No matching students found
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{student.fullName}</p>
                          <div className="flex gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                            <span className="text-primary">{student.enrollmentNo}</span>
                            {student.registrations?.[0] && (
                              <span>• Reg: {student.registrations[0].registrationNo}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border-none shrink-0", 
                          student.status === "REGISTERED" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                        )}>
                          {student.status.replace("_", " ")}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Active Selected Student Banner */}
        {selectedStudent && (
          <CardContent className="p-3.5 sm:p-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedStudent.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {selectedStudent.fullName}
                    </h4>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-bold">
                      {selectedStudent.paymentType === "EMI" ? "EMI Plan" : "One-Time"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                    <span>ID: {selectedStudent.enrollmentNo}</span>
                    <span>•</span>
                    <span className="font-sans flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <BookOpen className="w-3 h-3 text-slate-400" /> {selectedStudent.course?.title || "No Course"}
                    </span>
                    {selectedStudent.batch?.name && (
                      <>
                        <span>•</span>
                        <span className="font-sans flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" /> {selectedStudent.batch.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearStudent}
                className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" /> Change Student
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Financial Details Section */}
      {selectedStudent && (
        <div className="space-y-4">
          {isLoadingInvoices ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-slate-400">Loading student financial records...</p>
            </div>
          ) : !hasInvoices ? (
            <Card className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Invoices Scheduled</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                This student does not have fee invoices generated yet. Click below to automatically generate their installment schedule based on their enrolled course fee.
              </p>
              <Button 
                onClick={handleGenerateStructure} 
                disabled={isGenerating} 
                className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Settings2 className="w-3.5 h-3.5 mr-1.5" />}
                Generate Payment Schedule
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Financial Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Course Fee</span>
                    <div className="p-1 rounded-lg text-primary bg-primary/10">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                    <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400" /> {courseFee}
                  </div>
                </div>

                <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Total Paid</span>
                    <div className="p-1 rounded-lg text-emerald-600 bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400" /> {totalPaid}
                  </div>
                </div>

                <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Total Dues</span>
                    <div className="p-1 rounded-lg text-amber-600 bg-amber-500/10">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400" /> {totalPending}
                  </div>
                </div>

                <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Invoices</span>
                    <div className="p-1 rounded-lg text-slate-600 bg-slate-100 dark:bg-slate-800">
                      <Receipt className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {invoices.length}
                  </div>
                </div>
              </div>

              {/* Invoice List */}
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" /> Invoice Installments
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fee installment schedule and payment statuses for this student.
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {invoices.length} Invoices
                  </Badge>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {invoices.map((inv) => {
                      const isPaid = inv.status === "PAID";
                      const isOverdue = inv.status === "OVERDUE";
                      const statusColor = isPaid ? "border-emerald-500" : isOverdue ? "border-red-500" : "border-amber-500";

                      return (
                        <div 
                          key={inv.id} 
                          className={cn(
                            "flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px]",
                            statusColor
                          )}
                        >
                          {/* Invoice Title & Notes */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {inv.notes || inv.feeType}
                              </span>
                              <Badge variant="outline" className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                                isPaid ? "bg-emerald-500/10 text-emerald-600" :
                                isOverdue ? "bg-red-500/10 text-red-600" :
                                "bg-amber-500/10 text-amber-600"
                              )}>
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="uppercase tracking-wider font-semibold">{inv.feeType}</span>
                              {inv.paymentProof && (
                                <>
                                  <span>•</span>
                                  <a 
                                    href={inv.paymentProof} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                  >
                                    <ExternalLink className="w-3 h-3" /> View Proof
                                  </a>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Metadata & Actions */}
                          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end text-xs">
                            {/* Due Date */}
                            <div className="text-left lg:text-right shrink-0">
                              <span className="flex items-center lg:justify-end gap-1 font-medium text-slate-700 dark:text-slate-300 text-xs">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                Due Date
                              </p>
                            </div>

                            {/* Amount */}
                            <div className="text-left lg:text-right shrink-0 min-w-[75px]">
                              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-center lg:justify-end">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> {inv.amount}
                              </span>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                Amount
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
                              {!isPaid ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => openEditModal(inv)} 
                                    className="h-7 sm:h-8 w-7 sm:w-8 p-0 rounded-lg text-slate-500 hover:text-primary transition-colors" 
                                    title="Edit Invoice"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={() => openPaymentModal(inv)} 
                                    className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" /> Record Payment
                                  </Button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                                    Paid on {new Date(inv.paidDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => downloadReceipt(inv)} 
                                    className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/5" 
                                    title="Download Receipt"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Receipt
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Record Student Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Amount to Collect</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center font-mono">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" /> {selectedInvoice?.amount}
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[9px] font-bold">
                {selectedInvoice?.feeType}
              </Badge>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Payment Mode</Label>
              <select 
                value={paymentForm.method} 
                onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                className="w-full h-8 sm:h-9 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-xs font-medium"
              >
                <option value="CASH">Cash in Hand</option>
                <option value="UPI">UPI Transfer</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Notes / Receipt Ref # (Optional)</Label>
              <Input 
                value={paymentForm.notes} 
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="e.g. Receipt #1234 or Bank UTR" 
                className="h-8 sm:h-9 text-xs rounded-lg"
              />
            </div>

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
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-primary" /> Edit Fee Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Amount (₹)</Label>
              <Input 
                type="number"
                value={editForm.amount} 
                onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})}
                className="h-8 sm:h-9 text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Due Date</Label>
              <Input 
                type="date"
                value={editForm.dueDate} 
                onChange={e => setEditForm({...editForm, dueDate: e.target.value})}
                className="h-8 sm:h-9 text-xs rounded-lg"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditModalOpen(false)} 
                className="flex-1 h-8 sm:h-9 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditInvoice} 
                disabled={isEditing} 
                className="flex-1 h-8 sm:h-9 text-xs font-semibold rounded-lg"
              >
                {isEditing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
