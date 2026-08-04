"use client";

import React, { useState } from "react";
import { CreditCard, History, Settings2, Receipt, Upload, Loader2, CheckCircle2, ShieldCheck, Download, Search, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateFranchisePaymentConfig } from "@/app/actions/payments";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import Image from "next/image";
import MakePaymentTab from "./MakePaymentTab";
import PaymentRequestsTab from "./PaymentRequestsTab";
import PaymentReportsTab from "./PaymentReportsTab";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default function FeesManagementClient({ 
  workspaceId,
  students,
  pendingFees,
  paymentConfig,
  workspaceInfo
}: { 
  workspaceId: string;
  students: any[];
  pendingFees?: any[];
  paymentConfig: any;
  workspaceInfo?: any;
}) {
  const [activeTab, setActiveTab] = useState("make_payment");

  const [configForm, setConfigForm] = useState({
    upiId: paymentConfig?.upiId || "",
    qrCodeUrl: paymentConfig?.qrCodeUrl || "",
    bankName: paymentConfig?.bankName || "",
    accountHolderName: paymentConfig?.accountHolderName || "",
    accountNumber: paymentConfig?.accountNumber || "",
    ifscCode: paymentConfig?.ifscCode || "",
    instructions: paymentConfig?.instructions || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const res = await updateFranchisePaymentConfig(workspaceId, configForm);
    setIsSaving(false);
    if (res.success) {
      toast.success("Payment configuration saved successfully");
    } else {
      toast.error(res.error || "Failed to save configuration");
    }
  };

  const handleQrUpload = (url: string) => {
    if (url) {
      setConfigForm(prev => ({ ...prev, qrCodeUrl: url }));
      toast.success("QR Code uploaded successfully");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Fees Management" 
        description="Manage student fees, configure payment methods, and view comprehensive payment reports."
      />

      {/* Sub Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => setActiveTab("make_payment")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "make_payment"
              ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <CreditCard className="w-4 h-4" /> Make Payment
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "requests"
              ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-500 shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Receipt className="w-4 h-4" /> Payment Requests
          {pendingFees && pendingFees.length > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {pendingFees.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "reports"
              ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <History className="w-4 h-4" /> Payments Reports
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "config"
              ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Settings2 className="w-4 h-4" /> Payments Config
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-border/40 shadow-sm min-h-[500px]">
        {activeTab === "requests" && (
          <PaymentRequestsTab workspaceId={workspaceId} pendingFees={pendingFees} />
        )}

        {activeTab === "make_payment" && (
          <MakePaymentTab workspaceId={workspaceId} students={students} workspaceInfo={workspaceInfo} />
        )}

        {activeTab === "reports" && (
          <PaymentReportsTab workspaceId={workspaceId} workspaceInfo={workspaceInfo} />
        )}

        {activeTab === "config" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Settings2 className="w-5 h-5 text-primary" /> Setup Payment Methods
              </h3>
              <p className="text-muted-foreground text-sm">Configure how students can pay you offline via their portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* UPI & QR Code */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-border">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> UPI & QR Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>UPI ID</Label>
                      <Input 
                        value={configForm.upiId} 
                        onChange={e => setConfigForm({...configForm, upiId: e.target.value})}
                        placeholder="e.g. 9876543210@ybl"
                        className="bg-white dark:bg-zinc-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Payment QR Code</Label>
                      <div className="flex flex-col items-center gap-4">
                        {configForm.qrCodeUrl ? (
                          <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-primary/20">
                            <Image src={configForm.qrCodeUrl} alt="QR Code" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <ImageUpload
                                value={null}
                                onChange={handleQrUpload}
                                folder={`RGYCSP/${workspaceId}/qr-codes`}
                                label="Change QR"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <ImageUpload
                              value={null}
                              onChange={handleQrUpload}
                              folder={`RGYCSP/${workspaceId}/qr-codes`}
                              label="Upload QR Code"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-border">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4">Bank Transfer Details</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={configForm.bankName} onChange={e => setConfigForm({...configForm, bankName: e.target.value})} className="bg-white dark:bg-zinc-900" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Holder Name</Label>
                      <Input value={configForm.accountHolderName} onChange={e => setConfigForm({...configForm, accountHolderName: e.target.value})} className="bg-white dark:bg-zinc-900" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input value={configForm.accountNumber} onChange={e => setConfigForm({...configForm, accountNumber: e.target.value})} className="bg-white dark:bg-zinc-900" />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input value={configForm.ifscCode} onChange={e => setConfigForm({...configForm, ifscCode: e.target.value})} className="bg-white dark:bg-zinc-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Instructions for Students</Label>
              <textarea 
                value={configForm.instructions} 
                onChange={e => setConfigForm({...configForm, instructions: e.target.value})}
                className="w-full h-24 p-4 rounded-xl border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm"
                placeholder="Enter any specific instructions for students when paying..."
              />
            </div>

            <Button onClick={handleSaveConfig} disabled={isSaving} className="w-full h-14 rounded-xl font-bold text-lg">
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
              Save Payment Configuration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
