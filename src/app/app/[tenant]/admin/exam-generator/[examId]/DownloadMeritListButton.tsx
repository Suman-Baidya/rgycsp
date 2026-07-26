"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadMeritListButton({ meritList, examTitle }: { meritList?: any[], examTitle?: string }) {
  
  const handleDownload = () => {
    if (!meritList || meritList.length === 0) return;
    
    // Create CSV content
    const headers = ["Rank", "Student Name", "Enrollment No", "Marks Obtained", "Status"];
    const rows = meritList.map((m, index) => [
      index + 1,
      `"${m.student.firstName} ${m.student.lastName}"`,
      m.student.enrollmentNo,
      m.marksObtained,
      m.isPassed ? "PASSED" : "FAILED"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${examTitle?.replace(/[^a-z0-9]/gi, '_')}_Merit_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline" 
      className="rounded-xl font-bold print:hidden" 
      onClick={handleDownload}
      disabled={!meritList || meritList.length === 0}
    >
      <Download className="w-4 h-4 mr-2" /> Download CSV
    </Button>
  );
}
