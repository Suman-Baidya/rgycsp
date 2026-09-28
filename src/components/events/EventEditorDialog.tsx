"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Video,
  Users,
  ListTodo,
  Images,
  LayoutDashboard,
  Building2,
  Globe,
  Sparkles
} from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createAdminEvent, updateAdminEvent } from "@/app/actions/events-notices";

const TABS = [
  { id: "basic", label: "Basic Info", icon: LayoutDashboard, desc: "TITLE, DATE" },
  { id: "media", label: "Media & Bio", icon: Video, desc: "BANNER, VIDEO" },
  { id: "guests", label: "Special Guests", icon: Users, desc: "SPEAKERS" },
  { id: "schedule", label: "Itinerary", icon: ListTodo, desc: "EVENT TIMELINE" },
  { id: "gallery", label: "Photo Gallery", icon: Images, desc: "EVENT MEMORIES" },
];

const DEFAULT_CATEGORIES = [
  "Annual & Award Meet",
  "Technical Workshop",
  "Career & Placement Seminar",
  "Convocation Ceremony",
  "National Competition",
  "Cultural Exhibition",
  "Webinar & Online Session",
  "Academic Orientation"
];

export interface EventEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any | null; // null for create, event object for edit
  onSaveSuccess: () => void;
  isSuperAdmin?: boolean;
  workspaces?: { id: string; name: string; subdomain: string; centerCode?: string | null }[];
  currentWorkspaceId?: string; // For franchise admin
  workspaceSubdomain?: string;
  allEvents?: any[];
}

