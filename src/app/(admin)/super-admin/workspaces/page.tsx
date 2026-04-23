"use client";

import React from "react";
import { 
  Globe, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  ExternalLink,
  Shield,
  ShieldOff,
  Trash2,
  Mail
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

const workspaces = [
  {
    id: "1",
    name: "Zenith Global Academy",
    subdomain: "zenith",
    owner: "Suman Kumar",
    email: "suman@zenith.edu",
    status: "active",
    students: 1240,
    tokens: 45000,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Elite Coding School",
    subdomain: "elite-coding",
    owner: "Rahul Sharma",
    email: "rahul@elite.io",
    status: "active",
    students: 850,
    tokens: 12000,
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    name: "Modern Arts Institute",
    subdomain: "modern-arts",
    owner: "Priya Das",
    email: "priya@arts.edu",
    status: "inactive",
    students: 420,
    tokens: 500,
    createdAt: "2024-03-05",
  },
  {
    id: "4",
    name: "Future Tech University",
    subdomain: "futuretech",
    owner: "Amit Singh",
    email: "amit@ftu.ac.in",
    status: "active",
    students: 3200,
    tokens: 88000,
    createdAt: "2023-11-20",
  },
  {
    id: "5",
    name: "Little Stars School",
    subdomain: "littlestars",
    owner: "Anjali Gupta",
    email: "anjali@stars.org",
    status: "pending",
    students: 150,
    tokens: 0,
    createdAt: "2024-04-01",
  },
];

export default function WorkspacesManagement() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace Management</h1>
          <p className="text-muted-foreground mt-1">Manage all educational institutes and their active subscriptions.</p>
        </div>
        <Button className="h-11 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          Create New Workspace
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search workspaces, owners, or domains..." className="pl-9 bg-background/50 border-border/50 h-10" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 gap-2 border-border/50">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <div className="h-8 w-px bg-border/50 hidden sm:block mx-1" />
              <p className="text-sm text-muted-foreground hidden sm:block">
                Showing <span className="font-semibold text-foreground">5</span> of 142 workspaces
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-white/5">
              <TableRow>
                <TableHead className="w-[300px]">Workspace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Created At</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((ws) => (
                <TableRow key={ws.id} className="group hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {ws.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{ws.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {ws.subdomain}.abcdehub.com
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-2.5 py-0.5 font-medium",
                        ws.status === "active" ? "border-green-500/20 bg-green-500/5 text-green-500" :
                        ws.status === "inactive" ? "border-red-500/20 bg-red-500/5 text-red-500" :
                        "border-yellow-500/20 bg-yellow-500/5 text-yellow-500"
                      )}
                    >
                      {ws.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{ws.owner}</span>
                      <span className="text-xs text-muted-foreground">{ws.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {ws.students.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {ws.tokens.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(ws.createdAt).toLocaleDateString()}
                  </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity")}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2">
                          <ExternalLink className="h-4 w-4" /> View Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" /> Contact Owner
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                          <Shield className="h-4 w-4" /> Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500">
                          {ws.status === "active" ? (
                            <><ShieldOff className="h-4 w-4" /> Deactivate</>
                          ) : (
                            <><Shield className="h-4 w-4" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Delete Permanently
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

import { cn } from "@/lib/utils";
