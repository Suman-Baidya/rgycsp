"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  History, 
  Settings2, 
  Receipt, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  Users,
  QrCode,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateFranchisePaymentConfig } from "@/app/actions/payments";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import Image from "next/image";
import MakePaymentTab from "./MakePaymentTab";
import PaymentRequestsTab from "./PaymentRequestsTab";
import PaymentReportsTab from "./PaymentReportsTab";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { StatCard } from "@/components/dashboard/StatCard";

export default function FeesManagementClient({ 
  workspaceId,
  students = [],
  pendingFees = [],
  paymentConfig,
  workspaceInfo
}: { 
  workspaceId: string;
  students: any[];
  pendingFees?: any[];
  paymentConfig: any;
  workspaceInfo?: any;
}) {
  const [activeTab, setActiveTab] = useState<"make_payment" | "requests" | "reports" | "config">("make_payment");

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

  const pendingCount = pendingFees?.length || 0;
  const isUpiConfigured = !!(configForm.upiId || configForm.qrCodeUrl);
  const isBankConfigured = !!(configForm.accountNumber && configForm.ifscCode);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Fees Management" 
        description="Manage student fees, verify payment proofs, and configure payment methods."
      />

      {/* Top Metric Cards Grid (Rule 7.2 - 1-to-1 with sub tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Make Payment"
          value={students.length}
          description="Enrolled students"
          icon={<CreditCard className="h-5 w-5 text-blue-500" />}
          isActive={activeTab === "make_payment"}
          onClick={() => setActiveTab("make_payment")}
        />

        <StatCard
          label="Verification Requests"
          value={pendingCount}
          description={pendingCount > 0 ? "Proofs awaiting review" : "All proofs verified"}
          icon={<Receipt className="h-5 w-5 text-amber-500" />}
          color={pendingCount > 0 ? "#f59e0b" : undefined}
          isActive={activeTab === "requests"}
          onClick={() => setActiveTab("requests")}
        />

        <StatCard
          label="Payments Reports"
          value="Audit & Logs"
          description="Collections & receipts"
          icon={<History className="h-5 w-5 text-indigo-500" />}
          isActive={activeTab === "reports"}
          onClick={() => setActiveTab("reports")}
        />

        <StatCard
          label="Payments Config"
          value={isUpiConfigured ? "Configured" : "Not Set"}
          description={isUpiConfigured ? (isBankConfigured ? "UPI & Bank Active" : "UPI Active") : "Setup payment methods"}
          icon={<Settings2 className={cn("h-5 w-5", isUpiConfigured ? "text-emerald-500" : "text-slate-400")} />}
          color={isUpiConfigured ? "#10b981" : undefined}
          isActive={activeTab === "config"}
          onClick={() => setActiveTab("config")}
        />
      </div>

      {/* Sub Tabs Pill Navigation (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => setActiveTab("make_payment")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "make_payment"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <CreditCard className="w-3.5 h-3.5" /> Make Payment
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "requests"
              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Receipt className="w-3.5 h-3.5" /> Payment Requests
          {pendingCount > 0 && (
            <span className="ml-1 h-4 min-w-4 px-1 bg-amber-500 text-white text-[9px] font-bold rounded flex items-center justify-center animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "reports"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <History className="w-3.5 h-3.5" /> Payments Reports
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "config"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" /> Payments Config
        </button>
      </div>

      {/* Tab Content Panes */}
      <div>
        {activeTab === "make_payment" && (
          <MakePaymentTab 
            workspaceId={workspaceId} 
            students={students} 
            workspaceInfo={workspaceInfo} 
          />
        )}

        {activeTab === "requests" && (
          <PaymentRequestsTab 
            workspaceId={workspaceId} 
            pendingFees={pendingFees} 
          />
        )}

        {activeTab === "reports" && (
          <PaymentReportsTab 
            workspaceId={workspaceId} 
            workspaceInfo={workspaceInfo} 
          />
        )}

        {activeTab === "config" && (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-300">
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Student Offline Payment Configuration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure your UPI ID, QR code, and bank details shown to students when making offline payments.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* UPI & QR Code Settings */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3.5">
                    <h4 className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> UPI & QR Details
                    </h4>
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Franchise UPI ID</Label>
                      <Input 
                        value={configForm.upiId} 
                        onChange={e => setConfigForm({...configForm, upiId: e.target.value})}
                        placeholder="e.g. 9876543210@upi or franchise@ybl"
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Payment QR Code</Label>
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        {configForm.qrCodeUrl ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                              <Image src={configForm.qrCodeUrl} alt="QR Code" fill className="object-contain p-1" />
                            </div>
                            <div className="w-full">
                              <ImageUpload
                                value={null}
                                onChange={handleQrUpload}
                                folder={`RGYCSP/${workspaceId}/qr-codes`}
                                label="Change QR Code"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full text-center py-4">
                            <QrCode className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
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

                  {/* Bank Transfer Details */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> Bank Transfer Details
                    </h4>
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Bank Name</Label>
                      <Input 
                        value={configForm.bankName} 
                        onChange={e => setConfigForm({...configForm, bankName: e.target.value})} 
                        placeholder="e.g. State Bank of India"
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Account Holder Name</Label>
                      <Input 
                        value={configForm.accountHolderName} 
                        onChange={e => setConfigForm({...configForm, accountHolderName: e.target.value})} 
                        placeholder="e.g. Acme Educational Institute"
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Account Number</Label>
                      <Input 
                        value={configForm.accountNumber} 
                        onChange={e => setConfigForm({...configForm, accountNumber: e.target.value})} 
                        placeholder="e.g. 123456789012"
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">IFSC Code</Label>
                      <Input 
                        value={configForm.ifscCode} 
                        onChange={e => setConfigForm({...configForm, ifscCode: e.target.value.toUpperCase()})} 
                        placeholder="e.g. SBIN0001234"
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 uppercase" 
                      />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Payment Instructions for Students</Label>
                  <textarea 
                    value={configForm.instructions} 
                    onChange={e => setConfigForm({...configForm, instructions: e.target.value})}
                    className="w-full h-20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-xs placeholder:text-slate-400"
                    placeholder="Provide instructions for students, e.g. 'Please mention your enrollment number in the transfer remarks and upload the payment receipt screenshot.'"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button 
                    onClick={handleSaveConfig} 
                    disabled={isSaving} 
                    className="h-8 sm:h-9 px-4 rounded-lg font-semibold text-xs gap-1.5"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Save Payment Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
