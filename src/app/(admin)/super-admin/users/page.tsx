"use client";

import React from "react";
import { 
  Users, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  History,
  Lock,
  Unlock,
  Trash2
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

const globalUsers = [
  {
    id: "1",
    name: "Suman Kumar",
    email: "suman@example.com",
    role: "SUPER_ADMIN",
    status: "active",
    lastLogin: "2024-04-23 08:30 AM",
    workspaces: 5,
  },
  {
    id: "2",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "USER",
    status: "active",
    lastLogin: "2024-04-22 04:15 PM",
    workspaces: 1,
  },
  {
    id: "3",
    name: "Priya Das",
    email: "priya@example.com",
    role: "USER",
    status: "suspended",
    lastLogin: "2024-03-20 10:00 AM",
    workspaces: 2,
  },
  {
    id: "4",
    name: "System Bot",
    email: "bot@abcdedu.com",
    role: "SUPER_ADMIN",
    status: "active",
    lastLogin: "2024-04-23 12:00 AM",
    workspaces: 142,
  },
  {
    id: "5",
    name: "New Teacher",
    email: "teacher@test.com",
    role: "USER",
    status: "pending",
    lastLogin: "Never",
    workspaces: 0,
  },
];


export default function UsersManagement() {
  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      <AdminPageHeader 
        title="User Directory" 
        description="Global user database and security control panel."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
            <Mail className="h-4 w-4" />
            Invite Admin
          </Button>
          <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
            <Plus className="h-4 w-4" />
            Add Global User
          </Button>
        </div>
      </AdminPageHeader>

      <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="relative w-full max-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-11 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl h-11 font-medium" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="w-[300px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">System Role</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Workspaces</TableHead>
                <TableHead className="text-right py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Last Activity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalUsers.map((user) => (
                <TableRow key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                  <TableCell className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-800 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</span>
                        <span className="text-xs font-medium text-slate-500">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center",
                        user.role === "SUPER_ADMIN" ? "bg-primary/10" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        {user.role === "SUPER_ADMIN" ? (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-bold",
                        user.role === "SUPER_ADMIN" ? "text-primary" : "text-slate-500"
                      )}>
                        {user.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-3 py-1 rounded-lg font-bold border-2 text-[10px] tracking-tight",
                        user.status === "active" ? "border-green-500/10 bg-green-500/5 text-green-600 dark:text-green-400" :
                        user.status === "suspended" ? "border-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400" :
                        "border-amber-500/10 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm text-slate-700 dark:text-slate-300">
                    {user.workspaces}
                  </TableCell>
                  <TableCell className="text-right px-8">
                     <span className="text-xs font-bold text-slate-500">{user.lastLogin}</span>
                  </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all")}>
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px] rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl p-2">
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">User Control</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer">
                          <UserCog className="h-4 w-4 text-slate-400" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer">
                          <History className="h-4 w-4 text-slate-400" /> Activity Logs
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-primary">
                          <ShieldCheck className="h-4 w-4" /> System Promotion
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-amber-600">
                          {user.status === "active" ? (
                            <><Lock className="h-4 w-4" /> Suspend Access</>
                          ) : (
                            <><Unlock className="h-4 w-4" /> Restore Access</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10">
                          <Trash2 className="h-4 w-4" /> Terminate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
