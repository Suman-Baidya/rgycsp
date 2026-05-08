import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <div className="lg:hidden ml-12 font-bold tracking-tighter text-xl text-foreground">ABCD Admin</div>
          <div className="hidden lg:block">
            <Breadcrumbs />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              SA
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
