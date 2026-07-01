"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileText,
  BarChart3,
  Timer,
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  Target,
  ShieldCheck,
  Trophy
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";



export default function StudentExamsClient({
  settings,
  tenant
}: {
  settings: any,
  tenant: string
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";
  const [activeTab, setActiveTab] = useState("upcoming");

  const performanceData = [
    { subject: 'Math', A: 85, fullMark: 100 },
    { subject: 'Physics', A: 78, fullMark: 100 },
    { subject: 'Chemistry', A: 92, fullMark: 100 },
    { subject: 'English', A: 70, fullMark: 100 },
    { subject: 'Biology', A: 88, fullMark: 100 },
    { subject: 'Logic', A: 95, fullMark: 100 },
  ];

  const scoreTrends = [
    { name: 'Exam 1', score: 75 },
    { name: 'Exam 2', score: 82 },
    { name: 'Exam 3', score: 70 },
    { name: 'Exam 4', score: 90 },
    { name: 'Exam 5', score: 85 },
  ];

  const upcomingExams = [
    {
      id: "ex-1",
      title: "Quarterly Mathematics Assessment",
      course: "Advanced Calculus & Linear Algebra",
      date: "2026-05-15",
      time: "10:00 AM",
      duration: "180 Mins",
      totalMarks: 100,
      status: "UPCOMING",
      category: "Main Examination",
      difficulty: "Advanced",
      topics: ["Vector Spaces", "Integration", "Matrices"],
      proctoring: "Remote AI Monitored",
      admitIssued: true
    },
    {
      id: "ex-2",
      title: "Logical Reasoning & Aptitude",
      course: "Critical Thinking Workshop",
      date: "2026-05-03",
      time: "02:30 PM",
      duration: "90 Mins",
      totalMarks: 150,
      status: "LIVE",
      category: "Weekly Skills Test",
      difficulty: "Intermediate",
      topics: ["Pattern Recognition", "Data Interpretation"],
      proctoring: "On-Campus",
      admitIssued: false
    }
  ];

  const pastResults = [
    {
      id: "res-1",
      title: "Mid-Term Physics Exam",
      course: "Physics 101",
      date: "2026-04-20",
      marks: 85,
      total: 100,
      grade: "A",
      status: "PASSED",
      percentage: "85%",
      globalRank: 12,
      franchiseRank: 3
    },
    {
      id: "res-2",
      title: "English Literature - Unit 1",
      course: "Literature Fundamentals",
      date: "2026-04-05",
      marks: 38,
      total: 100,
      grade: "F",
      status: "FAILED",
      percentage: "38%",
      globalRank: 412,
      franchiseRank: 45
    }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Examination Portal</h1>
          <p className="text-slate-500 font-medium text-lg">Analyze your preparation and track academic excellence.</p>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-2xl font-bold gap-3 h-14 px-10 shadow-2xl shadow-primary/30 transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
            <Award className="w-5 h-5" /> View Certificates
          </Button>
        </div>
      </div>

      {/* Premium Exam Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Percentage & Status */}
        <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl bg-white dark:bg-zinc-900/40 hover:shadow-2xl hover:border-emerald-500/20 transition-all group overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-500 text-white font-black px-3 py-1 text-[10px] uppercase tracking-widest shadow-lg border-none animate-in fade-in zoom-in duration-500">
                PASSED
              </Badge>
            </div>
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">85<span className="text-xl text-slate-400">%</span></h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Global & Franchise Rank */}
        <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl bg-white dark:bg-zinc-900/40 hover:shadow-2xl hover:border-amber-500/20 transition-all group overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-sm border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Franchise Rank</p>
                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 font-black px-2 py-0.5 shadow-sm text-[10px]">
                  #3
                </Badge>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Global Rank</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="text-xl text-slate-400">#</span>12
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* 3. Upcoming Exam */}
        <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl bg-white dark:bg-zinc-900/40 hover:shadow-2xl hover:border-primary/20 transition-all group overflow-hidden relative flex flex-col justify-between" style={{ '--theme-color': primaryColor } as any}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 opacity-10" style={{ backgroundColor: primaryColor }} />
          <CardContent className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: primaryColor }}>
                <Calendar className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="font-bold px-2 py-0.5 text-[9px] uppercase tracking-widest shadow-sm bg-white dark:bg-zinc-900">
                In 14 Days
              </Badge>
            </div>
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 line-clamp-1" style={{ color: primaryColor }}>Math Assessment</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">15 May</h3>
              <p className="text-xs font-bold text-slate-500">10:00 AM</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Admit Card Status */}
        <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all group overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm border border-white/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-400 text-emerald-950 font-black px-3 py-1 text-[10px] uppercase tracking-widest shadow-lg border-none animate-pulse">
                ISSUED
              </Badge>
            </div>
            <div className="mt-auto space-y-3">
              <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Admit Card</p>
              <Button className="w-full bg-white text-blue-700 hover:bg-slate-100 font-bold rounded-xl h-10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] group/btn">
                Download <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Analytics Dashboard - Vertical Stack */}
      <section className="flex flex-col gap-10">
        {/* Score Progression Full Width */}
        <Card className="rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden group">
          <CardHeader className="px-10 pt-10 pb-8 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Academic Score Progression</CardTitle>
              </div>
              <CardDescription className="font-bold text-slate-400">Detailed tracking of your performance across the last 5 major assessments</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Trend Analysis</span>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] pt-12 pb-8 px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreTrends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(var(--primary-rgb), 0.03)' }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ fontWeight: 800, color: primaryColor }}
                  labelStyle={{ fontWeight: 800, color: '#64748b', marginBottom: '4px' }}
                />
                <Bar
                  dataKey="score"
                  fill="url(#barGradient)"
                  radius={[12, 12, 0, 0]}
                  barSize={60}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Analysis Full Width */}
        <Card className="rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden">
          <CardHeader className="px-10 pt-10 pb-8 border-b border-slate-50 dark:border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Competency Subject Mapping</CardTitle>
            </div>
            <CardDescription className="font-bold text-slate-400">Holistic analysis of subject-wise strengths and areas for improvement</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center py-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 12, fontWeight: 800, fill: '#64748b' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Current Proficiency"
                  dataKey="A"
                  stroke={primaryColor}
                  strokeWidth={3}
                  fill={primaryColor}
                  fillOpacity={0.15}
                  animationDuration={2000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
