"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, BookOpen, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getTenantLink, detectTenant } from "@/lib/routing";
import { usePathname } from "next/navigation";
import CourseDetailsModal from "@/app/courses/CourseDetailsModal";

export function WorkspaceCourses({ data, dbCourses }: { data: any, dbCourses?: any[] }) {
  const pathname = usePathname();
  const tenant = detectTenant(pathname, typeof window !== 'undefined' ? window.location.hostname : undefined);
  const getLink = (path: string) => getTenantLink(path, tenant, pathname);
  
  const hasDbCourses = dbCourses && dbCourses.length > 0;
  
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsCourse, setDetailsCourse] = React.useState<any>(null);
  
  const courses = hasDbCourses
    ? dbCourses.map(c => ({
        ...c,
        originalFee: c.priceDisplay || `₹${c.feeAmount}`,
        discountText: c.discountText,
        showFee: c.showFee !== false,
        lessons: (c as any).topics ? Object.values((c as any).topics).reduce((acc: number, val: any) => acc + (val?.length || 0), 0) : "12"
      }))
    : [
    { 
      title: "Mathematics", 
      category: "Science", 
      fee: "₹5000", 
      duration: "6 Months", 
      image: "https://cdn.pixabay.com/photo/2015/11/05/08/21/geometry-1023846_1280.jpg", 
      students: "1.2K+", 
      rating: "4.9",
      lessons: "24",
      description: "Master complex calculus and algebraic structures with our advanced curriculum designed for engineering aspirants."
    },
    { 
      title: "English", 
      category: "Arts", 
      fee: "₹3500", 
      duration: "4 Months", 
      image: "https://cdn.pixabay.com/photo/2015/03/12/21/17/stationery-670871_1280.jpg", 
      students: "850+", 
      rating: "4.8",
      lessons: "18",
      description: "Explore the works of classic and modern authors while developing critical analysis and writing skills."
    },
    { 
      title: "Computer", 
      category: "Technology", 
      fee: "₹8000", 
      duration: "1 Year", 
      image: "https://cdn.pixabay.com/photo/2012/10/29/15/36/ball-63527_1280.jpg", 
      students: "2.5K+", 
      rating: "5.0",
      lessons: "36",
      description: "Comprehensive guide to algorithms, data structures, and modern software development practices."
    },
  ];

  return (
    <section id="courses" className="py-24 bg-background px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
              <div className="h-0.5 w-10 bg-primary" />
              {data?.subtitle || "Academic Programs"}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {data?.title || "Explore Our Top Courses"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {data?.content?.description || "Unlock your potential with our meticulously crafted curriculum and expert-led training."}
            </p>
          </div>
          <Link href={getLink("/courses")}>
            <Button size="lg" className="rounded-full gap-2 px-10 h-14 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              View All Courses
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-3xl bg-slate-50/50 dark:bg-white/[0.02] flex flex-col h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={course.image || "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070"} 
                    alt={course.title} 
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-lg uppercase">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 flex flex-col gap-1 items-end">
                    {course.showFee ? (
                      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 rounded-xl font-black text-sm shadow-xl border border-white/20">
                        <span className="text-primary">{course.originalFee || course.fee}</span>
                      </div>
                    ) : course.discountText ? (
                      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl font-black text-sm shadow-xl border border-white/20">
                        {course.discountText}
                      </div>
                    ) : null}
                  </div>
                </div>
                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white ml-1">{course.rating || "4.9"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-bold">{course.students || "1.2K+"} Learners</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description || "Learn from industry experts with our comprehensive curriculum designed for modern needs."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold border-t border-border/40 pt-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {course.lessons || "12"} Lessons
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setDetailsCourse({
                          name: course.title,
                          banner: course.image,
                          category: course.category,
                          duration: course.duration,
                          priceDisplay: course.originalFee || course.fee,
                          discountText: course.discountText,
                          showFee: course.showFee,
                          description: course.description,
                          syllabus: course.topics || course.syllabus
                        });
                        setDetailsOpen(true);
                      }}
                      className="w-full rounded-2xl h-11 font-bold transition-all border-border shadow-sm text-xs px-2"
                    >
                      View Details
                    </Button>
                    <Button className="w-full rounded-2xl h-11 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all border-none shadow-sm text-xs px-2">
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <CourseDetailsModal 
        isOpen={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        course={detailsCourse} 
      />
    </section>
  );
}
