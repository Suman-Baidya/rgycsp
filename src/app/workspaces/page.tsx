import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null }
  });

  const workspaceRoles = await db.workspaceRole.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: { siteSettings: true }
      }
    }
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      <LandingNavbar settings={settings} user={session.user} />
      
      <main className="flex-1 container max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              My <span className="text-primary">Workspaces</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Manage your educational institutions and portals from one place.
            </p>
          </div>
          
          <Button className="h-12 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" /> Create New Workspace
          </Button>
        </div>

        {workspaceRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl">
            <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center">
              <Building2 className="w-12 h-12 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No Workspaces Found</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                You haven't been assigned to any workspaces yet. Create your first one to get started!
              </p>
            </div>
            <Button variant="outline" className="rounded-xl font-bold px-8 h-12 border-2">
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workspaceRoles.map((role) => {
              const workspace = role.workspace;
              const protocol = rootDomain.includes("localhost") ? "http" : "https";
              const dashboardUrl = `${protocol}://${workspace.subdomain}.${rootDomain}/admin`;
              
              return (
                <Card key={workspace.id} className="group rounded-[2.5rem] border-white/20 dark:border-white/5 shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div 
                    className="h-3 w-full" 
                    style={{ backgroundColor: workspace.siteSettings?.primaryColor || 'var(--primary)' }}
                  />
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-white/10 flex items-center justify-center p-2">
                        {workspace.logoUrl ? (
                          <img src={workspace.logoUrl} alt={workspace.name} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-black truncate">{workspace.name}</CardTitle>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">{role.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    </div>
                    
                    <Link href={dashboardUrl} target="_blank" className="block">
                      <Button className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                        Open Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
