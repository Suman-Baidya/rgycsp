"use client";

import React from "react";
import { 
  User, 
  BookOpen, 
  Calendar, 
  Bell, 
  ChevronRight, 
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function StudentDashboardClient({ student, tenant, settings, notices }: { student: any, tenant: string, settings: any, notices: any[] }) {
  const [mounted, setMounted] = React.useState(false);
  const profile = student.studentProfile || {};
  const primaryColor = settings?.primaryColor || "#0f172a";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayNotices = notices && notices.length > 0 ? notices.slice(0, 3) : [
    { title: "No recent notices found", date: "Today", category: "INFO" }
  ];

  if (!mounted) return null; // Or a skeleton

  return (
    <div className="pb-20">
      {/* Welcome Banner */}
      <div className="px-6 py-10">
        <div className="relative overflow-hidden rounded-[3rem] p-10 text-white shadow-2xl" style={{ backgroundColor: primaryColor }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 border-8 border-white rounded-full -ml-24 -mb-24"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-4 ring-white/20 shadow-2xl shrink-0">
                <AvatarImage src={student.image} />
                <AvatarFallback className="bg-white text-primary text-xl font-black">{student.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-black tracking-tight uppercase mb-1">Hi, {student.name.split(' ')[0]}!</h1>
                <p className="opacity-80 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Student Portal Overview
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 self-start md:self-center">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60">Current Session</p>
                <p className="text-sm font-black uppercase">{new Date().getFullYear()} Academic Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                label="Enrolled Course" 
                value={profile.batch?.course?.title || "Pending Assignment"} 
                icon={<BookOpen className="w-5 h-5" />}
                color={primaryColor}
              />
              <StatsCard 
                label="Batch" 
                value={profile.batch?.name || "N/A"} 
                icon={<Calendar className="w-5 h-5" />}
                color={primaryColor}
              />
              <StatsCard 
                label="Attendance" 
                value="92%" 
                subtext="This month"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="#10b981"
              />
            </div>

            {/* Notifications / Notices */}
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Notices</CardTitle>
                  <CardDescription className="font-bold text-slate-400">Stay updated with the latest institutional announcements.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl"><Bell className="w-5 h-5" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {displayNotices.map((notice: any, idx: number) => (
                    <NoticeItem 
                      key={idx}
                      title={notice.title} 
                      date={notice.date} 
                      category={notice.category || "GENERAL"} 
                      color={idx === 0 ? primaryColor : idx === 1 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </div>
                <div className="p-6 text-center">
                   <Link href={`/app/${tenant}/notice`}>
                      <Button variant="link" className="font-black text-xs uppercase tracking-widest text-primary gap-2">View All Notices <ChevronRight className="w-4 h-4" /></Button>
                   </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Info */}
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
               <div className="h-2" style={{ backgroundColor: primaryColor }}></div>
               <CardHeader className="px-8 pt-8 pb-4">
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Student Details</CardTitle>
               </CardHeader>
               <CardContent className="px-8 pb-8 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Username / App No</p>
                    <p className="font-bold text-slate-900 dark:text-white">{student.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</p>
                    <p className="font-bold text-slate-900 dark:text-white">{student.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enrollment Date</p>
                    <p className="font-bold text-slate-900 dark:text-white">{new Date(student.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl font-bold h-12 uppercase text-[11px] tracking-widest gap-2">
                     <User className="w-4 h-4" /> Edit Profile
                  </Button>
               </CardContent>
            </Card>

            {/* Support / Quick Help */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-zinc-900 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="text-xl font-black uppercase tracking-tight mb-2">Need Help?</h3>
               <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">Having trouble with your portal or studies? Our support team is here for you.</p>
               <Link href="/contact">
                  <Button className="w-full bg-white text-zinc-950 hover:bg-slate-100 rounded-2xl h-12 font-black uppercase text-[11px] tracking-widest shadow-xl">Contact Support</Button>
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, subtext, icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-8 flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{value}</p>
          {subtext && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function NoticeItem({ title, date, category, color }: any) {
  return (
    <div className="p-6 flex items-start gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
      <div className="mt-1">
        <Badge variant="outline" className="rounded-lg font-black text-[9px] px-2 py-1 tracking-widest uppercase border-2" style={{ borderColor: `${color}40`, color: color }}>
          {category}
        </Badge>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{title}</h4>
        <div className="flex items-center gap-3 mt-1.5">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{date}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </Button>
    </div>
  );
}
