"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette, CommandSearchButton } from "./CommandPalette";
import { BookOpen, ChevronRight, ChevronDown, Check, Loader2, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTenantLink } from "@/lib/routing";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { setActiveStudentCourse } from "@/app/actions/student";
import { toast } from "sonner";

export interface ActiveCourseItem {
  id: string;
  courseTitle: string;
  registrationNo: string | null;
  enrollmentNo: string | null;
  status: string;
  batchName: string | null;
}

interface StudentHeaderProps {
  tenantName: string;
  tenant: string;
  workspaceBase: string;
  userName: string;
  userImage?: string | null;
  currentCourseName: string;
  enrollmentNo?: string | null;
  registrationNo?: string | null;
  workspaceId?: string;
  activeCourses?: ActiveCourseItem[];
  currentProfileId?: string | null;
}

export function StudentHeader({
  tenantName,
  tenant,
  workspaceBase,
  userName,
  userImage,
  currentCourseName,
  enrollmentNo,
  registrationNo,
  workspaceId,
  activeCourses = [],
  currentProfileId,
}: StudentHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  // Format Breadcrumbs:
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  let currentPage = "Dashboard";
  if (lastSegment && lastSegment !== "student") {
    currentPage = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  }

  const dashboardHref = getTenantLink("/student/dashboard", tenant, pathname);
  const profileHref = getTenantLink("/student/profile", tenant, pathname);
  const coursesHref = getTenantLink("/student/courses", tenant, pathname);

  const handleSwitchCourse = (profileId: string, courseTitle: string) => {
    if (profileId === currentProfileId) return;
    setSwitchingId(profileId);
    startTransition(async () => {
      const res = await setActiveStudentCourse(profileId);
      if (res.success) {
        toast.success(`Switched active course to ${courseTitle}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to switch course");
      }
      setSwitchingId(null);
    });
  };

  return (
    <header className="h-16 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-6">
      <div className="max-w-[1600px] mx-auto w-full h-full flex items-center justify-between gap-4">
        {/* Left side: Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex sm:hidden w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center text-xs sm:text-sm font-medium truncate">
            <Link 
              href={dashboardHref}
              className="text-muted-foreground hover:text-foreground transition-colors capitalize hidden sm:inline-block truncate max-w-[180px]"
            >
              {tenantName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 mx-1.5 hidden sm:inline-block shrink-0" />
            <span className="text-foreground tracking-tight font-semibold truncate">
              {currentPage}
            </span>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex items-center mx-2">
          <CommandSearchButton />
        </div>

        {/* Right side: Course & Student Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Active Course Dropdown Switcher (Rule: Only active courses, no pass out) */}
          {activeCourses.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-all cursor-pointer max-w-[260px] text-left outline-none group focus:ring-2 focus:ring-primary/20">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <BookOpen className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex flex-col text-left min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                      Active Course
                    </span>
                    <span className="text-[9px] font-semibold px-1 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                      {activeCourses.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight tracking-tight truncate max-w-[150px] sm:max-w-[180px]">
                    {currentCourseName}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Course
                </DropdownMenuLabel>
                <div className="space-y-1">
                  {activeCourses.map((c) => {
                    const isSelected = c.id === currentProfileId;
                    const isSwitching = switchingId === c.id;
                    return (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => handleSwitchCourse(c.id, c.courseTitle)}
                        className={`flex items-start justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-slate-100 dark:bg-slate-800 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0 pr-2">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}>
                            {isSwitching ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <GraduationCap className="w-3 h-3" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {c.courseTitle}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                              {c.registrationNo ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {c.registrationNo}
                                </span>
                              ) : (
                                <span>Pending Reg</span>
                              )}
                              {c.batchName && <span>• {c.batchName}</span>}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
                <DropdownMenuSeparator className="my-1.5 border-slate-100 dark:border-slate-800" />
                <Link href={coursesHref} className="block">
                  <div className="p-2 text-center text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer">
                    View All & Completed Courses →
                  </div>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Single Enrolled Course Pill */
            <Link
              href={coursesHref}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 transition-colors group cursor-pointer max-w-[240px]"
              title={`Course: ${currentCourseName}`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                  My Course
                </span>
                <span className="text-xs font-bold text-foreground leading-tight tracking-tight truncate">
                  {currentCourseName}
                </span>
              </div>
            </Link>
          )}

          {/* Profile Section */}
          <Link 
            href={profileHref} 
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
            title="Student Profile"
          >
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-foreground leading-none mb-0.5 uppercase tracking-tight">
                {userName}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                {registrationNo ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Reg: {registrationNo}</span>
                ) : (
                  <span>{enrollmentNo || "Student"}</span>
                )}
              </div>
            </div>

            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border shadow-xs group-hover:ring-2 group-hover:ring-primary/20 transition-all">
              <AvatarImage src={userImage || undefined} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Notification Center & Theme Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 border-l border-border/50 pl-2.5 sm:pl-3">
            <NotificationBell workspaceId={workspaceId} tenant={tenant} portal="student" />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <CommandPalette portal="student" tenant={tenant} />
    </header>
  );
}
