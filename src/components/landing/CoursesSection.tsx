import React from "react";
import { db } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, IndianRupee, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function CoursesSection() {
  const popularCourses = await db.globalCourse.findMany({
    where: { 
      isActive: true,
      popular: true 
    },
    take: 6,
    orderBy: { createdAt: "desc" }
  });

  if (popularCourses.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 dark:bg-zinc-950 relative overflow-hidden" id="courses">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Our Programs</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Courses</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore our most sought-after programs designed to build your skills and advance your career in the digital world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularCourses.map((course) => (
            <div key={course.id} className="group relative bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
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
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3 line-clamp-2 leading-snug">
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
                  <Link 
                    href={`/courses`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "flex-1 rounded-xl h-11 font-bold border-2 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center"
                    )}
                  >
                    Details
                  </Link>
                  <Link 
                    href={`/courses`}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "flex-1 rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 flex items-center justify-center"
                    )}
                  >
                    Enroll
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/courses"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-2xl border-2 h-14 px-8 font-bold text-base hover:bg-slate-50 dark:hover:bg-zinc-900"
            )}
          >
            Explore All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
