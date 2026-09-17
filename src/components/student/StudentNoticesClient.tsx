"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Info,
  Clock,
  ExternalLink,
  Tag,
  BookOpen,
  Award,
  ShieldCheck,
  FileText,
  Printer,
  Share2,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building,
  GraduationCap,
  Download,
  Eye,
  FileDown,
  FileCheck2,
  Stamp,
  BadgeCheck,
  HelpCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getTenantLink } from "@/lib/routing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentNoticesClientProps {
  notices?: any[];
  settings?: any;
  tenant: string;
  workspace?: any;
}

// Fallback institutional templates when center admin has not yet added custom notices
const DEFAULT_NOTICES = [
  {
    id: "not-001",
    title: "Upcoming Term Examination Schedule & Admit Card Guidelines",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Exams",
    priority: "high",
    department: "Examination Controller",
    isTemplate: true,
    description: `All registered students enrolled in computer diploma, modular certificate, and vocational technology programs are hereby notified that the upcoming Annual / Semester Examination session will commence as per the published academic calendar.

Key Instructions for Examinees:
1. Students must download and verify their official Admit Card from the Student Portal Exams section prior to the exam date.
2. Entry to the examination hall will require a printed copy of the verified Admit Card along with an authorized Student ID card.
3. Reporting time is strictly 30 minutes prior to the commencement of the paper. Late entry beyond 15 minutes of paper start will not be permitted.
4. Electronic devices, smartwatches, and unauthorized materials are strictly prohibited inside the testing center.

Students facing discrepancies in their subject allocations or fee clearances must report immediately to the Center Administration desk.`,
    link: ""
  },
  {
    id: "not-002",
    title: "Practical Lab Session Allocation & Weekend Batch Timings",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Academic",
    priority: "medium",
    department: "Academic Director",
    isTemplate: true,
    description: `This is to inform all computer application, web design, accounting, and multimedia students that additional practical laboratory sessions have been allocated to ensure comprehensive hands-on training.

Schedule Guidelines:
1. Morning batches: Monday to Thursday, 09:30 AM to 11:30 AM.
2. Evening batches: Tuesday to Friday, 04:30 PM to 06:30 PM.
3. Special weekend doubt clearing and software project lab: Saturday, 10:00 AM to 02:00 PM.

Attendance of at least 75% in practical modules is mandatory for final government/institutional certification eligibility.`,
    link: ""
  },
  {
    id: "not-003",
    title: "Center Administrative Closure & National Holiday Notice",
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Holidays",
    priority: "low",
    department: "Center Administration",
    isTemplate: true,
    description: `The physical campus, administrative offices, and lecture classrooms of our center will remain closed on the upcoming official gazetted holiday.

Please take note of the following:
1. In-person lectures and practical lab batches will resume regularly on the next working day.
2. The Student Digital Portal, online practice tests, and downloadable study materials will remain accessible 24/7.
3. Emergency student queries may be submitted through the student support portal.`,
    link: ""
  },
  {
    id: "not-004",
    title: "Student Portal Profile & Fee Receipt Verification",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: "General",
    priority: "low",
    department: "Accounts & Registrar",
    isTemplate: true,
    description: `All newly admitted and continuing students are requested to review their profile details, photograph, and contact numbers in the Student Dashboard.

Students who made payments via UPI or NEFT/IMPS Bank Transfer must ensure that their payment UTR reference is submitted under the Fees & Invoices tab for instant verification and receipt voucher generation.`,
    link: ""
  }
];

