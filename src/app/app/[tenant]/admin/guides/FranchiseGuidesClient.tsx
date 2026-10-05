"use client";

import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Search, 
  ExternalLink, 
  Play, 
  Sparkles, 
  Building2, 
  BookOpenText,
  GraduationCap,
  Wallet,
  Calendar,
  Layers,
  ArrowRight,
  X
} from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FranchiseGuidesClientProps {
  initialGuides: any[];
  workspaceName: string;
}

export function FranchiseGuidesClient({
  initialGuides,
  workspaceName
}: FranchiseGuidesClientProps) {
  const [guides] = useState<any[]>(initialGuides);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [activeArticleModal, setActiveArticleModal] = useState<any | null>(null);

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

  // Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    guides.forEach(g => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [guides]);

  const hasSops = guides.some(g => g.guideType === "SOP");
  const sopCount = guides.filter(g => g.guideType === "SOP").length;

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      if (selectedCategory === "SOP_FILTER") {
        if (guide.guideType !== "SOP") return false;
      } else if (selectedCategory !== "ALL" && guide.category !== selectedCategory) {
        return false;
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
  }, [guides, selectedCategory, searchQuery]);

  const youtubeCount = guides.filter(g => g.contentType === "YOUTUBE").length;
  const pdfCount = guides.filter(g => g.contentType === "PDF").length;
  const articleCount = guides.filter(g => g.contentType === "ARTICLE" || g.contentType === "LINK").length;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Center User Guides & Tutorials"
        description={`Official operating manuals, video walk-throughs, and guidelines for ${workspaceName}.`}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Tutorials</p>
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
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Video Tutorials</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{youtubeCount}</p>
              </div>
              <div className="p-2.5 rounded-lg shrink-0 bg-red-500/10 text-red-600">
                <Video className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">PDF Manuals</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{pdfCount}</p>
              </div>
              <div className="p-2.5 rounded-lg shrink-0 bg-amber-500/10 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Step-by-Step Guides</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{articleCount}</p>
              </div>
              <div className="p-2.5 rounded-lg shrink-0 bg-emerald-500/10 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                placeholder="Search tutorials & operations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-slate-400"
              />
            </div>

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
              {hasSops && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("SOP_FILTER")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-all flex items-center gap-1",
                    selectedCategory === "SOP_FILTER"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 hover:bg-purple-100"
                  )}
                >
                  <Building2 className="w-3 h-3" />
                  <span>HQ Directives ({sopCount})</span>
                </button>
              )}
              {categories.map((cat) => (
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

        {/* Guides Grid */}
        <CardContent className="p-4 sm:p-5">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Tutorials Available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No user guides are currently published in this section. Your headquarters admin will add instructional videos and guides here.
              </p>
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
                          {guide.guideType === "SOP" && (
                            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-none text-[8px] font-bold px-1.5 py-0.5 flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5" />
                              <span>HQ Center SOP</span>
                            </Badge>
                          )}
                        </div>

                        {isYoutube && (
                          <Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                            <Video className="w-3 h-3 text-red-500" />
                            <span>Video</span>
                          </Badge>
                        )}
                        {isPdf && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-500" />
                            <span>PDF Manual</span>
                          </Badge>
                        )}
                        {isArticle && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-emerald-500" />
                            <span>Procedure</span>
                          </Badge>
                        )}
                        {isLink && (
                          <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-indigo-500" />
                            <span>Resource</span>
                          </Badge>
                        )}
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
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                      {isYoutube && guide.youtubeUrl && (
                        <Button
                          size="sm"
                          onClick={() => setActiveVideoModal(guide)}
                          className="h-8 w-full rounded-lg text-xs font-bold gap-1.5 shadow-sm bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Video Tutorial</span>
                        </Button>
                      )}

                      {isPdf && guide.pdfUrl && (
                        <a
                          href={guide.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-full rounded-lg text-xs font-bold gap-1.5 shadow-sm bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center justify-center px-3 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Open PDF Manual</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                        </a>
                      )}

                      {isArticle && (
                        <Button
                          size="sm"
                          onClick={() => setActiveArticleModal(guide)}
                          className="h-8 w-full rounded-lg text-xs font-bold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Step-by-Step Guide</span>
                          <ArrowRight className="w-3 h-3 ml-auto opacity-70" />
                        </Button>
                      )}

                      {isLink && guide.externalUrl && (
                        <a
                          href={guide.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-full rounded-lg text-xs font-bold gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center justify-center px-3 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Resource</span>
                        </a>
                      )}
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
                {activeArticleModal?.category || "Procedure"}
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
    </div>
  );
}
