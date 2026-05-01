import { db } from "@/lib/prisma";
import { AdmissionStatusClient } from "./AdmissionStatusClient";

export default async function AdmissionStatusPage({ params }: any) {
  const { tenant } = await params;
  
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: {
       siteSettings: true
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
       <AdmissionStatusClient 
         workspaceId={workspace?.id || ""} 
         workspaceName={workspace?.name || "Institute"} 
         logoUrl={workspace?.siteSettings?.logoUrl || ""}
       />
    </div>
  );
}