export default function StudentNoticesClient({
  notices: initialNotices = [],
  settings,
  tenant,
  workspace
}: StudentNoticesClientProps) {
  const pathname = usePathname();
  const primaryColor = settings?.primaryColor || "#0284c7";
  const workspaceName = workspace?.name || settings?.siteName || "Academic Center";
  const centerCode = workspace?.centerCode || tenant.toUpperCase();
  const centerAddress = workspace?.address || settings?.address || "Institutional Campus";
  const centerPhone = workspace?.phone || settings?.phone || "Contact Institute Office";
  const centerEmail = workspace?.email || settings?.email || "support@rgycsp.org.in";

  // Has custom notices configured by center admin
  const hasCustomNotices = initialNotices && initialNotices.length > 0;

  // Merge workspace notices with defaults if empty
  const allNotices = useMemo(() => {
    if (hasCustomNotices) {
      return initialNotices.map((n: any, idx: number) => ({
        id: n.id || `not-${idx + 101}`,
        title: n.title || "Official Announcement",
        date: n.date || new Date().toISOString(),
        category: n.category || "General",
        priority: n.priority || "normal",
        department: n.department || "Center Administration",
        description: n.description || "Official announcement from the administration. For further instructions or queries, contact the center reception.",
        link: n.link || "",
        isTemplate: false
      }));
    }
    return DEFAULT_NOTICES;
  }, [initialNotices, hasCustomNotices]);

  // Search, Category, and Sorting state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Active notice modal state
  const [activeNotice, setActiveNotice] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "a4">("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Hidden print reference for direct PDF generation
  const a4SheetRef = useRef<HTMLDivElement>(null);

  // Available categories
  const categories = ["all", "Academic", "Exams", "Holidays", "General"];

  // Filtered and Sorted notices
  const filteredNotices = useMemo(() => {
    let result = allNotices.filter((notice: any) => {
      const matchesSearch =
        notice.title?.toLowerCase().includes(search.toLowerCase()) ||
        notice.description?.toLowerCase().includes(search.toLowerCase()) ||
        notice.category?.toLowerCase().includes(search.toLowerCase()) ||
        notice.department?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        notice.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    result.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allNotices, search, selectedCategory, sortBy]);

  // Metrics Calculation
  const metrics = useMemo(() => {
    const totalCount = allNotices.length;
    const academicCount = allNotices.filter((n) =>
      /academic|course|batch|class/i.test(n.category || "")
    ).length;
    const examCount = allNotices.filter((n) =>
      /exam|test|admit|result/i.test(n.category || "")
    ).length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const recentCount = allNotices.filter((n) => {
      const d = new Date(n.date);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
      total: totalCount,
      academic: academicCount,
      exams: examCount,
      recent: recentCount || totalCount
    };
  }, [allNotices]);

  // Pagination logic
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage) || 1;
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(start, start + itemsPerPage);
  }, [filteredNotices, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // Helper date formatters
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateFull = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "01" : String(d.getDate()).padStart(2, "0");
    } catch {
      return "01";
    }
  };

  const formatMonth = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "Notice" : d.toLocaleDateString("en-IN", { month: "short" });
    } catch {
      return "Notice";
    }
  };

  // Category border & badge colors
  const getCategoryTheme = (category: string = "", priority: string = "") => {
    const cat = category.toLowerCase();
    const prio = priority.toLowerCase();

    if (prio === "high" || prio === "urgent") {
      return {
        border: "border-rose-500",
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30",
        dot: "bg-rose-500",
        accent: "text-rose-600 dark:text-rose-400"
      };
    }
    if (/exam|assessment|admit/i.test(cat)) {
      return {
        border: "border-purple-500",
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30",
        dot: "bg-purple-500",
        accent: "text-purple-600 dark:text-purple-400"
      };
    }
    if (/academic|curriculum|course|batch/i.test(cat)) {
      return {
        border: "border-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30",
        dot: "bg-emerald-500",
        accent: "text-emerald-600 dark:text-emerald-400"
      };
    }
    if (/holiday|vacation|closure/i.test(cat)) {
      return {
        border: "border-amber-500",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30",
        dot: "bg-amber-500",
        accent: "text-amber-600 dark:text-amber-400"
      };
    }
    return {
      border: "border-blue-500",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30",
      dot: "bg-blue-500",
      accent: "text-blue-600 dark:text-blue-400"
    };
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Notice link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Direct A4 PDF Generation using jspdf + html2canvas
  const handleDownloadPdf = async (noticeToDownload?: any) => {
    const notice = noticeToDownload || activeNotice;
    if (!notice) return;

    setIsGeneratingPdf(true);
    const toastId = toast.loading(`Generating official A4 PDF for "${notice.title.slice(0, 25)}..."`);

    try {
      // Find the element to capture
      let element = document.getElementById(`a4-sheet-${notice.id}`);
      if (!element) {
        // If modal was open on 'overview', temporary switch to render A4 sheet
        setActiveNotice(notice);
        setModalTab("a4");
        await new Promise((r) => setTimeout(r, 400));
        element = document.getElementById(`a4-sheet-${notice.id}`);
      }

      if (!element) {
        throw new Error("A4 Sheet element not ready");
      }

      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));

      const cleanName = (notice.title || "Circular")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 32);
      pdf.save(`${cleanName}_Official_Circular.pdf`);

      toast.success("A4 PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. You can also click 'Print A4' -> Save as PDF.", {
        id: toastId
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Clean Native Print
  const handlePrint = (noticeToPrint?: any) => {
    if (noticeToPrint) {
      setActiveNotice(noticeToPrint);
      setModalTab("a4");
    }
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
    }, 250);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Notice Board & Circulars
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 text-[10px] font-semibold px-2 py-0.5"
            >
              Live Updates
            </Badge>

            {!hasCustomNotices && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40 text-[9px] font-semibold px-2 py-0.5"
                title="Showing official academic templates. Notices configured in Franchise Admin -> Settings will reflect here."
              >
                Standard Templates
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Official announcements, examination notices, and center circulars.
          </p>
        </div>

        {/* Quick Nav Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={getTenantLink("/student/exams", tenant, pathname)}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Live Exams</span>
            </Button>
          </Link>
          <Link href={getTenantLink("/student/attendance", tenant, pathname)}>
            <Button
              variant="default"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>Attendance Log</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notice Source Status Banner */}
      {!hasCustomNotices && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Note:</strong> Showing verified institutional templates. When the center administration posts custom circulars in <strong>Franchise Admin → Settings → Notice Board</strong>, they automatically appear here.
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/60 px-2 py-0.5 rounded shrink-0">
            A4 Ready
          </span>
        </div>
      )}

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Circulars */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Total Circulars
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {metrics.total}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Active announcements
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Academic Notices */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Academic Updates
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {metrics.academic}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Classes & curriculum
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 shrink-0">
                <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Exam Schedules */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Exam Notices
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {metrics.exams}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Assessments & dates
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 shrink-0">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Recent / This Month */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  This Month
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {metrics.recent}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Published recently
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 shrink-0">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Content Card with Toolbar & High-Density Notices (Rule 7.4 & 7.5) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        {/* Toolbar Header */}
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-[300px] group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search notices, circulars..."
                className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400 focus-visible:ring-1"
              />
            </div>

            {/* Category Filter Pills & Sort Button */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 w-full lg:w-auto">
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
                {categories.map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-all capitalize",
                        isActive
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {cat === "all" ? "All Notices" : cat}
                    </button>
                  );
                })}
              </div>

              {/* Sort Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 gap-1.5 shrink-0"
              >
                {sortBy === "newest" ? (
                  <SortDesc className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <SortAsc className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{sortBy === "newest" ? "Newest First" : "Oldest First"}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* List of Notices (Rule 7.5) */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {paginatedNotices.length > 0 ? (
            paginatedNotices.map((notice: any) => {
              const theme = getCategoryTheme(notice.category, notice.priority);
              const isToday =
                new Date(notice.date).toDateString() === new Date().toDateString();

              return (
                <div
                  key={notice.id}
                  className={cn(
                    "flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px]",
                    theme.border
                  )}
                >
                  {/* Left Column: Date Stamp + Title & Details */}
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                    {/* Calendar Badge */}
                    <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/70 flex flex-col items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 group-hover:border-primary/30 transition-colors">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                        {formatMonth(notice.date)}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                        {formatDay(notice.date)}
                      </span>
                    </div>

                    {/* Notice Information */}
                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Badges & Meta info */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border",
                            theme.badge
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1", theme.dot)} />
                          {notice.category || "General"}
                        </Badge>

                        {isToday && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                            New Today
                          </Badge>
                        )}

                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDate(notice.date)}
                        </span>

                        <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700 text-xs">
                          •
                        </span>

                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {notice.department || "Administration"}
                        </span>
                      </div>

                      {/* Notice Title */}
                      <h2
                        onClick={() => {
                          setActiveNotice(notice);
                          setModalTab("overview");
                        }}
                        className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                      >
                        {notice.title}
                      </h2>

                      {/* Snippet */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                        {notice.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Actions (Rule 7.5 Action buttons) */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0 w-full sm:w-auto justify-end pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/40">
                    {/* Direct PDF Download Button */}
                    <Button
                      onClick={() => handleDownloadPdf(notice)}
                      disabled={isGeneratingPdf}
                      variant="outline"
                      size="sm"
                      className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1.5"
                      title="Download as official A4 PDF document"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : (
                        <Download className="w-3 h-3 text-primary" />
                      )}
                      <span>A4 PDF</span>
                    </Button>

                    {/* Direct A4 View / Read Circular Button */}
                    <Button
                      onClick={() => {
                        setActiveNotice(notice);
                        setModalTab("overview");
                      }}
                      variant="default"
                      size="sm"
                      className="h-7 sm:h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Read Circular</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  No Notices Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {search
                    ? `No announcements match "${search}". Try adjusting your keywords or category filters.`
                    : "There are currently no circulars published under this category."}
                </p>
              </div>
              {(search || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs font-semibold rounded-lg"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 4. Standardized Pagination (Rule 7.6) */}
        {filteredNotices.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <p className="text-xs font-medium text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredNotices.length)} of{" "}
              {filteredNotices.length} circulars
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">
                        ...
                      </span>
                    );
                  }
                  const isCurr = page === currentPage;
                  return (
                    <Button
                      key={page}
                      variant={isCurr ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(Number(page))}
                      className="h-7 w-7 rounded-md font-semibold text-xs p-0"
                      style={isCurr ? { backgroundColor: primaryColor, color: "#fff" } : {}}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Notice Reader & A4 Document Dialog Modal (Rule 7.7) */}
      <Dialog open={!!activeNotice} onOpenChange={(open) => !open && setActiveNotice(null)}>
        <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
          {activeNotice && (
            <div>
              {/* Modal Top Navigation & View Mode Toggles */}
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                      {workspaceName}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Circular Ref: {centerCode}/CIR/2026/{activeNotice.id.slice(-4).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* View Switcher Pills */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setModalTab("overview")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                      modalTab === "overview"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Quick View</span>
                  </button>
                  <button
                    onClick={() => setModalTab("a4")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                      modalTab === "a4"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <FileCheck2 className="w-3 h-3" />
                    <span>A4 Official Sheet</span>
                  </button>
                </div>
              </div>

              {/* View 1: Quick Overview */}
              {modalTab === "overview" && (
                <div>
                  {/* Header Banner */}
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider"
                      >
                        {activeNotice.category || "General"}
                      </Badge>

                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateFull(activeNotice.date)}
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">•</span>

                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        Dept: {activeNotice.department || "Academic Administration"}
                      </span>
                    </div>

                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {activeNotice.title}
                    </DialogTitle>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line space-y-2">
                      {activeNotice.description}
                    </div>

                    {/* Authenticated Department Release */}
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <BadgeCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-900 dark:text-white">
                            Official Authenticated Release
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Issued by Office of {activeNotice.department || "Academic Director"} • {workspaceName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30 text-[9px] font-bold px-2 py-0.5 uppercase"
                      >
                        Verified
                      </Badge>
                    </div>

                    {/* Attachment Link if present */}
                    {activeNotice.link && (
                      <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                          <FileText className="w-4 h-4" />
                          <span>Official Attachment / Reference Link</span>
                        </div>
                        <a
                          href={activeNotice.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold gap-1 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View 2: Official A4 Sheet (Standard 210mm x 297mm Layout) */}
              <div
                className={cn(
                  "p-3 sm:p-5 bg-slate-100 dark:bg-slate-950 overflow-y-auto max-h-[68vh]",
                  modalTab !== "a4" && "hidden"
                )}
              >
                <div className="text-center mb-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Standard A4 Official Institute Circular Sheet • Print or Export to PDF
                  </span>
                </div>

                {/* THE A4 DOCUMENT CONTAINER */}
                <div
                  id={`a4-sheet-${activeNotice.id}`}
                  className="bg-white text-slate-900 mx-auto rounded-md shadow-lg border-2 border-slate-900 p-6 sm:p-8 w-full max-w-[720px] font-serif relative"
                  style={{ minHeight: "920px" }}
                >
                  {/* Subtle Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                    <div className="text-center transform -rotate-45">
                      <GraduationCap className="w-80 h-80 mx-auto text-slate-900" />
                      <p className="text-5xl font-black uppercase tracking-widest mt-4">
                        {workspaceName}
                      </p>
                    </div>
                  </div>

                  {/* Inner Thin Border for Formal Institutional Design */}
                  <div className="border border-slate-400/80 p-5 sm:p-6 flex flex-col justify-between h-full space-y-6 relative z-10">
                    {/* A4 Section 1: Institutional Letterhead */}
                    <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <GraduationCap className="w-8 h-8 text-slate-900" />
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                        {workspaceName}
                      </h1>
                      <p className="text-[11px] font-semibold tracking-wider text-slate-700 uppercase">
                        Affiliated to Rashtriya Gramin Yuva Computer Saksharta Mission (RGYCSM)
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-600 pt-0.5">
                        <span>
                          <strong>Center Code:</strong> {centerCode}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>Accreditation:</strong> ISO 9001:2015 Certified
                        </span>
                        <span>•</span>
                        <span>
                          <strong>Reg No:</strong> RGYCSM/ATC/{workspace?.id?.slice(0, 6).toUpperCase() || "2026"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-0.5">
                        Campus: {centerAddress} | Phone: {centerPhone} | Email: {centerEmail}
                      </p>
                    </div>

                    {/* A4 Section 2: Circular Ref No. and Date Bar */}
                    <div className="flex items-center justify-between text-xs font-sans font-bold border-b border-slate-300 pb-2">
                      <div className="text-slate-800">
                        <span className="text-slate-500 font-normal">Ref No: </span>
                        ABCD/{centerCode}/CIR/2026/{activeNotice.id.slice(-4).toUpperCase()}
                      </div>
                      <div className="text-slate-800">
                        <span className="text-slate-500 font-normal">Date of Issue: </span>
                        {formatDateFull(activeNotice.date)}
                      </div>
                    </div>

                    {/* A4 Section 3: Official Notification Badge & Subject */}
                    <div className="text-center space-y-3 pt-1">
                      <div className="inline-block px-4 py-1 bg-slate-900 text-white text-xs font-sans font-bold uppercase tracking-widest rounded-sm">
                        Official Notification & Circular
                      </div>

                      <div className="bg-slate-100 border-l-4 border-slate-900 p-3 text-left font-sans">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                          Subject of Circular:
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {activeNotice.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-medium">
                          <span>Classification: <strong>{activeNotice.category || "General"}</strong></span>
                          <span>•</span>
                          <span>Issuing Wing: <strong>{activeNotice.department || "Academic Council"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* A4 Section 4: Circular Body Text */}
                    <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif pt-1 flex-1">
                      <p className="font-semibold font-sans text-xs text-slate-700">
                        To All Concerned Students, Faculty Members & Academic Coordinators:
                      </p>
                      
                      <div className="whitespace-pre-line text-justify pl-1">
                        {activeNotice.description}
                      </div>

                      <div className="pt-2 text-[11px] font-sans text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                        <strong>Compliance Note:</strong> All students are hereby advised to strictly adhere to the timelines and instructions specified above. For any verification or support, please contact the center administration or raise a ticket via the student portal.
                      </div>
                    </div>

                    {/* A4 Section 5: Signature Block & Official Seal */}
                    <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-4 items-end font-sans">
                      {/* Left: Distribution */}
                      <div className="text-[9px] text-slate-600 space-y-0.5">
                        <p className="font-bold uppercase text-slate-800">Copy Forwarded For Information To:</p>
                        <p>1. Institutional Notice Board (Physical & Digital Portal)</p>
                        <p>2. Academic & Examination Department</p>
                        <p>3. Faculty & Batch Coordinators</p>
                        <p>4. Office Archive & Student Affairs</p>
                      </div>

                      {/* Right: Signature & Seal */}
                      <div className="text-right space-y-1">
                        <div className="inline-block text-center pr-2">
                          <div className="w-24 h-12 border border-dashed border-slate-300 rounded flex items-center justify-center mx-auto mb-1 text-[9px] text-slate-400 select-none">
                            [Digitally Sealed]
                          </div>
                          <div className="w-36 border-t-2 border-slate-900 pt-1">
                            <p className="font-bold text-xs text-slate-900 uppercase">
                              Authorized Signatory
                            </p>
                            <p className="text-[10px] text-slate-600 font-medium">
                              Office of Academic Director
                            </p>
                            <p className="text-[9px] text-slate-500">
                              {workspaceName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* A4 Section 6: Official Verification Footer */}
                    <div className="pt-2 border-t border-slate-200 text-center font-sans text-[9px] text-slate-400 flex items-center justify-between">
                      <span>Official Circular Document • ABCD Edu Hub Platform</span>
                      <span>Page 1 of 1</span>
                      <span>Security Ref: {activeNotice.id.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Share Link */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8 text-xs font-medium rounded-lg gap-1.5 border-slate-200 dark:border-slate-700"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{copiedLink ? "Copied" : "Share"}</span>
                  </Button>

                  {/* Print A4 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(activeNotice)}
                    className="h-8 text-xs font-medium rounded-lg gap-1.5 border-slate-200 dark:border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print A4</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download PDF Button */}
                  <Button
                    type="button"
                    disabled={isGeneratingPdf}
                    onClick={() => handleDownloadPdf(activeNotice)}
                    className="h-8 px-3.5 text-xs font-semibold rounded-lg shadow-sm gap-1.5 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download A4 PDF</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveNotice(null)}
                    className="h-8 px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Styles for pristine A4 sheet output */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide non-print portal elements */
          header, nav, aside, footer, button, .no-print {
            display: none !important;
          }
          /* Ensure A4 Sheet is visible and takes full print area */
          [id^="a4-sheet-"] {
            box-shadow: none !important;
            border: 2px solid black !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 20px !important;
            page-break-inside: avoid;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
