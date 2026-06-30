"use client";

import { useEffect, useRef, useState } from "react";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrintClient({
  student,
  examData,
  workspaceId,
  autoDownload
}: {
  student: any;
  examData: any;
  workspaceId: string | null;
  autoDownload: boolean;
}) {
  const router = useRouter();
  const rendererRef = useRef<DocumentRendererRef>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure the renderer has fetched the template and rendered the hidden canvas
    const timer = setTimeout(() => {
      setIsReady(true);
      if (rendererRef.current && rendererRef.current.hasTemplate()) {
        if (autoDownload) {
          rendererRef.current.downloadPDF();
        } else {
          rendererRef.current.preview();
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoDownload]);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Admit Card Document Viewer</h1>
          <p className="text-slate-500">Student: {student.fullName} | Exam: {examData.title}</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={() => rendererRef.current?.preview()}
            variant="outline"
            className="h-12 px-6 rounded-xl font-bold"
            disabled={!isReady}
          >
            <Printer className="w-4 h-4 mr-2" /> View Preview
          </Button>
          <Button 
            onClick={() => rendererRef.current?.downloadPDF()}
            className="h-12 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700"
            disabled={!isReady}
          >
            <Download className="w-4 h-4 mr-2" /> Download High-Res PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center p-12 text-center">
        {!isReady ? (
          <div className="space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-slate-500 animate-pulse">Initializing Rendering Engine...</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-md">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Engine Ready</h3>
            <p className="text-slate-500 text-sm">
              The admit card has been dynamically generated with the exam parameters. Use the actions above to preview or download the final document.
            </p>
          </div>
        )}
      </div>

      <DocumentRenderer 
        ref={rendererRef} 
        type="ADMIT_CARD" 
        student={student} 
        examData={examData} 
        workspaceId={workspaceId} 
      />
    </div>
  );
}
