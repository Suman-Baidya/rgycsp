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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/app/actions/workspaces";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getRootDomain } from "@/lib/domain";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";


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
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const result = await createWorkspace(formData);
    setIsCreating(false);

    if (result.success) {
      toast.success("Workspace created successfully!");
      setOpen(false);
      router.refresh();
      setFormData({ name: "", subdomain: "", ownerName: "", ownerEmail: "", ownerPassword: "" });
    } else {
      toast.error(result.error || "Failed to create workspace");
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Workspace Management" 
        description="Manage all educational institutes and their active subscriptions."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger 
            render={
              <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="h-4 w-4" />
                Provision New Workspace
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8">
            <DialogHeader className="space-y-2 mb-4">
              <DialogTitle className="text-2xl font-black tracking-tight">Create Workspace</DialogTitle>
              <CardDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest">Setup new institute instance</CardDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 pt-4">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Workspace Name</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Zenith Global Academy" className="rounded-2xl h-12 border-2 bg-slate-50/50 font-bold" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input required value={formData.subdomain} onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} placeholder="zenith" className="rounded-2xl h-12 border-2 bg-slate-50/50 font-bold" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">.{rootDomain}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Owner Name</Label>
                    <Input required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} placeholder="John Doe" className="rounded-2xl h-12 border-2 bg-slate-50/50 font-bold text-sm" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Owner Email</Label>
                    <Input required type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} placeholder="john@zenith.edu" className="rounded-2xl h-12 border-2 bg-slate-50/50 font-bold text-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Owner Password</Label>
                  <Input required type="password" value={formData.ownerPassword} onChange={(e) => setFormData({...formData, ownerPassword: e.target.value})} placeholder="Secure password" className="rounded-2xl h-12 border-2 bg-slate-50/50 font-bold" />
                </div>
              </div>
              <Button type="submit" disabled={isCreating} className="w-full h-14 rounded-2xl text-md font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                {isCreating ? "Provisioning..." : "Provision Workspace Now"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </AdminPageHeader>

      <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="relative w-full max-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search workspaces..." 
                className="pl-11 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl h-11 font-medium" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block mx-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
                Region: <span className="text-slate-900 dark:text-white">Global Nodes</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="w-[300px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace Identity</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Owner</TableHead>
                <TableHead className="text-right py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Students</TableHead>
                <TableHead className="text-right py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Token Balance</TableHead>
                <TableHead className="text-right py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Activation Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialWorkspaces.map((ws: any) => {
                const adminRole = ws.roles?.[0];
                const ownerName = adminRole?.user?.name || "No Owner";
                const ownerEmail = adminRole?.user?.email || "N/A";
                const studentsCount = ws._count?.studentProfiles || 0;
                
                return (
                <TableRow key={ws.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                  <TableCell className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-800 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-black">
                          {ws.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{ws.name}</span>
                        <span className="text-xs font-medium text-slate-500">
                          {ws.subdomain}.{rootDomain}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-3 py-1 rounded-lg font-bold border-2 text-[10px] tracking-tight",
                        ws.status === "active" ? "border-green-500/10 bg-green-500/5 text-green-600 dark:text-green-400" :
                        ws.status === "inactive" ? "border-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400" :
                        "border-amber-500/10 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {ws.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ownerName}</span>
                      <span className="text-xs font-medium text-slate-500">{ownerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm text-slate-900 dark:text-white">
                    {studentsCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-black text-sm text-primary">
                    {ws.tokensBalance?.toLocaleString() || "0"}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <span className="text-xs font-bold text-slate-500">
                       {mounted ? new Date(ws.createdAt).toLocaleDateString('en-GB') : ""}
                    </span>
                  </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all")}>
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px] rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl p-2">
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer">
                          <ExternalLink className="h-4 w-4 text-slate-400" /> Open Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer">
                          <Mail className="h-4 w-4 text-slate-400" /> Email Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer">
                          <Shield className="h-4 w-4 text-slate-400" /> Security Audit
                        </DropdownMenuItem>
                        <DropdownMenuItem className={cn(
                          "gap-3 rounded-xl py-2.5 font-bold cursor-pointer",
                          ws.status === "active" ? "text-amber-600" : "text-green-600"
                        )}>
                          {ws.status === "active" ? (
                            <><ShieldOff className="h-4 w-4" /> Deactivate Instance</>
                          ) : (
                            <><Shield className="h-4 w-4" /> Activate Instance</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10">
                          <Trash2 className="h-4 w-4" /> Wipe All Data
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
