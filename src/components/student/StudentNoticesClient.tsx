"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Info,
  Clock,
  ExternalLink,
  Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StudentNoticesClient({ 
  notices: initialNotices, 
  settings, 
  tenant 
}: { 
  notices: any[], 
  settings: any, 
  tenant: string 
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filteredNotices = useMemo(() => {
    let result = initialNotices.filter((n: any) => 
      n.title?.toLowerCase().includes(search.toLowerCase()) || 
      n.description?.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [search, sortBy, initialNotices]);

  // Indian Date Formatter
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Notice Board</h1>
          <p className="text-slate-500 font-medium text-lg">Essential announcements and academic updates.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or content..." 
              className="h-14 pl-12 rounded-2xl bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none focus:ring-primary transition-all" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
              className="h-14 rounded-2xl px-6 font-bold gap-2 border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-xl shadow-slate-200/20 dark:shadow-none"
            >
              {sortBy === "newest" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              {sortBy === "newest" ? "Newest First" : "Oldest First"}
            </Button>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice: any, idx: number) => {
            const isToday = new Date(notice.date).toDateString() === new Date().toDateString();
            
            return (
              <Card key={idx} className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden hover:shadow-primary/5 transition-all duration-500 group relative">
                {isToday && (
                  <div className="absolute top-0 right-0 p-4">
                    <Badge className="bg-primary/10 text-primary border-none font-bold rounded-lg px-3 py-1 text-[9px] uppercase tracking-wider animate-pulse">
                      New Update
                    </Badge>
                  </div>
                )}
                
                <div className="p-8 lg:p-10 flex flex-col md:flex-row items-start gap-8">
                  {/* Date Block */}
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 transition-transform duration-500 group-hover:scale-110">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {new Date(notice.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                      {new Date(notice.date).toLocaleDateString('en-IN', { day: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge variant="outline" className="rounded-xl font-bold text-[10px] px-4 py-1.5 tracking-wider uppercase border-primary/20 bg-primary/5 text-primary">
                        <Tag className="w-3 h-3 mr-1.5" />
                        {notice.category || "General Announcement"}
                      </Badge>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" /> 
                        Published {formatDate(notice.date)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors leading-tight">
                        {notice.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-4xl">
                        {notice.description || "Detailed information regarding this announcement has been posted on the portal. Please contact the administration for further queries."}
                      </p>
                    </div>

                    {/* Meta Info / Action */}
                    <div className="pt-4 flex items-center gap-6 border-t border-slate-50 dark:border-white/5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Info className="w-4 h-4 text-primary" />
                        Verified Official Notice
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2 text-primary hover:bg-primary/5 ml-auto">
                        View Attachments <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center self-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="rounded-[3rem] p-24 text-center border-dashed border-2 border-slate-200 dark:border-white/10 bg-transparent">
            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
              <Bell className="w-10 h-10 text-slate-200 dark:text-white/20" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">No Notices Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg">
              {search ? "We couldn't find any notices matching your search criteria." : "There are currently no active announcements on your board."}
            </p>
            {search && (
              <Button 
                variant="link" 
                onClick={() => setSearch("")}
                className="mt-4 font-bold text-primary"
              >
                Clear Search Filter
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