export function EventEditorDialog({
  open,
  onOpenChange,
  event,
  onSaveSuccess,
  isSuperAdmin = false,
  workspaces = [],
  currentWorkspaceId,
  workspaceSubdomain = "events",
  allEvents = []
}: EventEditorDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Form State matching the database model
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    location: "",
    category: "Annual & Award Meet",
    hostName: "",
    image: "",
    videoUrl: "",
    isActive: true,
    isFeatured: false,
    workspaceId: "ALL", // "ALL" = Global, or specific workspace id
    showOnFranchises: true, // Super admin option to show on franchise landing pages
    broadcastNotice: true,  // Super admin option to notify franchises
    guests: [],
    programDetails: [],
    galleryImages: []
  });

  // Extract unique categories from all events + defaults
  const categoriesList = React.useMemo(() => {
    const list = new Set(DEFAULT_CATEGORIES);
    allEvents.forEach((e) => {
      if (e.category) list.add(e.category);
    });
    return Array.from(list);
  }, [allEvents]);

  // Synchronize formData when event prop changes
  useEffect(() => {
    if (event) {
      let parsedGuests: any[] = [];
      let parsedProgram: any[] = [];
      let parsedGallery: any[] = [];

      try {
        parsedGuests = typeof event.guests === "string" ? JSON.parse(event.guests) : (event.guests || []);
      } catch (e) {
        parsedGuests = [];
      }

      try {
        parsedProgram = typeof event.programDetails === "string" ? JSON.parse(event.programDetails) : (event.programDetails || []);
      } catch (e) {
        parsedProgram = [];
      }

      try {
        parsedGallery = typeof event.galleryImages === "string" ? JSON.parse(event.galleryImages) : (event.galleryImages || []);
      } catch (e) {
        parsedGallery = [];
      }

      // Check if showOnFranchises was stored in metadata / programDetails or default true
      const showOnFranchises = event.showOnFranchises !== undefined ? event.showOnFranchises : true;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? new Date(event.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        time: event.time || "",
        location: event.location || "",
        category: event.category || "Annual & Award Meet",
        hostName: event.hostName || (isSuperAdmin ? "RGYCSP Institute" : "Center Administration"),
        image: event.image || "",
        videoUrl: event.videoUrl || "",
        isActive: event.isActive !== false,
        isFeatured: !!event.isFeatured,
        workspaceId: event.workspaceId || "ALL",
        showOnFranchises,
        broadcastNotice: false,
        guests: parsedGuests,
        programDetails: parsedProgram,
        galleryImages: parsedGallery
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "11:00 AM",
        location: "",
        category: "Annual & Award Meet",
        hostName: isSuperAdmin ? "RGYCSP Institute" : "Center Administration",
        image: "",
        videoUrl: "",
        isActive: true,
        isFeatured: false,
        workspaceId: currentWorkspaceId || "ALL",
        showOnFranchises: true,
        broadcastNotice: isSuperAdmin,
        guests: [],
        programDetails: [],
        galleryImages: []
      });
    }
    setActiveTab("basic");
    setIsCreatingCategory(false);
  }, [event, open, isSuperAdmin, currentWorkspaceId]);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error("Event title is required.");
      return;
    }
    if (!formData.date) {
      toast.error("Event date is required.");
      return;
    }

    setIsSaving(true);
    try {
      let targetWorkspaceId: string | null = null;
      if (isSuperAdmin) {
        targetWorkspaceId = formData.workspaceId === "ALL" ? null : formData.workspaceId;
      } else {
        targetWorkspaceId = currentWorkspaceId || null;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        date: formData.date,
        time: formData.time?.trim() || null,
        location: formData.location?.trim() || null,
        category: formData.category || "General Event",
        hostName: formData.hostName?.trim() || (isSuperAdmin ? "Head Office" : "Center Administration"),
        image: formData.image?.trim() || null,
        videoUrl: formData.videoUrl?.trim() || null,
        workspaceId: targetWorkspaceId,
        isFeatured: Boolean(formData.isFeatured),
        isActive: formData.isActive !== false,
        showOnFranchises: formData.showOnFranchises !== false,
        broadcastNoticeToFranchises: isSuperAdmin && !targetWorkspaceId && !!formData.broadcastNotice,
        guests: formData.guests,
        programDetails: formData.programDetails,
        galleryImages: formData.galleryImages,
      };

      if (event?.id) {
        const res = await updateAdminEvent(event.id, payload);
        if (res.success) {
          toast.success("Event updated successfully");
          onSaveSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to update event");
        }
      } else {
        const res = await createAdminEvent(payload);
        if (res.success) {
          toast.success("Event created successfully");
          onSaveSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to create event");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving the event.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFolder = isSuperAdmin ? "events/banners" : `${workspaceSubdomain}/events`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[610px] max-h-[92vh] p-0 overflow-hidden rounded-2xl flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl">
        <DialogTitle className="sr-only">{event ? "Edit Event" : "Create Event"}</DialogTitle>

        {/* 1. Top Header */}
        <div className="flex-none flex items-center justify-between p-3.5 sm:px-6 sm:py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 z-10 gap-2">
          <div className="flex flex-col">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {event ? "Edit Event" : "Create Event"}
            </h2>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Setup your event details step by step.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-8 sm:h-9 px-3.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 sm:h-9 px-4 sm:px-5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* 2. Body with Sidebar Tabs & Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Sidebar Navigation */}
          <div className="w-56 flex-none bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3 overflow-y-auto hidden md:block space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 text-left p-2.5 rounded-xl transition-all text-xs font-medium relative overflow-hidden",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-inner"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{tab.label}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Selector */}
          <div className="md:hidden flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex overflow-x-auto gap-1.5 no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 relative bg-slate-50/50 dark:bg-slate-950/50">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* TAB 1: BASIC INFO */}
              {activeTab === "basic" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">
                        Essential Information
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        The core details that identify your event.
                      </p>

                      <div className="space-y-3.5">
                        {/* Event Title */}
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Event Title <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                            placeholder="e.g. RGYCSP Annual Excellence Awards & Grand Meet 2027"
                          />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              Date <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                              <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              Time
                            </Label>
                            <div className="relative">
                              <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                              <Input
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium"
                                placeholder="11:00 AM"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Location & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              Location / Venue
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                              <Input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium"
                                placeholder="e.g. Darjeeling, Grand Auditorium"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 relative">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              Category
                            </Label>
                            {!isCreatingCategory ? (
                              <Select
                                value={formData.category}
                                onValueChange={(val: any) => {
                                  if (val === "CREATE_NEW") {
                                    setIsCreatingCategory(true);
                                    setFormData({ ...formData, category: "" });
                                  } else {
                                    setFormData({ ...formData, category: val });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                                  {categoriesList.map((cat: any) => (
                                    <SelectItem key={cat} value={cat} className="text-xs rounded-lg cursor-pointer font-medium">
                                      {cat}
                                    </SelectItem>
                                  ))}
                                  <SelectItem
                                    value="CREATE_NEW"
                                    className="text-xs rounded-lg cursor-pointer text-primary font-bold bg-primary/5 mt-1 border-t border-primary/10"
                                  >
                                    + Create New Category
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  autoFocus
                                  value={formData.category}
                                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                  placeholder="Enter category name..."
                                  className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    setIsCreatingCategory(false);
                                    if (!categoriesList.includes(formData.category)) {
                                      setFormData({ ...formData, category: categoriesList[0] || "Annual & Award Meet" });
                                    }
                                  }}
                                  className="h-9 px-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Host Name & Scope (2 columns) */}
                        <div className={cn("grid gap-3", isSuperAdmin ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              Host Name
                            </Label>
                            <Input
                              value={formData.hostName}
                              onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                              className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium"
                              placeholder="e.g. RGYCSP Institute"
                            />
                          </div>

                          {isSuperAdmin && (
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                Target Franchise Scope
                              </Label>
                              <Select
                                value={formData.workspaceId}
                                onValueChange={(val) => setFormData({ ...formData, workspaceId: val as string })}
                              >
                                <SelectTrigger className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                  <SelectValue placeholder="Scope" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ALL">All Franchises (Global Head Office)</SelectItem>
                                  {workspaces.map((ws) => (
                                    <SelectItem key={ws.id} value={ws.id}>
                                      {ws.name} ({ws.subdomain})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Super Admin Additional Options if Global Event */}
                        {isSuperAdmin && formData.workspaceId === "ALL" && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div
                              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                              onClick={() => setFormData((prev: any) => ({ ...prev, showOnFranchises: !prev.showOnFranchises }))}
                            >
                              <div className="pr-2 pointer-events-none select-none">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight">
                                  Show on Franchise Sites
                                </span>
                                <span className="text-[9px] text-muted-foreground">Visible on center landing pages</span>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Switch
                                  checked={formData.showOnFranchises}
                                  onCheckedChange={(val) => setFormData((prev: any) => ({ ...prev, showOnFranchises: val }))}
                                  className="scale-75 shrink-0"
                                />
                              </div>
                            </div>

                            {!event && (
                              <div
                                className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                                onClick={() => setFormData((prev: any) => ({ ...prev, broadcastNotice: !prev.broadcastNotice }))}
                              >
                                <div className="pr-2 pointer-events-none select-none">
                                  <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 block leading-tight">
                                    Notify Center Admins
                                  </span>
                                  <span className="text-[9px] text-indigo-700 dark:text-indigo-300">Dispatch circular to dashboards</span>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Switch
                                    checked={formData.broadcastNotice}
                                    onCheckedChange={(val) => setFormData((prev: any) => ({ ...prev, broadcastNotice: val }))}
                                    className="scale-75 shrink-0"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Two Status Cards matching screenshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      onClick={() => setFormData((prev: any) => ({ ...prev, isActive: !prev.isActive }))}
                    >
                      <div className="flex flex-col pointer-events-none select-none">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">Public Status</span>
                        <span className="text-[10px] text-muted-foreground">Visible on public pages</span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(val) => setFormData((prev: any) => ({ ...prev, isActive: val }))}
                          className="scale-75"
                        />
                      </div>
                    </div>

                    <div
                      className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      onClick={() => setFormData((prev: any) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    >
                      <div className="flex flex-col pointer-events-none select-none">
                        <span className="font-semibold text-xs text-amber-500">Featured Event</span>
                        <span className="text-[10px] text-muted-foreground">Show as big hero banner</span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={formData.isFeatured}
                          onCheckedChange={(val) => setFormData((prev: any) => ({ ...prev, isFeatured: val }))}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & BIO */}
              {activeTab === "media" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">
                        Media & Bio
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Visuals and detailed description to attract attendees.
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Main Banner Image
                          </Label>
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                            <ImageUpload
                              value={formData.image || ""}
                              onChange={(url) => setFormData({ ...formData, image: url })}
                              label="Upload Event Banner"
                              folder={uploadFolder}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            YouTube Video URL
                          </Label>
                          <div className="relative">
                            <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <Input
                              value={formData.videoUrl || ""}
                              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                              className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium"
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Detailed Description
                          </Label>
                          <Textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[140px] text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-3 font-normal leading-relaxed resize-y"
                            placeholder="Write a compelling, detailed description for this event..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SPECIAL GUESTS */}
              {activeTab === "guests" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Special Guests</h3>
                      <p className="text-xs text-muted-foreground">VIPs, speakers, and performers.</p>
                    </div>
                    <Button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          guests: [...formData.guests, { name: "", role: "", image: "" }]
                        })
                      }
                      variant="outline"
                      className="h-8 px-3 rounded-lg text-xs font-semibold gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Guest
                    </Button>
                  </div>

                  {formData.guests.map((guest: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3.5 relative group"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            guests: formData.guests.filter((_: any, i: number) => i !== idx)
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      <div className="w-full sm:w-28 aspect-square shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                        <ImageUpload
                          value={guest.image || ""}
                          onChange={(url) => {
                            const n = [...formData.guests];
                            n[idx].image = url;
                            setFormData({ ...formData, guests: n });
                          }}
                          label="Photo"
                          folder="events/guests"
                        />
                      </div>

                      <div className="flex-1 space-y-2.5 flex flex-col justify-center pr-8 sm:pr-0">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Guest Name
                          </Label>
                          <Input
                            value={guest.name}
                            onChange={(e) => {
                              const n = [...formData.guests];
                              n[idx].name = e.target.value;
                              setFormData({ ...formData, guests: n });
                            }}
                            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-semibold"
                            placeholder="e.g. Dr. Jane Smith"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Role / Title
                          </Label>
                          <Input
                            value={guest.role}
                            onChange={(e) => {
                              const n = [...formData.guests];
                              n[idx].role = e.target.value;
                              setFormData({ ...formData, guests: n });
                            }}
                            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium"
                            placeholder="e.g. Keynote Speaker"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.guests.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center min-h-[360px] flex flex-col items-center justify-center shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        No Guests Added
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                        Make your event stand out by adding special guests and speakers.
                      </p>
                      <Button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            guests: [...formData.guests, { name: "", role: "", image: "" }]
                          })
                        }
                        variant="outline"
                        className="h-8 text-xs rounded-xl font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add First Guest
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ITINERARY */}
              {activeTab === "schedule" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Event Itinerary</h3>
                      <p className="text-xs text-muted-foreground">Map out the timeline for your attendees.</p>
                    </div>
                    <Button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          programDetails: [...formData.programDetails, { time: "", activity: "", speaker: "" }]
                        })
                      }
                      variant="outline"
                      className="h-8 px-3 rounded-xl text-xs font-semibold gap-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Slot
                    </Button>
                  </div>

                  {formData.programDetails.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
                      {formData.programDetails.map((slot: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 bg-slate-50/70 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                          <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
                            {idx + 1}
                          </span>
                          <Input
                            value={slot.time}
                            onChange={(e) => {
                              const n = [...formData.programDetails];
                              n[idx].time = e.target.value;
                              setFormData({ ...formData, programDetails: n });
                            }}
                            className="w-28 sm:w-32 h-8 text-xs rounded-md bg-white dark:bg-slate-900 border-slate-200 font-semibold shrink-0"
                            placeholder="09:00 AM"
                          />
                          <Input
                            value={slot.activity}
                            onChange={(e) => {
                              const n = [...formData.programDetails];
                              n[idx].activity = e.target.value;
                              setFormData({ ...formData, programDetails: n });
                            }}
                            className="flex-1 h-8 text-xs rounded-md bg-white dark:bg-slate-900 border-slate-200 font-medium min-w-0"
                            placeholder="Activity (e.g. Inauguration, Keynote Address)"
                          />
                          <Input
                            value={slot.speaker}
                            onChange={(e) => {
                              const n = [...formData.programDetails];
                              n[idx].speaker = e.target.value;
                              setFormData({ ...formData, programDetails: n });
                            }}
                            className="w-28 sm:w-36 h-8 text-xs rounded-md bg-white dark:bg-slate-900 border-slate-200 text-xs hidden sm:block shrink-0"
                            placeholder="Speaker"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md shrink-0"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                programDetails: formData.programDetails.filter((_: any, i: number) => i !== idx)
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center min-h-[360px] flex flex-col items-center justify-center shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                        <ListTodo className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        No Schedule Planned
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                        Add time slots, keynote speeches, and sessions to build an itinerary.
                      </p>
                      <Button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            programDetails: [...formData.programDetails, { time: "", activity: "", speaker: "" }]
                          })
                        }
                        variant="outline"
                        className="h-8 text-xs rounded-xl font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add First Time Slot
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PHOTO GALLERY */}
              {activeTab === "gallery" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Photo Gallery</h3>
                      <p className="text-xs text-muted-foreground">Showcase beautiful memories and event highlights.</p>
                    </div>
                    <Button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          galleryImages: [...formData.galleryImages, ""]
                        })
                      }
                      variant="outline"
                      className="h-8 px-3 rounded-xl text-xs font-semibold gap-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Image Slot
                    </Button>
                  </div>

                  {formData.galleryImages.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {formData.galleryImages.map((img: string, idx: number) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-3 right-3 z-10 h-7 w-7 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  galleryImages: formData.galleryImages.filter((_: any, i: number) => i !== idx)
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <ImageUpload
                              value={img}
                              onChange={(url) => {
                                const n = [...formData.galleryImages];
                                n[idx] = url;
                                setFormData({ ...formData, galleryImages: n });
                              }}
                              label={`Gallery Image ${idx + 1}`}
                              folder="events/gallery"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center min-h-[360px] flex flex-col items-center justify-center shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                        <Images className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        No Images Yet
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                        Upload engaging photos and memories to make this event stand out.
                      </p>
                      <Button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            galleryImages: [...formData.galleryImages, ""]
                          })
                        }
                        variant="outline"
                        className="h-8 text-xs rounded-xl font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add First Image
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
