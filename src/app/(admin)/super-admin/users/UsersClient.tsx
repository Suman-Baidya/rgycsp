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
  MoreHorizontal
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
import { useRouter } from "next/navigation";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All"); // All, student, staff, admin
  const [statusFilter, setStatusFilter] = useState("All"); // active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return {
      total: initialUsers.length,
      students: initialUsers.filter(u => u.studentProfile).length,
      staff: initialUsers.filter(u => u.workspaceRoles?.length > 0 && !u.studentProfile).length,
      online: initialUsers.filter(u => u.lastSeen && new Date(u.lastSeen) > fiveMinutesAgo).length,
    };
  }, [initialUsers]);

  // Sorting & Filtering logic
  const filteredUsers = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return initialUsers.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower);
      
      const isStudent = !!user.studentProfile;
      const isAdmin = user.role === "SUPER_ADMIN";
      const isStaff = user.workspaceRoles?.length > 0 && !isStudent;
      const isOnline = user.lastSeen && new Date(user.lastSeen) > fiveMinutesAgo;

      let matchesType = true;
      if (typeFilter === "student") matchesType = isStudent;
      if (typeFilter === "staff") matchesType = isStaff;
      if (typeFilter === "admin") matchesType = isAdmin;
      if (typeFilter === "online") matchesType = isOnline;

      let matchesStatus = true;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [initialUsers, searchQuery, typeFilter, statusFilter]);

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
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Students", value: stats.students, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Institute Staff", value: stats.staff, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Online Now", value: stats.online, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3.5 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="relative w-full max-w-[450px] group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <Input 
                placeholder="Search by name, email or username..." 
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
                  <SelectItem value="All" className="rounded-xl font-bold py-3">All User</SelectItem>
                  <SelectItem value="online" className="rounded-xl font-bold py-3">Online Now</SelectItem>
                  <SelectItem value="student" className="rounded-xl font-bold py-3">Students Only</SelectItem>
                  <SelectItem value="staff" className="rounded-xl font-bold py-3">Staff Only</SelectItem>
                  <SelectItem value="admin" className="rounded-xl font-bold py-3">Super Admins</SelectItem>
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

        <CardContent className="p-0 overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
              <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="w-[350px] px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">User Identity</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System Role</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspaces</TableHead>
                <TableHead className="text-right py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-8">Action Panel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const isStudent = !!user.studentProfile;
                  const isSuperAdmin = user.role === "SUPER_ADMIN";
                  const isOnline = user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
                  
                  return (
                    <TableRow key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <Avatar className="h-14 w-14 border-4 border-white dark:border-slate-800 shadow-xl rounded-2xl group-hover:scale-105 transition-transform duration-500">
                              <AvatarImage src={user.image} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl rounded-2xl uppercase">
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {isOnline && (
                              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-900"></span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-slate-900 dark:text-white leading-tight">{user.name || "Anonymous User"}</span>
                              {isOnline && (
                                <Badge className="h-4 px-1.5 text-[8px] font-black bg-green-500/10 text-green-600 border-none rounded-sm">ONLINE</Badge>
                              )}
                            </div>
                            <span className="text-xs font-medium text-slate-500 lowercase">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isSuperAdmin ? (
                            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none rounded-xl px-4 py-1.5 font-bold gap-2">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              SUPER ADMIN
                            </Badge>
                          ) : isStudent ? (
                            <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-none rounded-xl px-4 py-1.5 font-bold gap-2">
                              <GraduationCap className="h-3.5 w-3.5" />
                              STUDENT
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none rounded-xl px-4 py-1.5 font-bold gap-2">
                              <Briefcase className="h-3.5 w-3.5" />
                              USER
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.workspaceRoles?.length > 0 ? (
                            user.workspaceRoles.slice(0, 2).map((wr: any) => (
                              <div key={wr.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <Globe className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{wr.workspace.name}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Global Node Only</span>
                          )}
                          {user.workspaceRoles?.length > 2 && (
                            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                              +{user.workspaceRoles.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              render={
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-[240px] rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-900">
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">User Control</DropdownMenuLabel>
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer transition-colors">
                                <UserCog className="h-4 w-4 text-slate-400" /> Account Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer transition-colors">
                                <History className="h-4 w-4 text-slate-400" /> Access Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                                <Lock className="h-4 w-4 text-slate-400" /> Restrict Access
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4 text-slate-400" /> Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem]">
                        <Users className="h-12 w-12 opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg text-slate-600 dark:text-slate-400">No Users Found</p>
                        <p className="text-xs font-medium uppercase tracking-widest">Adjust your search or filters to see more results</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Showing <span className="text-slate-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span> users
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-10 w-10 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm transition-all active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "h-10 w-10 rounded-xl font-bold transition-all",
                      currentPage === i + 1 ? "shadow-lg shadow-primary/20" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-10 w-10 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm transition-all active:scale-90"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
