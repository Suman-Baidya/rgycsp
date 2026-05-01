import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function StudentNoticesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const workspaceSettings = workspace.siteSettings as any;
  const aboutSection = workspaceSettings?.sections?.find((s: any) => s.type === "about");
  const notices = (aboutSection?.content as any)?.notices || [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Notice Board</h1>
          <p className="text-slate-500 font-medium">Stay informed with the latest updates and announcements.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <Input placeholder="Search notices..." className="h-12 pl-12 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-xl focus:ring-primary" />
        </div>
      </div>

      <div className="space-y-4">
        {notices.length > 0 ? (
          notices.map((notice: any, idx: number) => (
            <Card key={idx} className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
               <div className="p-8 flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex flex-col items-center justify-center shrink-0">
                     <p className="text-[10px] font-black text-primary uppercase">{notice.date?.split(' ')[1] || "MAY"}</p>
                     <p className="text-xl font-black text-primary leading-tight">{notice.date?.split(' ')[0] || (idx + 1)}</p>
                  </div>
                  <div className="flex-1 space-y-2">
                     <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-lg font-black text-[9px] px-3 py-1 tracking-widest uppercase border-primary/20 text-primary">
                           {notice.category || "GENERAL"}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider"><Calendar className="w-3 h-3" /> {notice.date || "Just Now"}</span>
                     </div>
                     <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{notice.title}</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {notice.description || "The detailed information regarding this notice is available at the administrative office. Please visit for more details."}
                     </p>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                     <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </div>
               </div>
            </Card>
          ))
        ) : (
          <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] shadow-xl">
            <Bell className="w-16 h-16 text-slate-200 dark:text-white/10 mx-auto mb-6" />
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">The notice board is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
