"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  ExternalLink,
  Calendar,
  Tag,
  Info,
  ChevronRight,
  Sparkles,
  FileText,
  RotateCcw,
  Check
} from "lucide-react";
import { updateLandingSection } from "@/app/actions/site-settings";
import { toast } from "sonner";
import { slugify, getNoticeSlug, normalizeNotices, WorkspaceNotice } from "@/lib/notice-utils";
import { DEFAULT_WORKSPACE_NOTICES } from "@/lib/workspace-defaults";
import { NOTICE_CATEGORIES } from "@/lib/notice-categories";

export const ABOUT_DESTINATIONS = [
  { value: "/about", label: "About Our Center (/about)", defaultText: "Discover More" },
  { value: "/courses", label: "Explore Courses (/courses)", defaultText: "Our Programs" },
  { value: "/admission", label: "Student Admission (/admission)", defaultText: "Apply Now" },
  { value: "/enquiry", label: "Student Enquiry (/enquiry)", defaultText: "Enquiry Now" },
  { value: "/notice", label: "Notice Board (/notice)", defaultText: "Notice Board" },
  { value: "/contact", label: "Contact Center (/contact)", defaultText: "Contact Us" },
  { value: "custom", label: "Custom Link / External URL...", defaultText: "" },
];

const SUGGESTED_CATEGORIES = [
  "General",
  "Academic",
  "Exams",
  "Holidays",
  "Admissions",
  "Placement",
  "Scholarship"
];

interface NoticeBoardManagementProps {
  section: any;
  settings: any;
  mediaFolderBase?: string;
}

