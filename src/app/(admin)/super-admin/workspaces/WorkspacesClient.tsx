"use client";

import React from "react";
import { 
  Globe, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight as ChevronRightIcon,
  ExternalLink,
  Shield,
  ShieldOff,
  Trash2,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  ChevronLeft,
  BookOpen,
  Layers,
  Calendar,
  Activity,
  Settings
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/app/actions/workspaces";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getRootDomain } from "@/lib/domain";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";


export default function WorkspacesClient({ initialWorkspaces }: { initialWorkspaces: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [rootDomain, setRootDomain] = useState(process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000");
  
  useEffect(() => {
    setMounted(true);
    // Dynamically detect domain on client side if not explicitly set
    if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
      setRootDomain(getRootDomain());
    }
  }, []);

  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);  const itemsPerPage = 8;

  // Stats calculation
  const stats = {
    total: initialWorkspaces.length,
    active: initialWorkspaces.filter(ws => ws.isActive !== false).length,
    inactive: initialWorkspaces.filter(ws => ws.isActive === false).length,
    totalStudents: initialWorkspaces.reduce((acc, ws) => acc + (ws._count?.studentProfiles || 0), 0)
  };

  // Form State for new workspace
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    contactPhone: "",
    primaryColor: "#3b82f6",
    brandDescription: ""
  });

  // Filter logic
  const filteredWorkspaces = initialWorkspaces.filter(ws => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ws.name.toLowerCase().includes(searchLower) || 
      ws.subdomain.toLowerCase().includes(searchLower) ||
      ws.roles?.[0]?.user?.name?.toLowerCase().includes(searchLower) ||
      ws.roles?.[0]?.user?.email?.toLowerCase().includes(searchLower);
    
    const wsStatus = ws.isActive !== false ? "active" : "inactive";
    const matchesStatus = statusFilter === "All" || wsStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWorkspaces.length / itemsPerPage);
  const paginatedWorkspaces = filteredWorkspaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search/filter change
  }, [searchQuery, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const result = await createWorkspace(formData);
    setIsCreating(false);

    if (result.success) {
      toast.success("Workspace created successfully!");
      setOpen(false);
      router.refresh();
      setFormData({ 
        name: "", 
        subdomain: "", 
        ownerName: "", 
        ownerEmail: "", 
        ownerPassword: "",
        contactPhone: "",
        primaryColor: "#3b82f6",
        brandDescription: ""
      });
    } else {
      toast.error(result.error || "Failed to create workspace");
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AdminPageHeader 
        title="Workspaces" 
        description="Monitor and manage all educational institutes hosted on your platform."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger 
            render={
              <Button className="h-12 px-8 rounded-2xl gap-3 shadow-xl shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="h-5 w-5" />
                Provision Workspace
              </Button>
            }
          />
          <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Provision New Workspace</h2>
                  <p className="text-slate-500 font-medium text-sm">Initialize a dedicated instance for a new educational institute.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Section: Identity */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Institutional Identity</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Institute Name</label>
                    <Input 
                      required
                      placeholder="e.g. Zenith Academy"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Subdomain</label>
                    <div className="relative">
                      <Input 
                        required
                        placeholder="zenith"
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium pr-32 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                        value={formData.subdomain}
                        onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">.{rootDomain}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Brief Description</label>
                  <Input 
                    placeholder="Short summary of the institute..."
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                    value={formData.brandDescription}
                    onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Section: Administration */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Master Administrator</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Admin Name</label>
                    <Input 
                      required
                      placeholder="Full Name"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Login Email</label>
                    <Input 
                      required
                      type="email"
                      placeholder="admin@institute.edu"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Initial Password</label>
                    <Input 
                      required
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={formData.ownerPassword}
                      onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Contact Phone</label>
                    <Input 
                      placeholder="+91 XXXXX XXXXX"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Section: Branding */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Branding & Theme</h3>
                </div>
                
                <div className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-2 flex-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Primary Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color"
                        className="h-10 w-10 rounded-lg border-none bg-transparent cursor-pointer"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      />
                      <Input 
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="h-10 flex-1 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>
                  <p className="flex-1 text-[10px] font-medium text-slate-400 leading-relaxed italic">
                    * This color will be applied to the dashboard theme.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOpen(false)}
                  className="h-12 flex-1 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="h-12 flex-[1.5] rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
                >
                  {isCreating ? "Provisioning..." : "Provision Workspace"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </AdminPageHeader>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Workspaces", value: stats.total, icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Instances", value: stats.active, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Inactive / Pending", value: stats.inactive, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Platform Students", value: stats.totalStudents, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
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
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:pl-5">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary" />
              </div>
              <Input 
                placeholder="Search by institute name, domain or owner..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium" 
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as string)}>
                <SelectTrigger className="w-[180px] h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/40 font-bold px-5 focus:ring-primary/20 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-800">
                  <SelectItem value="All" className="rounded-xl font-bold py-3">All Workspace</SelectItem>
                  <SelectItem value="active" className="rounded-xl font-bold py-3">Active Only</SelectItem>
                  <SelectItem value="inactive" className="rounded-xl font-bold py-3">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden xl:block mx-2" />
              
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 px-5 py-3.5 rounded-2xl h-14">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Total Results: <span className="text-slate-900 dark:text-white">{filteredWorkspaces.length}</span>
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
              <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="w-[350px] px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace & Identity</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner Status</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Instance Activity</TableHead>
                <TableHead className="text-right py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWorkspaces.length > 0 ? (
                paginatedWorkspaces.map((ws: any) => {
                  const owner = ws.roles?.[0]?.user;
                  const isActive = ws.isActive !== false;
                  
                  return (
                    <TableRow key={ws.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <Avatar className="h-14 w-14 border-4 border-white dark:border-slate-800 shadow-xl rounded-2xl group-hover:scale-105 transition-transform duration-500">
                              <AvatarImage src={ws.logoUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl rounded-2xl">
                                {ws.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900",
                              isActive ? "bg-green-500" : "bg-red-500"
                            )}></div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-base text-slate-900 dark:text-white leading-tight">{ws.name}</span>
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-500 tracking-tight">
                                {ws.subdomain}.{rootDomain}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-slate-100 dark:border-slate-800">
                            <AvatarImage src={owner?.image} />
                            <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-xs">
                              {owner?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{owner?.name || "No Owner Assigned"}</span>
                            <span className="text-xs font-medium text-slate-400 lowercase">{owner?.email || "n/a"}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/5 text-blue-600 border border-blue-500/10">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{ws._count?.studentProfiles || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/5 text-purple-600 border border-purple-500/10">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{ws._count?.courses || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
                            <Layers className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{ws._count?.batches || 0}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => {
                              const protocol = window.location.protocol;
                              const url = `${protocol}//${ws.subdomain}.${rootDomain}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              render={
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                  <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-[240px] rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-900">
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Administrative Tools</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="gap-3 rounded-xl py-3 font-bold cursor-pointer transition-colors"
                                onClick={() => {
                                  const protocol = window.location.protocol;
                                  const url = `${protocol}//${ws.subdomain}.${rootDomain}`;
                                  window.open(url, "_blank");
                                }}
                              >
                                <ExternalLink className="h-4 w-4 text-slate-400" /> Open Landing Page
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer transition-colors">
                                <Activity className="h-4 w-4 text-slate-400" /> Analytics Report
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer transition-colors">
                                <Settings className="h-4 w-4 text-slate-400" /> Instance Config
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                              <DropdownMenuItem className={cn(
                                "gap-3 rounded-xl py-3 font-bold cursor-pointer transition-colors",
                                isActive ? "text-amber-600 bg-amber-500/5" : "text-green-600 bg-green-500/5"
                              )}>
                                {isActive ? (
                                  <><ShieldOff className="h-4 w-4" /> Suspend Instance</>
                                ) : (
                                  <><Shield className="h-4 w-4" /> Re-Activate System</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                              <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" /> Terminate Data
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
                        <Globe className="h-12 w-12 opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg text-slate-600 dark:text-slate-400">No Workspaces Found</p>
                        <p className="text-xs font-medium uppercase tracking-widest">Adjust your filters or try a different search term</p>
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
              Showing <span className="text-slate-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredWorkspaces.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredWorkspaces.length}</span> results
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
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
