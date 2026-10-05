"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { normalizeCategory, NOTICE_CATEGORIES } from "@/lib/notice-categories";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Edit3,
  Clock,
  Share2,
  MessageSquare,
  Trash2,
  Calendar,
  Building2,
  Hash,
  UserCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Layers,
  Send,
  Sliders,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
  Users,
  ShieldAlert,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { getBrandShortName } from "@/lib/branding";
import { getAllNoticepadTemplates } from "@/app/actions/document-templates";
import {
  broadcastSuperAdminNotice,
  saveCenterNotice,
  deleteBroadcastNotice,
  deleteCenterNotice,
  updateNoticeSchedule,
} from "@/app/actions/events-notices";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface NoticeItem {
  id?: string;
  title: string;
  message?: string;
  date?: string | Date;
  createdAt?: string | Date;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  type?: string;
  target?: string;
  targetAudience?: string | null;
  audience?: string;
  isHeadOffice?: boolean | null;
  link?: string;
  refNo?: string | null;
  category?: string | null;
  scheduledFor?: string | Date | null;
  status?: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  templateId?: string | null;
  publishedBy?: string | null;
  isActive?: boolean;
  workspace?: {
    id?: string;
    name?: string;
    centerCode?: string | null;
    subdomain?: string;
    signatureUrl?: string | null;
    ownerSignatureUrl?: string | null;
    ownerName?: string | null;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}


/** @deprecated Use normalizeCategory from @/lib/notice-categories directly */
export const normalizeNoticeCategory = normalizeCategory;
export { NOTICE_CATEGORIES };

interface NoticepadDocumentViewerProps {
  notices: NoticeItem[];
  selectedNoticeId?: string | null;
  isSuperAdmin?: boolean;
  workspace?: any | null;
  superAdminSignature?: string | null;
  franchiseSignature?: string | null;
  workspacesList?: any[];
  onNoticeSelect?: (notice: NoticeItem) => void;
  onRefresh?: () => void;
  showStatCards?: boolean;
  className?: string;
}

export function NoticepadDocumentViewer({
  notices = [],
  selectedNoticeId = null,
  isSuperAdmin = false,
  workspace = null,
  superAdminSignature = null,
  franchiseSignature = null,
  workspacesList = [],
  onNoticeSelect,
  onRefresh,
  className,
  showStatCards = false,
}: NoticepadDocumentViewerProps) {
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "SCHEDULED" | "DRAFT">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Template Engine State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Active Notice for Preview / Direct PDF Generation
  const [activePreviewNotice, setActivePreviewNotice] = useState<NoticeItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);

  // Notice Creation & Editing Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Form Fields
  const [formRefNo, setFormRefNo] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAudience, setFormAudience] = useState<string>(
    isSuperAdmin ? "ALL_FRANCHISES" : "STUDENTS"
  );
  const [formTargetWorkspaceId, setFormTargetWorkspaceId] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("General");
  const [formPriority, setFormPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [formLink, setFormLink] = useState("");
  const [formScheduleMode, setFormScheduleMode] = useState<"NOW" | "SCHEDULE">("NOW");
  const [formScheduledDate, setFormScheduledDate] = useState("");
  const [formTemplateId, setFormTemplateId] = useState<string>("");

  // Schedule Quick Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleNoticeItem, setScheduleNoticeItem] = useState<NoticeItem | null>(null);
  const [quickScheduleDate, setQuickScheduleDate] = useState("");
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  // Delete Confirmation State
  const [deleteNoticeItem, setDeleteNoticeItem] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Renderer Refs
  const previewDocRendererRef = useRef<DocumentRendererRef>(null);
  const directPdfRendererRef = useRef<DocumentRendererRef>(null);
  const [pdfRenderData, setPdfRenderData] = useState<any | null>(null);

  // Fetch all active NOTICE_PAD templates from DB
  useEffect(() => {
    let isMounted = true;
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const tpls = await getAllNoticepadTemplates(workspace?.id || null);
        if (isMounted) {
          setTemplates(tpls);
          if (tpls && tpls.length > 0) {
            setSelectedTemplate(tpls[0]);
            setFormTemplateId(tpls[0].id);
          }
        }
      } catch (e) {
        console.error("Error loading noticepad templates:", e);
      } finally {
        if (isMounted) setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
    return () => {
      isMounted = false;
    };
  }, [workspace?.id]);

  // Generate Reference Number
  const generateNewRefNo = () => {
    const year = new Date().getFullYear();
    const code = workspace?.centerCode || (isSuperAdmin ? "HO" : "CTR");
    const rand = Math.floor(100 + Math.random() * 900);
    const brand = isSuperAdmin ? getBrandShortName(workspace?.name, null) : (workspace?.centerCode || "CTR");
    return `${brand}/${code}/CIR/${year}/${rand}`;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingNoticeId(null);
    setFormRefNo(generateNewRefNo());
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("General");
    setFormAudience(isSuperAdmin ? "ALL_FRANCHISES" : "STUDENTS");
    setFormTargetWorkspaceId("");
    setFormPriority("NORMAL");
    setFormLink("");
    setFormScheduleMode("NOW");
    setFormScheduledDate("");
    if (selectedTemplate) setFormTemplateId(selectedTemplate.id);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (notice: NoticeItem) => {
    setEditingNoticeId(notice.id || null);
    setFormRefNo(notice.refNo || generateNewRefNo());
    const rawDate = notice.date || notice.createdAt;
    setFormDate(rawDate ? new Date(rawDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    setFormTitle(notice.title || "");
    setFormDescription(notice.message || "");
    setFormCategory(normalizeNoticeCategory(notice.category));
    const initialAudience = notice.target || notice.targetAudience || notice.audience;
    const resolvedAudience = isSuperAdmin
      ? (initialAudience === "STUDENTS" ? "ALL_STUDENTS" : initialAudience || "ALL_FRANCHISES")
      : (initialAudience || "STUDENTS");
    setFormAudience(resolvedAudience);
    setFormTargetWorkspaceId(notice.workspace?.id || "");
    setFormPriority(notice.priority || "NORMAL");
    setFormLink(notice.link || "");
    
    if (notice.status === "SCHEDULED" || notice.scheduledFor) {
      setFormScheduleMode("SCHEDULE");
      if (notice.scheduledFor) {
        const d = new Date(notice.scheduledFor);
        setFormScheduledDate(d.toISOString().slice(0, 16));
      } else {
        setFormScheduledDate("");
      }
    } else {
      setFormScheduleMode("NOW");
      setFormScheduledDate("");
    }

    if (notice.templateId) {
      setFormTemplateId(notice.templateId);
    } else if (selectedTemplate) {
      setFormTemplateId(selectedTemplate.id);
    }
    setIsFormModalOpen(true);
  };

  // Open Quick Schedule Modal
  const handleOpenScheduleModal = (notice: NoticeItem) => {
    setScheduleNoticeItem(notice);
    if (notice.scheduledFor) {
      const d = new Date(notice.scheduledFor);
      setQuickScheduleDate(d.toISOString().slice(0, 16));
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setQuickScheduleDate(tomorrow.toISOString().slice(0, 16));
    }
    setIsScheduleModalOpen(true);
  };

  // Submit Notice Form
  const handleSubmitNotice = async (statusOverride?: "PUBLISHED" | "DRAFT") => {
    if (!formTitle.trim()) {
      toast.error("Please enter a notice title");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Please enter the main circular content in the text area");
      return;
    }

    try {
      setIsSubmitting(true);
      const isScheduled = formScheduleMode === "SCHEDULE" && formScheduledDate;
      const finalStatus = statusOverride || (isScheduled ? "SCHEDULED" : "PUBLISHED");
      const scheduledForVal = isScheduled ? new Date(formScheduledDate).toISOString() : null;

      if (isSuperAdmin) {
        const res = await broadcastSuperAdminNotice({
          id: editingNoticeId || undefined,
          title: formTitle.trim(),
          message: formDescription.trim(),
          target: formAudience as any,
          workspaceId: formAudience === "SPECIFIC_FRANCHISE" ? formTargetWorkspaceId : null,
          priority: formPriority,
          category: normalizeNoticeCategory(formCategory),
          link: formLink.trim(),
          refNo: formRefNo.trim(),
          scheduledFor: scheduledForVal,
          status: finalStatus,
          templateId: formTemplateId || null,
          date: formDate,
        });

        if (res.success) {
          toast.success(
            editingNoticeId
              ? "Official Notice updated successfully"
              : isScheduled
              ? "Notice scheduled for announcement"
              : formAudience === "ALL_STUDENTS"
              ? "Official Notice broadcast towards all students nationwide"
              : formAudience === "PUBLIC"
              ? "Official Notice published on public board"
              : "Official Notice published towards franchises"
          );
          setIsFormModalOpen(false);
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.error || "Failed to save notice");
        }
      } else {
        // Franchise Admin
        const res = await saveCenterNotice(workspace?.id || null, {
          id: editingNoticeId || undefined,
          title: formTitle.trim(),
          message: formDescription.trim(),
          date: formDate,
          link: formLink.trim(),
          audience: formAudience as any,
          priority: formPriority,
          category: normalizeNoticeCategory(formCategory),
          refNo: formRefNo.trim(),
          scheduledFor: scheduledForVal,
          status: finalStatus,
          templateId: formTemplateId || null,
          publishedBy: workspace?.name || "Center Director",
        });

        if (res.success) {
          toast.success(
            editingNoticeId
              ? "Notice updated successfully"
              : isScheduled
              ? "Notice scheduled for announcement"
              : formAudience === "STAFF"
              ? "Internal Notice published towards faculty & staff"
              : formAudience === "PUBLIC"
              ? "Public Notice published on center board"
              : "Official Notice published towards students"
          );
          setIsFormModalOpen(false);
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.error || "Failed to save notice");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Schedule Submit
  const handleSaveQuickSchedule = async () => {
    if (!scheduleNoticeItem) return;
    try {
      setIsUpdatingSchedule(true);
      const isBroadcast = isSuperAdmin || !scheduleNoticeItem.workspace;
      const res = await updateNoticeSchedule({
        id: scheduleNoticeItem.id || "",
        scheduledFor: quickScheduleDate ? new Date(quickScheduleDate).toISOString() : null,
        status: quickScheduleDate ? "SCHEDULED" : "PUBLISHED",
        workspaceId: workspace?.id || scheduleNoticeItem.workspace?.id || null,
        isBroadcast,
      });

      if (res.success) {
        toast.success(
          quickScheduleDate ? "Notice scheduled successfully" : "Notice published immediately"
        );
        setIsScheduleModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.error || "Failed to update notice schedule");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update schedule");
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  // Delete Notice
  const handleConfirmDelete = async () => {
    if (!deleteNoticeItem?.id) return;
    try {
      setIsDeleting(true);
      if (isSuperAdmin) {
        const res = await deleteBroadcastNotice(deleteNoticeItem.id);
        if (res.success) {
          toast.success("Notice deleted successfully");
          setDeleteNoticeItem(null);
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.error || "Failed to delete notice");
        }
      } else {
        const res = await deleteCenterNotice(deleteNoticeItem.id, workspace?.id || null);
        if (res.success) {
          toast.success("Notice deleted successfully");
          setDeleteNoticeItem(null);
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.error || "Failed to delete notice");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete notice");
    } finally {
      setIsDeleting(false);
    }
  };

  // Signatures Resolution
  // Per requirement: Super Admin notices do NOT inject a dynamic signature image.
  // Franchise notices dynamically inject the center franchise signature.
  const activeFranchiseSign =
    franchiseSignature || workspace?.signatureUrl || workspace?.ownerSignatureUrl || "";

  // Build mapped doc data for any notice
  const getMappedNoticeData = (notice: NoticeItem) => {
    const rawDate = notice.date || notice.createdAt || new Date();
    const formattedDate = new Date(rawDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const isUrgent = notice.priority === "URGENT";
    const brand = isSuperAdmin ? getBrandShortName(workspace?.name, null) : (workspace?.centerCode || "CTR");
    const refNo = notice.refNo || `${brand}/${workspace?.centerCode || (isSuperAdmin ? "HO" : "CTR")}/CIR/${new Date().getFullYear()}/${notice.id ? notice.id.slice(-4).toUpperCase() : "042"}`;

    const isNoticeFromSuperAdmin = isSuperAdmin || !notice.workspace || notice.publishedBy === "Head Office" || notice.isHeadOffice;

    let recipient = "To All Concerned Candidates & Administration";
    if (isNoticeFromSuperAdmin) {
      if (notice.target === "SPECIFIC_FRANCHISE") {
        recipient = "To Authorized Center Administration & Directors";
      } else if (notice.target === "ALL_STUDENTS" || notice.targetAudience === "STUDENTS") {
        recipient = "To All Enrolled Students & Examination Candidates (Nationwide)";
      } else {
        recipient = "To All Authorized Study Center Directors & Coordinators";
      }
    } else {
      recipient = notice.audience === "STAFF"
        ? "To All Faculty Members & Center Staff"
        : "To All Enrolled Students & Examination Candidates";
    }

    // Dynamic signature is applied ONLY to franchise notices
    const dynamicFranchiseSign = !isNoticeFromSuperAdmin
      ? (activeFranchiseSign || notice.workspace?.signatureUrl || notice.workspace?.ownerSignatureUrl || "")
      : "";

    return {
      ...notice,
      noticeTitle: notice.title || "",
      noticeBody: notice.message || "",
      noticeDate: formattedDate,
      noticeRefNo: refNo,
      noticeRecipient: recipient,
      issuerName: isNoticeFromSuperAdmin
        ? "Central Head Office Directorate"
        : workspace?.name || notice.workspace?.name || "Authorized Study Center",
      issuerRole: isNoticeFromSuperAdmin
        ? "Controller of Examinations & Central Secretary"
        : workspace?.ownerName ? `Director (${workspace.name})` : "Center Director",
      issuerSign: dynamicFranchiseSign,
      superAdminSign: "",
      franchiseAdminSign: dynamicFranchiseSign,
      centerHeadSign: dynamicFranchiseSign,
      franchiseOwnerSign: dynamicFranchiseSign,
      officialSeal: "/logo.png",
      workspace: workspace || notice.workspace || null,
      isSuperAdmin: isNoticeFromSuperAdmin,
    };
  };

  // Direct High-Resolution PDF Download for a specific card
  const handleDownloadCardPDF = async (notice: NoticeItem) => {
    try {
      setPdfGeneratingId(notice.id || "current");
      const mapped = getMappedNoticeData(notice);
      setPdfRenderData(mapped);

      // Brief delay to ensure DocumentRenderer renders canvas
      await new Promise((r) => setTimeout(r, 200));

      if (directPdfRendererRef.current) {
        await directPdfRendererRef.current.downloadPDF();
      } else {
        toast.error("Document template renderer not available");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGeneratingId(null);
    }
  };

  // Open Preview Modal
  const handleOpenPreviewModal = (notice: NoticeItem) => {
    setActivePreviewNotice(notice);
    if (onNoticeSelect) onNoticeSelect(notice);
    setIsPreviewModalOpen(true);
  };

  // Share Handlers
  const handleShareNotice = async (notice: NoticeItem) => {
    const title = notice.title || "Institutional Notice";
    const text = `${title} - Official Notice from ${
      isSuperAdmin ? "Central Directorate" : workspace?.name || "Study Center"
    }`;
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast.success("Notice shared successfully!");
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Web share error:", err);
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${title}\n${url}`);
      toast.success("Notice link copied to clipboard");
    }
  };

  const handleWhatsAppShare = (notice: NoticeItem) => {
    const title = notice.title || "Institutional Notice";
    const url = typeof window !== "undefined" ? window.location.href : "";
    const msg = encodeURIComponent(
      `*${title}*\nNotice from ${
        isSuperAdmin ? "Central Directorate" : workspace?.name || "Study Center"
      }:\n${url}`
    );
    if (typeof window !== "undefined") {
      window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
    }
  };

  // Deduplicate Notices to avoid any accidental duplicate entries
  const uniqueNotices = useMemo(() => {
    const seen = new Set<string>();
    return notices.filter((n) => {
      const key = n.refNo?.trim()
        ? `ref:${n.refNo.trim().toUpperCase()}`
        : n.id?.trim()
        ? `id:${n.id.trim()}`
        : `title:${(n.title || "").trim().toLowerCase()}_${n.date || n.createdAt || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [notices]);

  // Filter Notices List
  const filteredNotices = useMemo(() => {
    return uniqueNotices.filter((n) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesMsg = n.message?.toLowerCase().includes(q);
        const matchesRef = n.refNo?.toLowerCase().includes(q);
        const matchesWs =
          n.workspace?.name?.toLowerCase().includes(q) ||
          n.workspace?.centerCode?.toLowerCase().includes(q) ||
          n.workspace?.subdomain?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesRef && !matchesWs) return false;
      }

      // Status
      if (statusFilter !== "ALL") {
        const itemStatus = n.status || (n.scheduledFor && new Date(n.scheduledFor) > new Date() ? "SCHEDULED" : "PUBLISHED");
        if (itemStatus !== statusFilter) return false;
      }

      // Priority
      if (priorityFilter !== "ALL") {
        if ((n.priority || "NORMAL") !== priorityFilter) return false;
      }

      // Category
      if (categoryFilter !== "ALL") {
        const itemCat = normalizeNoticeCategory(n.category);
        const filterCat = normalizeNoticeCategory(categoryFilter);
        if (itemCat !== filterCat) return false;
      }

      return true;
    });
  }, [uniqueNotices, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = uniqueNotices.length;
    const scheduled = uniqueNotices.filter(
      (n) => n.status === "SCHEDULED" || (n.scheduledFor && new Date(n.scheduledFor) > new Date())
    ).length;
    const urgent = uniqueNotices.filter((n) => n.priority === "URGENT").length;
    const published = total - scheduled;
    return { total, published, scheduled, urgent };
  }, [uniqueNotices]);

  // Pagination State (Rule 7.6)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE));
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotices.slice(start, start + PAGE_SIZE);
  }, [filteredNotices, currentPage, PAGE_SIZE]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

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

  return (
    <div className={cn("space-y-4 sm:space-y-5 pb-8 w-full mx-auto", className)}>
      {/* 1. TOP METRIC / STAT CARDS GRID */}
      {showStatCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Total Circulars
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stats.total}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Published & Live
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {stats.published}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Scheduled Circulars
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {stats.scheduled}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Urgent Directives
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                  {stats.urgent}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

        {/* 2. MAIN CONTENT CARD & TOOLBAR */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              <div className="relative w-full md:max-w-[280px] group">
                <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search notices by title, ref no, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val: any) => setStatusFilter(val)}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Status</SelectItem>
                  <SelectItem value="PUBLISHED" className="text-xs">Published</SelectItem>
                  <SelectItem value="SCHEDULED" className="text-xs">Scheduled</SelectItem>
                  <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={priorityFilter}
                onValueChange={(val: any) => setPriorityFilter(val)}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Priority</SelectItem>
                  <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
                  <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                  <SelectItem value="NORMAL" className="text-xs">Normal</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(val: any) => setCategoryFilter(val)}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[125px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Categories</SelectItem>
                  <SelectItem value="Academic" className="text-xs">Academic</SelectItem>
                  <SelectItem value="Exams" className="text-xs">Exams</SelectItem>
                  <SelectItem value="Holidays" className="text-xs">Holidays</SelectItem>
                  <SelectItem value="General" className="text-xs">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Top Primary Actions */}
            <div className="flex items-center gap-2 shrink-0 justify-end">
              {templates.length > 1 && (
                <div className="flex items-center gap-1.5 shrink-0 hidden lg:flex">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Template:
                  </span>
                  <Select
                    value={selectedTemplate?.id || ""}
                    onValueChange={(id: any) => {
                      const found = templates.find((t) => t.id === id);
                      if (found) setSelectedTemplate(found);
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 w-[150px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{selectedTemplate?.name || "Template"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((tpl, idx) => (
                        <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                          {tpl.name || `Design ${idx + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isSuperAdmin && (
                <Link
                  href="/super-admin/documents"
                  className="inline-flex items-center justify-center h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1.5 transition-colors"
                  title="Customize Noticepad layout in Document Designer"
                >
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Designer</span>
                </Link>
              )}

              <Button
                onClick={handleOpenCreateModal}
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create Official Notice</span>
              </Button>
            </div>
          </CardHeader>

          {/* 3. NOTICE HISTORY TABLE (Rule 7.5 & Mobile Responsive) */}
          <TooltipProvider delay={150}>
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-2 px-3 sm:px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none items-center">
              <div className="col-span-1 text-center font-mono">SL</div>
              <div className="col-span-5">Notice Reference & Title</div>
              <div className="col-span-2">Published By</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-2 text-right pr-2">Actions</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {paginatedNotices.length > 0 ? (
                paginatedNotices.map((notice, idx) => {
                  const isScheduled =
                    notice.status === "SCHEDULED" ||
                    (notice.scheduledFor && new Date(notice.scheduledFor) > new Date());
                  const rawDate = notice.date || notice.createdAt;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";
                  const formattedTime = rawDate
                    ? new Date(rawDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "";

                  const statusColor =
                    notice.priority === "URGENT"
                      ? "border-l-red-500"
                      : notice.priority === "HIGH"
                      ? "border-l-amber-500"
                      : isScheduled
                      ? "border-l-violet-500"
                      : "border-l-primary";

                  const isDownloadingThis = pdfGeneratingId === notice.id;

                  // Resolve publisher name & designation
                  const isFromHO =
                    notice.target === "ALL_FRANCHISES" ||
                    notice.target === "ALL_STUDENTS" ||
                    notice.targetAudience === "STUDENTS" ||
                    (!notice.workspace?.name && isSuperAdmin) ||
                    notice.publishedBy === "Head Office" ||
                    notice.isHeadOffice;
                  const publisherName = isFromHO
                    ? "Head Office Directorate"
                    : (notice.workspace?.name || workspace?.name || notice.publishedBy || "Center Directorate");
                  const publisherDesignation = isFromHO
                    ? "Central Secretary / Super Admin"
                    : "Center Director & Head";

                  // Resolve audience badge text
                  const targetLabel =
                    notice.target === "ALL_FRANCHISES" || notice.targetAudience === "ALL_FRANCHISES"
                      ? "To All Franchises"
                      : notice.target === "SPECIFIC_FRANCHISE" || notice.targetAudience === "SPECIFIC_FRANCHISE"
                      ? `To ${notice.workspace?.name || "Center"}`
                      : notice.target === "ALL_STUDENTS" || notice.targetAudience === "STUDENTS" || notice.audience === "STUDENTS"
                      ? "To All Students"
                      : notice.audience === "STAFF" || notice.targetAudience === "STAFF"
                      ? "To Staff"
                      : "Public Circular";

                  return (
                    <div
                      key={notice.id || `notice-${idx}`}
                      className={cn(
                        "flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-2 group border-l-[3px]",
                        statusColor
                      )}
                    >
                      {/* Column 0: SL Number (lg:col-span-1) */}
                      <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                        <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          #{((currentPage - 1) * PAGE_SIZE) + idx + 1}
                        </span>
                      </div>

                      {/* Column 1: Notice Reference & Title (lg:col-span-5) */}
                      <div className="lg:col-span-5 min-w-0 w-full space-y-1">
                        {/* Top: Mobile SL, Ref ID, Category, Priority, Audience, (Scheduled) */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="lg:hidden font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            #{((currentPage - 1) * PAGE_SIZE) + idx + 1}
                          </span>

                          {notice.refNo && (
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {notice.refNo}
                            </span>
                          )}

                          {notice.category && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border",
                                normalizeNoticeCategory(notice.category) === "Academic"
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                                  : normalizeNoticeCategory(notice.category) === "Exams"
                                  ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40"
                                  : normalizeNoticeCategory(notice.category) === "Holidays"
                                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                                  : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40"
                              )}
                            >
                              {normalizeNoticeCategory(notice.category)}
                            </Badge>
                          )}

                          {notice.priority && (
                            <Badge
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                                notice.priority === "URGENT"
                                  ? "bg-red-500 text-white"
                                  : notice.priority === "HIGH"
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              )}
                            >
                              {notice.priority}
                            </Badge>
                          )}

                          <Badge
                            variant="outline"
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40"
                          >
                            {targetLabel}
                          </Badge>

                          {isScheduled && (
                            <Badge className="bg-violet-500/10 text-violet-600 border-none text-[9px] font-bold uppercase px-1.5 py-0.5 rounded gap-1 flex items-center">
                              <Clock className="h-2.5 w-2.5" />
                              Scheduled
                            </Badge>
                          )}
                        </div>

                        {/* Bottom: Title with Tooltip & dot-dot truncate (Strictly NO description) */}
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => handleOpenPreviewModal(notice)}
                            className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate block max-w-full cursor-pointer hover:text-primary transition-colors select-none text-left p-0 border-none bg-transparent outline-none"
                          >
                            {notice.title}
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md text-xs font-medium">
                            {notice.title}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Responsive Middle Wrapper (columns 2 & 3 side-by-side on mobile, transparent on lg) */}
                      <div className="flex items-center justify-between w-full lg:contents pt-1 lg:pt-0">
                        {/* Column 2: Published By (lg:col-span-2) */}
                        <div className="lg:col-span-2 min-w-0 pr-1">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-slate-900 dark:text-white truncate block">
                              {publisherName}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 truncate block">
                              {publisherDesignation}
                            </span>
                          </div>
                        </div>

                        {/* Column 3: Date & Time (lg:col-span-2) */}
                        <div className="lg:col-span-2 min-w-0 text-right lg:text-left">
                          <div className="flex flex-col items-end lg:items-start">
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                              {formattedDate}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                              <Clock className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              {formattedTime || (isScheduled && notice.scheduledFor ? "Scheduled" : "Published")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 4: Action Buttons (lg:col-span-2 text-right) */}
                      <div className="lg:col-span-2 flex items-center justify-end gap-1 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                        {/* 1. Download PDF */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadCardPDF(notice)}
                          disabled={isDownloadingThis}
                          title="Download Official A4 PDF"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors p-0"
                        >
                          {isDownloadingThis ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </Button>

                        {/* 2. Preview A4 Noticepad */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenPreviewModal(notice)}
                          title="Preview A4 Noticepad"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors p-0"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {/* 3. Edit Notice */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditModal(notice)}
                          title="Edit Notice Details"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors p-0"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>

                        {/* 4. Schedule Announcement */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenScheduleModal(notice)}
                          title="Schedule Announcement"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors p-0"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </Button>

                        {/* 5. Share */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShareNotice(notice)}
                          title="Share Notice"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors p-0"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>

                        {/* 6. WhatsApp Share */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleWhatsAppShare(notice)}
                          title="Share on WhatsApp"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors p-0"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>

                        {/* 7. Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteNoticeItem(notice)}
                          title="Delete Notice"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      No Circulars or Notices Found
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                        ? "No notices match your current filters. Try resetting the search or filter options."
                        : "Create your first official circular. It will automatically be formatted using the official A4 document template."}
                    </p>
                  </div>
                  <Button
                    onClick={handleOpenCreateModal}
                    size="sm"
                    className="text-xs font-semibold gap-1.5 rounded-lg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Notice</span>
                  </Button>
                </div>
              )}
            </div>
          </TooltipProvider>

          {/* 4. STANDARDIZED PAGINATION FOOTER (Rule 7.6) */}
          {filteredNotices.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 gap-2 sm:gap-0">
              <div className="text-xs font-medium text-slate-500">
                Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredNotices.length)} to{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredNotices.length)} of {filteredNotices.length} notices
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm text-xs font-medium"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Prev
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((num, i) =>
                      num === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs select-none">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`page-${num}`}
                          variant={currentPage === num ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(num as number)}
                          className={cn(
                            "h-7 w-7 rounded-md font-semibold text-xs p-0",
                            currentPage === num
                              ? "bg-primary text-white"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          {num}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm text-xs font-medium"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ======================================================== */}
        {/* 4. CREATE / EDIT OFFICIAL NOTICE POPUP MODAL */}
        {/* ======================================================== */}
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
          <DialogContent className="max-w-2xl rounded-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>{editingNoticeId ? "Edit Official Notice" : "Create New Official Notice"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Enter circular details and body text. The system automatically binds institutional signatures and formats into the official A4 template.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              {/* Row 1: Memo / Ref No & Notice Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Memo / Reference Number
                    </Label>
                    <button
                      type="button"
                      onClick={() => setFormRefNo(generateNewRefNo())}
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      Regenerate
                    </button>
                  </div>
                  <Input
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                    placeholder="ABCD/HO/CIR/2026/042"
                    className="h-8 sm:h-9 text-xs rounded-lg font-mono bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Notice Date
                  </Label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              {/* Row 2: Notice Title */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Notice Title / Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Annual Center Verification & Examination Compliance Directive"
                  className="h-8 sm:h-9 text-xs rounded-lg font-semibold bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              {/* Row 3: Main Circular Content (Text Area) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Main Circular Body Content <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] text-slate-400">
                    Will render inside official letterhead
                  </span>
                </div>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Write the full institutional directive, instructions, and guidelines here. Supports paragraphs, numbered lists, and directives..."
                  rows={6}
                  className="text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 leading-relaxed font-sans"
                />
              </div>

              {/* Row 4: Target Audience, Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Target Audience
                  </Label>
                  {isSuperAdmin ? (
                    <Select value={formAudience} onValueChange={(val: any) => setFormAudience(val)}>
                      <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <SelectValue placeholder="Select Audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL_FRANCHISES" className="text-xs">
                          All Affiliated Franchise Centers
                        </SelectItem>
                        <SelectItem value="SPECIFIC_FRANCHISE" className="text-xs">
                          Specific Franchise Center
                        </SelectItem>
                        <SelectItem value="ALL_STUDENTS" className="text-xs">
                          All Enrolled Students (Nationwide)
                        </SelectItem>
                        <SelectItem value="PUBLIC" className="text-xs">
                          Public Notice Board & Ticker
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={formAudience} onValueChange={(val: any) => setFormAudience(val)}>
                      <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <SelectValue placeholder="Select Audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENTS" className="text-xs">
                          All Enrolled Students
                        </SelectItem>
                        <SelectItem value="STAFF" className="text-xs">
                          Faculty & Center Staff
                        </SelectItem>
                        <SelectItem value="PUBLIC" className="text-xs">
                          Public Center Notice Board
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={normalizeNoticeCategory(formCategory)}
                    onValueChange={(val: any) => setFormCategory(normalizeNoticeCategory(val))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic" className="text-xs">
                        Academic (Classes & Syllabus)
                      </SelectItem>
                      <SelectItem value="Exams" className="text-xs">
                        Exam (Admit Card & Tests)
                      </SelectItem>
                      <SelectItem value="Holidays" className="text-xs">
                        Holiday (Campus Closures)
                      </SelectItem>
                      <SelectItem value="General" className="text-xs">
                        General Notice
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Priority Level
                  </Label>
                  <Select
                    value={formPriority}
                    onValueChange={(val: any) => setFormPriority(val)}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL" className="text-xs">
                        Normal Priority
                      </SelectItem>
                      <SelectItem value="HIGH" className="text-xs">
                        High Priority
                      </SelectItem>
                      <SelectItem value="URGENT" className="text-xs">
                        Urgent Directive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Specific Franchise selector for Super Admin */}
              {isSuperAdmin && formAudience === "SPECIFIC_FRANCHISE" && workspacesList.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Study Center
                  </Label>
                  <Select
                    value={formTargetWorkspaceId}
                    onValueChange={(val: any) => setFormTargetWorkspaceId(val)}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <SelectValue placeholder="Choose Center" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {workspacesList.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id} className="text-xs">
                          {ws.name} ({ws.centerCode || ws.subdomain || "Center"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Row 5: Announcement Scheduling Mode */}
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Announcement Scheduling
                  </Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormScheduleMode("NOW")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                        formScheduleMode === "NOW"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Publish Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormScheduleMode("SCHEDULE")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                        formScheduleMode === "SCHEDULE"
                          ? "bg-white dark:bg-slate-900 text-primary font-bold shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Schedule for Later
                    </button>
                  </div>
                </div>

                {formScheduleMode === "SCHEDULE" && (
                  <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500">Scheduled Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={formScheduledDate}
                        onChange={(e) => setFormScheduledDate(e.target.value)}
                        className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 mt-1"
                      />
                    </div>
                    <div className="flex items-center text-[10px] text-slate-500 pt-4">
                      The circular will remain queued until the scheduled time arrives.
                    </div>
                  </div>
                )}
              </div>

              {/* Row 6: Template Selection (if multiple designs exist) */}
              {templates.length > 1 && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Template Design Binding
                  </Label>
                  <Select value={formTemplateId} onValueChange={(val: any) => setFormTemplateId(val)}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <SelectValue placeholder="Select Document Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((tpl, idx) => (
                        <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                          {tpl.name || `Design ${idx + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Row 7: Reference Link (Optional) */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Attachment / Action Link (Optional)
                </Label>
                <Input
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://... or /student/exams"
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between sm:justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormModalOpen(false)}
                className="h-8 sm:h-9 text-xs rounded-lg"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmitNotice("DRAFT")}
                  disabled={isSubmitting}
                  className="h-8 sm:h-9 text-xs rounded-lg"
                >
                  Save Draft
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSubmitNotice()}
                  disabled={isSubmitting}
                  className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-primary text-primary-foreground gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : formScheduleMode === "SCHEDULE" ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {formScheduleMode === "SCHEDULE"
                      ? "Schedule Notice"
                      : editingNoticeId
                      ? "Update Notice"
                      : "Publish Notice"}
                  </span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* 5. PREVIEW OFFICIAL A4 NOTICEPAD MODAL */}
        {/* ======================================================== */}
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] rounded-2xl p-0 flex flex-col overflow-hidden">
            <DialogHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>A4 Noticepad Preview: {activePreviewNotice?.title}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Formatted pixel-perfect A4 official document with signatures and stamps.
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* Document Canvas Display */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex justify-center">
              {activePreviewNotice && (
                <DocumentRenderer
                  ref={previewDocRendererRef}
                  type="NOTICE_PAD"
                  template={
                    templates.find((t) => t.id === activePreviewNotice.templateId) || selectedTemplate
                  }
                  student={getMappedNoticeData(activePreviewNotice)}
                  workspaceId={workspace?.id || null}
                  inline={true}
                />
              )}
            </div>

            <DialogFooter className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-row items-center justify-between sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                {activePreviewNotice && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareNotice(activePreviewNotice)}
                      className="h-8 text-xs font-medium rounded-lg gap-1"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWhatsAppShare(activePreviewNotice)}
                      className="h-8 text-xs font-medium rounded-lg gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  Close
                </Button>

                <Button
                  size="sm"
                  onClick={() => previewDocRendererRef.current?.downloadPDF()}
                  className="h-8 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 gap-1.5 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* 6. QUICK SCHEDULE MODAL */}
        {/* ======================================================== */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5">
            <DialogHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-500" />
                <span>Schedule Announcement</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Set the date and time when this circular should become active and live.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Circular Subject:
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {scheduleNoticeItem?.title}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scheduled Publish Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  value={quickScheduleDate}
                  onChange={(e) => setQuickScheduleDate(e.target.value)}
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between sm:justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickScheduleDate("")}
                className="h-8 text-xs text-emerald-600 hover:bg-emerald-50"
              >
                Publish Immediately
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveQuickSchedule}
                  disabled={isUpdatingSchedule}
                  className="h-8 text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
                >
                  {isUpdatingSchedule ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span>Save Schedule</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* 7. DELETE CONFIRMATION DIALOG */}
        {/* ======================================================== */}
        <Dialog open={!!deleteNoticeItem} onOpenChange={(open) => !open && setDeleteNoticeItem(null)}>
          <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                <span>Delete Circular Notice?</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Are you sure you want to permanently delete this notice? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {deleteNoticeItem && (
              <div className="p-3 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 my-2">
                <span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">
                  Notice to Delete:
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {deleteNoticeItem.title}
                </p>
                {deleteNoticeItem.refNo && (
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Ref: {deleteNoticeItem.refNo}
                  </span>
                )}
              </div>
            )}

            <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteNoticeItem(null)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-8 text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Delete Notice</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* 8. HIDDEN DIRECT PDF RENDERER (Off-screen rasterization) */}
        {/* ======================================================== */}
        {pdfRenderData && (
          <div className="hidden">
            <DocumentRenderer
              ref={directPdfRendererRef}
              type="NOTICE_PAD"
              template={
                templates.find((t) => t.id === pdfRenderData.templateId) || selectedTemplate
              }
              student={pdfRenderData}
              workspaceId={workspace?.id || null}
              inline={false}
            />
          </div>
        )}
      </div>
  );
}
