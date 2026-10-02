"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Bell,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Globe,
  Building2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Megaphone,
  Sparkles,
  Send,
  Eye,
  RefreshCw,
  Users,
  Video,
  Image as ImageIcon,
  Check,
  X,
  HardDrive,
  Database,
  Sliders,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileText,
  RotateCcw,
  Printer,
  Inbox,
  MessageSquare,
  Wrench,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EventEditorDialog } from "@/components/events/EventEditorDialog";
import { FranchiseMultiSelect } from "@/components/events/FranchiseMultiSelect";
import { NoticepadDocumentViewer, normalizeNoticeCategory } from "@/components/documents/NoticepadDocumentViewer";
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
  broadcastSuperAdminNotice,
  deleteBroadcastNotice,
  saveCenterNotice,
  deleteCenterNotice,
  getNoticeConfig,
  saveNoticeConfig,
  cleanupExpiredNotices,
  getFranchiseRequests,
  markFranchiseRequestRead,
  updateFranchiseRequestStatus,
} from "@/app/actions/events-notices";
import { NOTICE_CATEGORIES, REQUEST_CATEGORIES } from "@/lib/notice-categories";
import type { NoticeRetentionConfig } from "@/types/events-notices";

export function SuperAdminEventsNoticesClient() {
  const [activeTab, setActiveTab] = useState<"events" | "notices" | "global-ticker" | "config" | "noticepad" | "franchise-requests">("events");
  const [selectedNoticeForPad, setSelectedNoticeForPad] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [broadcastNotices, setBroadcastNotices] = useState<any[]>([]);
  const [publicNotices, setPublicNotices] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [superAdminSignature, setSuperAdminSignature] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [noticePriorityFilter, setNoticePriorityFilter] = useState("ALL");
  const [noticeTargetFilter, setNoticeTargetFilter] = useState("ALL");

  // Pagination states
  const [noticePage, setNoticePage] = useState(1);
  const [publicNoticePage, setPublicNoticePage] = useState(1);
  const PAGE_SIZE = 10;

  // Event Dialog State
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  // Notice Dialog State
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({
    title: "",
    message: "",
    target: "ALL_FRANCHISES" as "ALL_FRANCHISES" | "SPECIFIC_FRANCHISE" | "ALL_STUDENTS" | "PUBLIC",
    workspaceIds: [] as string[],
    priority: "NORMAL" as "NORMAL" | "HIGH" | "URGENT",
    category: "General",
    link: "",
  });

  // View Circular Modal State
  const [viewingCircular, setViewingCircular] = useState<any | null>(null);

  // Config Tab State
  const [retentionConfig, setRetentionConfig] = useState<NoticeRetentionConfig>({
    autoCleanEnabled: true,
    retentionDays: 365,
    cleanTargets: ["CIRCULAR", "CENTER_NOTICE", "READ_NOTIFICATION"],
    lastCleanedAt: null,
    lastCleanedCount: 0,
  });
  const [storageStats, setStorageStats] = useState({
    totalNotifications: 0,
    broadcastCircularsCount: 0,
    eligibleForCleanupCount: 0,
    oldestRecordDate: null as string | null,
    retentionDays: 365,
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [isCleanupConfirmOpen, setIsCleanupConfirmOpen] = useState(false);

  // Delete Confirm Dialog
  const [itemToDelete, setItemToDelete] = useState<{
    type: "EVENT" | "BROADCAST_NOTICE" | "PUBLIC_NOTICE";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Franchise Requests
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [franchiseRequests, setFfranchiseRequests] = useState<any[]>([]);
  const [isLoadingFrRequests, setIsLoadingFrRequests] = useState(false);
  const [frRequestFilter, setFrRequestFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED">("ALL");
  const [frCategoryFilter, setFrCategoryFilter] = useState<string>("ALL");
  const [frWorkspaceFilter, setFrWorkspaceFilter] = useState("ALL");
  const [frSearchQuery, setFrSearchQuery] = useState("");

  // Manage Request Modal State
  const [selectedRequestForManage, setSelectedRequestForManage] = useState<any | null>(null);
  const [manageStatus, setManageStatus] = useState<"PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED">("PENDING");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const pendingFrRequestsCount = franchiseRequests.filter(r => r.status === "PENDING" || (!r.status && !r.isRead)).length;

  useEffect(() => {
    loadData();
    loadNoticeConfig();
  }, []);

  useEffect(() => {
    if (tabParam === "franchise-requests" || tabParam === "requests") {
      setActiveTab("franchise-requests");
      loadFranchiseRequests();
    }
  }, [tabParam]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getEventsAndNotices(null);
      if (res.success) {
        setEvents(res.events || []);
        setBroadcastNotices(res.broadcastNotices || []);
        setPublicNotices(res.centerNotices || []);
        setWorkspaces(res.workspaces || []);
        if (res.superAdminSignature) {
          setSuperAdminSignature(res.superAdminSignature);
        }
      } else {
        toast.error(res.error || "Failed to load data");
      }
    } catch (err) {
      toast.error("Network error while loading events and notices");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNoticeConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const res = await getNoticeConfig();
      if (res.success) {
        if (res.config) setRetentionConfig(res.config as any);
        if (res.stats) setStorageStats(res.stats as any);
      }
    } catch (err) {
      console.error("Failed to load notice config", err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const loadFranchiseRequests = async () => {
    setIsLoadingFrRequests(true);
    try {
      const res = await getFranchiseRequests(null);
      if (res.success) {
        setFfranchiseRequests(res.requests || []);
      }
    } catch {}
    finally { setIsLoadingFrRequests(false); }
  };

  const handleOpenManageModal = (req: any) => {
    setSelectedRequestForManage(req);
    setManageStatus((req.status as any) || (req.isRead ? "RESOLVED" : "PENDING"));
    setResolutionNote("");
    setIsManageModalOpen(true);
  };

  const handleSaveRequestStatus = async () => {
    if (!selectedRequestForManage) return;
    setIsSavingStatus(true);
    try {
      const res = await updateFranchiseRequestStatus({
        requestId: selectedRequestForManage.id,
        status: manageStatus,
        resolutionNote: resolutionNote.trim() || undefined,
      });
      if (res.success) {
        toast.success(`Request status updated to ${manageStatus}`);
        setIsManageModalOpen(false);
        setSelectedRequestForManage(null);
        setResolutionNote("");
        await loadFranchiseRequests();
        window.dispatchEvent(new Event("franchise-requests-updated"));
      } else {
        toast.error(res.error || "Failed to update request");
      }
    } catch {
      toast.error("Network error while updating request status");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleQuickToggleStatus = async (req: any) => {
    const isCurrentlyResolved = req.status === "RESOLVED" || req.isRead;
    const nextStatus = isCurrentlyResolved ? "PENDING" : "RESOLVED";
    try {
      const res = await updateFranchiseRequestStatus({
        requestId: req.id,
        status: nextStatus,
      });
      if (res.success) {
        toast.success(nextStatus === "RESOLVED" ? "Request marked as Resolved" : "Request marked as Pending");
        await loadFranchiseRequests();
        window.dispatchEvent(new Event("franchise-requests-updated"));
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleMarkRequestRead = async (requestId: string, isRead: boolean) => {
    await markFranchiseRequestRead(requestId, isRead);
    setFfranchiseRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, isRead, status: isRead ? "RESOLVED" : "PENDING" } : r)
    );
    window.dispatchEvent(new Event("franchise-requests-updated"));
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await saveNoticeConfig({
        autoCleanEnabled: retentionConfig.autoCleanEnabled,
        retentionDays: retentionConfig.retentionDays,
        cleanTargets: retentionConfig.cleanTargets,
      });
      if (res.success) {
        toast.success("Storage retention policy saved successfully!");
        loadNoticeConfig();
      } else {
        toast.error(res.error || "Failed to save storage settings");
      }
    } catch (e: any) {
      toast.error("Failed to save storage settings");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleExecuteCleanup = async () => {
    setIsCleaningStorage(true);
    try {
      const res = await cleanupExpiredNotices({
        retentionDays: retentionConfig.retentionDays,
        cleanTargets: retentionConfig.cleanTargets,
      });
      if (res.success) {
        toast.success(res.message || "Storage cleanup completed successfully!");
        setIsCleanupConfirmOpen(false);
        loadData();
        loadNoticeConfig();
      } else {
        toast.error(res.error || "Failed to run storage cleanup");
      }
    } catch (e: any) {
      toast.error("Error executing storage cleanup");
    } finally {
      setIsCleaningStorage(false);
    }
  };

  // Stat Calculations
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter((e) => new Date(e.date) >= today);
    const globalEvents = events.filter((e) => !e.workspaceId);
    const urgentNotices = broadcastNotices.filter((n) => n.type === "WARNING");

    return {
      totalEvents: events.length,
      upcomingCount: upcomingEvents.length,
      globalEventsCount: globalEvents.length,
      broadcastNoticesCount: broadcastNotices.length,
      urgentNoticesCount: urgentNotices.length,
    };
  }, [events, broadcastNotices]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (workspaceFilter === "GLOBAL" && e.workspaceId) return false;
      if (workspaceFilter !== "ALL" && workspaceFilter !== "GLOBAL" && e.workspaceId !== workspaceFilter) {
        return false;
      }
      if (statusFilter === "ACTIVE" && !e.isActive) return false;
      if (statusFilter === "INACTIVE" && e.isActive) return false;
      if (statusFilter === "FEATURED" && !e.isFeatured) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(q);
        const matchCategory = e.category?.toLowerCase().includes(q);
        const matchLocation = e.location?.toLowerCase().includes(q);
        const matchCenter = e.workspace?.name?.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchLocation && !matchCenter) return false;
      }

      return true;
    });
  }, [events, workspaceFilter, statusFilter, searchQuery]);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return broadcastNotices.filter((n) => {
      // Priority filter
      if (noticePriorityFilter === "URGENT" && n.type !== "WARNING") return false;
      if (noticePriorityFilter === "HIGH" && (n.type === "WARNING" || n.type === "INFO")) return false;
      if (noticePriorityFilter === "NORMAL" && n.type !== "CIRCULAR" && n.type !== "INFO") return false;

      // Target filter
      if (noticeTargetFilter === "ALL_FRANCHISES" && n.workspaceId) return false;
      if (noticeTargetFilter === "SPECIFIC" && !n.workspaceId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title?.toLowerCase().includes(q);
        const matchMessage = n.message?.toLowerCase().includes(q);
        const matchCenter = n.workspace?.name?.toLowerCase().includes(q) || n.workspace?.centerCode?.toLowerCase().includes(q);
        if (!matchTitle && !matchMessage && !matchCenter) return false;
      }
      return true;
    });
  }, [broadcastNotices, searchQuery, noticePriorityFilter, noticeTargetFilter]);

  // Paginated Notices
  const paginatedNotices = useMemo(() => {
    const start = (noticePage - 1) * PAGE_SIZE;
    return filteredNotices.slice(start, start + PAGE_SIZE);
  }, [filteredNotices, noticePage]);

  const totalNoticePages = Math.ceil(filteredNotices.length / PAGE_SIZE) || 1;

  // Filtered Public Ticker Notices
  const filteredPublicNotices = useMemo(() => {
    if (!searchQuery.trim()) return publicNotices;
    const q = searchQuery.toLowerCase();
    return publicNotices.filter((n) =>
      n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q)
    );
  }, [publicNotices, searchQuery]);

  const paginatedPublicNotices = useMemo(() => {
    const start = (publicNoticePage - 1) * PAGE_SIZE;
    return filteredPublicNotices.slice(start, start + PAGE_SIZE);
  }, [filteredPublicNotices, publicNoticePage]);

  const totalPublicNoticePages = Math.ceil(filteredPublicNotices.length / PAGE_SIZE) || 1;

  // Open Event Dialog for Create
  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setIsEventDialogOpen(true);
  };

  // Open Event Dialog for Edit
  const handleOpenEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  // Handle Broadcast Notice Submit
  const handleBroadcastNotice = async () => {
    if (!noticeFormData.title.trim()) {
      toast.error("Please enter a notice title");
      return;
    }
    if (!noticeFormData.message.trim()) {
      toast.error("Please enter the circular instructions/message");
      return;
    }
    if (noticeFormData.target === "SPECIFIC_FRANCHISE" && noticeFormData.workspaceIds.length === 0) {
      toast.error("Please select at least one franchise center from the list");
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await broadcastSuperAdminNotice({
        title: noticeFormData.title,
        message: noticeFormData.message,
        target: noticeFormData.target,
        workspaceIds: noticeFormData.workspaceIds,
        priority: noticeFormData.priority,
        category: normalizeNoticeCategory(noticeFormData.category),
        link: noticeFormData.link || undefined,
      });

      if (res.success) {
        setIsNoticeDialogOpen(false);
        setNoticeFormData({
          title: "",
          message: "",
          target: "ALL_FRANCHISES",
          workspaceIds: [],
          priority: "NORMAL",
          category: "General",
          link: "",
        });

        const targetSummary = noticeFormData.target === "ALL_FRANCHISES"
          ? "All Franchise Centers"
          : noticeFormData.target === "ALL_STUDENTS"
          ? "All Enrolled Students (Nationwide)"
          : noticeFormData.target === "PUBLIC"
          ? "Public Website Notice Ticker"
          : `${res.count || noticeFormData.workspaceIds.length} Franchise Centers`;
        toast.success(`Circular broadcasted successfully to ${targetSummary}`);
        loadData();
        loadNoticeConfig();
      } else {
        toast.error(res.error || "Failed to broadcast circular");
      }
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Toggle Event Field Status directly
  const handleToggleEventField = async (
    eventId: string,
    field: "isActive" | "isFeatured" | "showOnFranchises",
    currentValue: boolean
  ) => {
    const newValue = !currentValue;
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, [field]: newValue } : e))
    );

    try {
      const res = await toggleEventStatus(eventId, field, newValue);
      if (res.success) {
        toast.success(
          field === "isActive"
            ? (newValue ? "Event is now Active" : "Event is now Hidden")
            : field === "isFeatured"
            ? (newValue ? "Marked as Featured" : "Removed from Featured")
            : (newValue ? "Visible to Franchises" : "Hidden from Franchises")
        );
      } else {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, [field]: currentValue } : e))
        );
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, [field]: currentValue } : e))
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
      } else if (itemToDelete.type === "BROADCAST_NOTICE") {
        const res = await deleteBroadcastNotice(itemToDelete.id);
        if (res.success) {
          toast.success("Notice circular removed");
          setBroadcastNotices((prev) => prev.filter((n) => n.id !== itemToDelete.id));
          loadNoticeConfig();
        } else {
          toast.error("Failed to delete notice");
        }
      } else if (itemToDelete.type === "PUBLIC_NOTICE") {
        const res = await deleteCenterNotice(itemToDelete.id, null);
        if (res.success) {
          toast.success("Public notice removed from landing ticker");
          setPublicNotices((prev) => prev.filter((n) => n.id !== itemToDelete.id));
        } else {
          toast.error("Failed to delete public notice");
        }
      }
    } catch (err: any) {
      toast.error("Delete operation failed");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Standardized Pagination helper following AGENTS.md rule 6
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Events & Notice Management"
        description="Organize centralized events for all franchises, broadcast directives, and manage storage retention."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadData();
              loadNoticeConfig();
            }}
            disabled={isLoading}
            className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNoticeDialogOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-amber-500/20 text-amber-600 hover:bg-amber-500/10"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Broadcast Notice
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreateEvent}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Event
          </Button>
        </div>
      </AdminPageHeader>

      {/* 2. Stat Cards Grid (Smart Dynamic Header) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {activeTab === "franchise-requests" ? (
          <>
            <StatCard
              label="Total Inquiries"
              value={franchiseRequests.length}
              subtext="All franchise queries & support"
              icon={<Inbox className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Pending Action"
              value={franchiseRequests.filter(r => (r.status === "PENDING" || (!r.status && !r.isRead))).length}
              subtext="Awaiting Head Office review"
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="In Progress"
              value={franchiseRequests.filter(r => r.status === "IN_PROGRESS").length}
              subtext="Under investigation / processing"
              icon={<RefreshCw className="h-5 w-5 text-sky-500" />}
              color="sky"
            />
            <StatCard
              label="Resolved / Closed"
              value={franchiseRequests.filter(r => r.status === "RESOLVED" || r.status === "REJECTED" || (r.isRead && !r.status)).length}
              subtext="Successfully answered / closed"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
          </>
        ) : activeTab === "noticepad" ? (
          <>
            <StatCard
              label="Total Circulars"
              value={broadcastNotices.length}
              subtext="A4 printable circulars"
              icon={<FileText className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Published & Live"
              value={broadcastNotices.filter((n) => n.status === "PUBLISHED" || (!n.status && (!n.scheduledFor || new Date(n.scheduledFor) <= new Date()))).length}
              subtext="Active on franchise dashboards"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
            <StatCard
              label="Scheduled Circulars"
              value={broadcastNotices.filter((n) => n.status === "SCHEDULED" || (n.scheduledFor && new Date(n.scheduledFor) > new Date())).length}
              subtext="Scheduled for release"
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Urgent Directives"
              value={broadcastNotices.filter((n) => n.type === "WARNING" || n.priority === "URGENT").length}
              subtext="High-priority compliance notices"
              icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}
              color="rose"
            />
          </>
        ) : activeTab === "config" ? (
          <>
            <StatCard
              label="Total DB Records"
              value={storageStats.totalNotifications}
              subtext="Notifications in database"
              icon={<Database className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Broadcast Circulars"
              value={storageStats.broadcastCircularsCount}
              subtext="Active system circulars"
              icon={<Megaphone className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Eligible for Cleanup"
              value={storageStats.eligibleForCleanupCount}
              subtext={`Stale records > ${retentionConfig.retentionDays} days`}
              icon={<Trash2 className="h-5 w-5 text-rose-500" />}
              color="rose"
            />
            <StatCard
              label="Storage Retention"
              value={`${retentionConfig.retentionDays} Days`}
              subtext={retentionConfig.autoCleanEnabled ? "Auto-Cleaning Active" : "Manual Cleanup Only"}
              icon={<HardDrive className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
          </>
        ) : activeTab === "notices" || activeTab === "global-ticker" ? (
          <>
            <StatCard
              label="Head Office Circulars"
              value={stats.broadcastNoticesCount}
              subtext="Active admin notices & directives"
              icon={<Megaphone className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Urgent Alerts"
              value={stats.urgentNoticesCount}
              subtext="Priority directives dispatched"
              icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}
              color="rose"
            />
            <StatCard
              label="Center Specific"
              value={broadcastNotices.filter((n) => !!n.workspaceId).length}
              subtext="Directives to individual centers"
              icon={<Building2 className="h-5 w-5 text-indigo-500" />}
              color="indigo"
            />
            <StatCard
              label="Landing Ticker"
              value={publicNotices.length}
              subtext="Public announcements on website"
              icon={<Globe className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total Events"
              value={stats.totalEvents}
              subtext={`${stats.globalEventsCount} Organized for All Franchises`}
              icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
            <StatCard
              label="Upcoming Events"
              value={stats.upcomingCount}
              subtext="Scheduled across all centers"
              icon={<Clock className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
            <StatCard
              label="Head Office Circulars"
              value={stats.broadcastNoticesCount}
              subtext="Active admin notices & directives"
              icon={<Megaphone className="h-5 w-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              label="Storage Retention"
              value={`${retentionConfig.retentionDays} Days`}
              subtext={retentionConfig.autoCleanEnabled ? "Auto-Cleaning Active" : "Manual Cleanup Only"}
              icon={<HardDrive className="h-5 w-5 text-indigo-500" />}
              color="indigo"
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
          <Megaphone className="w-3.5 h-3.5" />
          Broadcast Circulars ({broadcastNotices.length})
        </button>

        <button
          onClick={() => setActiveTab("global-ticker")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "global-ticker"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          Public Landing Ticker ({publicNotices.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("config");
            loadNoticeConfig();
          }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "config"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          Config & Storage Cleanup
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
          onClick={() => { setActiveTab("franchise-requests"); loadFranchiseRequests(); }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "franchise-requests"
              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Inbox className="w-3.5 h-3.5 text-indigo-500" />
          Franchise Requests
          {pendingFrRequestsCount > 0 && (
            <span className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
              {pendingFrRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. Main Content */}
      {activeTab === "franchise-requests" ? (
        <div className="space-y-4">
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            {/* Filter Toolbar with Smart Search */}
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative w-full md:max-w-[380px] group">
                <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search center name, code (e.g. WB-124), subject, or ref no..."
                  value={frSearchQuery}
                  onChange={(e) => setFrSearchQuery(e.target.value)}
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={frRequestFilter} onValueChange={(v: any) => setFrRequestFilter(v)}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="REJECTED">Closed / Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={frCategoryFilter} onValueChange={(val: any) => setFrCategoryFilter(val)}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {REQUEST_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadFranchiseRequests}
                  disabled={isLoadingFrRequests}
                  className="h-8 sm:h-9 px-2.5 rounded-lg text-xs font-semibold gap-1.5"
                  title="Reload Requests"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoadingFrRequests && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoadingFrRequests ? (
                <div className="flex items-center justify-center h-44 text-xs text-slate-400 gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                  <span>Loading franchise requests...</span>
                </div>
              ) : franchiseRequests.filter(r => {
                  const reqStatus = r.status || (r.isRead ? "RESOLVED" : "PENDING");
                  if (frRequestFilter !== "ALL" && reqStatus !== frRequestFilter) return false;
                  if (frCategoryFilter !== "ALL" && (r.category || "General") !== frCategoryFilter) return false;
                  if (frSearchQuery.trim()) {
                    const q = frSearchQuery.toLowerCase().trim();
                    const titleMatch = (r.title || "").toLowerCase().includes(q);
                    const msgMatch = (r.message || "").toLowerCase().includes(q);
                    const refMatch = (r.refNo || "").toLowerCase().includes(q);
                    const centerNameMatch = (r.workspace?.name || "").toLowerCase().includes(q);
                    const centerCodeMatch = (r.workspace?.centerCode || "").toLowerCase().includes(q);
                    const subdomainMatch = (r.workspace?.subdomain || "").toLowerCase().includes(q);
                    const districtMatch = (r.workspace?.district || "").toLowerCase().includes(q);
                    const submitterMatch = (r.user?.name || "").toLowerCase().includes(q) || (r.user?.email || "").toLowerCase().includes(q);
                    if (!titleMatch && !msgMatch && !refMatch && !centerNameMatch && !centerCodeMatch && !subdomainMatch && !districtMatch && !submitterMatch) return false;
                  }
                  return true;
                }).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-44 gap-2.5 text-slate-400 p-6 text-center">
                  <Inbox className="h-9 w-9 opacity-25" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No requests found</p>
                  <p className="text-[11px] text-slate-400 max-w-sm">No franchise center inquiries match your current search and filter selections.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {franchiseRequests
                    .filter(r => {
                      const reqStatus = r.status || (r.isRead ? "RESOLVED" : "PENDING");
                      if (frRequestFilter !== "ALL" && reqStatus !== frRequestFilter) return false;
                      if (frCategoryFilter !== "ALL" && (r.category || "General") !== frCategoryFilter) return false;
                      if (frSearchQuery.trim()) {
                        const q = frSearchQuery.toLowerCase().trim();
                        const titleMatch = (r.title || "").toLowerCase().includes(q);
                        const msgMatch = (r.message || "").toLowerCase().includes(q);
                        const refMatch = (r.refNo || "").toLowerCase().includes(q);
                        const centerNameMatch = (r.workspace?.name || "").toLowerCase().includes(q);
                        const centerCodeMatch = (r.workspace?.centerCode || "").toLowerCase().includes(q);
                        const subdomainMatch = (r.workspace?.subdomain || "").toLowerCase().includes(q);
                        const districtMatch = (r.workspace?.district || "").toLowerCase().includes(q);
                        const submitterMatch = (r.user?.name || "").toLowerCase().includes(q) || (r.user?.email || "").toLowerCase().includes(q);
                        if (!titleMatch && !msgMatch && !refMatch && !centerNameMatch && !centerCodeMatch && !subdomainMatch && !districtMatch && !submitterMatch) return false;
                      }
                      return true;
                    })
                    .map((req) => {
                      const status = req.status || (req.isRead ? "RESOLVED" : "PENDING");
                      const category = req.category || "General";

                      // Clean Category Icon Component
                      const CategoryIcon =
                        category === "Technical" ? Wrench :
                        category === "Financial" ? Coins :
                        category === "Operational" ? Building2 :
                        category === "Complaint" ? AlertTriangle :
                        FileText;

                      const categoryColor =
                        category === "Technical" ? "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50" :
                        category === "Financial" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50" :
                        category === "Operational" ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50" :
                        category === "Complaint" ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50" :
                        "text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";

                      return (
                        <div
                          key={req.id}
                          className={cn(
                            "flex flex-col lg:flex-row items-start lg:items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3.5 group border-l-[3px]",
                            status === "RESOLVED" ? "border-emerald-500" :
                            status === "IN_PROGRESS" ? "border-sky-500" :
                            status === "REJECTED" ? "border-slate-400 dark:border-slate-600" :
                            "border-amber-500"
                          )}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 shadow-xs", categoryColor)}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                                  {req.title}
                                </p>
                                {req.refNo && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {req.refNo}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {req.message}
                              </p>

                              <div className="flex items-center gap-2.5 pt-0.5 flex-wrap text-[10px]">
                                {req.workspace && (
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                                    <Building2 className="h-3 w-3" />
                                    {req.workspace.name} {req.workspace.centerCode ? `[${req.workspace.centerCode}]` : ""}
                                  </span>
                                )}

                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                    status === "RESOLVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" :
                                    status === "IN_PROGRESS" ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300" :
                                    status === "REJECTED" ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300" :
                                    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                                  )}
                                >
                                  {status === "IN_PROGRESS" ? "In Progress" : status}
                                </Badge>

                                <Badge
                                  className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                                    req.priority === "URGENT" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-extrabold" :
                                    req.priority === "HIGH" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" :
                                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  )}
                                >
                                  {req.priority}
                                </Badge>

                                <span className="text-slate-400 font-medium">
                                  {new Date(req.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>

                                {req.user && (
                                  <span className="text-slate-500 font-medium hidden sm:inline">
                                    Submitted by: <strong className="text-slate-700 dark:text-slate-300">{req.user.name}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenManageModal(req)}
                              className="h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                            >
                              <Edit2 className="h-3 w-3" />
                              Manage & Respond
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickToggleStatus(req)}
                              title={status === "RESOLVED" ? "Mark Pending" : "Mark Resolved"}
                              className={cn(
                                "h-8 px-2.5 rounded-lg text-xs font-semibold",
                                status === "RESOLVED" ? "text-slate-600 hover:text-slate-900" : "text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30"
                              )}
                            >
                              {status === "RESOLVED" ? (
                                <RotateCcw className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manage Request Modal */}
          <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
            <DialogContent className="max-w-xl rounded-2xl p-4 sm:p-5">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {selectedRequestForManage?.refNo || "SUPPORT-REQ"}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border-none",
                      selectedRequestForManage?.priority === "URGENT" ? "bg-rose-100 text-rose-700" :
                      selectedRequestForManage?.priority === "HIGH" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    )}
                  >
                    {selectedRequestForManage?.priority}
                  </Badge>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedRequestForManage?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Update status, review center query, and send official Head Office response.
                </DialogDescription>
              </DialogHeader>

              {selectedRequestForManage && (
                <div className="space-y-4 py-2">
                  {/* Franchise Context Card */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                        {selectedRequestForManage.workspace?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Center Code: <span className="font-mono font-bold text-indigo-600">{selectedRequestForManage.workspace?.centerCode || "N/A"}</span>
                        {selectedRequestForManage.workspace?.district && ` • ${selectedRequestForManage.workspace.district}, ${selectedRequestForManage.workspace.state || ""}`}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <p className="font-medium text-slate-700 dark:text-slate-300">By {selectedRequestForManage.user?.name || "Center Admin"}</p>
                      <p className="text-[10px] text-slate-400">{selectedRequestForManage.user?.email || ""}</p>
                    </div>
                  </div>

                  {/* Query Body Card */}
                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Franchise Message / Query</Label>
                    <div className="mt-1 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                      {selectedRequestForManage.message}
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resolution Status</Label>
                    <Select
                      value={manageStatus}
                      onValueChange={(val: any) => setManageStatus(val)}
                    >
                      <SelectTrigger className="h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending (Awaiting Action)</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress (Under Review / Assigned)</SelectItem>
                        <SelectItem value="RESOLVED">Resolved (Action Completed)</SelectItem>
                        <SelectItem value="REJECTED">Closed / Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Head Office Response Note */}
                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Head Office Response / Guidance <span className="text-[10px] text-slate-400 font-normal">(Optional — will notify Franchise Admin)</span>
                    </Label>
                    <Textarea
                      placeholder="Type response remarks or action taken for the franchise..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      rows={4}
                      className="mt-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManageModalOpen(false)}
                  disabled={isSavingStatus}
                  className="h-9 px-3 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveRequestStatus}
                  disabled={isSavingStatus}
                  className="h-9 px-4 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                >
                  {isSavingStatus ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {isSavingStatus ? "Saving..." : "Save & Notify Center"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : activeTab === "noticepad" ? (
        <NoticepadDocumentViewer
          notices={broadcastNotices}
          selectedNoticeId={selectedNoticeForPad?.id || null}
          isSuperAdmin={true}
          superAdminSignature={superAdminSignature}
          workspacesList={workspaces}
          onRefresh={loadData}
          onNoticeSelect={(n) => setSelectedNoticeForPad(n)}
        />
      ) : (
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        {/* Card Header Toolbar (for list/table tabs) */}
        {activeTab !== "config" && (
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:max-w-[300px] group">
              <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={
                  activeTab === "events"
                    ? "Search events by title or location..."
                    : activeTab === "notices"
                    ? "Search notices, circulars, centers..."
                    : "Search ticker notices..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "events" && (
                <>
                  <Select value={workspaceFilter} onValueChange={(val) => setWorkspaceFilter(val as string)}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[170px]">
                      <SelectValue placeholder="All Centers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Centers & Global</SelectItem>
                      <SelectItem value="GLOBAL">All Franchises (Global)</SelectItem>
                      {workspaces.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id}>
                          {ws.name} ({ws.subdomain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as string)}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[120px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active Only</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="FEATURED">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {activeTab === "notices" && (
                <>
                  <Select value={noticePriorityFilter} onValueChange={(val: any) => setNoticePriorityFilter(val as string)}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[130px]">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Priorities</SelectItem>
                      <SelectItem value="URGENT">Urgent Directives</SelectItem>
                      <SelectItem value="HIGH">High Priority</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={noticeTargetFilter} onValueChange={(val: any) => setNoticeTargetFilter(val as string)}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[140px]">
                      <SelectValue placeholder="All Recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Recipients</SelectItem>
                      <SelectItem value="ALL_FRANCHISES">All Centers</SelectItem>
                      <SelectItem value="SPECIFIC">Specific Centers</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </CardHeader>
        )}

        {/* Card Content Body */}
        <CardContent className="p-0">
          {/* TAB 1: EVENTS */}
          {activeTab === "events" && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3.5 group border-l-[3px] border-l-primary"
                >
                  <div className="flex items-start sm:items-center gap-3 w-full lg:w-auto">
                    {/* Event Thumbnail */}
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
                          Star
                        </span>
                      )}
                    </div>

                    {/* Event Primary Info */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!event.workspaceId ? (
                          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Organized for All Franchises
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            {event.workspace?.name || "Center Event"}
                          </Badge>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400">&bull;</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {event.category || "General Event"}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {event.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {event.time}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1 max-w-[200px] truncate">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Toggles */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {!event.workspaceId && (
                        <div
                          className="flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/50"
                          title="Click to toggle visibility on franchise center sites"
                          onClick={() => handleToggleEventField(event.id, "showOnFranchises", event.showOnFranchises !== false)}
                        >
                          <span className="text-[10px] font-medium text-slate-500">Franchises:</span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={event.showOnFranchises !== false}
                              onCheckedChange={() => handleToggleEventField(event.id, "showOnFranchises", event.showOnFranchises !== false)}
                              className="scale-75 shrink-0"
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className="flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/50"
                        title="Click to toggle public status"
                        onClick={() => handleToggleEventField(event.id, "isActive", event.isActive)}
                      >
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", event.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-200/80 text-slate-500")}>
                          {event.isActive ? "Active" : "Hidden"}
                        </span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={event.isActive}
                            onCheckedChange={() => handleToggleEventField(event.id, "isActive", event.isActive)}
                            className="scale-75 shrink-0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No events found</p>
                  <p className="text-[11px] text-slate-400">Create a centralized event for all franchises or adjust your filters.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROPER TABLE FOR BROADCAST CIRCULARS */}
          {activeTab === "notices" && (
            <div>
              <Table>
                <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 min-w-[260px]">
                      Directive Subject & Instructions
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 min-w-[170px]">
                      Target Recipient(s)
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-28 text-center">
                      Priority Level
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-32">
                      Broadcast Date
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 min-w-[110px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedNotices.map((notice) => {
                    const isUrgent = notice.type === "WARNING";
                    const isTargetAll = !notice.workspaceId;

                    return (
                      <TableRow
                        key={notice.id}
                        className={cn(
                          "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all border-none group",
                          isUrgent ? "border-l-[3px] border-l-red-500" : "border-l-[3px] border-l-amber-500"
                        )}
                      >
                        {/* Notice Subject & Message */}
                        <TableCell className="py-3 px-3 sm:px-4">
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                                {notice.title}
                              </span>
                              {notice.link && notice.link !== "/admin/events-notices" && (
                                <a
                                  href={notice.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:opacity-80 shrink-0"
                                  title="Has URL link or attachment"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {notice.message}
                            </p>
                          </div>
                        </TableCell>

                        {/* Target Recipient(s) */}
                        <TableCell className="py-3 px-3">
                          {isTargetAll ? (
                            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit">
                              <Building2 className="h-3 w-3" /> All Franchises
                            </Badge>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block truncate max-w-[160px]">
                                {notice.workspace?.name || "Specific Center"}
                              </span>
                              {notice.workspace?.centerCode && (
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                  {notice.workspace.centerCode}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Priority Level */}
                        <TableCell className="py-3 px-3 text-center">
                          {isUrgent ? (
                            <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-none text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                              Urgent
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Official
                            </Badge>
                          )}
                        </TableCell>

                        {/* Broadcast Date */}
                        <TableCell className="py-3 px-3">
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {new Date(notice.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </TableCell>

                        {/* Actions */}
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
                              onClick={() => setViewingCircular(notice)}
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                              title="Inspect Directive Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {notice.link && notice.link !== "/admin/events-notices" && (
                              <a
                                href={notice.link}
                                target="_blank"
                                rel="noreferrer"
                                className="h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                                title="Open Link"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setItemToDelete({
                                  type: "BROADCAST_NOTICE",
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
                    );
                  })}
                </TableBody>
              </Table>

              {filteredNotices.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No circular notices found</p>
                  <p className="text-[11px] text-slate-400">Broadcast important directives to center directors using the button above.</p>
                </div>
              )}

              {/* Standardized Pagination System */}
              {filteredNotices.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Showing {(noticePage - 1) * PAGE_SIZE + 1} to {Math.min(noticePage * PAGE_SIZE, filteredNotices.length)} of {filteredNotices.length} notices
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoticePage((p) => Math.max(1, p - 1))}
                      disabled={noticePage <= 1}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {getPageNumbers(noticePage, totalNoticePages).map((p, idx) =>
                      p === "..." ? (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>
                      ) : (
                        <Button
                          key={`page-${p}`}
                          variant={noticePage === p ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setNoticePage(p as number)}
                          className="h-7 w-7 rounded-md font-semibold text-xs p-0"
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoticePage((p) => Math.min(totalNoticePages, p + 1))}
                      disabled={noticePage >= totalNoticePages}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPER TABLE FOR GLOBAL WEBSITE TICKER NOTICES */}
          {activeTab === "global-ticker" && (
            <div>
              <Table>
                <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 min-w-[280px]">
                      Ticker Notice Title
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-32">
                      Audience
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-28 text-center">
                      Priority
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 w-32">
                      Published On
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2.5 px-3 sm:px-4 w-24">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedPublicNotices.map((notice) => (
                    <TableRow
                      key={notice.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all border-none border-l-[3px] border-l-blue-500"
                    >
                      <TableCell className="py-3 px-3 sm:px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                            {notice.title}
                          </span>
                          {notice.message && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{notice.message}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <Badge className="bg-blue-500/10 text-blue-600 border-none text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          Public Web
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {notice.priority || "NORMAL"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{notice.date}</span>
                      </TableCell>
                      <TableCell className="text-right py-3 px-3 sm:px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setItemToDelete({
                              type: "PUBLIC_NOTICE",
                              id: notice.id,
                              title: notice.title,
                            })
                          }
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPublicNotices.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <Globe className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No public notices on ticker</p>
                  <p className="text-[11px] text-slate-400">Notices broadcasted to 'Public Website' will appear here and on the main website ticker.</p>
                </div>
              )}

              {filteredPublicNotices.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <span className="text-xs font-medium text-slate-500">
                    Showing {(publicNoticePage - 1) * PAGE_SIZE + 1} to {Math.min(publicNoticePage * PAGE_SIZE, filteredPublicNotices.length)} of {filteredPublicNotices.length} ticker items
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPublicNoticePage((p) => Math.max(1, p - 1))}
                      disabled={publicNoticePage <= 1}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Page {publicNoticePage} of {totalPublicNoticePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPublicNoticePage((p) => Math.min(totalPublicNoticePages, p + 1))}
                      disabled={publicNoticePage >= totalPublicNoticePages}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTICE CONFIG & STORAGE CLEANING */}
          {activeTab === "config" && (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Policy Configuration Card */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-primary" />
                      Notice Storage Retention & Auto-Clean Schedule
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure how long notices and broadcast circulars are retained before automatic pruning to maintain fast database storage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Auto-Cleanup Active:
                    </span>
                    <Switch
                      checked={retentionConfig.autoCleanEnabled}
                      onCheckedChange={(val) => setRetentionConfig({ ...retentionConfig, autoCleanEnabled: val })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Retention Cleaning Period */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Storage Retention Period (Cleaning Threshold)
                    </Label>
                    <Select
                      value={String(retentionConfig.retentionDays)}
                      onValueChange={(val) => setRetentionConfig({ ...retentionConfig, retentionDays: Number(val) })}
                    >
                      <SelectTrigger className="h-9 text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder="Select Cleaning Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Days (1 Month Storage)</SelectItem>
                        <SelectItem value="60">60 Days (2 Months Storage)</SelectItem>
                        <SelectItem value="90">90 Days (3 Months Storage)</SelectItem>
                        <SelectItem value="180">180 Days (6 Months Storage)</SelectItem>
                        <SelectItem value="365">365 Days (1 Year Storage - Standard)</SelectItem>
                        <SelectItem value="730">730 Days (2 Years Long-Term Storage)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Records older than this period will be pruned during maintenance routines.
                    </p>
                  </div>

                  {/* Clean Target Scope */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Scope of Cleanup Targets
                    </Label>
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={retentionConfig.cleanTargets.includes("CIRCULAR")}
                          onChange={(e) => {
                            const newTargets = e.target.checked
                              ? [...retentionConfig.cleanTargets, "CIRCULAR" as const]
                              : retentionConfig.cleanTargets.filter((t) => t !== "CIRCULAR");
                            setRetentionConfig({ ...retentionConfig, cleanTargets: newTargets });
                          }}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>Super Admin Broadcast Circulars & Directives</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={retentionConfig.cleanTargets.includes("READ_NOTIFICATION")}
                          onChange={(e) => {
                            const newTargets = e.target.checked
                              ? [...retentionConfig.cleanTargets, "READ_NOTIFICATION" as const]
                              : retentionConfig.cleanTargets.filter((t) => t !== "READ_NOTIFICATION");
                            setRetentionConfig({ ...retentionConfig, cleanTargets: newTargets });
                          }}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>Archived / Read System Notifications</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={retentionConfig.cleanTargets.includes("CENTER_NOTICE")}
                          onChange={(e) => {
                            const newTargets = e.target.checked
                              ? [...retentionConfig.cleanTargets, "CENTER_NOTICE" as const]
                              : retentionConfig.cleanTargets.filter((t) => t !== "CENTER_NOTICE");
                            setRetentionConfig({ ...retentionConfig, cleanTargets: newTargets });
                          }}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>Expired Public Website Ticker Notices</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    className="h-8 px-4 text-xs font-semibold rounded-lg gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {isSavingConfig ? "Saving Policy..." : "Save Retention Policy"}
                  </Button>
                </div>
              </div>

              {/* Manual Cleanup Action Box */}
              <div className="border border-red-200/80 dark:border-red-900/50 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-red-50/40 via-white to-red-50/20 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <Database className="h-4 w-4" />
                      Immediate Database Storage Maintenance
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                      Run an instant purge of stale circulars and expired notifications older than{" "}
                      <strong className="text-slate-900 dark:text-white">{retentionConfig.retentionDays} days</strong>.
                      This maintains rapid query speeds on PostgreSQL serverless storage.
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsCleanupConfirmOpen(true)}
                    disabled={isCleaningStorage}
                    className="h-8 sm:h-9 px-3.5 text-xs font-semibold rounded-lg shrink-0 gap-1.5 shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Run Storage Cleanup Now</span>
                  </Button>
                </div>

                {retentionConfig.lastCleanedAt && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-red-100 dark:border-red-950/40 flex items-center justify-between">
                    <span>
                      Last cleaned: <strong>{new Date(retentionConfig.lastCleanedAt).toLocaleString()}</strong>
                    </span>
                    <span>
                      Freed <strong>{retentionConfig.lastCleanedCount || 0}</strong> obsolete records
                    </span>
                  </div>
                )}
              </div>
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
        isSuperAdmin={true}
        workspaces={workspaces}
        allEvents={events}
      />

      {/* BROADCAST NOTICE MODAL WITH MULTI-FRANCHISE SELECTOR */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-2xl p-0 max-h-[85vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl">
          {/* STATIC TOP HEADER */}
          <div className="flex-none p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pr-12">
            <DialogHeader className="p-0 space-y-1 text-left">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-500 shrink-0" />
                Broadcast Notice Circular
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Dispatch an official directive to center directors or publish to the public website.
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
                placeholder="e.g. Mandatory Submission: Annual Center Verification Audit"
                className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Recipient</Label>
                <Select
                  value={noticeFormData.target}
                  onValueChange={(val: any) => setNoticeFormData({ ...noticeFormData, target: val })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold">
                    <SelectValue placeholder="Select Target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_FRANCHISES">All Franchise Admins (Broadcast)</SelectItem>
                    <SelectItem value="SPECIFIC_FRANCHISE">Specific Franchise Center(s)</SelectItem>
                    <SelectItem value="ALL_STUDENTS">All Students Nationwide (Student Portal)</SelectItem>
                    <SelectItem value="PUBLIC">Public Website Notice Ticker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</Label>
                <Select
                  value={normalizeNoticeCategory(noticeFormData.category)}
                  onValueChange={(val: any) => setNoticeFormData({ ...noticeFormData, category: val })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold">
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Level</Label>
                <Select
                  value={noticeFormData.priority}
                  onValueChange={(val: any) => setNoticeFormData({ ...noticeFormData, priority: val })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal Information</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="URGENT">Urgent Action Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* MULTI-FRANCHISE SELECTION WITH SEARCH, CODE, & NO RAW IDs */}
            {noticeFormData.target === "SPECIFIC_FRANCHISE" && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Select Target Center(s) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Choose 1 or multiple franchise centers</span>
                </Label>
                <FranchiseMultiSelect
                  workspaces={workspaces}
                  selectedWorkspaceIds={noticeFormData.workspaceIds}
                  onChange={(ids) => setNoticeFormData({ ...noticeFormData, workspaceIds: ids })}
                  placeholder="Search centers by name, center code, or city..."
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Circular Message / Instructions *</Label>
              <Textarea
                value={noticeFormData.message}
                onChange={(e) => setNoticeFormData({ ...noticeFormData, message: e.target.value })}
                placeholder="Full details of circular, deadline date, guidelines for administration..."
                className="min-h-[100px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document URL / Link (Optional)</Label>
              <Input
                value={noticeFormData.link}
                onChange={(e) => setNoticeFormData({ ...noticeFormData, link: e.target.value })}
                placeholder="e.g. https://... or /guidelines.pdf"
                className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-normal"
              />
            </div>
          </div>

          {/* STATIC BOTTOM ACTION FOOTER */}
          <div className="flex-none p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNoticeDialogOpen(false)}
              className="h-8 sm:h-9 text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBroadcastNotice}
              disabled={isBroadcasting}
              className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              {isBroadcasting ? "Broadcasting..." : "Broadcast Notice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW CIRCULAR DETAILS MODAL */}
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
                      viewingCircular.type === "WARNING" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
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
                  Target: {viewingCircular.workspace?.name ? `${viewingCircular.workspace.name} (${viewingCircular.workspace.centerCode || "Center"})` : "All Franchise Centers"}
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
                    Attached Document / External URL
                  </span>
                  <a
                    href={viewingCircular.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Open Resource</span>
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

      {/* CONFIRM IMMEDIATE STORAGE CLEANUP DIALOG */}
      <ConfirmDialog
        open={isCleanupConfirmOpen}
        onOpenChange={setIsCleanupConfirmOpen}
        title="Execute Storage Maintenance Cleanup?"
        description={`This will permanently remove ${storageStats.eligibleForCleanupCount} notices and obsolete notification records older than ${retentionConfig.retentionDays} days. This action frees storage on PostgreSQL and cannot be undone.`}
        confirmText="Confirm & Prune Storage"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleExecuteCleanup}
      />

      {/* CONFIRM DELETE DIALOG FOR NOTICES & EVENTS */}
      <ConfirmDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={
          itemToDelete?.type === "EVENT"
            ? "Delete Event?"
            : itemToDelete?.type === "BROADCAST_NOTICE"
            ? "Delete Circular Notice?"
            : "Remove Public Notice?"
        }
        description={`Are you sure you want to permanently delete "${itemToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
