"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileDown, Database } from "lucide-react";
import { bulkRegisterStudentsAction } from "@/app/actions/admissions";
import Papa from "papaparse";

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    <div className="space-y-8">
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg text-primary">Need a Template?</h3>
          <p className="text-sm text-slate-500">Download the standard CSV template to ensure correct column names.</p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/10">
          <FileDown className="w-4 h-4 mr-2" /> Download Template
        </Button>
      </div>

      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Upload CSV File</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">Drop your filled CSV template here or browse from your computer.</p>
        
        <label className="cursor-pointer">
          <div className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-bold inline-flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
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
        <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
            <h3 className="font-bold">Preview ({parsedData.length} students)</h3>
            <Button onClick={handleConfirmImport} disabled={isUploading} className="rounded-xl">
              {isUploading ? "Importing..." : `Confirm Import`}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Mobile</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Course ID</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b dark:border-slate-800">
                    <td className="px-6 py-4 font-medium">{row.fullName || "-"}</td>
                    <td className="px-6 py-4">{row.mobile || "-"}</td>
                    <td className="px-6 py-4">{row.email || "-"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{row.courseId || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 5 && (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                And {parsedData.length - 5} more rows...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
