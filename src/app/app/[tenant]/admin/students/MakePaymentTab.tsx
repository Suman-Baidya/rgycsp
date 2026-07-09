"use client";

import React, { useState, useMemo } from "react";
import { Search, IndianRupee, History, AlertCircle, CheckCircle2, User, BookOpen, Clock, Loader2, Calendar, Receipt, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateStudentPaymentStructure, getStudentInvoices, recordManualOfflinePayment } from "@/app/actions/payments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export default function MakePaymentTab({ 
  workspaceId, 
  students 
}: { 
  workspaceId: string;
  students: any[];
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

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return students.filter(s => 
      s.fullName.toLowerCase().includes(lower) || 
      s.enrollmentNo.toLowerCase().includes(lower) ||
      (s.registrations?.[0]?.registrationNo && s.registrations[0].registrationNo.toLowerCase().includes(lower))
    ).slice(0, 5); // show top 5 matches
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

  const handleGenerateStructure = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    const res = await generateStudentPaymentStructure(selectedStudent.id, workspaceId);
    setIsGenerating(false);
    
    if (res.success) {
      toast.success(res.message);
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

  const downloadReceipt = async (invoice: any) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Receipt No: REC-${invoice.id.substring(0, 8).toUpperCase()}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.paidDate).toLocaleDateString()}`, 20, 50);
    
    doc.text(`Student Name: ${selectedStudent.fullName}`, 20, 70);
    doc.text(`Enrollment No: ${selectedStudent.enrollmentNo}`, 20, 80);
    doc.text(`Course: ${selectedStudent.course?.title || "N/A"}`, 20, 90);
    
    doc.text(`Fee Details: ${invoice.notes || invoice.feeType}`, 20, 110);
    doc.text(`Payment Method: ${invoice.paymentMethod || "Offline"}`, 20, 120);
    
    doc.setFontSize(16);
    doc.text(`Amount Paid: Rs. ${invoice.amount}`, 20, 140);
    
    doc.setFontSize(10);
    doc.text("Thank you for your payment.", 105, 180, { align: "center" });
    
    doc.save(`Receipt_${selectedStudent.enrollmentNo}_${invoice.feeType}.pdf`);
  };

  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((sum, i) => sum + i.amount, 0);
  const hasInvoices = invoices.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student by Name, Enrollment No, or Reg No..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-lg"
          />
        </div>
        
        {searchTerm && filteredStudents.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-border/40 rounded-2xl shadow-xl overflow-hidden">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 flex items-center justify-between border-b border-border/40 last:border-0 transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{student.fullName}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono text-indigo-500">{student.enrollmentNo}</span>
                    {student.registrations?.[0] && (
                      <span className="font-mono text-emerald-500">{student.registrations[0].registrationNo}</span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={student.status === "REGISTERED" ? "bg-green-500/10 text-green-600 border-none" : "border-none"}>
                  {student.status.replace("_", " ")}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Financial Profile */}
      {selectedStudent && (
        <div className="space-y-8">
          {/* Header Profile */}
          <div className="bg-slate-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedStudent.fullName}</h3>
                <p className="text-sm text-muted-foreground font-mono">{selectedStudent.enrollmentNo}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Course</p>
                <div className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-border shadow-sm">
                  <BookOpen className="w-4 h-4 text-primary" /> {selectedStudent.course?.title || 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Batch</p>
                <div className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-border shadow-sm">
                  <Clock className="w-4 h-4 text-primary" /> {selectedStudent.batch?.name || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          {isLoadingInvoices ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !hasInvoices ? (
            <div className="py-16 text-center space-y-6 bg-slate-50/50 dark:bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-border">
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-muted-foreground/50">
                <Receipt className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">No Invoices Found</h4>
                <p className="text-muted-foreground max-w-sm mx-auto">This student doesn't have a payment structure yet. Generate it based on their enrolled course pricing.</p>
              </div>
              <Button onClick={handleGenerateStructure} disabled={isGenerating} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings2 className="w-4 h-4 mr-2" />}
                Generate Payment Structure
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle2 className="w-5 h-5" /> <span className="font-bold text-sm uppercase tracking-widest">Total Paid</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white flex items-center">
                    <IndianRupee className="w-8 h-8 mr-1 text-slate-400" /> {totalPaid}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" /> <span className="font-bold text-sm uppercase tracking-widest">Total Pending</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white flex items-center">
                    <IndianRupee className="w-8 h-8 mr-1 text-slate-400" /> {totalPending}
                  </div>
                </div>
              </div>

              {/* Invoice List */}
              <div>
                <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Invoice Schedule
                </h4>
                <div className="bg-white dark:bg-zinc-950 border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-border/50">
                        <th className="px-6 py-4 text-left font-bold text-slate-500">Invoice Details</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500">Due Date</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500">Status</th>
                        <th className="px-6 py-4 text-right font-bold text-slate-500">Amount</th>
                        <th className="px-6 py-4 text-right font-bold text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">{inv.notes || inv.feeType}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{inv.feeType}</p>
                            {inv.paymentProof && (
                              <a href={inv.paymentProof} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                                View Payment Proof
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-2 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              "border-none",
                              inv.status === "PAID" ? "bg-green-500/10 text-green-600" :
                              inv.status === "OVERDUE" ? "bg-red-500/10 text-red-600" :
                              "bg-amber-500/10 text-amber-600"
                            )}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-black font-mono">
                            ₹{inv.amount}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.status !== "PAID" && (
                              <Button size="sm" onClick={() => openPaymentModal(inv)} className="rounded-lg font-bold shadow-md shadow-primary/20">
                                Record Payment
                              </Button>
                            )}
                            {inv.status === "PAID" && (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-bold text-muted-foreground">Paid on {new Date(inv.paidDate).toLocaleDateString()}</span>
                                <Button variant="outline" size="sm" onClick={() => downloadReceipt(inv)} className="h-7 text-xs px-2 py-0">
                                  Download Receipt
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

    </div>
  );
}
