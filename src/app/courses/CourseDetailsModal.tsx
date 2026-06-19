"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";
import { Clock, IndianRupee, BookOpen, Layers, Target, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CourseDetailsModal({ isOpen, onClose, course }: { isOpen: boolean, onClose: () => void, course: any }) {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-4xl max-h-[90vh] flex flex-col rounded-[2rem] p-0 border-0 gap-0 shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
        <DialogTitle className="sr-only">{course.name}</DialogTitle>
        <DialogClose className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all shadow-lg hover:scale-105 border border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="relative w-full h-64 sm:h-[22rem] bg-slate-100 dark:bg-zinc-800 shrink-0">
          {course.banner ? (
            <Image src={course.banner} alt={course.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-slate-300 dark:text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {course.short && (
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm sm:text-base font-black bg-primary text-white shadow-lg">
                  {course.short}
                </span>
              )}
              {course.groupId && (
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm sm:text-base font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {course.groupId.toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2">
              {course.name}
            </h2>
          </div>
        </div>
        
        <div className="p-8 sm:p-12 space-y-10 bg-white dark:bg-zinc-950">
          <div className="flex flex-wrap items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300 border-b border-border/50 pb-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Duration</div>
                <div className="text-base text-slate-900 dark:text-white">{course.duration || "Self-paced"}</div>
              </div>
            </div>
            
            {course.priceDisplay && course.showFee !== false && (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Course Fee</div>
                  <div className="text-base text-slate-900 dark:text-white">{course.priceDisplay}</div>
                </div>
              </div>
            )}

            {course.showFee === false && course.discountText && (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Special Offer</div>
                  <div className="text-base font-bold text-green-600 dark:text-green-500">{course.discountText}</div>
                </div>
              </div>
            )}

            {course.demand && (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Level / Demand</div>
                  <div className="text-base text-slate-900 dark:text-white">{course.demand}</div>
                </div>
              </div>
            )}
          </div>

          <div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
               <GraduationCap className="h-6 w-6 text-primary" />
               About this Course
             </h3>
             <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
               {course.description || "No description provided."}
             </p>
          </div>
          
          {course.syllabus && Object.keys(course.syllabus).length > 0 && (
            <div className="pt-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                Course Syllabus
              </h3>
              <div className="space-y-12 pl-2">
                {Object.entries(course.syllabus).map(([term, units]: [string, any], index: number) => (
                  <div key={term} className="relative">
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-black shadow-sm ring-4 ring-white dark:ring-zinc-950 shrink-0">
                        {index + 1}
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {term.replace(/_/g, " ")}
                      </h4>
                    </div>
                    
                    <div className="ml-5 border-l-2 border-dashed border-slate-200 dark:border-zinc-800 pl-8 pb-4 space-y-6">
                      {units.map((u: any, idx: number) => (
                        <div key={idx} className="relative group">
                          {/* Timeline dot */}
                          <div className="absolute -left-[39px] top-4 h-3 w-3 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-primary group-hover:scale-125 transition-all shadow-sm ring-4 ring-white dark:ring-zinc-950" />
                          
                          <div className="bg-slate-50 hover:bg-slate-100 transition-colors dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md">
                            <div className="font-bold text-slate-900 dark:text-white text-base mb-2 flex flex-col sm:flex-row sm:items-center gap-3">
                              <span className="text-primary whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-md text-xs tracking-wide">UNIT {u.unit}</span>
                              <span>{u.title}</span>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed sm:pl-[72px]">
                              {u.detail}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
        
        {/* Fixed Sticky Footer for Enroll */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
          <div className="hidden sm:block">
            {course.showFee !== false ? (
              <>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Course Fee</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  {course.priceDisplay || "Free"}
                  {course.price > 0 && <span className="text-base font-semibold text-slate-400 line-through">₹{course.price + 2000}</span>}
                </div>
              </>
            ) : course.discountText ? (
              <>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Limited Time Offer</div>
                <div className="text-2xl font-black text-green-600 dark:text-green-500 flex items-center gap-3">
                  {course.discountText}
                </div>
              </>
            ) : null}
          </div>
          <Link href={`/nearest-center?courseId=${course.id}`} className="w-full sm:w-auto">
            <Button className="w-full px-10 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 text-lg transition-transform active:scale-95">
              Enroll Now
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
