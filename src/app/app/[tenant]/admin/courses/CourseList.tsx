"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, BookOpen, Layers, Users, Eye,
  ChevronRight, Filter, ArrowUpDown,
  CheckCircle2, XCircle, MoreHorizontal, GraduationCap, Edit3, Power, Loader2, IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  toggleCourseActivation,
  updateFranchiseCoursePricing,
  createBatch 
} from "@/app/actions/courses";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CourseList({ 
  workspaceId, 
  initialCourses,
  tenant
}: { 
  workspaceId: string; 
  initialCourses: any[];
  tenant: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  const [pricingOpen, setPricingOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [pricingForm, setPricingForm] = useState({ feeAmount: 0, priceDisplay: "", discountText: "", showFee: true });
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [batchOpen, setBatchOpen] = useState(false);
  
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [adminDetailsOpen, setAdminDetailsOpen] = useState(false);
  const [adminDetailsCourse, setAdminDetailsCourse] = useState<any>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set(initialCourses.map(c => c.groupId).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [initialCourses]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter & Sort Logic
  const processedCourses = useMemo(() => {
    let result = [...initialCourses];
    
    if (selectedCategory !== "All") {
      result = result.filter(c => c.groupId === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(c => 
        (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (c.short?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [initialCourses, searchTerm, sortConfig, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(processedCourses.length / itemsPerPage));
  const paginatedCourses = useMemo(() => {
    return processedCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [processedCourses, currentPage, itemsPerPage]);

  if (!mounted) return null;

  const toggleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const openAdminDetails = (course: any) => {
    setAdminDetailsCourse(course);
    setAdminDetailsOpen(true);
  };

  const handleToggleActivation = async (globalCourseId: string, currentlyActive: boolean) => {
    const toastId = toast.loading(currentlyActive ? "Disabling course..." : "Enabling course...");
    const res = await toggleCourseActivation(workspaceId, globalCourseId, !currentlyActive);
    if (res.success) {
      toast.success(currentlyActive ? "Course hidden from landing page" : "Course enabled on landing page", { id: toastId });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update status", { id: toastId });
    }
  };

  const openPricingModal = (course: any, localOverride: any) => {
    setSelectedCourse({ globalCourse: course, localOverride });
    setPricingForm({
      feeAmount: localOverride?.feeAmount ?? course.price ?? 0,
      priceDisplay: localOverride?.priceDisplay ?? course.priceDisplay ?? "",
      discountText: localOverride?.discountText ?? course.discountText ?? "",
      showFee: localOverride?.showFee ?? course.showFee ?? true,
    });
    setPricingOpen(true);
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.localOverride?.id) {
      toast.error("Please enable the course first before editing local pricing.");
      return;
    }

    setIsUpdating(true);
    const res = await updateFranchiseCoursePricing(selectedCourse.localOverride.id, {
      ...pricingForm,
      feeAmount: Number(pricingForm.feeAmount)
    });
    setIsUpdating(false);

    if (res.success) {
      toast.success("Pricing updated for your franchise!");
      setPricingOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update pricing");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48 px-4 py-2 bg-white dark:bg-zinc-900 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-zinc-950/20">
                <th className="p-6 w-16">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sl No.</span>
                </th>
                <th className="p-6">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Course Info <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-6 hidden md:table-cell">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Duration
                  </span>
                </th>
                <th className="p-6 hidden lg:table-cell">
                   <button onClick={() => toggleSort('price')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Pricing <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-6 text-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Status
                  </span>
                </th>
                <th className="p-6 text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {paginatedCourses.map((globalCourse, index) => {
                const localOverride = globalCourse.courses?.[0];
                const isActive = localOverride?.isActive === true;
                const activePrice = localOverride?.feeAmount ?? globalCourse.price;
                const totalStudents = localOverride?._count?.admissionApps || 0;
                
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <React.Fragment key={globalCourse.id}>
                    <tr className="group transition-all hover:bg-slate-50/50 dark:hover:bg-zinc-950/20">
                      <td className="p-6 text-slate-500 font-black">{serialNumber}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-sm border border-border/50">
                            {globalCourse.banner ? (
                              <img src={globalCourse.banner} alt={globalCourse.name} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-8 h-8" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 max-w-[300px]">
                             <h4 className="text-2xl font-black text-primary leading-tight uppercase tracking-[0.2em]">{globalCourse.short || "COURSE"}</h4>
                             <span className="text-sm font-bold text-slate-600 dark:text-slate-300 capitalize line-clamp-2" title={globalCourse.name}>{globalCourse.name}</span>
                             <span className="text-xs text-muted-foreground font-medium mt-1">
                               <Users className="w-3 h-3 inline mr-1" />
                               {totalStudents} Enrolled
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 hidden md:table-cell">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{globalCourse.duration || "N/A"}</span>
                      </td>
                      <td className="p-6 hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="text-lg font-black text-primary">₹{activePrice.toLocaleString()}</span>
                          {localOverride ? (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full w-max">Custom Pricing</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-bold">Global Pricing</span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => handleToggleActivation(globalCourse.id, isActive)}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95",
                            isActive ? "bg-green-500 text-white shadow-green-500/20" : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                          )}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isActive ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openAdminDetails(globalCourse)} className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-slate-500">
                               <Eye className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openPricingModal(globalCourse, localOverride)} className="w-10 h-10 rounded-xl hover:bg-green-500/10 hover:text-green-600 transition-all text-slate-500">
                               <Edit3 className="w-5 h-5" />
                            </Button>
                         </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-slate-50/30 dark:bg-zinc-950/20">
            <div className="text-sm text-muted-foreground font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedCourses.length)} of {processedCourses.length} courses
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 rounded-xl font-bold"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "h-9 w-9 rounded-xl font-bold transition-all",
                      currentPage === i + 1 ? "bg-primary text-white shadow-md shadow-primary/20" : ""
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-9 rounded-xl font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {processedCourses.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-border/60 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground/30">
            <BookOpen className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No courses available</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xs mx-auto">The Super Admin hasn't created any global courses yet.</p>
          </div>
        </div>
      )}

      {/* Pricing Override Modal */}
      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Edit Local Pricing</DialogTitle>
            <p className="text-sm text-muted-foreground">Override the pricing details for your franchise landing page.</p>
          </DialogHeader>

          <form onSubmit={handleUpdatePricing} className="space-y-6">
            <div className="space-y-2">
              <Label>Custom Price (₹)</Label>
              <Input 
                type="number" 
                value={pricingForm.feeAmount}
                onChange={e => setPricingForm({...pricingForm, feeAmount: Number(e.target.value)})}
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Price Display Text (e.g. ₹5,000 / month)</Label>
              <Input 
                value={pricingForm.priceDisplay}
                onChange={e => setPricingForm({...pricingForm, priceDisplay: e.target.value})}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Discount Offer Text (e.g. 50% Off!)</Label>
              <Input 
                value={pricingForm.discountText}
                onChange={e => setPricingForm({...pricingForm, discountText: e.target.value})}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-border">
              <Switch 
                checked={pricingForm.showFee}
                onCheckedChange={v => setPricingForm({...pricingForm, showFee: v})}
              />
              <div>
                <Label className="font-bold block">Show Course Fee</Label>
                <span className="text-xs text-muted-foreground">Toggle public visibility of the price.</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setPricingOpen(false)} className="flex-1 h-12 rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isUpdating} className="flex-1 h-12 rounded-xl font-bold">
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Pricing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Admin View Details Modal */}
      <Dialog open={adminDetailsOpen} onOpenChange={setAdminDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              {adminDetailsCourse?.name} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Duration</p>
                <p className="font-bold text-slate-900 dark:text-white">{adminDetailsCourse?.duration || "N/A"}</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Global Price</p>
                <p className="font-bold text-slate-900 dark:text-white">₹{adminDetailsCourse?.price || 0}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Syllabus Structure
              </h4>
              <div className="space-y-4">
                {adminDetailsCourse?.syllabus && Object.keys(adminDetailsCourse.syllabus).length > 0 ? (
                  Object.entries(adminDetailsCourse.syllabus as Record<string, any[]>).map(([term, units]) => (
                    <div key={term} className="p-5 border border-border/60 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm">
                      <h5 className="font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{term}</h5>
                      <div className="space-y-3">
                        {units.map((u, idx) => (
                          <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl">
                            <div className="flex gap-3 items-center">
                              <Badge variant="secondary" className="text-[9px] shrink-0">U{u.unit}</Badge>
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{u.title}</span>
                            </div>
                            {u.detail && (
                              <p className="text-xs text-muted-foreground pl-[3.25rem] leading-relaxed">{u.detail}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-2xl bg-slate-50 dark:bg-zinc-900/50">
                    <p className="text-sm text-muted-foreground font-medium">No syllabus mapped globally.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
