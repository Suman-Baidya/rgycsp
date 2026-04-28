"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function WorkspaceCourses({ data }: { data: any }) {
  const courses = data?.content?.courses || [
    { 
      title: "Advanced Mathematics", 
      category: "Science", 
      fee: "₹5000", 
      duration: "6 Months", 
      image: "https://images.unsplash.com/photo-1509228468518-180dd48a5f5f?q=80&w=2070", 
      students: "1.2K+", 
      rating: "4.9",
      description: "Master complex calculus and algebraic structures with our advanced curriculum designed for engineering aspirants."
    },
    { 
      title: "English Literature", 
      category: "Arts", 
      fee: "₹3500", 
      duration: "4 Months", 
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2070", 
      students: "850+", 
      rating: "4.8",
      description: "Explore the works of classic and modern authors while developing critical analysis and writing skills."
    },
    { 
      title: "Computer Science", 
      category: "Technology", 
      fee: "₹8000", 
      duration: "1 Year", 
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070", 
      students: "2.5K+", 
      rating: "5.0",
      description: "Comprehensive guide to algorithms, data structures, and modern software development practices."
    },
  ];

  return (
    <section id="courses" className="py-24 bg-background px-6 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
              <div className="h-0.5 w-8 bg-primary" />
              Academic Programs
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Explore Our Top Courses
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Unlock your potential with our meticulously crafted curriculum and expert-led training.
            </p>
          </div>
          <Button size="lg" className="rounded-full gap-2 px-8 h-14 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            View All Courses
            <ArrowRight className="h-5 w-5" />
          </Button>
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
                    src={course.image} 
                    alt={course.title} 
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-lg uppercase">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-primary px-3 py-1 rounded-lg font-black text-sm shadow-xl">
                      {course.fee}
                    </div>
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
                      <span className="text-xs font-bold">{course.students || "1.2K+"} Students</span>
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
                      12 Lessons
                    </div>
                  </div>
                  
                  <Button className="w-full rounded-2xl h-11 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-4 border-none shadow-sm">
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
