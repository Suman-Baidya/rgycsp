import { auth } from "@/auth";
import Link from "next/link";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function WorkspaceAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const session = await auth();
  const { tenant } = await params;

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <WorkspaceSidebar tenant={tenant} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <div className="lg:hidden ml-14 font-bold tracking-tight text-lg text-foreground capitalize truncate max-w-[200px]">
            {tenant} Admin
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium capitalize">{tenant} Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              WA
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
