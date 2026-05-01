import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdmissionPDFView } from "@/components/admission/AdmissionPDFView";
import { PrintControlBar } from "./PrintControlBar";

export default async function PrintAdmissionPage({ params }: any) {
  const { tenant, id } = await params;

  const application = await db.admissionApplication.findUnique({
    where: { id },
    include: {
      workspace: {
        include: {
          siteSettings: true
        }
      }
    }
  });

  if (!application) return notFound();

  const workspace = application.workspace;
  const settings = workspace.siteSettings;
  const config = await db.admissionFormConfig.findUnique({
    where: { workspaceId: workspace.id }
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0">
      <PrintControlBar />

      <AdmissionPDFView 
        application={application} 
        workspace={workspace} 
        settings={settings} 
        config={config}
      />
    </div>
  );
}
