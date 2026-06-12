"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getGlobalCourses } from "@/app/actions/globalCourse";
import { getGlobalCourseGroups } from "@/app/actions/globalCourseGroup";
import Image from "next/image";
import { Search, BookOpen, Clock, IndianRupee, Filter, Loader2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import CourseDetailsModal from "./CourseDetailsModal";

export default function CoursesPageClient({ initialData, initialGroups = [] }: { initialData: any, initialGroups?: any[] }) {
  const [courses, setCourses] = useState(initialData.courses);
  const [total, setTotal] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getGlobalCourses(search, group, page, 12, true);
      setCourses(res.courses);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [search, group, page]);

  const isMounted = React.useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const timeout = setTimeout(fetchCourses, 400);
    return () => clearTimeout(timeout);
  }, [search, group, page, fetchCourses]);

  const [courseGroups, setCourseGroups] = useState<any[]>(initialGroups);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Smart Search & Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-[2rem] p-4 md:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 mb-16 flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search for courses (e.g. DCA, Python)..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-12 h-14 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 focus-visible:border-primary text-base font-medium"
          />
        </div>
        <div className="w-full md:w-[300px] shrink-0 relative">
          <Select value={group} onValueChange={(val) => { setGroup(val as string); setPage(1); }}>
            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 focus:ring-0 focus:border-primary text-base font-medium capitalize">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-2">
              <SelectItem value="all" className="rounded-xl py-3 font-medium cursor-pointer">
                All Categories
              </SelectItem>
              {courseGroups.filter(g => g.isActive).map(g => (
                <SelectItem key={g.value} value={g.value} className="rounded-xl py-3 font-medium cursor-pointer">
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {total} {total === 1 ? 'Course' : 'Courses'} Found
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating results...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {courses.map((course: any, idx: number) => (
            <motion.div 
              key={course.id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="group flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="aspect-video w-full relative overflow-hidden bg-slate-100 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-800">
                {course.banner ? (
                  <Image 
                    src={course.banner} 
                    alt={course.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-300 dark:text-zinc-700" />
                  </div>
                )}
                {course.popular && (
                  <div className="absolute top-3 left-3 bg-amber-500 px-2.5 py-1 rounded-md text-[10px] font-black text-white shadow-sm uppercase tracking-wider">
                    POPULAR
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                {/* Short Name & Duration */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-base font-black text-primary uppercase tracking-wider truncate pr-2">
                    {course.short || course.groupId || "COURSE"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                    {course.duration || "Self-paced"}
                  </div>
                </div>
                
                {/* Full Name */}
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {course.name}
                </h3>
                
                {/* Price & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {course.showFee ? (
                      <>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {course.priceDisplay || "Free"}
                        </span>
                        {course.price > 0 && (
                          <span className="text-sm font-medium text-slate-400 line-through">
                            ₹{course.price + 2000}
                          </span>
                        )}
                      </>
                    ) : course.discountText ? (
                      <span className="text-sm sm:text-base font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-200 dark:border-green-500/20 shadow-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                        {course.discountText}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(course.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700 fill-slate-300 dark:fill-zinc-700'}`} />
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{course.rating || "5.0"}</span>
                  </div>
                </div>
                
                {/* Description */}
                {course.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-5 flex-1">
                    {course.description}
                  </p>
                )}

                {/* Separator & Buttons */}
                <div className="pt-4 mt-auto border-t border-slate-100 dark:border-zinc-800 flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => { setSelectedCourse(course); setIsModalOpen(true); }}
                    className="flex-1 rounded-xl h-11 font-bold border-2 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  >
                    Details
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {courses.length === 0 && !isLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Courses Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              We couldn't find any courses matching your current filters. Try adjusting your search or category.
            </p>
            <Button variant="outline" onClick={() => { setSearch(""); setGroup("all"); }} className="mt-8 rounded-xl h-12 px-6">
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            disabled={page === 1 || isLoading} 
            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl h-12 px-6 font-bold flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </Button>
          <div className="text-sm font-semibold text-slate-500">
            Page {page} of {totalPages}
          </div>
          <Button 
            variant="outline" 
            disabled={page === totalPages || isLoading} 
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl h-12 px-6 font-bold flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      <CourseDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        course={selectedCourse} 
      />
    </div>
  );
}
