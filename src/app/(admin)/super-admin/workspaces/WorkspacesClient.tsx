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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function WorkspacesClient({ initialWorkspaces }: { initialWorkspaces: any[] }) {
  const router = useRouter();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace Management</h1>
          <p className="text-muted-foreground mt-1">Manage all educational institutes and their active subscriptions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="h-11 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              Create New Workspace
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create Workspace</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Zenith Global Academy" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input required value={formData.subdomain} onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} placeholder="zenith" className="rounded-xl h-11" />
                    <span className="text-sm text-muted-foreground">.{rootDomain}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} placeholder="John Doe" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Owner Email</Label>
                  <Input required type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} placeholder="john@zenith.edu" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Owner Password</Label>
                  <Input required type="password" value={formData.ownerPassword} onChange={(e) => setFormData({...formData, ownerPassword: e.target.value})} placeholder="Secure password" className="rounded-xl h-11" />
                </div>
              </div>
              <Button type="submit" disabled={isCreating} className="w-full h-12 rounded-xl text-md font-bold">
                {isCreating ? "Creating..." : "Provision Workspace"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
              {initialWorkspaces.map((ws: any) => {
                const adminRole = ws.roles?.[0];
                const ownerName = adminRole?.user?.name || "No Owner";
                const ownerEmail = adminRole?.user?.email || "N/A";
                const studentsCount = ws._count?.studentProfiles || 0;
                
                return (
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
                          {ws.subdomain}.{rootDomain}
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
                      <span className="text-sm font-medium">{ownerName}</span>
                      <span className="text-xs text-muted-foreground">{ownerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {studentsCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {ws.tokensBalance?.toLocaleString() || "0"}
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
