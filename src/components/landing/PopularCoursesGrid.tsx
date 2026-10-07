"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";

export function PopularCoursesGrid({ courses }: { courses: any[] }) {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="group relative bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="aspect-video w-full relative overflow-hidden bg-slate-100 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-800">
              {course.banner ? (
                <Image 
                  src={course.banner} 
                  alt={course.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
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
                    <Star 
                      key={star} 
                      className={`h-3.5 w-3.5 ${star <= Math.round(course.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700 fill-slate-300 dark:fill-zinc-700'}`} 
                    />
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
                  className="flex-1 rounded-xl h-11 font-bold border-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Details
                </Button>
                <Link 
                  href={`/nearest-center?courseId=${course.id}`}
                  className="flex-1"
                >
                  <Button 
                    className="w-full rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    Enroll
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CourseDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        course={selectedCourse} 
      />
    </>
  );
}
