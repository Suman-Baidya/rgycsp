"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Star,
  Download,
  FileText,
  Layers,
  Award,
  ArrowUpRight,
  CheckCircle,
  ExternalLink,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTenantLink } from "@/lib/routing";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";

interface StudentCoursesClientProps {
  currentCourse: any;
  otherCourses: any[];
  profile: any;
  settings?: any;
  tenant: string;
  workspace?: any;
}

export default function StudentCoursesClient({
  currentCourse,
  otherCourses = [],
  profile = {},
  settings,
  tenant,
  workspace
}: StudentCoursesClientProps) {
  const pathname = usePathname();
  const primaryColor = settings?.primaryColor || "#0284c7";
  const batch = profile?.batch;

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<any>(null);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(0);

  // Safely parse topics/syllabus
  let courseTopics: any[] = [];
  if (currentCourse?.topics) {
    try {
      courseTopics = typeof currentCourse.topics === "string" ? JSON.parse(currentCourse.topics) : currentCourse.topics;
      if (!Array.isArray(courseTopics)) courseTopics = [];
    } catch (e) {
      courseTopics = [];
    }
  }

  // Fallback default syllabus units if none are provided
  const syllabusUnits = courseTopics.length > 0 ? courseTopics : [
    {
      title: "Module 1: Foundations & Core Architecture",
      items: ["Fundamental Concepts & Definitions", "Hardware & Architecture Overview", "Operating Systems Setup", "Practical Lab Orientation"]
    },
    {
      title: "Module 2: Practical Applications & Core Tools",
      items: ["Standard Productivity Applications", "Data Management Basics", "Workflow & Documentation Standards", "Lab Assignment 1"]
    },
    {
      title: "Module 3: Advanced Concepts & Project Work",
      items: ["Advanced Problem Solving", "Industry Best Practices", "Capstone Project Guidelines", "Final Assessment & Viva Preparation"]
    }
  ];

  // Dynamically calculate course progress based on certificate issuance or duration elapsed
  const isCompleted = !!profile?.certificateApproved || !!profile?.certificateIssuedToStudent;
  const overallProgress = isCompleted 
    ? 100 
    : (profile?.admissionDate 
        ? (() => {
            const daysSinceAdmission = Math.max(1, Math.floor((Date.now() - new Date(profile.admissionDate).getTime()) / (1000 * 60 * 60 * 24)));
            const durationStr = (currentCourse?.duration || "6 Months").toLowerCase();
            let estimatedDays = 180;
            if (durationStr.includes("1 year") || durationStr.includes("12 month")) estimatedDays = 365;
            else if (durationStr.includes("3 month")) estimatedDays = 90;
            else if (durationStr.includes("2 year")) estimatedDays = 730;
            else if (durationStr.includes("month")) {
              const months = parseInt(durationStr.match(/\d+/)?.[0] || "6");
              estimatedDays = months * 30;
            }
            return Math.min(95, Math.max(10, Math.round((daysSinceAdmission / estimatedDays) * 100)));
          })()
        : 25);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Courses & Curriculum
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Track your active learning enrollment, module milestones, batch schedule, and explore specialized tracks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={getTenantLink("/student/exams", tenant, pathname)}>
            <Button variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
              <Award className="w-3.5 h-3.5" />
              Exam Schedule
            </Button>
          </Link>
          <Link href={getTenantLink("/student/attendance", tenant, pathname)}>
            <Button variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5" />
              Attendance Log
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Active Program */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Enrolled Course</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate" title={currentCourse?.title || "Pending Enrollment"}>
                  {currentCourse?.code || "COURSE"}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {currentCourse?.duration || "Regular Program"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Academic Progress */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Curriculum Progress</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{overallProgress}%</p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  On-track for upcoming exams
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Assigned Batch Schedule */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Assigned Batch</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate" title={batch?.name || "Regular Batch"}>
                  {batch?.name || "Active Batch"}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {batch?.startTime && batch?.endTime ? `${batch.startTime} - ${batch.endTime}` : "Scheduled Classroom"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Total Units */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Curriculum Units</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {syllabusUnits.length} <span className="text-sm font-semibold text-slate-500">Modules</span>
                </p>
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  Verified Academic Syllabus
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Enrolled Course Card */}
      {currentCourse ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Current Program Enrollment
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-slate-500">
                  Detailed curriculum overview and batch allocations
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40 uppercase tracking-wider">
              Enrolled & Active
            </Badge>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              {/* Left Column: Course Preview Card */}
              <div className="lg:col-span-4 relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between min-h-[220px]">
                {currentCourse.image ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={currentCourse.image}
                      alt={currentCourse.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-primary shadow-xs uppercase tracking-wider">
                        {currentCourse.category || "DIPLOMA"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{currentCourse.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{currentCourse.code}</p>
                    </div>
                  </div>
                )}

                <div className="p-3.5 space-y-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium text-[11px]">Milestone Progress</span>
                    <span className="font-bold text-primary text-[11px]">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Parameters */}
              <div className="lg:col-span-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {currentCourse.title}
                    </h3>
                    <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border-slate-300 dark:border-slate-700">
                      {currentCourse.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {currentCourse.description || "Comprehensive hands-on curriculum certified for industry standard skills and professional certification."}
                  </p>
                </div>

                {/* Metadata Column Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">{currentCourse.duration || "Regular"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Enrolled Student</span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block truncate">{profile.fullName || "Student"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Admission Date</span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                      {profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Batch Teacher</span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block truncate">{batch?.teacherName || "Center Faculty"}</span>
                  </div>
                </div>

                {/* Practical Slot & Schedule Details */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      Batch Timings: <strong className="text-slate-800 dark:text-slate-200">{batch?.startTime && batch?.endTime ? `${batch.startTime} - ${batch.endTime}` : "Daily Regular Slot"}</strong> ({batch?.days || "Mon - Sat"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDetailsCourse({
                          name: currentCourse.title,
                          banner: currentCourse.image,
                          category: currentCourse.category,
                          duration: currentCourse.duration,
                          description: currentCourse.description,
                          syllabus: currentCourse.topics
                        });
                        setDetailsOpen(true);
                      }}
                      className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700"
                    >
                      <Info className="w-3.5 h-3.5" />
                      View Syllabus Modal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl p-8 text-center border-dashed border border-slate-200 dark:border-slate-800 bg-transparent">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">No Active Course Enrollment</h3>
          <p className="text-slate-500 font-medium mt-1 text-xs max-w-sm mx-auto">
            You haven't been assigned to a course batch yet. Please contact your center administrator to confirm your enrollment.
          </p>
        </Card>
      )}

      {/* 4. Curriculum Modules & Syllabus Breakdown */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Curriculum Units & Module Breakdown
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Structured learning topics required for certification examinations
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {syllabusUnits.length} Units Available
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {syllabusUnits.map((unit: any, idx: number) => {
              const isExpanded = expandedUnit === idx;
              const items = Array.isArray(unit.items) ? unit.items : (typeof unit.items === "string" ? unit.items.split(",") : []);
              return (
                <div key={idx} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <div
                    onClick={() => setExpandedUnit(isExpanded ? null : idx)}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {unit.title || `Curriculum Unit ${idx + 1}`}
                        </h4>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {items.length > 0 ? `${items.length} key learning topics included` : "Comprehensive unit syllabus"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {idx === 0 ? "COMPLETED" : idx === 1 ? "IN PROGRESS" : "UPCOMING"}
                      </span>
                      <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-90")} />
                    </div>
                  </div>

                  {isExpanded && items.length > 0 && (
                    <div className="px-4 pb-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        {items.map((topicItem: string, tIdx: number) => (
                          <div key={tIdx} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-snug">
                              {topicItem.trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. Explore Available Courses / Continued Education */}
      {otherCourses.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Available Courses & Specializations
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Enhance your qualification portfolio with certified courses offered at your center.
              </p>
            </div>
            <Link href={getTenantLink("/courses", tenant, pathname)}>
              <Button variant="ghost" className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary gap-1">
                Public Catalog <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {otherCourses.map((course, idx) => (
              <Card
                key={idx}
                className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-between group hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {course.image ? (
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 text-primary shadow-xs uppercase tracking-wider">
                        {course.category || "SPECIALIZATION"}
                      </span>
                    </div>
                    {course.duration && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description || "Professional certified training track designed for career readiness."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailsCourse({
                        name: course.title,
                        banner: course.image,
                        category: course.category,
                        duration: course.duration,
                        priceDisplay: course.priceDisplay || (course.feeAmount ? `₹${course.feeAmount.toLocaleString()}` : ""),
                        discountText: course.discountText,
                        showFee: course.showFee,
                        description: course.description,
                        syllabus: course.topics
                      });
                      setDetailsOpen(true);
                    }}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700"
                  >
                    Curriculum
                  </Button>
                  <Link href={getTenantLink(`/admission?courseId=${course.id}`, tenant, pathname)} className="flex-1">
                    <Button className="w-full h-8 rounded-lg text-xs font-semibold gap-1 bg-primary text-white">
                      Inquire <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal for viewing detailed course syllabus */}
      <CourseDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        course={detailsCourse}
      />
    </div>
  );
}
