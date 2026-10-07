import React from "react";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PopularCoursesGrid } from "./PopularCoursesGrid";

export async function CoursesSection({ data }: { data?: any }) {
  const popularCourses = await db.globalCourse.findMany({
    where: { 
      isActive: true,
      popular: true 
    },
    take: 6,
    orderBy: { createdAt: "desc" }
  });

  if (popularCourses.length === 0) return null;

  const title = data?.title || "Popular Courses";
  const subtitle = data?.subtitle || "OUR PROGRAMS";
  const description = data?.content?.description || "Explore our most sought-after programs designed to build your skills and advance your career in the digital world.";

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-transparent" id="courses">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader 
          subtitle={subtitle}
          title={title}
          description={description}
          highlightStyle="primary"
        />

        <PopularCoursesGrid courses={popularCourses} />

        <div className="mt-14 sm:mt-16 text-center">
          <Link 
            href="/courses"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-2xl border-2 h-13 sm:h-14 px-8 font-bold text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all hover:border-primary/50"
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
