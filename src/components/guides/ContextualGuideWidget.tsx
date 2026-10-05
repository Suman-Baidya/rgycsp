"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Search, 
  ExternalLink, 
  Play, 
  Sparkles, 
  X, 
  ArrowLeft,
  HelpCircle,
  Maximize2
} from "lucide-react";
import { getPublishedUserGuides } from "@/app/actions/user-guides";
import { getTenantLink } from "@/lib/routing";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ContextualGuideWidgetProps {
  portal: "super-admin" | "admin";
  tenant?: string;
  workspaceBase?: string;
  workspaceId?: string;
}

export function ContextualGuideWidget({ portal, tenant = "", workspaceBase = "", workspaceId }: ContextualGuideWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [guides, setGuides] = useState<any[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"relevant" | "all" | "videos" | "pdfs">("relevant");
  
  // In-drawer reading / viewing state
  const [viewingGuide, setViewingGuide] = useState<any | null>(null);

  // Load guides
  useEffect(() => {
    let isMounted = true;
    async function fetchGuides() {
      setIsLoading(true);
      try {
        const targetRole = portal === "super-admin" ? "SUPER_ADMIN" : "FRANCHISE_ADMIN";
        const res = await getPublishedUserGuides(targetRole, workspaceId);
        if (isMounted) {
          if (res.enabled && res.guides) {
            setGuides(res.guides);
            setIsEnabled(true);
          } else {
            setIsEnabled(false);
          }
        }
      } catch {
        if (isMounted) setIsEnabled(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchGuides();
    return () => {
      isMounted = false;
    };
  }, [portal]);

  // Listen to open / toggle events from Header button or external triggers
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleToggle = () => setIsOpen(prev => !prev);

    window.addEventListener("open-user-guide-drawer", handleOpen);
    window.addEventListener("toggle-user-guide-drawer", handleToggle);

    return () => {
      window.removeEventListener("open-user-guide-drawer", handleOpen);
      window.removeEventListener("toggle-user-guide-drawer", handleToggle);
    };
  }, []);

  // When pathname changes, reset viewing state and switch to relevant tab
  useEffect(() => {
    setViewingGuide(null);
    setActiveTab("relevant");
  }, [pathname]);

  // Contextual route keywords
  const { currentSectionName, routeKeywords } = useMemo(() => {
    const segments = pathname.toLowerCase().split("/").filter(Boolean);
    const filtered = segments.filter(s => !["app", "super-admin", "admin"].includes(s));
    const last = filtered[filtered.length - 1] || "dashboard";
    
    // Human readable section
    let name = last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
    if (last === "enquiries") name = "Enquiries & Campaigns";
    if (last === "wallet") name = "Wallet & Payments";
    if (last === "courses") name = "Courses & Curriculum";
    if (last === "admissions" || last === "students") name = "Students & Admissions";

    return {
      currentSectionName: name,
      routeKeywords: filtered
    };
  }, [pathname]);

  // Classify matching guides
  const isGuideMatching = (guide: any) => {
    if (routeKeywords.length === 0) return true;
    const title = (guide.title || "").toLowerCase();
    const desc = (guide.description || "").toLowerCase();
    const cat = (guide.category || "").toLowerCase();

    return routeKeywords.some(k => 
      title.includes(k) || 
      desc.includes(k) || 
      cat.includes(k) ||
      (k === "enquiries" && (title.includes("campaign") || cat.includes("admission"))) ||
      (k === "students" && cat.includes("admission")) ||
      (k === "admissions" && cat.includes("admission")) ||
      (k === "wallet" && (title.includes("balance") || cat.includes("billing")))
    );
  };

  const relevantGuides = useMemo(() => {
    return guides.filter(isGuideMatching);
  }, [guides, routeKeywords]);

  // Filtered guides by tab and search
  const displayedGuides = useMemo(() => {
    let list = guides;

    if (activeTab === "relevant") {
      list = relevantGuides.length > 0 ? relevantGuides : guides;
    } else if (activeTab === "videos") {
      list = guides.filter(g => g.contentType === "YOUTUBE");
    } else if (activeTab === "pdfs") {
      list = guides.filter(g => g.contentType === "PDF");
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(g => 
      (g.title || "").toLowerCase().includes(q) ||
      (g.description || "").toLowerCase().includes(q) ||
      (g.category || "").toLowerCase().includes(q)
    );
  }, [guides, relevantGuides, activeTab, searchQuery]);

  // Extract YouTube embed URL
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

  if (!isEnabled) {
    return null;
  }

  const fullCenterHref = portal === "super-admin" 
    ? "/super-admin/guides" 
    : getTenantLink("/admin/guides", tenant, pathname);

  return (
    <>
      {/* Slide-over Drawer & Overlay (Triggered exclusively from Top Smart Header Icon) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {viewingGuide ? (
                    <button
                      type="button"
                      onClick={() => setViewingGuide(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Back to guides list"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {viewingGuide ? viewingGuide.title : "Help & User Guides"}
                    </h2>
                    <p className="text-[11px] text-slate-500 truncate">
                      {viewingGuide 
                        ? (viewingGuide.category || "Tutorial") 
                        : `Contextual guides for ${currentSectionName}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View 1: Active In-Drawer Guide Viewer (Video or Article) */}
              {viewingGuide ? (
                <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-5 space-y-4">
                  {/* YouTube Embed Player */}
                  {viewingGuide.contentType === "YOUTUBE" && viewingGuide.youtubeUrl && (
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md border border-slate-800">
                        <iframe
                          src={getEmbedYoutubeUrl(viewingGuide.youtubeUrl) || ""}
                          title={viewingGuide.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-red-500/10 text-red-600">
                            Video Tutorial
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {viewingGuide.category || "General"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                          {viewingGuide.title}
                        </h3>
                        {viewingGuide.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                            {viewingGuide.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Article Reader */}
                  {viewingGuide.contentType === "ARTICLE" && (
                    <div className="space-y-3">
                      <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                          Step-by-Step Guide
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                          {viewingGuide.title}
                        </h3>
                        {viewingGuide.description && (
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {viewingGuide.description}
                          </p>
                        )}
                      </div>

                      <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-wrap">
                        {viewingGuide.content || "No detailed instructions written for this guide."}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button
                      type="button"
                      onClick={() => setViewingGuide(null)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      ← Back to All Guides
                    </button>
                  </div>
                </div>
              ) : (
                /* View 2: Guide List & Search Directory */
                <div className="flex-1 overflow-y-auto flex flex-col">
                  {/* Search Bar */}
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 space-y-2.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search guides for ${currentSectionName}...`}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab("relevant")}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1",
                          activeTab === "relevant"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>For This Page</span>
                        {relevantGuides.length > 0 && (
                          <span className="ml-0.5 px-1 py-0.2 rounded-full text-[9px] bg-white/20">
                            {relevantGuides.length}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("all")}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-colors",
                          activeTab === "all"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        All ({guides.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("videos")}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1",
                          activeTab === "videos"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        <Video className="w-3 h-3 text-red-500" />
                        <span>Videos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("pdfs")}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1",
                          activeTab === "pdfs"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        <FileText className="w-3 h-3 text-amber-500" />
                        <span>PDFs</span>
                      </button>
                    </div>
                  </div>

                  {/* Guides List */}
                  <div className="p-3 sm:p-4 space-y-2.5 flex-1">
                    {displayedGuides.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          No matching guides found
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Try searching a different keyword or browse all platform guides in the main guide center.
                        </p>
                      </div>
                    ) : (
                      displayedGuides.map((guide) => {
                        const isMatching = isGuideMatching(guide);
                        const isYoutube = guide.contentType === "YOUTUBE";
                        const isPdf = guide.contentType === "PDF";
                        const isArticle = guide.contentType === "ARTICLE";
                        const isLink = guide.contentType === "LINK";

                        return (
                          <div
                            key={guide.id}
                            className={cn(
                              "p-3 rounded-xl border transition-all space-y-2 group",
                              isMatching
                                ? "bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/50 shadow-xs ring-1 ring-indigo-500/10"
                                : "bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-xs"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isYoutube && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-red-500/10 text-red-600 inline-flex items-center gap-0.5">
                                      <Video className="w-2.5 h-2.5" /> Video
                                    </span>
                                  )}
                                  {isPdf && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-500/10 text-amber-600 inline-flex items-center gap-0.5">
                                      <FileText className="w-2.5 h-2.5" /> PDF
                                    </span>
                                  )}
                                  {isArticle && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-500/10 text-emerald-600 inline-flex items-center gap-0.5">
                                      <BookOpen className="w-2.5 h-2.5" /> Guide
                                    </span>
                                  )}
                                  {isLink && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-500/10 text-indigo-600 inline-flex items-center gap-0.5">
                                      <ExternalLink className="w-2.5 h-2.5" /> Link
                                    </span>
                                  )}
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {guide.category || "General"}
                                  </span>
                                  {isMatching && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-snug">
                                  {guide.title}
                                </h4>
                                {guide.description && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                    {guide.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Row */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2">
                              {isYoutube && (
                                <button
                                  type="button"
                                  onClick={() => setViewingGuide(guide)}
                                  className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Watch Video</span>
                                </button>
                              )}

                              {isArticle && (
                                <button
                                  type="button"
                                  onClick={() => setViewingGuide(guide)}
                                  className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Read Guide</span>
                                </button>
                              )}

                              {isPdf && guide.pdfUrl && (
                                <a
                                  href={guide.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-1 shadow-xs transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Open PDF</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                                </a>
                              )}

                              {isLink && guide.externalUrl && (
                                <a
                                  href={guide.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1 shadow-xs transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Visit Resource</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 shrink-0">
                    <Link
                      href={fullCenterHref}
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Open Full User Guide Center</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
