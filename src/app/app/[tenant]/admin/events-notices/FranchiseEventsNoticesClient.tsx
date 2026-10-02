"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Bell,
  Plus,
  Search,
  Trash2,
  Edit2,
  Globe,
  Building2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Sparkles,
  Send,
  Eye,
  RefreshCw,
  Users,
  UserCheck,
  GraduationCap,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  Inbox,
  MessageSquare,
  CheckCircle2 as CheckCircle2Icon,
  Wrench,
  Coins,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EventEditorDialog } from "@/components/events/EventEditorDialog";
import { NoticepadDocumentViewer, normalizeNoticeCategory } from "@/components/documents/NoticepadDocumentViewer";
import { NOTICE_CATEGORIES } from "@/lib/notice-categories";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  getEventsAndNotices,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  toggleEventStatus,
  saveCenterNotice,
  deleteCenterNotice,
  submitFranchiseRequest,
  getFranchiseRequests,
} from "@/app/actions/events-notices";
import type { NoticeItem } from "@/types/events-notices";

interface FranchiseEventsNoticesClientProps {
  workspaceId: string;
  workspaceName: string;
  workspaceSubdomain: string;
  workspace?: any;
  initialHost?: string;
  isSubdomainMode?: boolean;
}

export default function FranchiseEventsNoticesClient({
  workspaceId,
  workspaceName,
  workspaceSubdomain,
  workspace = null,
  initialHost = "",
  isSubdomainMode = false,
}: FranchiseEventsNoticesClientProps) {
  const [activeTab, setActiveTab] = useState<"events" | "notices" | "circulars" | "noticepad" | "requests">("events");
  const [selectedNoticeForPad, setSelectedNoticeForPad] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [centerNotices, setCenterNotices] = useState<NoticeItem[]>([]);
  const [headOfficeNotices, setHeadOfficeNotices] = useState<any[]>([]);
  const [superAdminSignature, setSuperAdminSignature] = useState<string | null>(null);
  const [franchiseSignature, setFranchiseSignature] = useState<string | null>(workspace?.signatureUrl || null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [eventScopeFilter, setEventScopeFilter] = useState<"ALL" | "CENTER" | "HEAD_OFFICE">("ALL");
  const [noticeAudienceFilter, setNoticeAudienceFilter] = useState<string>("ALL");

  // Pagination states
  const [centerNoticePage, setCenterNoticePage] = useState(1);
  const [circularPage, setCircularPage] = useState(1);
  const PAGE_SIZE = 10;

  // View Circular Modal State
  const [viewingCircular, setViewingCircular] = useState<any | null>(null);

  // Event Modal State
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  // Notice Modal State
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({
    title: "",
    message: "",
    date: new Date().toISOString().split("T")[0],
    link: "",
    audience: "ALL" as "ALL" | "PUBLIC" | "STUDENTS" | "STAFF",
    priority: "NORMAL" as "NORMAL" | "HIGH" | "URGENT",
    category: "General",
    isActive: true,
  });

  // Delete Confirm Dialog
  const [itemToDelete, setItemToDelete] = useState<{
    type: "EVENT" | "NOTICE";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Franchise → Super Admin Requests
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED">("ALL");
  const [selectedRequestForView, setSelectedRequestForView] = useState<any | null>(null);
  const [requestFormData, setRequestFormData] = useState({
    subject: "",
    message: "",
    priority: "NORMAL" as "NORMAL" | "HIGH" | "URGENT",
    category: "General" as "General" | "Technical" | "Financial" | "Operational" | "Complaint",
  });

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await getFranchiseRequests(workspaceId);
      if (res.success) setMyRequests(res.requests || []);
    } catch {}
    finally { setIsLoadingRequests(false); }
  };

  const filteredMyRequests = useMemo(() => {
    return myRequests.filter((req) => {
      const status = (req.status || (req.isRead ? "RESOLVED" : "PENDING")).toUpperCase();
      if (requestStatusFilter !== "ALL" && status !== requestStatusFilter) return false;
      if (requestSearchQuery.trim()) {
        const q = requestSearchQuery.toLowerCase();
        const matchTitle = (req.title || "").toLowerCase().includes(q);
        const matchMsg = (req.message || "").toLowerCase().includes(q);
        const matchRef = (req.refNo || "").toLowerCase().includes(q);
        const matchCat = (req.category || "").toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchRef && !matchCat) return false;
      }
      return true;
    });
  }, [myRequests, requestStatusFilter, requestSearchQuery]);

  const requestStats = useMemo(() => {
    const total = myRequests.length;
    const pending = myRequests.filter((r) => (r.status || (r.isRead ? "RESOLVED" : "PENDING")).toUpperCase() === "PENDING").length;
    const inProgress = myRequests.filter((r) => (r.status || "").toUpperCase() === "IN_PROGRESS").length;
    const resolved = myRequests.filter((r) => {
      const s = (r.status || (r.isRead ? "RESOLVED" : "PENDING")).toUpperCase();
      return s === "RESOLVED";
    }).length;
    return { total, pending, inProgress, resolved };
  }, [myRequests]);

  const handleSubmitRequest = async () => {
    if (!requestFormData.subject.trim()) { toast.error("Please enter a subject"); return; }
    if (!requestFormData.message.trim()) { toast.error("Please enter your message/request"); return; }
    setIsSubmittingRequest(true);
    try {
      const res = await submitFranchiseRequest({
        workspaceId,
        subject: requestFormData.subject,
        message: requestFormData.message,
        priority: requestFormData.priority,
        category: requestFormData.category,
      });
      if (res.success) {
        toast.success("Your request has been sent to Head Office.");
        setRequestFormData({ subject: "", message: "", priority: "NORMAL", category: "General" });
        loadRequests();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("franchise-requests-updated"));
        }
      } else {
        toast.error(res.error || "Failed to send request");
      }
    } catch { toast.error("Failed to send request"); }
    finally { setIsSubmittingRequest(false); }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getEventsAndNotices(workspaceId);
      if (res.success) {
        setEvents(res.events || []);
        setCenterNotices(res.centerNotices || []);
        setHeadOfficeNotices(res.headOfficeNotices || []);
        if (res.superAdminSignature) setSuperAdminSignature(res.superAdminSignature);
        if (res.franchiseSignature) setFranchiseSignature(res.franchiseSignature);
      } else {
        toast.error(res.error || "Failed to load events and notices");
      }
    } catch (err) {
      toast.error("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // Stat Calculations
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter((e) => new Date(e.date) >= today);
    const centerEventsCount = events.filter((e) => e.workspaceId === workspaceId).length;
    const headOfficeEventsCount = events.filter((e) => !e.workspaceId).length;
    const activeNoticesCount = centerNotices.filter((n) => n.isActive).length;

    return {
      totalEvents: events.length,
      upcomingCount: upcomingEvents.length,
      centerEventsCount,
      headOfficeEventsCount,
      activeNoticesCount,
      circularsCount: headOfficeNotices.length,
    };
  }, [events, centerNotices, headOfficeNotices, workspaceId]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (eventScopeFilter === "CENTER" && e.workspaceId !== workspaceId) return false;
      if (eventScopeFilter === "HEAD_OFFICE" && e.workspaceId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(q);
        const matchCategory = e.category?.toLowerCase().includes(q);
        const matchLocation = e.location?.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchLocation) return false;
      }
      return true;
    });
  }, [events, eventScopeFilter, searchQuery, workspaceId]);

  // Filtered Center Notices
  const filteredCenterNotices = useMemo(() => {
    return centerNotices.filter((n) => {
      if (noticeAudienceFilter !== "ALL" && n.audience !== noticeAudienceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title?.toLowerCase().includes(q);
        const matchMessage = n.message?.toLowerCase().includes(q);
        if (!matchTitle && !matchMessage) return false;
      }
      return true;
    });
  }, [centerNotices, noticeAudienceFilter, searchQuery]);

  // Filtered Head Office Circulars
  const filteredCirculars = useMemo(() => {
    return headOfficeNotices.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title?.toLowerCase().includes(q);
        const matchMessage = c.message?.toLowerCase().includes(q);
        if (!matchTitle && !matchMessage) return false;
      }
      return true;
    });
  }, [headOfficeNotices, searchQuery]);

  // Paginated Center Notices
  const paginatedCenterNotices = useMemo(() => {
    const start = (centerNoticePage - 1) * PAGE_SIZE;
    return filteredCenterNotices.slice(start, start + PAGE_SIZE);
  }, [filteredCenterNotices, centerNoticePage]);
  const totalCenterNoticePages = Math.ceil(filteredCenterNotices.length / PAGE_SIZE) || 1;

  // Paginated Circulars
  const paginatedCirculars = useMemo(() => {
    const start = (circularPage - 1) * PAGE_SIZE;
    return filteredCirculars.slice(start, start + PAGE_SIZE);
  }, [filteredCirculars, circularPage]);
  const totalCircularPages = Math.ceil(filteredCirculars.length / PAGE_SIZE) || 1;

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  // Open Event Dialog for Create
  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setIsEventDialogOpen(true);
  };

  // Open Event Dialog for Edit
  const handleOpenEditEvent = (event: any) => {
    if (event.isHeadOffice) {
      toast.info("This is an official Head Office event organized for all franchises.");
      return;
    }
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  // Open Notice Dialog for Create
  const handleOpenCreateNotice = () => {
    setEditingNotice(null);
    setNoticeFormData({
      title: "",
      message: "",
      date: new Date().toISOString().split("T")[0],
      link: "",
      audience: "ALL",
      priority: "NORMAL",
      category: "General",
      isActive: true,
    });
    setIsNoticeDialogOpen(true);
  };

  // Open Notice Dialog for Edit
  const handleOpenEditNotice = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setNoticeFormData({
      title: notice.title || "",
      message: notice.message || "",
      date: notice.date || new Date().toISOString().split("T")[0],
      link: notice.link || "",
      audience: (notice.audience as any) || "ALL",
      priority: notice.priority || "NORMAL",
      category: normalizeNoticeCategory((notice as any).category),
      isActive: notice.isActive !== false,
    });
    setIsNoticeDialogOpen(true);
  };

  // Save Notice
  const handleSaveNotice = async () => {
    if (!noticeFormData.title.trim()) {
      toast.error("Please enter notice title");
      return;
    }

    setIsSavingNotice(true);
    try {
      const res = await saveCenterNotice(workspaceId, {
        id: editingNotice?.id,
        ...noticeFormData,
        category: normalizeNoticeCategory(noticeFormData.category),
        publishedBy: workspaceName,
      });

      if (res.success) {
        toast.success(editingNotice ? "Notice updated" : "Notice published & live on ticker!");
        setIsNoticeDialogOpen(false);
        loadData();
      } else {
        toast.error(res.error || "Failed to save notice");
      }
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsSavingNotice(false);
    }
  };

  // Toggle local event active status directly
  const handleToggleEventActive = async (eventId: string, currentActive: boolean) => {
    const newValue = !currentActive;
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isActive: newValue } : e))
    );

    try {
      const res = await toggleEventStatus(eventId, "isActive", newValue);
      if (res.success) {
        toast.success(newValue ? "Event is now Active" : "Event is now Hidden");
      } else {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, isActive: currentActive } : e))
        );
        toast.error(res.error || "Failed to toggle status");
      }
    } catch {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, isActive: currentActive } : e))
      );
      toast.error("Network error while updating status");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === "EVENT") {
        const res = await deleteAdminEvent(itemToDelete.id);
        if (res.success) {
          toast.success("Event deleted");
          setEvents((prev) => prev.filter((e) => e.id !== itemToDelete.id));
        } else {
          toast.error("Failed to delete event");
        }
      } else if (itemToDelete.type === "NOTICE") {
        const res = await deleteCenterNotice(itemToDelete.id, workspaceId);
        if (res.success) {
          toast.success("Notice deleted");
          setCenterNotices((prev) => prev.filter((n) => n.id !== itemToDelete.id));
        } else {
          toast.error("Failed to delete notice");
        }
      }
    } catch (err: any) {
      toast.error("Delete operation failed");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Header */}
      <AdminPageHeader
        title="Events & Notice Board"
        description="Organize center workshops, publish announcements for students & staff, and view official Head Office circulars."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateNotice}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-amber-500/20 text-amber-600 hover:bg-amber-500/10"
          >
            <Bell className="h-3.5 w-3.5" />
            Publish Notice
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreateEvent}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Center Event
          </Button>
        </div>
      </AdminPageHeader>

      {/* 2. Stat Cards Grid (Smart Dynamic Header) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {activeTab === "requests" ? (
          <>
            <StatCard
              label="Total Sent"
              value={requestStats.total}
              subtext="Support requests to Head Office"
              icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Pending Review"
              value={requestStats.pending}
              subtext="Awaiting Head Office response"
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="In Progress"
              value={requestStats.inProgress}
              subtext="Under active investigation"
              icon={<RefreshCw className="h-5 w-5 text-sky-500" />}
              color="sky"
            />
            <StatCard
              label="Resolved"
              value={requestStats.resolved}
              subtext="Completed with resolution note"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
          </>
        ) : activeTab === "noticepad" ? (
          <>
            <StatCard
              label="Total Circulars"
              value={centerNotices.length + headOfficeNotices.length}
              subtext="Center notices & directives"
              icon={<FileText className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Published & Live"
              value={[...centerNotices, ...headOfficeNotices].filter((n: any) => n.status === "PUBLISHED" || (!n.status && (!n.scheduledFor || new Date(n.scheduledFor) <= new Date()))).length}
              subtext="Active on A4 noticepad"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
            <StatCard
              label="Scheduled Circulars"
              value={[...centerNotices, ...headOfficeNotices].filter((n: any) => n.status === "SCHEDULED" || (n.scheduledFor && new Date(n.scheduledFor) > new Date())).length}
              subtext="Scheduled for release"
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Urgent Directives"
              value={[...centerNotices, ...headOfficeNotices].filter((n: any) => n.priority === "URGENT" || n.type === "WARNING").length}
              subtext="High-priority compliance alerts"
              icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}
              color="rose"
            />
          </>
        ) : activeTab === "circulars" ? (
          <>
            <StatCard
              label="Head Office Circulars"
              value={stats.circularsCount}
              subtext="Directives from Head Office"
              icon={<ShieldCheck className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Urgent Directives"
              value={headOfficeNotices.filter((n: any) => n.type === "WARNING").length}
              subtext="High-priority compliance notices"
              icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}
              color="rose"
            />
            <StatCard
              label="General Directives"
              value={headOfficeNotices.filter((n: any) => n.type !== "WARNING").length}
              subtext="Standard institutional directives"
              icon={<Megaphone className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Center Events"
              value={stats.centerEventsCount}
              subtext="Active center programs"
              icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
          </>
        ) : activeTab === "notices" ? (
          <>
            <StatCard
              label="Center Notices"
              value={stats.activeNoticesCount}
              subtext="Live on ticker & student portal"
              icon={<Megaphone className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Head Office Circulars"
              value={stats.circularsCount}
              subtext="Directives from Head Office"
              icon={<ShieldCheck className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Center Events"
              value={stats.centerEventsCount}
              subtext="Organized by center"
              icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
            <StatCard
              label="Upcoming Programs"
              value={stats.upcomingCount}
              subtext="Active on center website"
              icon={<Clock className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total Events"
              value={stats.totalEvents}
              subtext={`${stats.centerEventsCount} Center + ${stats.headOfficeEventsCount} Head Office`}
              icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
            <StatCard
              label="Upcoming Programs"
              value={stats.upcomingCount}
              subtext="Active on center website"
              icon={<Clock className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
            <StatCard
              label="Center Notices"
              value={stats.activeNoticesCount}
              subtext="Live on ticker & student portal"
              icon={<Megaphone className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Head Office Circulars"
              value={stats.circularsCount}
              subtext="Directives from Head Office"
              icon={<ShieldCheck className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
          </>
        )}
      </div>

      {/* 3. Horizontal Navigation Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => setActiveTab("events")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "events"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Events Showcase ({events.length})
        </button>

        <button
          onClick={() => setActiveTab("notices")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "notices"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Bell className="w-3.5 h-3.5" />
          Center Notices & Ticker ({centerNotices.length})
        </button>

        <button
          onClick={() => setActiveTab("circulars")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "circulars"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          Head Office Circulars ({headOfficeNotices.length})
        </button>

        <button
          onClick={() => setActiveTab("noticepad")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "noticepad"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          Official Noticepad (A4)
        </button>

        <button
          onClick={() => { setActiveTab("requests"); loadRequests(); }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "requests"
              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Inbox className="w-3.5 h-3.5 text-indigo-500" />
          Send Request to HO
          {myRequests.filter(r => !r.isRead).length > 0 && (
            <span className="ml-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-indigo-500 text-white">
              {myRequests.filter(r => !r.isRead).length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Main Content */}
      {activeTab === "requests" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Send Request Form */}
          <Card className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Inbox className="h-4 w-4 text-indigo-500" />
                Send Request to Head Office
              </CardTitle>
              <CardDescription className="text-[11px]">Send queries, complaints, or requests directly to the Super Admin team.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</Label>
                <Select
                  value={requestFormData.category}
                  onValueChange={(val: any) => setRequestFormData(p => ({ ...p, category: val }))}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General" className="text-xs">General Inquiry</SelectItem>
                    <SelectItem value="Technical" className="text-xs">Technical Support</SelectItem>
                    <SelectItem value="Financial" className="text-xs">Financial & Wallet</SelectItem>
                    <SelectItem value="Operational" className="text-xs">Center Operations</SelectItem>
                    <SelectItem value="Complaint" className="text-xs">Grievance & Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Priority</Label>
                <Select
                  value={requestFormData.priority}
                  onValueChange={(val: any) => setRequestFormData(p => ({ ...p, priority: val }))}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL" className="text-xs">Normal Priority</SelectItem>
                    <SelectItem value="HIGH" className="text-xs">High Priority</SelectItem>
                    <SelectItem value="URGENT" className="text-xs">Urgent Escalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject</Label>
                <Input
                  placeholder="Brief summary of your request or issue..."
                  value={requestFormData.subject}
                  onChange={e => setRequestFormData(p => ({ ...p, subject: e.target.value }))}
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Message / Details</Label>
                <Textarea
                  placeholder="Provide complete details, references, or instructions for Head Office..."
                  value={requestFormData.message}
                  onChange={e => setRequestFormData(p => ({ ...p, message: e.target.value }))}
                  rows={5}
                  className="text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none mt-1"
                />
              </div>
              <Button
                onClick={handleSubmitRequest}
                disabled={isSubmittingRequest}
                className="w-full h-8 sm:h-9 text-xs font-semibold rounded-lg gap-2"
              >
                {isSubmittingRequest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {isSubmittingRequest ? "Sending..." : "Submit to Head Office"}
              </Button>
            </CardContent>
          </Card>

          {/* Request History */}
          <div className="lg:col-span-3 space-y-3">
            {/* List & Toolbar Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative w-full sm:max-w-[240px]">
                  <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search my requests..."
                    value={requestSearchQuery}
                    onChange={e => setRequestSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-2.5 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={requestStatusFilter}
                    onValueChange={(val: any) => setRequestStatusFilter(val)}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[130px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL" className="text-xs">All Status</SelectItem>
                      <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS" className="text-xs">In Progress</SelectItem>
                      <SelectItem value="RESOLVED" className="text-xs">Resolved</SelectItem>
                      <SelectItem value="REJECTED" className="text-xs">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadRequests}
                    disabled={isLoadingRequests}
                    className="h-8 w-8 rounded-lg p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Refresh requests"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isLoadingRequests && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingRequests ? (
                  <div className="flex items-center justify-center h-44 text-xs text-slate-400 gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading requests...
                  </div>
                ) : filteredMyRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                    <Inbox className="h-8 w-8 opacity-30" />
                    <p className="text-xs font-medium">No requests found</p>
                    <p className="text-[10px]">
                      {requestSearchQuery || requestStatusFilter !== "ALL"
                        ? "Try clearing filters to view all requests."
                        : "Use the form on the left to submit an inquiry to Head Office."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredMyRequests.map((req) => {
                      const reqStatus = (req.status || (req.isRead ? "RESOLVED" : "PENDING")).toUpperCase();
                      const statusColor =
                        reqStatus === "PENDING"
                          ? "border-l-amber-500"
                          : reqStatus === "IN_PROGRESS"
                          ? "border-l-sky-500"
                          : reqStatus === "RESOLVED"
                          ? "border-l-emerald-500"
                          : "border-l-slate-400";

                      return (
                        <div
                          key={req.id}
                          className={cn(
                            "p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all border-l-[3px]",
                            statusColor
                          )}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {req.title}
                                </span>
                                {req.refNo && (
                                  <span className="font-mono text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    {req.refNo}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {req.message}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <Badge
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                                  reqStatus === "PENDING"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                    : reqStatus === "IN_PROGRESS"
                                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                                    : reqStatus === "RESOLVED"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                )}
                              >
                                {reqStatus}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-semibold px-1 py-0.2 rounded border",
                                  req.priority === "URGENT"
                                    ? "text-red-600 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30"
                                    : req.priority === "HIGH"
                                    ? "text-amber-600 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30"
                                    : "text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                                )}
                              >
                                {req.priority || "NORMAL"}
                              </Badge>
                            </div>
                          </div>

                          {/* Response highlight note if resolved or answered */}
                          {req.resolutionNotes && (
                            <div className="mt-2.5 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold">Head Office Response:</span>{" "}
                                <span className="line-clamp-2">{req.resolutionNotes}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-medium text-slate-500 dark:text-slate-400">
                                {req.category || "General"}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(req.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequestForView(req)}
                              className="h-6 px-2 text-[10px] font-semibold text-primary hover:bg-primary/5 rounded"
                            >
                              <Eye className="h-3 w-3 mr-1" /> View Ticket
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeTab === "noticepad" ? (
        <NoticepadDocumentViewer
          notices={[...centerNotices, ...headOfficeNotices]}
          selectedNoticeId={selectedNoticeForPad?.id || null}
          isSuperAdmin={false}
          workspace={workspace || { id: workspaceId, name: workspaceName, subdomain: workspaceSubdomain, signatureUrl: franchiseSignature }}
          superAdminSignature={superAdminSignature}
          franchiseSignature={franchiseSignature || workspace?.signatureUrl}
          onRefresh={loadData}
          onNoticeSelect={(n) => setSelectedNoticeForPad(n)}
        />
      ) : (
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:max-w-[300px] group">
            <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={activeTab === "events" ? "Search events..." : "Search notices..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "events" && (
              <Select value={eventScopeFilter} onValueChange={(val: any) => setEventScopeFilter(val)}>
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[160px]">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Events</SelectItem>
                  <SelectItem value="CENTER">Center Events Only</SelectItem>
                  <SelectItem value="HEAD_OFFICE">Head Office Events</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === "notices" && (
              <Select value={noticeAudienceFilter} onValueChange={(val) => setNoticeAudienceFilter(val as string)}>
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[150px]">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Audiences</SelectItem>
                  <SelectItem value="PUBLIC">Public Website</SelectItem>
                  <SelectItem value="STUDENTS">Students Portal</SelectItem>
                  <SelectItem value="STAFF">Staff Only</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* TAB 1: EVENTS */}
          {activeTab === "events" && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3.5 border-l-[3px] border-l-primary"
                >
                  <div className="flex items-start sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative h-14 w-20 sm:h-16 sm:w-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700/60">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <CalendarDays className="h-6 w-6 opacity-40" />
                        </div>
                      )}
                      {event.isFeatured && (
                        <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {event.isHeadOffice ? (
                          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Head Office Event
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Center Event
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-400">&bull;</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {event.category || "General Event"}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {event.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {event.time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {event.location || "Online"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {!event.isHeadOffice ? (
                        <div
                          className="flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/50"
                          title="Click to toggle public status"
                          onClick={() => handleToggleEventActive(event.id, event.isActive)}
                        >
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", event.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-200/80 text-slate-500")}>
                            {event.isActive ? "Active" : "Hidden"}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={event.isActive}
                              onCheckedChange={() => handleToggleEventActive(event.id, event.isActive)}
                              className="scale-75 shrink-0"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", event.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                          {event.isActive ? "Active" : "Hidden"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!event.isHeadOffice ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditEvent(event)}
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setItemToDelete({
                                type: "EVENT",
                                id: event.id,
                                title: event.title,
                              })
                            }
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500 py-1">
                          Head Office Managed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No events found</p>
                  <p className="text-[11px] text-slate-400">Add an upcoming workshop or event for your students.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROPER TABLE FOR CENTER NOTICES */}
          {activeTab === "notices" && (
            <div>
              <Table>
                <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 min-w-[260px]">
                      Notice Title & Message
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-32">
                      Audience
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-28 text-center">
                      Priority
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-32">
                      Date
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 w-28">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedCenterNotices.map((notice) => (
                    <TableRow
                      key={notice.id}
                      className={cn(
                        "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all border-none group",
                        notice.priority === "URGENT" ? "border-l-[3px] border-l-red-500" : "border-l-[3px] border-l-amber-500"
                      )}
                    >
                      <TableCell className="py-3 px-3 sm:px-4">
                        <div className="space-y-0.5 max-w-xl">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                              {notice.title}
                            </span>
                            {notice.link && notice.link !== "#" && (
                              <a
                                href={notice.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:opacity-80 shrink-0"
                                title="Has link or attachment"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {notice.message && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                              {notice.message}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <Badge className="bg-blue-500/10 text-blue-600 border-none text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          {notice.audience}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        {notice.priority === "URGENT" ? (
                          <Badge className="bg-red-500/15 text-red-600 border-none text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Urgent
                          </Badge>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">
                            {notice.priority || "NORMAL"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {notice.date}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3 px-3 sm:px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNoticeForPad(notice);
                              setActiveTab("noticepad");
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                            title="Print / View Official A4 Noticepad"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditNotice(notice)}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                            title="Edit Notice"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setItemToDelete({
                                type: "NOTICE",
                                id: notice.id,
                                title: notice.title,
                              })
                            }
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCenterNotices.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <Bell className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No notices published yet</p>
                  <p className="text-[11px] text-slate-400">Notices published here automatically update your landing page ticker and student portal.</p>
                </div>
              )}

              {filteredCenterNotices.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Showing {(centerNoticePage - 1) * PAGE_SIZE + 1} to {Math.min(centerNoticePage * PAGE_SIZE, filteredCenterNotices.length)} of {filteredCenterNotices.length} notices
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCenterNoticePage((p) => Math.max(1, p - 1))}
                      disabled={centerNoticePage <= 1}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {getPageNumbers(centerNoticePage, totalCenterNoticePages).map((p, idx) =>
                      p === "..." ? (
                        <span key={`cnt-dots-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>
                      ) : (
                        <Button
                          key={`cnt-page-${p}`}
                          variant={centerNoticePage === p ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCenterNoticePage(p as number)}
                          className="h-7 w-7 rounded-md font-semibold text-xs p-0"
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCenterNoticePage((p) => Math.min(totalCenterNoticePages, p + 1))}
                      disabled={centerNoticePage >= totalCenterNoticePages}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPER TABLE FOR HEAD OFFICE CIRCULARS */}
          {activeTab === "circulars" && (
            <div>
              <Table>
                <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 min-w-[280px]">
                      Official Circular Directive
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-36">
                      Directive Type
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-36">
                      Issued On
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedCirculars.map((circular) => {
                    const isUrgent = circular.type === "WARNING";
                    return (
                      <TableRow
                        key={circular.id}
                        className={cn(
                          "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all border-none group",
                          isUrgent ? "border-l-[3px] border-l-red-500" : "border-l-[3px] border-l-indigo-600"
                        )}
                      >
                        <TableCell className="py-3 px-3 sm:px-4">
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                                {circular.title}
                              </span>
                              {circular.link && circular.link !== "/admin/events-notices" && (
                                <a
                                  href={circular.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:opacity-80 shrink-0"
                                  title="Attachment link"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {circular.message}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-3">
                          {isUrgent ? (
                            <Badge className="bg-red-500/15 text-red-600 border-none text-[9px] font-extrabold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit">
                              <ShieldCheck className="h-3 w-3" /> Urgent Directive
                            </Badge>
                          ) : (
                            <Badge className="bg-indigo-500/15 text-indigo-600 border-none text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit">
                              <ShieldCheck className="h-3 w-3" /> Official Circular
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-3 px-3">
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {new Date(circular.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <span className="text-[10px] text-slate-400">Head Office</span>
                        </TableCell>

                        <TableCell className="text-right py-3 px-3 sm:px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedNoticeForPad(circular);
                                setActiveTab("noticepad");
                              }}
                              className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 border-slate-200 dark:border-slate-700 hover:text-amber-600 hover:border-amber-500/30"
                              title="Print / View Official A4 Noticepad"
                            >
                              <Printer className="h-3.5 w-3.5 text-amber-500" />
                              <span>Noticepad</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingCircular(circular)}
                              className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 border-slate-200 dark:border-slate-700"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              <span>Read Directive</span>
                            </Button>

                            {circular.link && circular.link !== "/admin/events-notices" && (
                              <a
                                href={circular.link}
                                target="_blank"
                                rel="noreferrer"
                                className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                                title="Open Link / Attachment"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredCirculars.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No active circulars from Head Office</p>
                  <p className="text-[11px] text-slate-400">Official circulars, board directives, and policy notices will appear here.</p>
                </div>
              )}

              {filteredCirculars.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Showing {(circularPage - 1) * PAGE_SIZE + 1} to {Math.min(circularPage * PAGE_SIZE, filteredCirculars.length)} of {filteredCirculars.length} circulars
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCircularPage((p) => Math.max(1, p - 1))}
                      disabled={circularPage <= 1}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {getPageNumbers(circularPage, totalCircularPages).map((p, idx) =>
                      p === "..." ? (
                        <span key={`circ-dots-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>
                      ) : (
                        <Button
                          key={`circ-page-${p}`}
                          variant={circularPage === p ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCircularPage(p as number)}
                          className="h-7 w-7 rounded-md font-semibold text-xs p-0"
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCircularPage((p) => Math.min(totalCircularPages, p + 1))}
                      disabled={circularPage >= totalCircularPages}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      <EventEditorDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={editingEvent}
        onSaveSuccess={loadData}
        isSuperAdmin={false}
        currentWorkspaceId={workspaceId}
        workspaceSubdomain={workspaceSubdomain}
        allEvents={events}
      />

      {/* CREATE / EDIT NOTICE MODAL */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-2xl p-0 max-h-[85vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl">
          {/* STATIC TOP HEADER */}
          <div className="flex-none p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pr-12">
            <DialogHeader className="p-0 space-y-1 text-left">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500 shrink-0" />
                {editingNotice ? "Edit Notice" : "Publish Center Notice"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Notices instantly synchronize with your public landing page ticker, the `/notice` page, and student dashboard.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* SCROLLABLE FORM BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar min-h-0">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notice Title *</Label>
              <Input
                value={noticeFormData.title}
                onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                placeholder="e.g. Admission Open for Summer Batch 2026"
                className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Audience</Label>
                <Select
                  value={noticeFormData.audience}
                  onValueChange={(val: any) => setNoticeFormData({ ...noticeFormData, audience: val })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All (Public + Students + Staff)</SelectItem>
                    <SelectItem value="PUBLIC">Public Website Only</SelectItem>
                    <SelectItem value="STUDENTS">Students Portal Only</SelectItem>
                    <SelectItem value="STAFF">Staff & Faculty Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</Label>
                <Select
                  value={normalizeNoticeCategory(noticeFormData.category)}
                  onValueChange={(val: any) => setNoticeFormData({ ...noticeFormData, category: val })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Notice</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Exams">Exams</SelectItem>
                    <SelectItem value="Holidays">Holidays</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</Label>
                <Select
                  value={noticeFormData.priority}
                  onValueChange={(val: any) => setNoticeFormData({ ...noticeFormData, priority: val })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="URGENT">Urgent Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</Label>
                <Input
                  type="date"
                  value={noticeFormData.date}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, date: e.target.value })}
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document URL / Link</Label>
                <Input
                  value={noticeFormData.link}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, link: e.target.value })}
                  placeholder="e.g. /courses or link to PDF"
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notice Body & Details</Label>
              <Textarea
                value={noticeFormData.message}
                onChange={(e) => setNoticeFormData({ ...noticeFormData, message: e.target.value })}
                placeholder="Full details of notice or announcement..."
                className="min-h-[90px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Switch
                checked={noticeFormData.isActive}
                onCheckedChange={(val) => setNoticeFormData({ ...noticeFormData, isActive: val })}
              />
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Live on Home Page Notice Ticker
              </Label>
            </div>
          </div>

          {/* STATIC BOTTOM FOOTER */}
          <div className="flex-none p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNoticeDialogOpen(false)}
              className="h-8 sm:h-9 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNotice}
              disabled={isSavingNotice}
              className="h-8 sm:h-9 text-xs rounded-lg font-semibold bg-primary text-primary-foreground shadow-xs gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isSavingNotice ? "Saving..." : editingNotice ? "Update Notice" : "Publish Notice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Confirm Deletion"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{itemToDelete?.title}</strong>? This action cannot be undone.
          </>
        }
        onConfirm={handleConfirmDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        destructive={true}
      />

      {/* VIEW HEAD OFFICE CIRCULAR DIRECTIVE MODAL */}
      <Dialog open={Boolean(viewingCircular)} onOpenChange={(open) => !open && setViewingCircular(null)}>
        {viewingCircular && (
          <DialogContent className="max-w-lg w-[95vw] rounded-2xl p-0 max-h-[85vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl">
            {/* STATIC TOP HEADER */}
            <div className="flex-none p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pr-12">
              <DialogHeader className="p-0 space-y-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={cn(
                      "text-[9px] font-extrabold uppercase px-1.5 py-0 border-none rounded",
                      viewingCircular.type === "WARNING" ? "bg-red-500 text-white" : "bg-indigo-600 text-white"
                    )}
                  >
                    {viewingCircular.type === "WARNING" ? "Urgent Directive" : "Official Circular"}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(viewingCircular.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {viewingCircular.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Issued by Head Office Central Administration
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar min-h-0">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {viewingCircular.message}
              </div>

              {viewingCircular.link && viewingCircular.link !== "/admin/events-notices" && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Official Directive Attachment / Link
                  </span>
                  <a
                    href={viewingCircular.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Open Attachment</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* STATIC BOTTOM FOOTER */}
            <div className="flex-none flex items-center justify-between p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedNoticeForPad(viewingCircular);
                  setViewingCircular(null);
                  setActiveTab("noticepad");
                }}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600"
              >
                <Printer className="h-3.5 w-3.5 text-amber-500" />
                <span>Open in Official Noticepad (A4)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingCircular(null)}
                className="h-8 px-4 text-xs font-semibold rounded-lg"
              >
                Close Directive
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* 8. Franchise Request Details Modal */}
      <Dialog open={!!selectedRequestForView} onOpenChange={(open) => !open && setSelectedRequestForView(null)}>
        {selectedRequestForView && (
          <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800">
            <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {selectedRequestForView.title}
                    </DialogTitle>
                    {selectedRequestForView.refNo && (
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Ref: {selectedRequestForView.refNo}
                      </p>
                    )}
                  </div>
                </div>

                <Badge
                  className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border-none shrink-0",
                    (selectedRequestForView.status || (selectedRequestForView.isRead ? "RESOLVED" : "PENDING")).toUpperCase() === "PENDING"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                      : (selectedRequestForView.status || "").toUpperCase() === "IN_PROGRESS"
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                      : (selectedRequestForView.status || (selectedRequestForView.isRead ? "RESOLVED" : "PENDING")).toUpperCase() === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {(selectedRequestForView.status || (selectedRequestForView.isRead ? "RESOLVED" : "PENDING")).toUpperCase()}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Meta row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRequestForView.category || "General"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Priority</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRequestForView.priority || "NORMAL"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Submitted On</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(selectedRequestForView.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Submitted Request Details
                </Label>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedRequestForView.message}
                </div>
              </div>

              {/* Head Office Response Section */}
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Head Office Action & Remarks
                </Label>
                {selectedRequestForView.resolutionNotes ? (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2Icon className="h-4 w-4" />
                      Official Response from Central Directorate:
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {selectedRequestForView.resolutionNotes}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>This ticket is currently queued for review with the Super Admin operations desk.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequestForView(null)}
                className="h-8 px-4 text-xs font-semibold rounded-lg"
              >
                Close Ticket View
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
