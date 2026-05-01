"use client";
 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

export function PrintControlBar() {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params.tenant;
  const [isDownloading, setIsDownloading] = useState(false);

  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = (isSubdirectoryMode && tenant) ? `/app/${tenant}` : '';

  const downloadPDF = async () => {
    const page1 = document.getElementById('admission-form-content');
    const page2 = document.getElementById('admission-form-content-2');
    
    if (!page1 || !page2) {
      toast.error("Document elements not found");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading("Generating premium document...");

    try {
      const options = {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
      };

      // Capture Page 1
      const img1 = await toPng(page1, options);

      // Capture Page 2
      const img2 = await toPng(page2, options);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add Page 1
      pdf.addImage(img1, "PNG", 0, 0, 210, 297, undefined, 'FAST');
      
      // Add Page 2
      pdf.addPage();
      pdf.addImage(img2, "PNG", 0, 0, 210, 297, undefined, 'FAST');

      pdf.save(`Admission_Form_${params.id}.pdf`);
      
      toast.success("Download complete!", { id: toastId });
    } catch (error: any) {
      console.error("PDF Export Error:", error);
      toast.error(error?.message || "Failed to generate PDF.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center no-print px-4">
      <Link href={`${workspaceBase}/admission/status`}>
        <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Link>
      <div className="flex gap-3">
        <Button 
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 font-bold text-xs uppercase tracking-widest px-8 h-12 min-w-[180px]"
          onClick={downloadPDF}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Download className="w-4 h-4 mr-2" /> Download PDF</>
          )}
        </Button>
      </div>
    </div>
  );
}
