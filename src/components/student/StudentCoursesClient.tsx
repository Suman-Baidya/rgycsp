"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Info,
  Loader2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getTenantLink } from "@/lib/routing";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";
import { applyForStudentReAdmission } from "@/app/actions/admissions";
import { toast } from "sonner";

interface StudentCoursesClientProps {
  currentCourse: any;
  otherCourses: any[];
  profile: any;
  activeProfiles?: any[];
  completedProfiles?: any[];
  student?: any;
  settings?: any;
  tenant: string;
  workspace?: any;
}

export default function StudentCoursesClient({
  currentCourse,
  otherCourses = [],
  profile = {},
  activeProfiles = [],
  completedProfiles = [],
  student = {},
  settings,
  tenant,
  workspace
}: StudentCoursesClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const batch = profile?.batch;

  const [activeTab, setActiveTab] = useState<"active" | "previous" | "explore">("active");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<any>(null);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(0);

  // Re-Admission Modal State
  const [reEnrollModalOpen, setReEnrollModalOpen] = useState(false);
  const [selectedCourseForReEnroll, setSelectedCourseForReEnroll] = useState<any>(null);
  const [reEnrollRemarks, setReEnrollRemarks] = useState("");
  const [isSubmittingReEnroll, setIsSubmittingReEnroll] = useState(false);

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

  const handleOpenReEnroll = (course: any) => {
    setSelectedCourseForReEnroll(course);
    setReEnrollRemarks("");
    setReEnrollModalOpen(true);
  };

  const handleSubmitReEnroll = async () => {
    if (!selectedCourseForReEnroll || !workspace?.id) return;
    setIsSubmittingReEnroll(true);
    try {
      const res = await applyForStudentReAdmission(workspace.id, selectedCourseForReEnroll.id, reEnrollRemarks);
      if (res.success) {
        toast.success(res.message || "Re-admission application submitted successfully!");
        setReEnrollModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to submit application");
      }
    } catch (e: any) {
      toast.error(e.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingReEnroll(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Courses & Curriculum
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Track your active learning enrollment, previous completed courses, and apply for new course re-admissions.
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
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Active Course</p>
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
                  On-track for milestones
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

        {/* Metric 4: Completed Credentials */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Past Credentials</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {completedProfiles.length} <span className="text-sm font-semibold text-slate-500">Passed</span>
                </p>
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                  Verified Institutional History
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Horizontal Navigation Tabs (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-full">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all ${
            activeTab === "active"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Active Curriculum
        </button>

        <button
          onClick={() => setActiveTab("previous")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all ${
            activeTab === "previous"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Previous & Completed Courses
          {completedProfiles.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              {completedProfiles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all ${
            activeTab === "explore"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Explore & Re-Admission ({otherCourses.length})
        </button>
      </div>

      {/* 4. TAB 1: ACTIVE CURRICULUM */}
      {activeTab === "active" && (
        <div className="space-y-4">
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

                {/* Units / Syllabus List */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Curriculum Units & Learning Outcomes
                  </h4>
                  <div className="space-y-2">
                    {syllabusUnits.map((unit: any, idx: number) => {
                      const isExpanded = expandedUnit === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200/70 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-all"
                        >
                          <button
                            onClick={() => setExpandedUnit(isExpanded ? null : idx)}
                            className="w-full flex items-center justify-between p-3 sm:p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </div>
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {unit.title}
                              </span>
                            </div>
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 text-slate-400 transition-transform duration-200",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </button>

                          {isExpanded && unit.items && (
                            <div className="p-3 sm:p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {unit.items.map((item: string, iIdx: number) => (
                                  <li key={iIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 text-center bg-white dark:bg-slate-900">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Active Course Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You are not currently enrolled in an active course. You can explore available programs and apply for enrollment.
              </p>
              <Button onClick={() => setActiveTab("explore")} className="mt-4 h-8 px-4 rounded-lg text-xs font-semibold gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Explore Available Courses
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 5. TAB 2: PREVIOUS & COMPLETED COURSES */}
      {activeTab === "previous" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Historical & Completed Course Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Official certificates, marksheet history, and archived credentials for completed programs.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40">
              {completedProfiles.length} Completed
            </Badge>
          </div>

          {completedProfiles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {completedProfiles.map((cp: any) => {
                const cCourse = cp.course || cp.batch?.course;
                const semList = cp.semesters || [];
                return (
                  <Card key={cp.id} className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {cCourse?.title || cp.fullName}
                            </CardTitle>
                            {cCourse?.code && (
                              <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                {cCourse.code}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Enrollment: <strong className="text-slate-700 dark:text-slate-300">{cp.enrollmentNo}</strong> • Reg: <strong className="text-emerald-600 dark:text-emerald-400">{cp.registrationNo || "Registered"}</strong>
                          </CardDescription>
                        </div>
                      </div>

                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                        Pass Out / Graduated
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-3.5 sm:p-5 space-y-4">
                      {/* Meta Columns */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Admission Date</span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                            {cp.admissionDate ? new Date(cp.admissionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Archived"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                            {cCourse?.duration || "Completed"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Certificate Status</span>
                          <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 block flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {cp.certificateApproved || cp.certificateIssuedToStudent ? "Official Issued" : "Certified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Data Snapshot</span>
                          <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 mt-0.5 block">
                            Historical Locked
                          </span>
                        </div>
                      </div>

                      {/* Documents / Credentials Downloads */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Verified Program Documents & Credentials
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Certificate Link */}
                          <Link href={getTenantLink("/student/profile", tenant, pathname)}>
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600">
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                              View Certificate
                            </Button>
                          </Link>

                          {/* Semester Marksheets */}
                          {semList.length > 0 ? (
                            semList.map((sem: any) => (
                              <Link key={sem.id} href={getTenantLink("/student/profile", tenant, pathname)}>
                                <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
                                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                                  Sem {sem.semesterNumber} Marksheet
                                </Button>
                              </Link>
                            ))
                          ) : (
                            <Link href={getTenantLink("/student/profile", tenant, pathname)}>
                              <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                Official Marksheet
                              </Button>
                            </Link>
                          )}

                          <Link href={getTenantLink("/student/profile", tenant, pathname)}>
                            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 text-slate-500">
                              <Download className="w-3.5 h-3.5" />
                              Student ID Archive
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 text-center bg-white dark:bg-slate-900">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-500 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Completed Courses Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                As soon as you finish your active curriculum and your completion certificate is issued, your full course archive, marksheets, and certifications will appear here permanently.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* 6. TAB 3: EXPLORE & RE-ADMISSION */}
      {activeTab === "explore" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Available Courses in Center
              </h2>
              <p className="text-xs text-slate-500">
                Enroll in another course or re-admit with your permanent ID. All biodata is automatically retained.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded self-start sm:self-auto">
              {otherCourses.length} Programs Available
            </Badge>
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
                        {course.category || "PROGRAM"}
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      {course.feeAmount && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          ₹{course.feeAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description || "Professional certified training track designed for career readiness and recognized certification."}
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
                  <Button
                    onClick={() => handleOpenReEnroll(course)}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold gap-1 bg-primary text-white hover:bg-primary/90"
                  >
                    <Sparkles className="w-3 h-3" /> Apply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 7. RE-ADMISSION / NEW COURSE APPLICATION DIALOG (Rule 7.7) */}
      <Dialog open={reEnrollModalOpen} onOpenChange={setReEnrollModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Apply for Re-Admission / Additional Course
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Confirm your enrollment into <strong className="text-slate-800 dark:text-slate-200">{selectedCourseForReEnroll?.title}</strong>. Your permanent Enrollment No will be retained.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Selected Course Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Target Program</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {selectedCourseForReEnroll?.title} ({selectedCourseForReEnroll?.code || "COURSE"})
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span>Duration: <strong className="text-slate-700 dark:text-slate-300">{selectedCourseForReEnroll?.duration || "Standard"}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-700 dark:text-slate-300">{selectedCourseForReEnroll?.category || "Specialization"}</strong></span>
                </div>
              </div>
              {selectedCourseForReEnroll?.feeAmount && (
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Program Fee</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    ₹{selectedCourseForReEnroll.feeAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Pre-filled Student Verified Identity Snapshot */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verified Student Identity Snapshot (Pre-Filled)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Permanent Enrollment No</span>
                  <span className="font-mono font-bold text-xs text-primary mt-0.5 block">
                    {profile.enrollmentNo || "Permanent ID"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                    {profile.fullName || student?.name || "Student"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                    {profile.phone || "On File"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Guardian / Parent</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block truncate">
                    {profile.fatherName || profile.guardianName || profile.motherName || "On File"}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks / Message */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Preferred Timing / Message to Franchise Admin (Optional)
              </label>
              <Textarea
                value={reEnrollRemarks}
                onChange={(e) => setReEnrollRemarks(e.target.value)}
                placeholder="e.g., Interested in morning 10 AM batch, or already completed DCA in previous year."
                rows={3}
                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Notice Alert */}
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start gap-2.5 text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Permanent Record Retention:</strong> Your permanent Enrollment No ({profile.enrollmentNo}) and login credentials remain unchanged. Submitting this sends an admission notification to the center administration to approve your seat and assign your batch schedule.
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setReEnrollModalOpen(false)}
              disabled={isSubmittingReEnroll}
              className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReEnroll}
              disabled={isSubmittingReEnroll}
              className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs"
            >
              {isSubmittingReEnroll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Confirm Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for viewing detailed course syllabus */}
      <CourseDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        course={detailsCourse}
      />
    </div>
  );
}
