"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Trophy,
  ArrowRight,
  User,
  GraduationCap,
  Star
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTenantLink } from "@/lib/routing";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";

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
  const pathname = usePathname();
  const primaryColor = settings?.primaryColor || "#0f172a";
  const progress = 65; // Mock progress

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<any>(null);

  // Safely parse topics/syllabus
  let courseTopics: any[] = [];
  if (currentCourse?.topics) {
    try {
      courseTopics = typeof currentCourse.topics === 'string' ? JSON.parse(currentCourse.topics) : currentCourse.topics;
      if (!Array.isArray(courseTopics)) courseTopics = [];
    } catch (e) {
      courseTopics = [];
    }
  }

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

                  {/* Enhanced Student & Course Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2 border-b border-slate-100 dark:border-white/5">
                      <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><User className="w-3 h-3" /> Enrolled As</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{profile.fullName}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Admission Date</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{new Date(profile.admissionDate).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{currentCourse.duration || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Total Units</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{courseTopics.length > 0 ? courseTopics.length : "N/A"}</p>
                      </div>
                  </div>

                  {/* Syllabus / Topics Overview */}
                  {courseTopics.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Course Curriculum</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courseTopics.slice(0, 4).map((topic: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-start gap-3 group hover:border-primary/50 transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-bold text-xs">{idx + 1}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{topic.title || `Semester ${idx + 1}`}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">
                                {topic.items && Array.isArray(topic.items) ? `${topic.items.length} Modules` : 'Pending Setup'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {courseTopics.length > 4 && (
                        <p className="text-xs font-bold text-primary text-center pt-2 cursor-pointer hover:underline">+ {courseTopics.length - 4} more units</p>
                      )}
                    </div>
                  )}

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
            Trending Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherCourses.map((course, idx) => (
            <Card key={idx} className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex flex-col h-full">
              <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                <img 
                  src={course.image || "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070"} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Badges */}
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] shadow-xl uppercase border border-white/20">
                    {idx === 0 ? "TOP TRENDING" : "TRENDING"}
                  </span>
                </div>
                
                {/* Duration/Fee Floating Badge */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-1 items-end">
                  <div className="bg-primary text-primary-foreground px-5 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-2xl shadow-primary/40 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration || "12 Weeks"}</span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs font-black">4.9</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                    {course.description || "Expand your expertise with this advanced specialization."}
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center gap-3 mt-auto border-t border-slate-50 dark:border-white/5">
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setDetailsCourse({
                        name: course.title,
                        banner: course.image,
                        category: course.category,
                        duration: course.duration,
                        priceDisplay: course.priceDisplay || course.feeAmount,
                        discountText: course.discountText,
                        showFee: course.showFee,
                        description: course.description,
                        syllabus: course.topics
                      });
                      setDetailsOpen(true);
                    }}
                    className="flex-1 rounded-xl h-12 font-bold text-xs border-primary/20 hover:bg-primary/5 text-primary transition-all"
                  >
                    View Details
                  </Button>
                  <Link href={getTenantLink(`/admission?courseId=${course.id}`, tenant, pathname)} className="flex-1">
                    <Button className="w-full rounded-xl h-12 font-black text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none transition-all group/btn">
                      Enroll <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
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

      <CourseDetailsModal 
        isOpen={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        course={detailsCourse} 
      />
    </div>
  );
}
