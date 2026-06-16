"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Star, Clock, BookOpen, Users, 
  ArrowRight, Filter, SlidersHorizontal, 
  ChevronDown, LayoutGrid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";

interface Course {
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

  const categories = ["All", ...Array.from(new Set(initialCourses.map(c => c.category).filter(Boolean)))];

  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                         course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-6 bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] shadow-sm">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search our programs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-none bg-slate-50 dark:bg-zinc-800 font-medium text-lg focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-14 pl-12 pr-10 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              {categories.map((cat: any) => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="h-8 w-px bg-border/40 hidden lg:block mx-2" />

          <div className="flex bg-slate-50 dark:bg-zinc-800 p-1.5 rounded-2xl">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-11 w-11 rounded-xl transition-all",
                viewMode === "grid" ? "bg-white dark:bg-zinc-700 shadow-md text-primary" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("list")}
              className={cn(
                "h-11 w-11 rounded-xl transition-all",
                viewMode === "list" ? "bg-white dark:bg-zinc-700 shadow-md text-primary" : "text-muted-foreground"
              )}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Showing {filteredCourses.length} Courses</span>
        <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
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
                    <img 
                      src={course.image || "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070"} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
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
                      <Button className="flex-1 rounded-xl h-12 font-black text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none transition-all group/btn">
                        Enroll
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex flex-col md:flex-row h-full">
                  <div className="relative w-full md:w-80 overflow-hidden">
                    <img 
                      src={course.image || "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070"} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
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
                      <Button className="w-full md:w-auto px-8 rounded-xl h-12 font-black text-xs bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20">
                        Enroll Now
                      </Button>
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
