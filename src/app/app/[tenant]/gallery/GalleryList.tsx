"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, Filter, SortDesc, SortAsc, LayoutGrid, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryItem {
  id: string;
  title: string | null;
  image: string;
  category: string | null;
  createdAt: string;
}

export function GalleryList({ initialItems, categories }: { initialItems: GalleryItem[], categories: string[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filteredItems = initialItems.filter(item => {
    const matchesSearch = (item.title?.toLowerCase().includes(search.toLowerCase()) || 
                         item.category?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="space-y-12">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-[3rem] border border-border/40 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search photos by topic or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-none bg-white dark:bg-zinc-900 shadow-md focus:ring-2 focus:ring-primary/20 text-lg font-medium"
          />
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              buttonVariants({ variant: "outline" }), 
              "h-14 px-6 rounded-2xl gap-3 font-bold border-none bg-white dark:bg-zinc-900 shadow-md hover:bg-primary/5 hover:text-primary transition-all cursor-pointer flex items-center"
            )}>
              <Filter className="w-5 h-5" />
              {selectedCategory === "All" ? "All Topics" : selectedCategory}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl p-2 min-w-[200px] shadow-2xl border-border/40">
              <DropdownMenuItem onClick={() => setSelectedCategory("All")} className="rounded-xl font-bold p-3">All Topics</DropdownMenuItem>
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)} className="rounded-xl font-bold p-3">{cat}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
            className="h-14 px-6 rounded-2xl gap-3 font-bold border-none bg-white dark:bg-zinc-900 shadow-md hover:bg-primary/5 hover:text-primary transition-all"
          >
            {sortBy === "newest" ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
            <span className="hidden sm:inline">{sortBy === "newest" ? "Newest" : "Oldest"}</span>
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-[180px]">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => {
             // Smart Grid Logic (Refined Bento Pattern for smaller scale)
             const isLarge = idx % 12 === 0;
             const isWide = idx % 12 === 5;
             const isTall = idx % 12 === 9;

             return (
               <motion.div 
                 key={item.id} 
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ duration: 0.4, delay: idx * 0.05 }}
                 className={cn(
                   "group relative overflow-hidden bg-muted border border-border/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-2 rounded-[1.5rem] sm:rounded-[2rem]",
                   isLarge ? "md:col-span-2 md:row-span-2" : 
                   isWide ? "md:col-span-2" : 
                   isTall ? "md:row-span-2" : "md:col-span-1 md:row-span-1"
                 )}
               >
                 <img 
                   src={item.image} 
                   alt={item.title || ""} 
                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                   <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white bg-primary px-2 py-0.5 rounded-full shadow-lg">
                         {item.category || "General"}
                       </span>
                     </div>
                     <h3 className={cn("font-black text-white leading-tight line-clamp-1", isLarge ? "text-lg" : "text-sm")}>
                       {item.title || "Gallery Moment"}
                     </h3>
                     <div className="flex items-center gap-2 text-[8px] text-white/50 font-black uppercase tracking-widest">
                       <Calendar className="w-2.5 h-2.5" />
                       {new Date(item.createdAt).toLocaleDateString('en-GB')}
                     </div>
                   </div>
                 </div>
               </motion.div>
             );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-32 space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
            <LayoutGrid className="w-10 h-10 text-primary/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">No memories found</h3>
            <p className="text-muted-foreground font-medium">Try adjusting your filters or search terms.</p>
          </div>
        </div>
      )}
    </div>
  );
}
