"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateApplicationStatus } from "@/app/actions/admission";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";

export function AdminApplicationsClient({ workspaceId, initialData }: any) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const params = useParams();
  const pathname = usePathname();
  
  const getTenant = () => {
    if (params?.tenant) return params.tenant as string;
    if (pathname.startsWith('/app/')) return pathname.split('/')[2];
    return "";
  };

  const tenant = getTenant();
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';
  const adminBase = `${workspaceBase}/admin/students`;

  const filteredData = data.filter((app: any) => 
    (app.status === "PENDING" || app.status === "REJECTED") && (
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleStatusUpdate = async (id: string, status: string) => {
    let reason = "";
    if (status === "REJECTED") {
      reason = window.prompt("Enter rejection reason:") || "";
      if (!reason) return;
    }

    try {
      const res = await updateApplicationStatus(id, status, reason);
      if (res.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        // Remove from list if approved
        if (status === "APPROVED") {
          setData(data.filter((a: any) => a.id !== id));
        } else {
          setData(data.map((a: any) => a.id === id ? { ...a, status, rejectionReason: reason } : a));
        }
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search pending applications..." 
            className="pl-10 rounded-xl border-slate-200 font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
           {/* Pagination Controls */}
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase hidden sm:inline">
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
           </div>

           <Button variant="outline" className="rounded-xl font-bold border-slate-200">
             <Filter className="w-4 h-4 mr-2" /> Filter
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((app: any) => (
            <div key={app.id} className="group relative bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all duration-300">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Side: Applicant Info */}
                  <div className="flex items-center gap-5">
                     <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {app.photoUrl ? (
                          <Image src={app.photoUrl} alt={app.fullName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-lg font-bold text-slate-900 tracking-tight">{app.fullName}</h3>
                           <Badge variant="outline" className={cn(
                              "rounded-full px-3 py-0.5 text-[9px] font-bold uppercase border-none shadow-sm",
                              app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" : 
                              app.status === "REJECTED" ? "bg-red-500/10 text-red-600" : 
                              "bg-amber-500/10 text-amber-600"
                            )}>
                              {app.status}
                           </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                           <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {app.applicationNo}
                           </span>
                           <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Middle: Course Details */}
                  <div className="flex flex-col md:items-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Applied For</p>
                     <p className="text-sm font-bold text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                        {app.appliedCourse}
                     </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                     <Link href={`${workspaceBase}/admission/print/${app.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 hover:bg-slate-50">
                           <Eye className="w-4 h-4 mr-2" /> Details
                        </Button>
                     </Link>
                     
                     <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 text-sm cursor-pointer shadow-sm transition-all active:scale-95 outline-none">
                              Update Status
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] shadow-2xl border-none ring-1 ring-slate-100">
                           <DropdownMenuItem 
                              className="rounded-xl cursor-pointer font-bold text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 py-2.5"
                              onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                           >
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve Applicant
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                              className="rounded-xl cursor-pointer font-bold text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5"
                              onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                           >
                              <XCircle className="mr-2 h-4 w-4" /> Reject Applicant
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
             <p className="text-slate-400 font-bold text-xs uppercase mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
