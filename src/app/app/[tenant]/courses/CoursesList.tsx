"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Star, Clock, BookOpen, Users, 
  ArrowRight, Filter, SlidersHorizontal, 
  ChevronDown, LayoutGrid, List, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";
import { useDebounce } from "@/hooks/useDebounce";

interface Course {
  id?: string;
  title: string;
  category?: string | null;
  fee: string;
  duration?: string | null;
  image?: string | null;
  students?: string;
  rating?: string;
  description: string;
  lessons?: string;
  discountText?: string | null;
  showFee?: boolean;
}

export function CoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 250);
  const categories = ["All", ...Array.from(new Set(initialCourses.map(c => c.category).filter(Boolean)))];

  const filteredCourses = React.useMemo(() => {
    return initialCourses.filter(course => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch = !q || course.title.toLowerCase().includes(q) || 
                           (course.description && course.description.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialCourses, debouncedSearch, selectedCategory]);

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Modern Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
          {/* Search Input - Full flex width, no artificial narrow cap */}
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input 
              placeholder="Search our programs, topics, or skills..." 
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

          {/* Right Controls: Category Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="relative flex-1 md:flex-none min-w-[150px] sm:min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 sm:h-11 pl-8.5 pr-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-xs sm:text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-none truncate"
              >
                {categories.map((cat: any) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-xs text-primary" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all",
                  viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-xs text-primary" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {categories.map((cat: any) => {
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
                  {cat === "All" ? "All Programs" : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Meta Count Bar */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium px-1">
          <span>
            Showing <strong>{filteredCourses.length}</strong> {filteredCourses.length === 1 ? "course" : "courses"}
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

      {/* Courses Grid/List */}
      <div className={cn(
        "grid gap-8",
        viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.title}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {viewMode === "grid" ? (
                <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex flex-col h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image 
                      src={course.image || "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070"} 
                      alt={course.title} 
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] shadow-xl uppercase border border-white/20">
                        {course.category}
                      </span>
                    </div>
                    <div className="absolute bottom-6 right-6 flex flex-col gap-1 items-end">
                      {course.showFee !== false ? (
                        <div className="bg-primary text-primary-foreground px-5 py-2 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 flex items-center gap-2">
                          <span>{course.fee}</span>
                        </div>
                      ) : course.discountText ? (
                        <div className="bg-primary text-primary-foreground px-5 py-2 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 text-green-300">
                          {course.discountText}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-black">{course.rating || "4.9"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold">{course.students || "1.2K+"} Students</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                        {course.description || "Learn from industry experts with our comprehensive curriculum designed for modern needs."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/40 mt-auto grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold text-xs">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold text-xs">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        {course.lessons || "12"} Lessons
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setDetailsCourse({
                            name: course.title,
                            banner: course.image,
                            category: course.category,
                            duration: course.duration,
                            priceDisplay: course.fee,
                            discountText: course.discountText,
                            showFee: course.showFee,
                            description: course.description,
                            syllabus: (course as any).topics // Assuming topics maps back to syllabus
                          });
                          setDetailsOpen(true);
                        }}
                        className="flex-1 rounded-xl h-12 font-bold text-xs border-primary/20 hover:bg-primary/5 text-primary transition-all"
                      >
                        View Details
                      </Button>
                      <Link href={`admission?courseId=${course.id}`} className="flex-1">
                        <Button className="w-full rounded-xl h-12 font-black text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none transition-all group/btn">
                          Enroll
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex flex-col md:flex-row h-full">
                  <div className="relative w-full md:w-80 min-h-[200px] overflow-hidden">
                    <Image 
                      src={course.image || "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070"} 
                      alt={course.title} 
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[8px] font-black tracking-widest shadow-lg uppercase border border-white/20">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 space-y-3">
                       <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-[10px] font-black">{course.rating || "4.9"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {course.showFee !== false ? (
                            <div className="text-xs font-black text-primary flex items-center gap-2">
                              <span>{course.fee}</span>
                            </div>
                          ) : course.discountText ? (
                            <div className="text-xs font-black text-green-600">
                              {course.discountText}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          {course.lessons || "12"} Lessons
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {course.students || "1.2K+"} Students
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setDetailsCourse({
                            name: course.title,
                            banner: course.image,
                            category: course.category,
                            duration: course.duration,
                            priceDisplay: course.fee,
                            discountText: course.discountText,
                            showFee: course.showFee,
                            description: course.description,
                            syllabus: (course as any).topics
                          });
                          setDetailsOpen(true);
                        }}
                        className="w-full md:w-auto px-8 rounded-xl h-12 font-bold text-xs border-primary/20 hover:bg-primary/5 text-primary transition-all"
                      >
                        View Details
                      </Button>
                      <Link href={`admission?courseId=${course.id}`} className="w-full md:w-auto">
                        <Button className="w-full px-8 rounded-xl h-12 font-black text-xs bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20">
                          Enroll Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-zinc-900 rounded-[4rem] border border-dashed border-border/60">
          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground/30">
            <Search className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No courses found</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Try matching with another category or search term.</p>
          </div>
        </div>
      )}

      <CourseDetailsModal 
        isOpen={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        course={detailsCourse} 
      />
    </div>
  );
}
