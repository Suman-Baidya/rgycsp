"use client";

import React from "react";
import { 
  Wallet, 
  Receipt, 
  CreditCard, 
  Download, 
  ArrowUpRight, 
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StudentFeesClient({ 
  invoices, 
  stats, 
  settings, 
  tenant 
}: { 
  invoices: any[], 
  stats: any, 
  settings: any, 
  tenant: string 
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Fees & Financials</h1>
          <p className="text-slate-500 font-medium text-lg">Manage your invoices and track your payment history.</p>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-2xl font-bold gap-3 h-14 px-10 shadow-2xl shadow-primary/30 transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
            <CreditCard className="w-5 h-5" /> Pay Now
          </Button>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatsCard 
          label="Remaining Balance" 
          value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`} 
          subtext="Immediate dues"
          icon={<Wallet className="w-5 h-5" />} 
          color="#ef4444" 
          isDark={true}
        />
        <StatsCard 
          label="Total Paid" 
          value={`₹${stats.totalPaid.toLocaleString('en-IN')}`} 
          subtext="Successful payments"
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="#10b981" 
        />
        <StatsCard 
          label="Last Transaction" 
          value={stats.lastPayment ? `₹${stats.lastPayment.toLocaleString('en-IN')}` : "No Dues"} 
          subtext={stats.lastDate ? `On ${stats.lastDate}` : "Current session"}
          icon={<History className="w-5 h-5" />} 
          color={primaryColor} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Payment History Table */}
        <div className="lg:col-span-8">
          <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Invoice History</CardTitle>
                <CardDescription className="font-bold text-slate-400 text-sm">Detailed record of all academic transactions</CardDescription>
              </div>
              <FileText className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-white/5">
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                <Receipt className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">#{invoice.id.slice(-6).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-medium text-slate-500 dark:text-slate-400 text-sm">
                              {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-bold text-lg text-slate-900 dark:text-white">₹{invoice.amount.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <Badge className={cn(
                              "rounded-xl font-bold text-[9px] px-3 py-1.5 tracking-wider uppercase border-2",
                              invoice.status === "PAID" ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-500" : 
                              invoice.status === "OVERDUE" ? "border-red-500/10 bg-red-500/5 text-red-500" : 
                              "border-amber-500/10 bg-amber-500/5 text-amber-500"
                            )}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-24 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Wallet className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Invoices</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">Your payment history and invoices will be displayed here once generated.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Security & Plan info */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-slate-900 text-white shadow-2xl relative overflow-hidden p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
              <div className="space-y-6 relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Secure Payments</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">All your transactions are encrypted and secured. We never store your card details on our servers.</p>
                 </div>
                 <div className="pt-4 flex items-center gap-4 border-t border-white/10">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-5 bg-white/10 rounded border border-white/5"></div>
                       <div className="w-8 h-5 bg-white/10 rounded border border-white/5"></div>
                       <div className="w-8 h-5 bg-white/10 rounded border border-white/5"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PCI DSS Compliant</span>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-xl p-8 group">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold tracking-tight">Need Assistance?</h3>
                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                 </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">If you have any questions regarding your fees or need to request a payment plan, our support team is here to help.</p>
              <Button variant="outline" className="w-full rounded-2xl h-12 font-bold group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-all">
                 Contact Accounts Dept
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, subtext, icon, color, isDark }: any) {
  return (
    <Card className={cn(
      "rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden",
      isDark ? "bg-slate-900 text-white border-transparent" : "border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/50"
    )}>
      <CardContent className="p-8 relative">
        <div 
          className="absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl" 
          style={{ backgroundColor: color }}
        />
        
        <div className="flex flex-col gap-6 relative z-10">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
            style={{ 
              backgroundColor: color,
              boxShadow: `0 8px 25px -6px ${color}80`
            }}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
          </div>
          
          <div className="space-y-1">
            <p className={cn(
               "text-[11px] font-bold uppercase tracking-wider",
               isDark ? "text-slate-400" : "text-slate-500"
            )}>{label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
              {subtext && (
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wide",
                  isDark ? "text-primary/70" : "text-slate-400"
                )}>{subtext}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
