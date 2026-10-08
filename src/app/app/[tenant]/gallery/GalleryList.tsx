"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Search,
  Filter,
  SortDesc,
  SortAsc,
  LayoutGrid,
  Calendar,
  X,
  Eye,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryItem {
  id: string;
  title: string | null;
  image: string;
  category: string | null;
  createdAt: string;
}

export function GalleryList({
  initialItems,
  categories
}: {
  initialItems: GalleryItem[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const filteredItems = initialItems
    .filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const allCategoryTabs = ["All", ...categories];

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Modern Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
          {/* Search Input - Full flex width, no artificial narrow cap */}
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              placeholder="Search photos by topic, title, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-9 h-10 sm:h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary shadow-none w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Controls: Filter Dropdown & Sort Button */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 sm:h-11 px-3 sm:px-4 rounded-xl gap-2 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex-1 md:flex-none justify-center cursor-pointer shadow-none"
                )}
              >
                <Filter className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[130px]">
                  {selectedCategory === "All" ? "All Topics" : selectedCategory}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 opacity-60 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl p-1.5 min-w-[200px] shadow-lg border border-slate-200 dark:border-slate-800"
              >
                {allCategoryTabs.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-lg font-medium text-xs py-2 px-2.5 flex items-center justify-between cursor-pointer",
                      selectedCategory === cat
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
              className="h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl gap-1.5 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0 shadow-none"
              title={`Sorting by ${sortBy === "newest" ? "Newest first" : "Oldest first"}`}
            >
              {sortBy === "newest" ? (
                <SortDesc className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              ) : (
                <SortAsc className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              )}
              <span>{sortBy === "newest" ? "Newest" : "Oldest"}</span>
            </Button>
          </div>
        </div>

        {/* Quick Category Tabs (Horizontal Scroll on Mobile) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {allCategoryTabs.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full shrink-0 transition-all font-medium whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Meta count bar */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium px-1">
          <span>
            Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? "photo" : "photos"}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </span>
          {(search || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="text-primary hover:underline font-bold"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-[160px] sm:auto-rows-[180px]">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => {
            const isLarge = idx % 12 === 0;
            const isWide = idx % 12 === 5;
            const isTall = idx % 12 === 9;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                onClick={() => setPreviewItem(item)}
                className={cn(
                  "group relative overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl cursor-pointer",
                  isLarge ? "col-span-2 row-span-2" : isWide ? "col-span-2" : isTall ? "row-span-2" : "col-span-1 row-span-1"
                )}
              >
                <Image
                  fill
                  src={item.image}
                  alt={item.title || "Campus Gallery"}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
                  <div className="space-y-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-primary/90 px-2 py-0.5 rounded-full shadow-xs">
                        {item.category || "General"}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <Eye className="w-3 h-3" />
                      </div>
                    </div>
                    <h3
                      className={cn(
                        "font-bold text-white leading-tight line-clamp-1",
                        isLarge ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                      )}
                    >
                      {item.title || "Campus Moment"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/70 font-semibold">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20 sm:py-24 space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No photos found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any photos matching &quot;{search}&quot;. Try adjusting your keywords or category filter.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="rounded-xl text-xs font-semibold h-8 px-4"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Photo Preview Dialog / Modal */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-4xl p-2 sm:p-3 overflow-hidden bg-slate-950 border-slate-800 text-white rounded-2xl sm:rounded-3xl">
          {previewItem && (
            <div className="space-y-3">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[75vh] rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                <Image
                  fill
                  src={previewItem.image}
                  alt={previewItem.title || "Gallery image"}
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              </div>
              <div className="px-2 py-1 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {previewItem.title || "Campus Gallery"}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-primary font-bold">
                      {previewItem.category || "General"}
                    </span>
                    <span>•</span>
                    <span>{new Date(previewItem.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