export function NoticeBoardManagement({
  section,
  settings,
  mediaFolderBase
}: NoticeBoardManagementProps) {
  const router = useRouter();

  // Local state for atomic, reliable saving (avoids keystroke network spam)
  const [isActive, setIsActive] = useState<boolean>(section?.isActive ?? true);
  const [notices, setNotices] = useState<WorkspaceNotice[]>(() => {
    const raw = section?.content?.notices;
    if (Array.isArray(raw) && raw.length > 0) {
      return normalizeNotices(raw);
    }
    return normalizeNotices(DEFAULT_WORKSPACE_NOTICES);
  });

  // Keep About section content synchronized
  const [aboutDescription, setAboutDescription] = useState<string>(
    section?.content?.description || ""
  );
  const [btnText, setBtnText] = useState<string>(
    section?.content?.btnText || "Discover More"
  );
  const [btnLink, setBtnLink] = useState<string>(
    section?.content?.btnLink || "/about"
  );
  const [showAboutSettings, setShowAboutSettings] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state if section prop changes externally
  useEffect(() => {
    if (section) {
      setIsActive(section.isActive ?? true);
      if (Array.isArray(section.content?.notices)) {
        setNotices(normalizeNotices(section.content.notices));
      }
      setAboutDescription(section.content?.description || "");
      setBtnText(section.content?.btnText || "Discover More");
      setBtnLink(section.content?.btnLink || "/about");
    }
  }, [section]);

  const isAboutPredefined = ABOUT_DESTINATIONS.some((d) => d.value === btnLink);
  const aboutSelectVal = isAboutPredefined
    ? btnLink
    : btnLink
    ? "custom"
    : "/about";

  // Notice handlers
  const handleAddNotice = () => {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNotice: WorkspaceNotice = {
      id: `notice-${uniqueSuffix}`,
      title: "New Official Announcement",
      date: today,
      category: "General",
      description: "",
      link: ""
    };
    setNotices([newNotice, ...notices]);
  };

  const handleUpdateNotice = (index: number, patch: Partial<WorkspaceNotice>) => {
    setNotices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleRemoveNotice = (index: number) => {
    setNotices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveNotice = (index: number, direction: "up" | "down") => {
    setNotices((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleLoadDefaults = () => {
    setNotices(normalizeNotices(DEFAULT_WORKSPACE_NOTICES));
    toast.info("Default template notices loaded");
  };

  // Atomic save to prevent state collisions and keystroke race conditions
  const handleSave = async () => {
    if (!section?.id) {
      toast.error("Notice section ID not found");
      return;
    }

    setIsSaving(true);
    try {
      // Normalize notices with guaranteed unique IDs and slugs
      const normalizedNotices = normalizeNotices(notices).map((n) => ({
        ...n,
        title: n.title?.trim() || "Notice Announcement",
        date:
          n.date?.trim() ||
          new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }),
        category: n.category?.trim() || "General",
        description: n.description || "",
        link: n.link?.trim() || ""
      }));

      const mergedContent = {
        ...(section.content || {}),
        description: aboutDescription,
        btnText,
        btnLink,
        notices: normalizedNotices
      };

      const result = await updateLandingSection(section.id, {
        ...section,
        isActive,
        content: mergedContent,
        workspaceId: settings.workspaceId
      });

      if (result?.success) {
        toast.success("Notice Board and About section saved successfully!");
        router.refresh();
      } else {
        toast.error(result?.error || "Failed to update Notice Board");
      }
    } catch (err: any) {
      console.error("Notice Board save error:", err);
      toast.error(err?.message || "Failed to save notice board");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Notice Board Management
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {notices.length} {notices.length === 1 ? "Notice" : "Notices"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Manage live circulars and synchronized About Institute section details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {isActive ? "Online" : "Offline"}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Notice Board"}</span>
            </Button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddNotice}
              className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Post New Notice
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLoadDefaults}
              className="h-8 px-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 gap-1.5 border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" /> Template Notices
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Each notice gets its own dedicated details page automatically.
          </p>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Notices ({notices.length})
          </Label>
        </div>

        {notices.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <Bell className="w-8 h-8 text-slate-400 mx-auto opacity-40" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No Notices Posted
              </h4>
              <p className="text-[11px] text-slate-500">
                Click &quot;Post New Notice&quot; or load the template notices to get started.
              </p>
            </div>
            <Button size="sm" onClick={handleAddNotice} className="h-8 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Notice
            </Button>
          </div>
        ) : (
          notices.map((notice, idx) => (
            <Card
              key={`${notice.id || 'notice'}-${idx}`}
              className="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden group"
            >
              <CardContent className="p-3.5 sm:p-4 space-y-3.5">
                {/* Notice Item Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {notice.category || "General"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      ID: {notice.id || getNoticeSlug(notice, idx)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === 0}
                      onClick={() => handleMoveNotice(idx, "up")}
                      className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === notices.length - 1}
                      onClick={() => handleMoveNotice(idx, "down")}
                      className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveNotice(idx)}
                      className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Title */}
                  <div className="sm:col-span-8 space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Notice Title *
                    </Label>
                    <Input
                      value={notice.title}
                      onChange={(e) => handleUpdateNotice(idx, { title: e.target.value })}
                      placeholder="e.g. Annual Semester Examination Schedule 2026"
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                    />
                  </div>

                  {/* Date */}
                  <div className="sm:col-span-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </Label>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateNotice(idx, {
                            date: new Date().toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          })
                        }
                        className="text-[9px] font-bold text-primary hover:underline"
                      >
                        Today
                      </button>
                    </div>
                    <Input
                      value={notice.date}
                      onChange={(e) => handleUpdateNotice(idx, { date: e.target.value })}
                      placeholder="e.g. 12 Oct, 2026"
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                    />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-5 space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </Label>
                    <div className="flex gap-1.5">
                      <select
                        value={
                          SUGGESTED_CATEGORIES.includes(notice.category || "")
                            ? notice.category
                            : "Custom"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== "Custom") {
                            handleUpdateNotice(idx, { category: val });
                          }
                        }}
                        className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2 cursor-pointer focus:outline-none"
                      >
                        {SUGGESTED_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="Custom">Custom...</option>
                      </select>
                      <Input
                        value={notice.category || ""}
                        onChange={(e) => handleUpdateNotice(idx, { category: e.target.value })}
                        placeholder="Category label"
                        className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium flex-1"
                      />
                    </div>
                  </div>

                  {/* External Link / Document */}
                  <div className="sm:col-span-7 space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      External Link / Attachment (Optional)
                    </Label>
                    <Input
                      value={notice.link || ""}
                      onChange={(e) => handleUpdateNotice(idx, { link: e.target.value })}
                      placeholder="e.g. https://... or leave empty to use built-in detail page"
                      className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-normal"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="sm:col-span-12 space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Notice Full Description & Circular Details
                    </Label>
                    <Textarea
                      value={notice.description || ""}
                      onChange={(e) => handleUpdateNotice(idx, { description: e.target.value })}
                      placeholder="Write the full announcement text, instructions, and circular body displayed on the dedicated notice detail page..."
                      className="min-h-[75px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal leading-relaxed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* About Institute Section Settings (Safely Preserved) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div
          onClick={() => setShowAboutSettings(!showAboutSettings)}
          className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                About Institute Section Content
              </h4>
              <p className="text-[10px] text-slate-500">
                Connected section displayed alongside the notice board on your homepage.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-500">
            {showAboutSettings ? "Collapse" : "Expand"}
          </Button>
        </div>

        {showAboutSettings && (
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* CTA Destination */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CTA Destination (Select Box)
                </Label>
                <div className="relative">
                  <select
                    value={aboutSelectVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        if (isAboutPredefined) setBtnLink("");
                      } else {
                        const dest = ABOUT_DESTINATIONS.find((d) => d.value === val);
                        setBtnLink(val);
                        if (
                          !btnText ||
                          btnText === "Discover More" ||
                          ABOUT_DESTINATIONS.some((d) => d.defaultText === btnText)
                        ) {
                          if (dest?.defaultText) setBtnText(dest.defaultText);
                        }
                      }
                    }}
                    className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 pl-2.5 pr-7 w-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-xs truncate"
                  >
                    {ABOUT_DESTINATIONS.map((dest) => (
                      <option
                        key={dest.value}
                        value={dest.value}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1.5"
                      >
                        {dest.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* CTA Button Label */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CTA Button Label
                </Label>
                <Input
                  value={btnText}
                  onChange={(e) => setBtnText(e.target.value)}
                  placeholder="e.g. Discover More"
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {aboutSelectVal === "custom" && (
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Custom Destination URL
                </Label>
                <Input
                  value={btnLink}
                  onChange={(e) => setBtnLink(e.target.value)}
                  placeholder="e.g. /custom-page or https://..."
                  className="h-8 text-xs rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"
                />
              </div>
            )}

            {/* About Full Description */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                About Full Description
              </Label>
              <Textarea
                value={aboutDescription}
                onChange={(e) => setAboutDescription(e.target.value)}
                className="min-h-[85px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal"
                placeholder="Detailed institute introduction and values displayed on the homepage..."
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            Clicking Save will update the Notice Board and About section simultaneously without data loss.
          </span>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Commit All Changes"}</span>
        </Button>
      </div>
    </div>
  );
}
