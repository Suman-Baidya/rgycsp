import { auth } from "@/auth";

export default async function WorkspaceAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const session = await auth();
  const { tenant } = await params;

  // We will eventually verify if `session.user` has WorkspaceRole = 'ADMIN' for THIS specific tenant.
  
  return (
    <div className="flex min-h-screen">
      {/* Vertical Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col gap-8 hidden md:flex sticky top-0 h-screen">
        <div>
          <h2 className="text-xl font-bold text-primary">Workspace</h2>
          <p className="text-sm text-muted-foreground capitalize">{tenant} dashboard</p>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <div className="text-sm font-medium py-2 px-3 bg-secondary/50 rounded-md text-secondary-foreground">Overview</div>
          <div className="text-sm font-medium py-2 px-3 text-muted-foreground hover:bg-secondary/30 rounded-md cursor-pointer transition-colors">Staff & Roles</div>
          <div className="text-sm font-medium py-2 px-3 text-muted-foreground hover:bg-secondary/30 rounded-md cursor-pointer transition-colors">Students</div>
          <div className="text-sm font-medium py-2 px-3 text-muted-foreground hover:bg-secondary/30 rounded-md cursor-pointer transition-colors">Landing Page Builder</div>
          <div className="text-sm font-medium py-2 px-3 text-muted-foreground hover:bg-secondary/30 rounded-md cursor-pointer transition-colors">Token Wallet</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-zinc-50/50 dark:bg-black/10">
        {children}
      </main>
    </div>
  );
}
