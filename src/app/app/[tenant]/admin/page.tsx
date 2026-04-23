import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function WorkspaceAdminDashboard({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Manage all aspects of {workspace?.name}.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-medium flex items-center gap-2">
            AI Tokens: <span className="font-bold">{workspace?.tokensBalance}</span>
          </div>
          <Button variant="outline">Buy Tokens</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric Cards */}
        {[
          { label: "Total Students", value: "0" },
          { label: "Active Courses", value: "0" },
          { label: "Staff Members", value: "0" },
          { label: "Pending Fees", value: "₹0" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-card border rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border rounded-xl bg-card p-8 min-h-[300px] flex items-center justify-center text-center">
        <div>
          <h3 className="text-lg font-semibold">Welcome to your new workspace!</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">You can start by inviting staffs, building your landing page, or creating your very first course.</p>
          <Button className="mt-6">Get Started Tour</Button>
        </div>
      </div>
    </div>
  );
}
