"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getTenantLink, WORKSPACE_ROUTES } from "@/lib/routing";

export function StudentBreadcrumbs({ tenant }: { tenant: string }) {
  const pathname = usePathname();

  // Determine current page name based on pathname
  let pageName = "Dashboard Overview";
  if (pathname.includes("/student/courses")) pageName = "My Courses";
  else if (pathname.includes("/student/attendance")) pageName = "Attendance";
  else if (pathname.includes("/student/exams")) pageName = "Exams";
  else if (pathname.includes("/student/fees")) pageName = "Fees & Invoices";
  else if (pathname.includes("/student/notices")) pageName = "Notices";
  else if (pathname.includes("/student/profile")) pageName = "My Profile";

  return (
    <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <Link href={getTenantLink(WORKSPACE_ROUTES.STUDENT_DASHBOARD, tenant, pathname)} className="hover:text-primary transition-colors flex items-center gap-1.5">
        <Home className="w-3.5 h-3.5" /> Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
      <span className="text-foreground">{pageName}</span>
    </div>
  );
}
