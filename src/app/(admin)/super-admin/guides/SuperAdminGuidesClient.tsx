"use client";

import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Check, 
  Eye, 
  EyeOff, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Layers, 
  BookOpenText,
  FileCheck2,
  RefreshCcw,
  Lock,
  Unlock,
  X
} from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  saveUserGuide, 
  deleteUserGuide, 
  toggleFranchiseGuideVisibility,
  toggleGuideLock,
  type UserGuideInput 
} from "@/app/actions/user-guides";

interface SuperAdminGuidesClientProps {
  initialGuides: any[];
  franchises?: any[];
  isDeveloper: boolean;
  franchiseGuidesEnabled: boolean;
  config?: any;
}

export function SuperAdminGuidesClient({
  initialGuides,
  franchises = [],
  isDeveloper,
  franchiseGuidesEnabled: initialFranchiseVisibility,
  config
}: SuperAdminGuidesClientProps) {
  const [guides, setGuides] = useState<any[]>(initialGuides);
  const [activeTab, setActiveTab] = useState<"SUPER_ADMIN" | "FRANCHISE_ADMIN">("SUPER_ADMIN");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedGuideType, setSelectedGuideType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [centerSearch, setCenterSearch] = useState("");
  const [isFranchiseVisible, setIsFranchiseVisible] = useState(initialFranchiseVisibility);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  // Dialogs
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any | null>(null);
  const [deletingGuideId, setDeletingGuideId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Active Reader / Player Modals
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [activeArticleModal, setActiveArticleModal] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState<UserGuideInput>({
    title: "",
    description: "",
    category: "Platform Overview",
    targetRole: "SUPER_ADMIN",
    contentType: "YOUTUBE",
    youtubeUrl: "",
    pdfUrl: "",
    externalUrl: "",
    content: "",
    order: 0,
    isPublished: true,
    isAllFranchises: true,
    assignedWorkspaces: [],
    guideType: "OFFICIAL",
  });

  const handleOpenAddDialog = () => {
    setEditingGuide(null);
    setCenterSearch("");
    setFormData({
      title: "",
      description: "",
      category: activeTab === "SUPER_ADMIN" ? "Platform Architecture" : "Student Admissions",
      targetRole: activeTab,
      contentType: "YOUTUBE",
      youtubeUrl: "",
      pdfUrl: "",
      externalUrl: "",
      content: "",
      order: guides.length + 1,
      isPublished: true,
      isAllFranchises: true,
      assignedWorkspaces: [],
      guideType: "OFFICIAL",
      isLocked: false,
      version: "1.0.0",
    });
    setIsEditorOpen(true);
  };

  const handleOpenEditDialog = (guide: any) => {
    setEditingGuide(guide);
    setCenterSearch("");
    setFormData({
      id: guide.id,
      title: guide.title,
      description: guide.description || "",
      category: guide.category || "General",
      targetRole: guide.targetRole,
      contentType: guide.contentType,
      youtubeUrl: guide.youtubeUrl || "",
      pdfUrl: guide.pdfUrl || "",
      externalUrl: guide.externalUrl || "",
      content: guide.content || "",
      order: guide.order ?? 0,
      isPublished: guide.isPublished ?? true,
      isAllFranchises: guide.isAllFranchises ?? true,
      assignedWorkspaces: Array.isArray(guide.assignedWorkspaces) ? guide.assignedWorkspaces : [],
      guideType: guide.guideType || "OFFICIAL",
      isLocked: guide.isLocked ?? false,
      version: guide.version || "1.0.0",
    });
    setIsEditorOpen(true);
  };

  const toggleCenterSelection = (workspaceId: string) => {
    setFormData(prev => {
      const current = Array.isArray(prev.assignedWorkspaces) ? [...prev.assignedWorkspaces] : [];
      const index = current.indexOf(workspaceId);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(workspaceId);
      }
      return { ...prev, assignedWorkspaces: current };
    });
  };

  const handleSelectAllCenters = () => {
    setFormData(prev => ({
      ...prev,
      assignedWorkspaces: franchises.map(f => f.id)
    }));
  };

  const handleClearAllCenters = () => {
    setFormData(prev => ({
      ...prev,
      assignedWorkspaces: []
    }));
  };

  const filteredFranchisesForPicker = useMemo(() => {
    if (!centerSearch.trim()) return franchises;
    const q = centerSearch.toLowerCase().trim();
    return franchises.filter(f => 
      (f.name || "").toLowerCase().includes(q) ||
      (f.centerCode || "").toLowerCase().includes(q) ||
      (f.district || "").toLowerCase().includes(q)
    );
  }, [franchises, centerSearch]);

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a guide title");
      return;
    }

    setIsSaving(true);
    toast.loading("Saving guide...", { id: "guide-save" });

    try {
      const res = await saveUserGuide(formData);
      if (res.success && res.guide) {
        toast.success(editingGuide ? "Guide updated successfully!" : "Guide created successfully!", { id: "guide-save" });
        if (editingGuide) {
          setGuides(prev => prev.map(g => g.id === res.guide.id ? res.guide : g));
        } else {
          setGuides(prev => [...prev, res.guide]);
        }
        setIsEditorOpen(false);
      } else {
        toast.error(res.error || "Failed to save guide", { id: "guide-save" });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: "guide-save" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGuideId) return;

    try {
      const res = await deleteUserGuide(deletingGuideId);
      if (res.success) {
        toast.success("Guide deleted");
        setGuides(prev => prev.filter(g => g.id !== deletingGuideId));
        setDeletingGuideId(null);
      } else {
        toast.error(res.error || "Failed to delete guide");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleToggleFranchiseVisibility = async (checked: boolean) => {
    setIsUpdatingVisibility(true);
    try {
      const res = await toggleFranchiseGuideVisibility(checked);
      if (res.success) {
        setIsFranchiseVisible(checked);
        toast.success(checked ? "User Guide menu enabled for all Franchises!" : "User Guide menu hidden from Franchises.");
      } else {
        toast.error(res.error || "Failed to update visibility");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleToggleLock = async (guideId: string, currentLocked: boolean) => {
    try {
      const res = await toggleGuideLock(guideId, !currentLocked);
      if (res.success && res.guide) {
        toast.success(!currentLocked ? "Official Guide locked and protected" : "Guide unlocked for editing");
        setGuides(prev => prev.map(g => g.id === guideId ? { ...g, isLocked: !currentLocked } : g));
      } else {
        toast.error(res.error || "Failed to update lock status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle lock");
    }
  };

  // Extract YouTube Embed URL
  const getEmbedYoutubeUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0` : url;
    } catch {
      return url;
    }
  };

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      if (guide.targetRole !== activeTab) return false;
      if (selectedCategory !== "ALL" && guide.category !== selectedCategory) return false;
      if (selectedGuideType !== "ALL") {
        if (selectedGuideType === "OFFICIAL" && guide.guideType === "SOP") return false;
        if (selectedGuideType === "SOP" && guide.guideType !== "SOP") return false;
        if (selectedGuideType === "TARGETED" && guide.isAllFranchises !== false) return false;
        if (selectedGuideType === "BROADCAST" && guide.isAllFranchises === false) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = guide.title.toLowerCase().includes(q);
        const matchDesc = guide.description?.toLowerCase().includes(q);
        const matchCat = guide.category?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat;
      }
      return true;
    });
  }, [guides, activeTab, selectedCategory, selectedGuideType, searchQuery]);

  // Categories for active tab
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    guides.filter(g => g.targetRole === activeTab).forEach(g => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [guides, activeTab]);

  const superAdminGuidesCount = guides.filter(g => g.targetRole === "SUPER_ADMIN").length;
  const franchiseGuidesCount = guides.filter(g => g.targetRole === "FRANCHISE_ADMIN").length;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Interactive User Guides & Knowledge Hub"
        description="Official step-by-step video walkthroughs, documentation manuals, and operating procedures."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Franchise Visibility Control for Super Admin */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Franchise Menu:</span>
            </div>
            <Switch
              checked={isFranchiseVisible}
              disabled={isUpdatingVisibility}
              onCheckedChange={handleToggleFranchiseVisibility}
            />
            <Badge variant="outline" className={cn(
              "text-[9px] font-bold px-1.5 py-0 border-none",
              isFranchiseVisible ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}>
              {isFranchiseVisible ? "VISIBLE" : "HIDDEN"}
            </Badge>
          </div>

          <Button
            onClick={handleOpenAddDialog}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Guide</span>
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Guides</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{guides.length}</p>
              </div>
              <div className="p-2.5 rounded-lg shrink-0 bg-blue-500/10 text-blue-600">
                <BookOpenText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Super Admin Guides</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{superAdminGuidesCount}</p>
              </div>
              <div className="p-2.5 rounded-lg shrink-0 bg-indigo-500/10 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Franchise Guides</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{franchiseGuidesCount}</p>
              </div>
              <div className="p-2.5 rounded-lg shrink-0 bg-purple-500/10 text-purple-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Franchise Access</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isFranchiseVisible ? "Active" : "Paused"}
                </p>
              </div>
              <div className={cn(
                "p-2.5 rounded-lg shrink-0",
                isFranchiseVisible ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
                {isFranchiseVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs Pill Container */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => {
            setActiveTab("SUPER_ADMIN");
            setSelectedCategory("ALL");
          }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "SUPER_ADMIN"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin Operations</span>
          <Badge className="ml-1 text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none px-1.5 py-0">
            {superAdminGuidesCount}
          </Badge>
        </button>

        <button
          onClick={() => {
            setActiveTab("FRANCHISE_ADMIN");
            setSelectedCategory("ALL");
          }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "FRANCHISE_ADMIN"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Franchise Network Guides</span>
          <Badge className="ml-1 text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none px-1.5 py-0">
            {franchiseGuidesCount}
          </Badge>
        </button>
      </div>

      {/* Main Content Card & Filter Toolbar */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:max-w-[300px] group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Search guides, manuals & tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-slate-400"
              />
            </div>

            {/* Guide Type & Scope Filter Pills (for Franchise Admin Tab) */}
            {activeTab === "FRANCHISE_ADMIN" && (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs shrink-0 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedGuideType("ALL")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    selectedGuideType === "ALL" ? "bg-white dark:bg-slate-900 text-primary shadow-xs" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  All Types
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGuideType("OFFICIAL")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    selectedGuideType === "OFFICIAL" ? "bg-white dark:bg-slate-900 text-primary shadow-xs" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Official
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGuideType("SOP")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    selectedGuideType === "SOP" ? "bg-white dark:bg-slate-900 text-purple-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Custom SOPs
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGuideType("TARGETED")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    selectedGuideType === "TARGETED" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Targeted Centers
                </button>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-all",
                  selectedCategory === "ALL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                All Topics
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-all",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Guides Grid / List */}
        <CardContent className="p-4 sm:p-5">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Guides Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No guides matching your filters. Click &quot;Add Guide&quot; above to create YouTube video tutorials, PDF manuals, or rich documentation articles.
              </p>
              <Button
                onClick={handleOpenAddDialog}
                size="sm"
                className="h-8 px-3 rounded-lg text-xs font-bold gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Guide</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredGuides.map((guide) => {
                const isYoutube = guide.contentType === "YOUTUBE";
                const isPdf = guide.contentType === "PDF";
                const isArticle = guide.contentType === "ARTICLE";
                const isLink = guide.contentType === "LINK";

                return (
                  <div
                    key={guide.id}
                    className="flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs group"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded border-none bg-blue-500/10 text-blue-600 uppercase">
                            {guide.category || "General"}
                          </Badge>

                          {guide.targetRole === "FRANCHISE_ADMIN" && (
                            <>
                              {guide.guideType === "SOP" ? (
                                <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-none text-[8px] font-bold px-1.5 py-0.5 flex items-center gap-0.5">
                                  <Building2 className="w-2.5 h-2.5" />
                                  <span>Custom SOP</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-[8px] font-bold px-1.5 py-0.5">
                                  Official Guide
                                </Badge>
                              )}

                              {guide.isAllFranchises !== false ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-none text-[8px] font-bold px-1.5 py-0.5">
                                  All Centers
                                </Badge>
                              ) : (
                                <Badge 
                                  className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-none text-[8px] font-bold px-1.5 py-0.5 cursor-help"
                                  title={`Assigned to ${Array.isArray(guide.assignedWorkspaces) ? guide.assignedWorkspaces.length : 0} specific franchise centers`}
                                >
                                  {Array.isArray(guide.assignedWorkspaces) ? `${guide.assignedWorkspaces.length} Centers` : "Targeted"}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isYoutube && (
                            <Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                              <Video className="w-3 h-3 text-red-500" />
                              <span>YouTube</span>
                            </Badge>
                          )}
                          {isPdf && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-amber-500" />
                              <span>PDF Document</span>
                            </Badge>
                          )}
                          {isArticle && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-emerald-500" />
                              <span>Article</span>
                            </Badge>
                          )}
                          {isLink && (
                            <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 text-indigo-500" />
                              <span>Resource</span>
                            </Badge>
                          )}

                          {guide.isLocked && (
                            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-none text-[8px] font-bold px-1.5 py-0.5 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>v{guide.version || "1.0.0"}</span>
                            </Badge>
                          )}

                          {guide.createdByRole === "DEVELOPER" && (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-none text-[8px] font-bold px-1 py-0">
                              DEV
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {guide.title}
                        </h4>
                        {guide.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {guide.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      {/* Main Viewer Trigger */}
                      {isYoutube && guide.youtubeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveVideoModal(guide)}
                          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500/10"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch Video</span>
                        </Button>
                      )}

                      {isPdf && guide.pdfUrl && (
                        <a 
                          href={guide.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Open PDF</span>
                        </a>
                      )}

                      {isArticle && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveArticleModal(guide)}
                          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Read Guide</span>
                        </Button>
                      )}

                      {isLink && guide.externalUrl && (
                        <a 
                          href={guide.externalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit Link</span>
                        </a>
                      )}

                      {/* Management Edit / Delete / Lock for Creators / Devs */}
                      <div className="flex items-center gap-1">
                        {isDeveloper && (
                          <button
                            type="button"
                            onClick={() => handleToggleLock(guide.id, guide.isLocked || false)}
                            className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                              guide.isLocked
                                ? "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                            title={guide.isLocked ? "Official Guide is Locked (Click to Unlock)" : "Click to Lock as Protected Guide"}
                          >
                            {guide.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {!isDeveloper && guide.isLocked ? (
                          <div 
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20"
                            title="Official System Guide: Protected by Developer"
                          >
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>System Protected</span>
                          </div>
                        ) : (
                          (isDeveloper || (!guide.isLocked && guide.createdByRole !== "DEVELOPER")) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditDialog(guide)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Guide"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingGuideId(guide.id)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                title="Delete Guide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* YouTube Video Player Modal */}
      <Dialog open={!!activeVideoModal} onOpenChange={(open) => !open && setActiveVideoModal(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl">
          <div className="relative aspect-video w-full bg-black">
            {activeVideoModal?.youtubeUrl && (
              <iframe
                src={getEmbedYoutubeUrl(activeVideoModal.youtubeUrl) || ""}
                title={activeVideoModal.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
            {/* Top-Right Circular Close Button */}
            <button
              type="button"
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              title="Close Video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 text-white flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">{activeVideoModal?.title}</h3>
              {activeVideoModal?.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{activeVideoModal.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveVideoModal(null)}
              className="h-8 px-4 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Video</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Reader Modal */}
      <Dialog open={!!activeArticleModal} onOpenChange={(open) => !open && setActiveArticleModal(null)}>
        <DialogContent 
          showCloseButton={false}
          className="max-w-2xl max-h-[85vh] h-full flex flex-col p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        >
          <div className="sticky top-0 z-30 shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 border-none uppercase mb-2">
                {activeArticleModal?.category || "Documentation"}
              </Badge>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {activeArticleModal?.title}
              </DialogTitle>
              {activeArticleModal?.description && (
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeArticleModal.description}
                </DialogDescription>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveArticleModal(null)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Close Article"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar">
            {activeArticleModal?.content || "No detailed instructions provided."}
          </div>

          <div className="sticky bottom-0 z-30 shrink-0 px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md flex justify-end rounded-b-2xl">
            <button
              type="button"
              onClick={() => setActiveArticleModal(null)}
              className="h-8 sm:h-9 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
            >
              Done Reading
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Guide Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent 
          showCloseButton={false}
          className="max-w-xl max-h-[88vh] h-full flex flex-col p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        >
          <form onSubmit={handleSaveGuide} className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Sticky Top Header */}
            <div className="sticky top-0 z-30 shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingGuide ? "Edit User Guide" : "Create User Guide"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Add official video tutorials, PDF manuals, or step-by-step instructions.
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Close Dialog"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3.5 custom-scrollbar">
              {/* Title */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Guide Title *
                </Label>
                <Input
                  required
                  placeholder="e.g. How to Approve Student Admissions"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="h-8 sm:h-9 text-xs rounded-lg"
                />
              </div>

              {/* Category & Target Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category Topic
                  </Label>
                  <Input
                    placeholder="e.g. Admissions, Wallet, Exams"
                    value={formData.category || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="h-8 sm:h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Audience
                  </Label>
                  {isDeveloper ? (
                    <Select
                      value={formData.targetRole}
                      onValueChange={(val: any) => setFormData(prev => ({ ...prev, targetRole: val }))}
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">
                          <span className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Super Admin Only</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="FRANCHISE_ADMIN">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Franchise Admin</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-8 sm:h-9 px-3 flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Franchise Admin (Standard)
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Format Selection (Interactive Visual Cards) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resource Format *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: "YOUTUBE",
                      label: "YouTube Video",
                      sub: "Interactive Stream",
                      icon: Video,
                      activeColor: "border-red-500 bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 ring-2 ring-red-500/20",
                      disabled: !isDeveloper && config?.enableGuideVideos === false,
                    },
                    {
                      id: "PDF",
                      label: "PDF Document",
                      sub: "Manual / SOP",
                      icon: FileText,
                      activeColor: "border-amber-500 bg-amber-50/80 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20",
                      disabled: !isDeveloper && config?.enableGuidePdfs === false,
                    },
                    {
                      id: "ARTICLE",
                      label: "Step Article",
                      sub: "Written Guide",
                      icon: BookOpen,
                      activeColor: "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20",
                      disabled: !isDeveloper && config?.enableGuideArticles === false,
                    },
                    {
                      id: "LINK",
                      label: "External Link",
                      sub: "Web Reference",
                      icon: LinkIcon,
                      activeColor: "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20",
                      disabled: !isDeveloper && config?.enableGuideExternalLinks === false,
                    },
                  ].map((item) => {
                    const isSelected = formData.contentType === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.disabled) return;
                          setFormData(prev => ({ ...prev, contentType: item.id as any }));
                        }}
                        className={cn(
                          "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all group relative",
                          item.disabled
                            ? "opacity-45 cursor-not-allowed bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800"
                            : isSelected
                              ? cn("shadow-xs font-semibold cursor-pointer", item.activeColor)
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                        )}
                        title={item.disabled ? "This media format is currently disabled by developer." : item.label}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <IconComp className={cn("w-4 h-4", isSelected ? "text-current" : "text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200")} />
                          {isSelected && !item.disabled && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                          {item.disabled && (
                            <span className="text-[8px] font-bold text-slate-400 px-1 py-0 rounded bg-slate-200/60 dark:bg-slate-700/60">
                              OFF
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold leading-tight truncate w-full">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full">
                          {item.disabled ? "Disabled by Dev" : item.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic URL Inputs */}
              {formData.contentType === "YOUTUBE" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    YouTube Video URL *
                  </Label>
                  <Input
                    required
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={formData.youtubeUrl || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className="h-8 sm:h-9 text-xs rounded-lg"
                  />
                </div>
              )}

              {formData.contentType === "PDF" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PDF Document URL *
                  </Label>
                  <Input
                    required
                    type="url"
                    placeholder="https://.../manual.pdf"
                    value={formData.pdfUrl || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                    className="h-8 sm:h-9 text-xs rounded-lg"
                  />
                </div>
              )}

              {formData.contentType === "LINK" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    External Web Link *
                  </Label>
                  <Input
                    required
                    type="url"
                    placeholder="https://..."
                    value={formData.externalUrl || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                    className="h-8 sm:h-9 text-xs rounded-lg"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Brief Summary
                </Label>
                <Textarea
                  placeholder="Short description of what this guide explains..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="text-xs rounded-lg"
                />
              </div>

              {/* Rich Text / Markdown Content */}
              {(formData.contentType === "ARTICLE" || formData.contentType === "YOUTUBE") && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Instructions / Notes
                  </Label>
                  <Textarea
                    placeholder="Write detailed steps, procedures, keyboard shortcuts, or operational guidelines..."
                    value={formData.content || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                    className="text-xs rounded-lg font-mono"
                  />
                </div>
              )}

              {/* Franchise Center Targeting & SOP Classification */}
              {formData.targetRole === "FRANCHISE_ADMIN" && (
                <div className="p-3 sm:p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Classification & Type
                      </Label>
                      <p className="text-[10px] text-slate-500">
                        Distinguish general feature guide vs official HQ center policy
                      </p>
                    </div>
                    <Select
                      value={formData.guideType || "OFFICIAL"}
                      onValueChange={(val: any) => setFormData(prev => ({ ...prev, guideType: val }))}
                    >
                      <SelectTrigger className="h-8 w-full sm:w-44 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OFFICIAL">Official Platform Guide</SelectItem>
                        <SelectItem value="SOP">HQ Center SOP / Directive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2.5 border-t border-indigo-100/80 dark:border-indigo-900/40 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Target Franchise Audience
                        </Label>
                        <p className="text-[10px] text-slate-500">
                          {formData.isAllFranchises ? "Broadcasting to all franchise branches" : "Visible only to selected branches"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, isAllFranchises: true, assignedWorkspaces: [] }))}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors",
                            formData.isAllFranchises ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                          )}
                        >
                          All Centers
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, isAllFranchises: false }))}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors",
                            !formData.isAllFranchises ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                          )}
                        >
                          Specific Centers
                        </button>
                      </div>
                    </div>

                    {!formData.isAllFranchises && (
                      <div className="pt-2 space-y-2 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Filter centers by code, name, district..."
                            value={centerSearch}
                            onChange={(e) => setCenterSearch(e.target.value)}
                            className="h-7 text-xs px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 w-full"
                          />
                          <button
                            type="button"
                            onClick={handleSelectAllCenters}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 font-bold"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={handleClearAllCenters}
                            className="text-[10px] text-slate-500 hover:underline shrink-0 font-bold"
                          >
                            Clear
                          </button>
                        </div>

                        <div className="max-h-36 overflow-y-auto space-y-1 p-1 rounded-lg border border-slate-100 dark:border-slate-800 text-xs custom-scrollbar">
                          {filteredFranchisesForPicker.length === 0 ? (
                            <p className="text-[11px] text-slate-400 text-center py-3">No matching franchise centers</p>
                          ) : (
                            filteredFranchisesForPicker.map(franchise => {
                              const isSelected = (formData.assignedWorkspaces || []).includes(franchise.id);
                              return (
                                <label
                                  key={franchise.id}
                                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCenterSelection(franchise.id)}
                                    className="rounded text-indigo-600"
                                  />
                                  <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">
                                    [{franchise.centerCode || "NO-CODE"}]
                                  </span>
                                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                                    {franchise.name}
                                  </span>
                                  {franchise.district && (
                                    <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                                      {franchise.district}
                                    </span>
                                  )}
                                </label>
                              );
                            })
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                          <span>
                            {(formData.assignedWorkspaces || []).length} of {franchises.length} centers selected
                          </span>
                          {(formData.assignedWorkspaces || []).length === 0 && (
                            <span className="text-amber-600 font-semibold">
                              Please select at least 1 center
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Developer Lock & Versioning Controls */}
              {isDeveloper && (
                <div className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock as Official System Guide</span>
                      </Label>
                      <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80">
                        When locked, non-developer Super Admins cannot edit or delete this guide
                      </p>
                    </div>
                    <Switch
                      checked={formData.isLocked || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLocked: checked }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                    <Label className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                      Manual Version:
                    </Label>
                    <Input
                      type="text"
                      placeholder="1.0.0"
                      value={formData.version || "1.0.0"}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      className="h-7 w-24 text-xs font-mono bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-center"
                    />
                  </div>
                </div>
              )}

              {/* Sort Order & Publish State */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Published & Active
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-500">Order:</Label>
                  <Input
                    type="number"
                    value={formData.order ?? 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="h-7 w-16 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-30 shrink-0 px-4 sm:px-6 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-end gap-2.5 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="h-8 sm:h-9 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-8 sm:h-9 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingGuide ? "Update Guide" : "Create Guide"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        open={!!deletingGuideId}
        onOpenChange={(open) => !open && setDeletingGuideId(null)}
        title="Delete User Guide"
        description="Are you sure you want to permanently delete this user guide? This cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Guide"
        destructive={true}
      />
    </div>
  );
}
