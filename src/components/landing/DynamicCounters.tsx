"use client";

import React from "react";
import { Users, BookOpen, GraduationCap, Clock, Award, Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

export function DynamicCounters({ data }: { data: any }) {
  const iconMap: any = { Users, BookOpen, GraduationCap, Clock, Award, Trophy, Star, Zap };
  
  const stats = (data?.content?.stats && data.content.stats.length > 0) 
    ? data.content.stats 
    : [
        { icon: "Users", label: "Total Students", value: "2500+" },
        { icon: "BookOpen", label: "Total Courses", value: "45+" },
        { icon: "Clock", label: "Years Experience", value: "10+" },
        { icon: "GraduationCap", label: "Active Students", value: "1800+" },
      ];

  return (
    <section className="py-20 bg-zinc-950 dark:bg-zinc-900/50 text-white relative overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 bg-primary/10 opacity-30" />
      <div className="w-full px-8 md:px-24 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-24">
          {stats.map((stat: any, i: number) => {
            const Icon = iconMap[stat.icon] || Users;
            
            // Extract number and suffix from value string (e.g. "2500+")
            const numericValue = parseInt(stat.value.toString().replace(/[^0-9]/g, '')) || 0;
            const suffix = stat.value.toString().replace(/[0-9]/g, '') || stat.suffix || "";

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group hover:border-primary/50 transition-all">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                    <AnimatedCounter to={numericValue} suffix={suffix} />
                  </h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
