"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, BookOpen, Layers, Users, Eye,
  ArrowUpDown, CheckCircle2, XCircle, GraduationCap, 
  Edit3, Power, Loader2, IndianRupee, Clock, Award, 
  Sparkles, Calendar, Tag, Info, Check, ArrowRight
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
  toggleCourseActivation,
  updateFranchiseCoursePricing 
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
  
  // Edit / Pricing Modal state
  const [pricingOpen, setPricingOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ globalCourse: any; localOverride: any } | null>(null);
  const [pricingForm, setPricingForm] = useState({ 
    feeAmount: 0, 
    priceDisplay: "", 
    discountText: "", 
    showFee: true,
    admissionFee: 0, 
    registrationFee: 0, 
    examFee: 0,
    isInstallmentBased: false, 
    installmentAmount: 0, 
    totalInstallments: 0, 
    totalCourseFee: 0,
    isActive: true
  });
  const [isUpdating, setIsUpdating] = useState(false);
  
  // View Details Modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<{ course: any; override: any } | null>(null);
  const [viewTab, setViewTab] = useState<"overview" | "syllabus">("overview");

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  const openAdminDetails = (course: any, override: any) => {
    setSelectedView({ course, override });
    setViewTab("overview");
    setViewOpen(true);
  };

  const handleToggleActivation = async (globalCourseId: string, currentlyActive: boolean) => {
    const toastId = toast.loading(currentlyActive ? "Disabling course..." : "Enabling course...");
    const res = await toggleCourseActivation(workspaceId, globalCourseId, !currentlyActive);
    if (res.success) {
      toast.success(currentlyActive ? "Course hidden from franchise portal" : "Course enabled for franchise portal", { id: toastId });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update status", { id: toastId });
    }
  };

  const openPricingModal = (course: any, localOverride: any) => {
    setSelectedCourse({ globalCourse: course, localOverride });
    const defaultTotalFee = localOverride?.totalCourseFee ?? localOverride?.feeAmount ?? course.price ?? 0;
    setPricingForm({
      feeAmount: localOverride?.feeAmount ?? course.price ?? 0,
      priceDisplay: localOverride?.priceDisplay ?? course.priceDisplay ?? "",
      discountText: localOverride?.discountText ?? course.discountText ?? "",
      showFee: localOverride?.showFee ?? course.showFee ?? true,
      admissionFee: localOverride?.admissionFee ?? 0,
      registrationFee: localOverride?.registrationFee ?? 0,
      examFee: localOverride?.examFee ?? 0,
      isInstallmentBased: localOverride?.isInstallmentBased ?? false,
      installmentAmount: localOverride?.installmentAmount ?? 0,
      totalInstallments: localOverride?.totalInstallments ?? 0,
      totalCourseFee: defaultTotalFee,
      isActive: localOverride ? localOverride.isActive === true : true
    });
    setPricingOpen(true);
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.globalCourse?.id) return;

    setIsUpdating(true);
    const res = await updateFranchiseCoursePricing(workspaceId, selectedCourse.globalCourse.id, {
      feeAmount: Number(pricingForm.feeAmount) || 0,
      admissionFee: Number(pricingForm.admissionFee) || 0,
      registrationFee: Number(pricingForm.registrationFee) || 0,
      examFee: Number(pricingForm.examFee) || 0,
      priceDisplay: pricingForm.priceDisplay || "",
      discountText: pricingForm.discountText || "",
      showFee: pricingForm.showFee,
      isInstallmentBased: pricingForm.isInstallmentBased,
      installmentAmount: pricingForm.isInstallmentBased ? Number(pricingForm.installmentAmount) || null : null,
      totalInstallments: pricingForm.isInstallmentBased ? Number(pricingForm.totalInstallments) || null : null,
      totalCourseFee: Number(pricingForm.totalCourseFee) || 0,
      isActive: pricingForm.isActive
    });
    setIsUpdating(false);

    if (res.success) {
      toast.success("Course pricing & settings saved!");
      setPricingOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update pricing");
    }
  };

  // Calculated one-time total inside edit modal
  const liveOneTimeTotal = (
    Number(pricingForm.admissionFee || 0) +
    Number(pricingForm.registrationFee || 0) +
    Number(pricingForm.totalCourseFee || 0) +
    Number(pricingForm.examFee || 0)
  );

  return (
    <div className="space-y-4">
      {/* Main Content Card & Filter Toolbar (Rule 7.4) */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 sm:h-9 pl-8 pr-3 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 sm:h-9 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Total: <span className="font-bold text-slate-700 dark:text-slate-300">{processedCourses.length}</span> courses
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 h-8 sm:h-9">
                <th className="px-3.5 py-2 w-12 text-[10px] font-bold uppercase tracking-wider text-slate-400">#</th>
                <th className="px-3.5 py-2">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">
                    Course Info <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-3.5 py-2 hidden md:table-cell text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Duration
                </th>
                <th className="px-3.5 py-2 hidden lg:table-cell">
                  <button onClick={() => toggleSort('price')} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">
                    Pricing <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-3.5 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-3.5 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {paginatedCourses.map((globalCourse, index) => {
                const localOverride = globalCourse.courses?.[0];
                const isActive = localOverride?.isActive === true;
                const activePrice = localOverride?.feeAmount ?? globalCourse.price;
                const totalStudents = localOverride?._count?.admissionApps || 0;
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr key={globalCourse.id} className="group transition-all hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-3.5 py-2.5 text-xs text-slate-400 font-medium">{serialNumber}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-xs border border-slate-100 dark:border-slate-800">
                          {globalCourse.banner ? (
                            <img src={globalCourse.banner} alt={globalCourse.name} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 max-w-[280px]">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">{globalCourse.short || "COURSE"}</h4>
                            {localOverride?.isInstallmentBased && (
                              <Badge variant="outline" className="text-[8px] font-bold px-1 py-0 bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800">EMI</Badge>
                            )}
                            {globalCourse.groupId && (
                              <span className="text-[9px] font-medium text-slate-400 capitalize">({globalCourse.groupId})</span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 truncate" title={globalCourse.name}>{globalCourse.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            <Users className="w-2.5 h-2.5 inline mr-1" />
                            {totalStudents} Enrolled
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 hidden md:table-cell">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{globalCourse.duration || "N/A"}</span>
                    </td>
                    <td className="px-3.5 py-2.5 hidden lg:table-cell">
                      <div className="flex flex-col gap-0.5">
                        {localOverride ? (
                          <>
                            <span className="text-xs font-bold text-primary">
                              ₹{Number(localOverride.totalCourseFee || localOverride.feeAmount || 0).toLocaleString()}
                            </span>
                            {localOverride.isInstallmentBased && (
                              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                EMI: ₹{localOverride.installmentAmount} × {localOverride.totalInstallments}
                              </span>
                            )}
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.2 rounded w-max">
                              Custom Franchise
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">₹{Number(activePrice || 0).toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-medium">Standard Global</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch 
                          checked={isActive}
                          onCheckedChange={() => handleToggleActivation(globalCourse.id, isActive)}
                          className="scale-80 data-[state=checked]:bg-emerald-600 cursor-pointer"
                          title={isActive ? "Click to disable course" : "Click to enable course"}
                        />
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded select-none min-w-[50px] text-center inline-block font-mono",
                          isActive 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {isActive ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Course Details"
                          onClick={() => openAdminDetails(globalCourse, localOverride)} 
                          className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-slate-500"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Edit Pricing & Settings"
                          onClick={() => openPricingModal(globalCourse, localOverride)} 
                          className="h-7 w-7 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors text-slate-500"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls (Rule 7.6) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-xs font-medium text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedCourses.length)} of {processedCourses.length}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-medium"
              >
                Prev
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "h-7 w-7 rounded-md font-semibold text-xs transition-all",
                      currentPage === i + 1 ? "bg-primary text-primary-foreground shadow-xs" : ""
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
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-medium"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {processedCourses.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No courses match your search</h3>
            <p className="text-xs text-slate-500">Try changing your search term or category filter.</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. COURSE VIEW SECTION (View Details Modal - Rule 7.7)     */}
      {/* ========================================================= */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          {/* Header Banner / Title */}
          <div className="relative bg-slate-900 text-white p-4 sm:p-5 overflow-hidden">
            {selectedView?.course?.banner && (
              <img 
                src={selectedView.course.banner} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs" 
              />
            )}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 backdrop-blur-md">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm uppercase tracking-wider text-white">
                      {selectedView?.course?.short || "COURSE"}
                    </span>
                    {selectedView?.course?.groupId && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/15 text-slate-200 uppercase tracking-wider">
                        {selectedView.course.groupId}
                      </span>
                    )}
                    {selectedView?.override?.isActive ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Enabled in Franchise
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                        Disabled in Franchise
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                    {selectedView?.course?.name}
                  </h3>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  const course = selectedView?.course;
                  const override = selectedView?.override;
                  setViewOpen(false);
                  if (course) openPricingModal(course, override);
                }}
                className="h-8 px-3 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Pricing</span>
              </Button>
            </div>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="px-4 sm:px-5 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex gap-2">
              <button
                onClick={() => setViewTab("overview")}
                className={cn(
                  "pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5",
                  viewTab === "overview" 
                    ? "border-primary text-primary dark:text-white" 
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Overview & Pricing</span>
              </button>
              <button
                onClick={() => setViewTab("syllabus")}
                className={cn(
                  "pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5",
                  viewTab === "syllabus" 
                    ? "border-primary text-primary dark:text-white" 
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum & Syllabus</span>
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
            {viewTab === "overview" ? (
              <div className="space-y-4">
                {/* 4 Quick Stat Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3 text-primary" /> Duration
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {selectedView?.course?.duration || "Self-Paced"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Users className="w-3 h-3 text-indigo-500" /> Enrolled
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {selectedView?.override?._count?.admissionApps || 0} Students
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <IndianRupee className="w-3 h-3 text-emerald-500" /> Global Price
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      ₹{Number(selectedView?.course?.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Award className="w-3 h-3 text-amber-500" /> Franchise Fee
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-primary">
                      ₹{Number(selectedView?.override?.totalCourseFee || selectedView?.override?.feeAmount || selectedView?.course?.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Franchise Pricing Breakdown Card */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Franchise Fee Structure
                      </h4>
                    </div>
                    {selectedView?.override ? (
                      <Badge variant="outline" className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                        Custom Configured
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] font-medium text-slate-500">
                        Default Base Global
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Admission Fee</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{Number(selectedView?.override?.admissionFee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registration Fee</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{Number(selectedView?.override?.registrationFee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Exam Fee</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{Number(selectedView?.override?.examFee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Course Tuition</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{Number(selectedView?.override?.feeAmount || selectedView?.course?.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Installment Plan Info */}
                  {selectedView?.override?.isInstallmentBased && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                        EMI Option Available:
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">
                        ₹{selectedView.override.installmentAmount}/month × {selectedView.override.totalInstallments} months
                      </span>
                    </div>
                  )}

                  {/* Public Display Preview */}
                  {(selectedView?.override?.priceDisplay || selectedView?.course?.priceDisplay || selectedView?.override?.discountText) && (
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Badge Preview:</span>
                      {selectedView?.override?.priceDisplay && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          {selectedView.override.priceDisplay}
                        </span>
                      )}
                      {selectedView?.override?.discountText && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold">
                          {selectedView.override.discountText}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Course Description */}
                {selectedView?.course?.description && (
                  <div className="space-y-1.5 pt-1">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedView.course.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Syllabus Tab */
              <div className="space-y-3">
                {selectedView?.course?.syllabus && Object.keys(selectedView.course.syllabus).length > 0 ? (
                  Object.entries(selectedView.course.syllabus as Record<string, any[]>).map(([term, units]) => (
                    <div key={term} className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-2 mb-2.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{term}</h5>
                      </div>
                      <div className="space-y-2">
                        {units.map((u, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                                Unit {u.unit || idx + 1}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{u.title}</span>
                            </div>
                            {u.detail && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8 mt-1 leading-relaxed">
                                {u.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center border border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/30 space-y-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No syllabus mapped globally</p>
                    <p className="text-[11px] text-slate-400">The curriculum modules have not been added for this course yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewOpen(false)}
              className="h-8 px-3 rounded-lg text-xs font-semibold"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const course = selectedView?.course;
                const override = selectedView?.override;
                setViewOpen(false);
                if (course) openPricingModal(course, override);
              }}
              className="h-8 px-3.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Pricing & Settings</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. COURSE EDIT SECTION (Pricing & Settings Modal - Rule 7.7) */}
      {/* ========================================================= */}
      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Edit Course Pricing & Settings</span>
                  <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                    {selectedCourse?.globalCourse?.short || "COURSE"}
                  </Badge>
                </DialogTitle>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedCourse?.globalCourse?.name}
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdatePricing} className="space-y-4 pt-1">
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              {/* Franchise Course Activation Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                    Enable for Franchise Website & Admissions
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    When active, students can enroll in this course through your franchise center.
                  </p>
                </div>
                <Switch 
                  checked={pricingForm.isActive}
                  onCheckedChange={(checked) => setPricingForm({ ...pricingForm, isActive: checked })}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              {/* 4-Item Fee Component Grid */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fee Breakdown (₹)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Admission Fee (₹)
                    </Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={pricingForm.admissionFee}
                      onChange={e => setPricingForm({ ...pricingForm, admissionFee: Number(e.target.value) })}
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      placeholder="0"
                    />
                    <span className="text-[9px] text-slate-400 block">Collected once at time of admission</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Registration Fee (₹)
                    </Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={pricingForm.registrationFee}
                      onChange={e => setPricingForm({ ...pricingForm, registrationFee: Number(e.target.value) })}
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      placeholder="0"
                    />
                    <span className="text-[9px] text-slate-400 block">Registration & verification charges</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Exam Fee (₹)
                    </Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={pricingForm.examFee}
                      onChange={e => setPricingForm({ ...pricingForm, examFee: Number(e.target.value) })}
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      placeholder="0"
                    />
                    <span className="text-[9px] text-slate-400 block">Evaluation & certificate generation fee</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Course Tuition Fee (₹)
                    </Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={pricingForm.totalCourseFee}
                      onChange={e => setPricingForm({ ...pricingForm, totalCourseFee: Number(e.target.value) })}
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      placeholder="0"
                    />
                    <span className="text-[9px] text-slate-400 block">Base course tuition for your center</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Fee Calculation Preview Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Total Student Cost (One-Time):</span>
                  <span className="text-sm font-bold text-primary">₹{liveOneTimeTotal.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Calculation: ₹{pricingForm.admissionFee || 0} (Adm) + ₹{pricingForm.registrationFee || 0} (Reg) + ₹{pricingForm.totalCourseFee || 0} (Tuition) + ₹{pricingForm.examFee || 0} (Exam)
                </div>
              </div>

              {/* Installment / EMI Configuration */}
              <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer">
                      Enable Installment / EMI Option
                    </Label>
                    <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400">
                      Allow students to pay in monthly installments instead of one lump sum.
                    </p>
                  </div>
                  <Switch 
                    checked={pricingForm.isInstallmentBased}
                    onCheckedChange={(checked) => setPricingForm({ ...pricingForm, isInstallmentBased: checked })}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>

                {pricingForm.isInstallmentBased && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">
                        Monthly EMI (₹/month)
                      </Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={pricingForm.installmentAmount}
                        onChange={e => setPricingForm({ ...pricingForm, installmentAmount: Number(e.target.value) })}
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800"
                        placeholder="e.g. 1500"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">
                        Total Installments (Months)
                      </Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={pricingForm.totalInstallments}
                        onChange={e => setPricingForm({ ...pricingForm, totalInstallments: Number(e.target.value) })}
                        className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800"
                        placeholder="e.g. 3"
                      />
                    </div>

                    <div className="col-span-2 text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                      EMI Total: ₹{(Number(pricingForm.installmentAmount || 0) * Number(pricingForm.totalInstallments || 0)).toLocaleString()} 
                      <span className="text-slate-400 ml-1">
                        (+ ₹{(Number(pricingForm.admissionFee || 0) + Number(pricingForm.registrationFee || 0)).toLocaleString()} admission/registration upfront)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Display & Promotion Settings */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Public Display & Promotional Badges</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Price Display Text (Optional)
                    </Label>
                    <Input 
                      value={pricingForm.priceDisplay}
                      onChange={e => setPricingForm({ ...pricingForm, priceDisplay: e.target.value })}
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      placeholder="e.g. ₹2,500 / month"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Discount Offer Text (Optional)
                    </Label>
                    <Input 
                      value={pricingForm.discountText}
                      onChange={e => setPricingForm({ ...pricingForm, discountText: e.target.value })}
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      placeholder="e.g. Flat 30% Off this week!"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                      Show Fee Publicly
                    </Label>
                    <p className="text-[10px] text-slate-400">Display pricing transparently on public catalog pages.</p>
                  </div>
                  <Switch 
                    checked={pricingForm.showFee}
                    onCheckedChange={(checked) => setPricingForm({ ...pricingForm, showFee: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPricingOpen(false)} 
                className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating} 
                className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Course Settings</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
