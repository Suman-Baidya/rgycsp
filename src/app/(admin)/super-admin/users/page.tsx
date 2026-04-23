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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Directory</h1>
          <p className="text-muted-foreground mt-1">Global user database and security control panel.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 gap-2 border-border/50">
            <Mail className="h-4 w-4" />
            Invite Admin
          </Button>
          <Button className="h-11 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Global User
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users by name, email, or role..." className="pl-9 bg-background/50 border-border/50 h-10" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 gap-2 border-border/50">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-white/5">
              <TableRow>
                <TableHead className="w-[300px]">User Profile</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Workspaces</TableHead>
                <TableHead className="text-right">Last Activity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalUsers.map((user) => (
                <TableRow key={user.id} className="group hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === "SUPER_ADMIN" ? (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-zinc-400" />
                      )}
                      <span className={cn(
                        "text-xs font-semibold",
                        user.role === "SUPER_ADMIN" ? "text-primary" : "text-zinc-500"
                      )}>
                        {user.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-2.5 py-0.5 font-medium",
                        user.status === "active" ? "border-green-500/20 bg-green-500/5 text-green-500" :
                        user.status === "suspended" ? "border-red-500/20 bg-red-500/5 text-red-500" :
                        "border-yellow-500/20 bg-yellow-500/5 text-yellow-500"
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {user.workspaces}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity")}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>User Management</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2">
                          <UserCog className="h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <History className="h-4 w-4" /> Login History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                          <ShieldCheck className="h-4 w-4" /> Promote to Super Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500">
                          {user.status === "active" ? (
                            <><Lock className="h-4 w-4" /> Suspend Account</>
                          ) : (
                            <><Unlock className="h-4 w-4" /> Unsuspend Account</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Delete Global User
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
