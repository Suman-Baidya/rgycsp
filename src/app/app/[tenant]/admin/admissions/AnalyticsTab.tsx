import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsTab({ workspaceId, applications }: { workspaceId: string, applications: any[] }) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set(applications.map(app => new Date(app.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [applications]);

  const stats = useMemo(() => {
    const filtered = applications.filter(app => new Date(app.createdAt).getFullYear() === selectedYear);
    
    let manual = 0;
    let online = 0;
    let csv = 0;

    const monthlyCounts = Array(12).fill(0).map((_, i) => ({ name: new Date(0, i).toLocaleString('default', { month: 'short' }), Manual: 0, Online: 0, CSV: 0 }));

    filtered.forEach(app => {
      const month = new Date(app.createdAt).getMonth();
      if (app.source === "MANUAL") { manual++; monthlyCounts[month].Manual++; }
      else if (app.source === "CSV") { csv++; monthlyCounts[month].CSV++; }
      else { online++; monthlyCounts[month].Online++; }
    });

    return { manual, online, csv, monthlyCounts, total: filtered.length };
  }, [applications, selectedYear]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
  const pieData = [
    { name: 'Online', value: stats.online },
    { name: 'Manual', value: stats.manual },
    { name: 'CSV', value: stats.csv },
  ].filter(d => d.value > 0);

  const downloadReport = () => {
    const filtered = applications.filter(app => new Date(app.createdAt).getFullYear() === selectedYear);
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Application No,Full Name,Source,Status,Created At\n" + 
      filtered.map(e => `${e.applicationNo},${e.fullName},${e.source || 'ONLINE'},${e.status},${new Date(e.createdAt).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admissions_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-semibold text-slate-500">Filter by Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-8 sm:h-9 px-2.5 border rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            {!availableYears.includes(new Date().getFullYear()) && (
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            )}
          </select>
        </div>
        <Button onClick={downloadReport} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-xs bg-primary text-primary-foreground">
          <Download className="w-3.5 h-3.5" /> Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-1 flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3 w-full">Enrollment Sources</h3>
          {pieData.length > 0 ? (
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-xs text-muted-foreground">No data for {selectedYear}</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3">Monthly Enrollments ({selectedYear})</h3>
           <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyCounts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="Online" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Manual" stackId="a" fill="#10b981" />
                  <Bar dataKey="CSV" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
