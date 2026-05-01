import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Receipt, CreditCard, Download, ArrowUpRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentFeesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(`/app/${tenant}/student/dashboard`);

  const student = result.data;
  const invoices = student.studentProfile?.invoices || [];

  const totalPaid = invoices
    .filter((i: any) => i.status === "PAID")
    .reduce((sum: number, i: any) => sum + i.amount, 0);
  
  const pendingAmount = invoices
    .filter((i: any) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Fees & Payments</h1>
          <p className="text-slate-500 font-medium">Manage your financial records and invoices.</p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 shadow-xl shadow-primary/20 bg-primary h-12">Make Quick Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Outstanding</p>
            <h3 className="text-4xl font-black tracking-tight">${pendingAmount.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
               Pay Now <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
         </Card>
         <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeeStatsCard label="Total Paid Amount" value={`$${totalPaid.toLocaleString()}`} icon={<CheckCircle2 className="w-5 h-5" />} />
            <FeeStatsCard label="Last Payment" value={invoices.find((i: any) => i.status === "PAID")?.amount ? `$${invoices.find((i: any) => i.status === "PAID").amount.toLocaleString()}` : "N/A"} icon={<History className="w-5 h-5" />} />
         </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50 dark:border-white/5">
          <CardTitle className="text-xl font-black uppercase tracking-tight">Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-white/5 text-left">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice ID</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                     {invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                           <td className="px-10 py-6">
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                 <Receipt className="w-4 h-4 text-slate-400" /> #{invoice.id.slice(-8).toUpperCase()}
                              </p>
                           </td>
                           <td className="px-10 py-6 text-sm font-medium text-slate-500">
                              {new Date(invoice.date).toLocaleDateString()}
                           </td>
                           <td className="px-10 py-6 font-black text-slate-900 dark:text-white">
                              ${invoice.amount.toLocaleString()}
                           </td>
                           <td className="px-10 py-6">
                              <Badge className={cn(
                                 "rounded-lg font-black text-[9px] px-3 py-1 tracking-widest uppercase border-none",
                                 invoice.status === "PAID" ? "bg-emerald-500/10 text-emerald-500" : 
                                 invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                              )}>
                                 {invoice.status}
                              </Badge>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Download className="w-4 h-4 text-slate-400" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <Wallet className="w-16 h-16 text-slate-200 dark:text-white/10 mx-auto mb-6" />
              <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">No invoice records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FeeStatsCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 flex items-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
         {icon}
      </div>
      <div>
         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{label}</p>
         <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
