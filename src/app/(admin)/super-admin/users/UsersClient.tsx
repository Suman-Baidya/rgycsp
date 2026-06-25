"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  Mail,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  History,
  Lock,
  Unlock,
  Trash2,
  Globe,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Activity,
  MoreHorizontal,
  Building2,
  ExternalLink
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getTenantLink } from "@/lib/routing";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All User"); // All User, All Staff, All Admin
  const [statusFilter, setStatusFilter] = useState("All"); // active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const students = initialUsers.filter(u => u.studentProfile);
    const registered = students.filter(u => u.studentProfile?.status === "REGISTERED").length;
    const unregistered = students.filter(u => u.studentProfile?.status === "UNREGISTERED").length;
    const passout = students.filter(u => u.studentProfile?.status === "PASS_OUT").length;

    // Use unique workspace count for "Total Institute"
    const uniqueWorkspaces = new Set();
    initialUsers.forEach(u => {
      u.workspaceRoles?.forEach((wr: any) => {
        if (wr.workspace?.id) uniqueWorkspaces.add(wr.workspace.id);
      });
    });

    return {
      total: initialUsers.length, // Overall Users including students
      students: { total: students.length, registered, unregistered, passout },
      institutes: uniqueWorkspaces.size,
      avgStudentsPerInstitute: uniqueWorkspaces.size > 0 ? Math.round(students.length / uniqueWorkspaces.size) : 0,
      staff: initialUsers.filter(u => u.workspaceRoles?.length > 0 && !u.studentProfile).length,
      online: initialUsers.filter(u => u.lastSeen && new Date(u.lastSeen) > fiveMinutesAgo).length,
    };
  }, [initialUsers]);

  // Sorting & Filtering logic
  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      const isStudent = !!user.studentProfile;
      if (isStudent) return false; // Hide students from the table view

      const searchLower = searchQuery.toLowerCase();
      const workspaceMatch = user.workspaceRoles?.some((wr: any) => 
        wr.workspace?.name?.toLowerCase().includes(searchLower)
      );

      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        workspaceMatch;
      
      const isAdmin = user.role === "SUPER_ADMIN";
      const isStaff = user.workspaceRoles?.length > 0;

      let matchesType = true;
      if (typeFilter === "All Staff") matchesType = isStaff;
      if (typeFilter === "All Admin") matchesType = isAdmin;

      return matchesSearch && matchesType;
    });
  }, [initialUsers, searchQuery, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="User Directory" 
        description="Manage system access, roles, and global security across all institutes."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 rounded-2xl gap-3 font-bold border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Mail className="h-5 w-5" />
            Invite Admin
          </Button>
          <Button className="h-12 px-8 rounded-2xl gap-3 shadow-xl shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
            <Plus className="h-5 w-5" />
            Add Global User
          </Button>
        </div>
      </AdminPageHeader>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Overall Users Card */}
        <Card className="border-none shadow-xl shadow-blue-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity scale-150 transform group-hover:scale-110 duration-500 pointer-events-none">
            <Users className="w-28 h-28 text-blue-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Overall Users</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
               <div className="flex items-center gap-2">
                 <GraduationCap className="w-3 h-3 text-blue-500" />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg Students / Inst.</p>
               </div>
               <p className="text-sm font-black text-blue-600 dark:text-blue-400">{stats.avgStudentsPerInstitute.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Students Card (Clickable) */}
        <Card 
          onClick={() => router.push("/super-admin/students")}
          className="border-none shadow-xl shadow-purple-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-purple-500/30 hover:shadow-purple-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 transform group-hover:scale-110 duration-500 pointer-events-none">
            <GraduationCap className="w-28 h-28 text-purple-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Students</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.students.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Active Students</p>
               </div>
               <p className="text-sm font-black text-purple-600 dark:text-purple-400">{stats.students.registered + stats.students.unregistered}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Institute & Staff Card (Clickable) */}
        <Card 
          onClick={() => router.push("/super-admin/franchises")}
          className="border-none shadow-xl shadow-emerald-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 transform group-hover:scale-110 duration-500 pointer-events-none">
            <Building2 className="w-28 h-28 text-emerald-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Institutes</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.institutes.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
               <div className="flex items-center gap-2">
                 <Briefcase className="w-3 h-3 text-emerald-500" />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Staffs</p>
               </div>
               <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.staff.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Online Now Card */}
        <Card className="border-none shadow-xl shadow-green-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity scale-150 transform group-hover:scale-110 duration-500 pointer-events-none">
            <Activity className="w-28 h-28 text-green-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 relative group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Online Now</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.online.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="relative w-full max-w-[450px] group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
                <Input 
                  placeholder="Search identity, email, or franchise..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium" 
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as string)}>
                <SelectTrigger className="w-[160px] h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/40 font-bold px-5 focus:ring-primary/20 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="User Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-800">
                  <SelectItem value="All User" className="rounded-xl font-bold py-3">All User</SelectItem>
                  <SelectItem value="All Staff" className="rounded-xl font-bold py-3">All Staff</SelectItem>
                  <SelectItem value="All Admin" className="rounded-xl font-bold py-3">All Admin</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden xl:block mx-2" />
              
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 px-5 py-3.5 rounded-2xl h-14">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Total Results: <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span>
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Users Found</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your search criteria or changing tabs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-y border-slate-50 dark:border-slate-800/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 w-[350px]">User</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">Access Level</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">Franchises</TableHead>
                    <TableHead className="py-4 px-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const isSuperAdmin = user.role === "SUPER_ADMIN";
                    const isStaff = user.workspaceRoles?.length > 0;
                    const isOnline = user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
                    const borderColor = isSuperAdmin ? "border-amber-500" : isStaff ? "border-emerald-500" : "border-primary";

                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group border-b border-slate-50 dark:border-slate-800/50 relative">
                        <TableCell className="p-6">
                           <div className={cn("absolute left-0 top-0 bottom-0 w-1", borderColor)} />
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shrink-0 shadow-sm">
                                  <AvatarImage src={user.image || undefined} className="object-cover" />
                                  <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-2xl uppercase">
                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900"></span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name || "Anonymous User"}</p>
                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-slate-400 shrink-0" /> {user.email}
                                </p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="p-6">
                            {isSuperAdmin ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-none rounded uppercase text-[10px] font-bold px-2 py-1 tracking-widest gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" /> SUPER ADMIN
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded uppercase text-[10px] font-bold px-2 py-1 tracking-widest gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" /> STAFF
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell className="p-6">
                           <div className="flex flex-col items-start gap-2">
                             {isSuperAdmin ? (
                               <Link href="/super-admin" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic hover:text-indigo-500 transition-colors group/link">
                                 Global Scope <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                               </Link>
                             ) : (
                               <>
                                 {user.workspaceRoles.slice(0, 2).map((wr: any) => (
                                   <Link 
                                     key={wr.id} 
                                     href={getTenantLink("/admin/dashboard", wr.workspace.subdomain || wr.workspace.id, pathname)}
                                     className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group/link cursor-pointer"
                                     title="Access Dashboard"
                                   >
                                     <Globe className="h-3 w-3 text-slate-400 group-hover/link:text-indigo-500" />
                                     <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 truncate max-w-[120px]">{wr.workspace.name}</span>
                                     <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                                   </Link>
                                 ))}
                                 {user.workspaceRoles?.length > 2 && (
                                   <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                                     +{user.workspaceRoles.length - 2} more
                                   </div>
                                 )}
                               </>
                             )}
                           </div>
                        </TableCell>
                        <TableCell className="p-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              render={
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto">
                                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-[200px] rounded-2xl border-none shadow-xl p-2 bg-white dark:bg-slate-900">
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">User Control</DropdownMenuLabel>
                              
                              <DropdownMenuItem 
                                className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 text-xs flex items-center w-full"
                                onClick={() => {
                                  const targetHref = isSuperAdmin ? "/super-admin" : user.workspaceRoles.length > 0 ? getTenantLink("/admin/dashboard", user.workspaceRoles[0].workspace.subdomain || user.workspaceRoles[0].workspace.id, pathname) : "#";
                                  if (targetHref !== "#") router.push(targetHref);
                                }}
                              >
                                <ExternalLink className="h-4 w-4" /> Access Dashboard
                              </DropdownMenuItem>

                              <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs">
                                <UserCog className="h-4 w-4 text-slate-400" /> Account Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs">
                                <History className="h-4 w-4 text-slate-400" /> Access Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-slate-50 dark:bg-slate-800" />
                              <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-500/10 text-xs">
                                <Lock className="h-4 w-4 text-slate-400" /> Restrict Access
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-500/10 text-xs">
                                <Trash2 className="h-4 w-4 text-slate-400" /> Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer - Match Students Page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-sm font-medium text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn("h-9 w-9 rounded-xl font-bold text-xs", currentPage === i + 1 ? "shadow-md shadow-primary/20" : "text-slate-500")}
                      >
                        {i + 1}
                      </Button>
                    );
                  } else if (
                    i === currentPage - 3 ||
                    i === currentPage + 1
                  ) {
                    return <span key={i} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
