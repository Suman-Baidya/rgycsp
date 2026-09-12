"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileDown, Database } from "lucide-react";
import { bulkRegisterStudentsAction } from "@/app/actions/admissions";
export default function CsvBulkImport({ workspaceId }: { workspaceId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleDownloadTemplate = () => {
    const headers = [
      "fullName", "fatherName", "motherName", "dob", "gender", "religion", "caste", "bloodGroup", "guardianPhone",
      "mobile", "whatsapp", "email",
      "vill", "po", "ps", "dist", "state", "pin",
      "qualName", "qualBoard", "qualYear", "qualPercent",
      "courseId", "batchId", "fees"
    ];
    const example = [
      "John Doe", "Robert Doe", "Jane Doe", "2000-01-15", "Male", "Hindu", "GEN", "O+", "9876543210",
      "9876543210", "9876543210", "john@example.com",
      "Salt Lake", "Sector 5", "Bidhannagar", "Kolkata", "West Bengal", "700091",
      "12th", "CBSE", "2018", "85",
      "course_cuid", "batch_cuid", "5000"
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + example.join(",");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const Papa = (await import("papaparse")).default;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
          toast.success(`Successfully parsed ${results.data.length} students`);
        } else {
          toast.error("The CSV file seems to be empty or invalid.");
        }
      },
      error: function() {
        toast.error("Failed to parse CSV file");
      }
    });
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;
    
    setIsUploading(true);
    try {
      const res = await bulkRegisterStudentsAction(workspaceId, parsedData);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} students!`);
        setParsedData([]);
      } else {
        toast.error(res.error || "Failed to import students");
      }
    } catch (error) {
      toast.error("An error occurred during import.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 p-3.5 sm:p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-primary">Need a Template?</h3>
          <p className="text-xs text-slate-500">Download the standard CSV template to ensure correct column names.</p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline" className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 shrink-0">
          <FileDown className="w-3.5 h-3.5 mr-1.5" /> Download Template
        </Button>
      </div>

      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">Upload CSV File</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">Drop your filled CSV template here or browse from your computer.</p>
        
        <label className="cursor-pointer">
          <div className="bg-primary text-primary-foreground h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center hover:opacity-90 transition-all shadow-xs">
            Browse File
          </div>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {parsedData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Preview ({parsedData.length} students)</h3>
            <Button onClick={handleConfirmImport} disabled={isUploading} size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold">
              {isUploading ? "Importing..." : `Confirm Import`}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-3.5 py-2.5">Name</th>
                  <th className="px-3.5 py-2.5">Mobile</th>
                  <th className="px-3.5 py-2.5">Email</th>
                  <th className="px-3.5 py-2.5">Course ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {parsedData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-white">{row.fullName || "-"}</td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">{row.mobile || "-"}</td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">{row.email || "-"}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-500">{row.courseId || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 5 && (
              <div className="p-2.5 text-center text-[11px] text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                And {parsedData.length - 5} more rows...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
