"use client";

// Client component for Learner Courses Path

import React from "react";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  GraduationCap, 
  ChevronRight, 
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Trophy,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Progress = ({ value, className, style }: { value?: number, className?: string, style?: React.CSSProperties }) => (
  <div
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10",
      className
    )}
  >
    <div
      className="h-full w-full flex-1 transition-all duration-500 ease-in-out"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundColor: "var(--progress-background, currentColor)",
        ...style
      }}
    />
  </div>
);

export default function StudentCoursesClient({ 
  currentCourse, 
  otherCourses, 
  profile, 
  settings, 
  tenant 
}: { 
  currentCourse: any, 
  otherCourses: any[], 
  profile: any, 
  settings: any, 
  tenant: string 
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";
  const progress = 65; // Mock progress

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">My Learning Path</h1>
        <p className="text-slate-500 font-medium text-lg">Continue your journey and explore new horizons.</p>
      </div>

      {/* Current Course Card - Premium Redesign */}
      {currentCourse ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
              Current Enrollment
            </h2>
            <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-bold text-xs border-2 text-primary border-primary/20 bg-primary/5 uppercase tracking-wide">
              Active Session
            </Badge>
          </div>

          <Card className="rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 group transition-all duration-500 hover:shadow-primary/5">
            <div className="grid lg:grid-cols-12 gap-0">
               {/* Left: Course Image/Preview */}
               <div className="lg:col-span-4 relative h-72 lg:h-auto overflow-hidden">
                  {currentCourse.image ? (
                    <img src={currentCourse.image} alt={currentCourse.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-20 h-20 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                     <Button className="w-full bg-white text-black hover:bg-slate-100 rounded-2xl font-bold gap-3 py-6 shadow-2xl">
                        <PlayCircle className="w-5 h-5" /> Resume Learning
                     </Button>
                  </div>
               </div>

               {/* Right: Detailed Progress */}
               <div className="lg:col-span-8 p-8 lg:p-12 space-y-8">
                  <div className="space-y-4">
                    <CardTitle className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">{currentCourse.title}</CardTitle>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed line-clamp-2">
                      {currentCourse.description || "Deep dive into your professional learning path with curated modules and practical sessions."}
                    </p>
                  </div>

                  {/* Progress Metrics */}
                  <div className="space-y-4 bg-slate-50 dark:bg-white/5 p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                     <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" /> Overall Progress
                        </p>
                        <span className="font-bold text-primary">{progress}% Completed</span>
                     </div>
                     <Progress value={progress} className="h-3 rounded-full" style={{ "--progress-background": primaryColor } as any} />
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time Left</p>
                           <p className="font-bold text-sm">4 Weeks</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Remaining</p>
                           <p className="font-bold text-sm">8 Chapters</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Done</p>
                           <p className="font-bold text-sm">12 Modules</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Next Class</p>
                           <p className="font-bold text-sm">Mon, 10 AM</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </Card>
        </section>
      ) : (
        <Card className="rounded-[3rem] p-20 text-center border-dashed border-2 border-slate-200 dark:border-white/10 bg-transparent">
          <BookOpen className="w-16 h-16 text-slate-200 dark:text-white/10 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">No Active Enrollment</h3>
          <p className="text-slate-500 font-medium mt-2">You haven't been assigned to any course yet. Contact your administrator to get started.</p>
        </Card>
      )}

      {/* AI Recommendations - Modern Glassmorphism */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            AI Suggested For You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherCourses.map((course, idx) => (
            <Card key={idx} className="rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="relative h-48 overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-md text-black hover:bg-white border-none font-bold rounded-lg px-3 py-1 text-[10px] uppercase tracking-wider">
                    {idx === 0 ? "Best Match" : "Trending"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{course.description || "Expand your expertise with this advanced specialization."}</p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-50 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Duration</span>
                      <span className="text-xs font-bold">{course.duration || "12 Weeks"}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold group-hover:bg-primary group-hover:text-white transition-all">
                    Explore <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* AI CTA Placeholder */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             <div>
                <Sparkles className="w-8 h-8 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold leading-tight mb-2">Want a Custom Learning Path?</h3>
                <p className="text-white/70 font-medium">Let our AI analyze your goals and suggest the perfect courses for your career.</p>
             </div>
             <Button className="mt-8 bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl font-bold gap-2">
                Generate Path <ArrowRight className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
