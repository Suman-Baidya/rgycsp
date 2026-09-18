"use client";

import React, { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { UserPlus, Search, ShieldCheck, Mail, Shield, Eye, Pencil, Loader2, BookOpen, Users, LayoutDashboard, Calendar, Wallet, Settings, GraduationCap, ShoppingCart, Activity, Ban, Trash2, MoreVertical, MoreHorizontal, UserCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { addStaff, updateStaffRole, removeStaff } from "@/app/actions/staff";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PERMISSION_OPTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "admissions", label: "Admissions", icon: UserPlus },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "products", label: "Products", icon: ShoppingCart },
  { id: "exam-gen", label: "Exam Zone", icon: GraduationCap },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function StaffList({ 
  workspaceId, 
  initialStaff 
}: { 
  workspaceId: string; 
  initialStaff: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccessLogOpen, setIsAccessLogOpen] = useState(false);
  
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "ADMIN" | "STAFF" | "TEACHER",
    permissions: [] as string[]
  });

  const [editFormData, setEditFormData] = useState({
    role: "STAFF" as "ADMIN" | "STAFF" | "TEACHER",
    permissions: [] as string[]
  });

  const filteredStaff = useMemo(() => {
    if (!debouncedSearch.trim()) return initialStaff;
    const query = debouncedSearch.toLowerCase().trim();
    return initialStaff.filter(s => 
      s.user?.name?.toLowerCase().includes(query) ||
      s.user?.email?.toLowerCase().includes(query)
    );
  }, [initialStaff, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addStaff(workspaceId, formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Staff member added successfully!");
      setOpen(false);
      router.refresh();
      setFormData({ name: "", email: "", password: "", role: "STAFF", permissions: [] });
    } else {
      toast.error(result.error || "Failed to add staff member");
    }
  };

  const handleEditClick = (staff: any) => {
    setSelectedStaff(staff);
    let parsedPermissions = [];
    try {
      if (Array.isArray(staff.permissions)) {
        parsedPermissions = staff.permissions;
      } else if (typeof staff.permissions === 'string') {
        parsedPermissions = JSON.parse(staff.permissions);
      }
    } catch (e) {}

    setEditFormData({
      role: (staff.role === "MANAGER" ? "STAFF" : staff.role) as "ADMIN" | "STAFF" | "TEACHER",
      permissions: parsedPermissions
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    
    const result = await updateStaffRole(selectedStaff.id, editFormData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Staff profile updated!");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update staff");
    }
  };

  const handleRemove = async () => {
    if (!selectedStaff) return;
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    
    setIsSubmitting(true);
    const result = await removeStaff(selectedStaff.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Staff member removed!");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove staff");
    }
  };

  const togglePermission = (id: string, formType: 'add' | 'edit') => {
    if (formType === 'add') {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(id) 
          ? prev.permissions.filter(p => p !== id)
          : [...prev.permissions, id]
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(id) 
          ? prev.permissions.filter(p => p !== id)
          : [...prev.permissions, id]
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-[300px] group">
          <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Search team members..." 
            className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs placeholder:text-xs placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-1.5 rounded-lg h-8 sm:h-9 px-3 text-xs font-semibold" />}>
            <UserPlus className="h-3.5 w-3.5" />
            Add Team Member
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Full Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" placeholder="john@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Password</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" placeholder="••••••••" />
                  <p className="text-[10px] text-slate-400">Leave blank if user already has an account.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Role</Label>
                  <Select value={formData.role} onValueChange={val => setFormData({...formData, role: val as any})}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="STAFF">Manager / Staff</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.role !== "ADMIN" && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Label className="text-xs font-medium">Page Permissions</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PERMISSION_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60">
                        <Checkbox 
                          id={`add-${opt.id}`} 
                          checked={formData.permissions.includes(opt.id)}
                          onCheckedChange={() => togglePermission(opt.id, 'add')}
                        />
                        <label htmlFor={`add-${opt.id}`} className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                          <opt.icon className="w-3.5 h-3.5 text-slate-400" />
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full h-8 sm:h-9 rounded-lg font-semibold text-xs mt-2">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                {isSubmitting ? "Adding..." : "Add to Workspace"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modern Vertical List (Rule 7.5) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {filteredStaff.map((item) => {
            let itemPermissions = [];
            try {
              if (Array.isArray(item.permissions)) itemPermissions = item.permissions;
              else if (typeof item.permissions === 'string') itemPermissions = JSON.parse(item.permissions);
            } catch (e) {}

            return (
              <div 
                key={item.id} 
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-bold text-xs rounded-xl uppercase">
                      {item.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-none">{item.user.name || "Unknown User"}</h3>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "capitalize text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                          item.role === "ADMIN" ? "bg-primary/10 text-primary" :
                          item.role === "TEACHER" ? "bg-orange-500/10 text-orange-600" :
                          "bg-slate-100 text-slate-600"
                        )}
                      >
                        {item.role === "ADMIN" && <Shield className="h-2.5 w-2.5 mr-1" />}
                        {item.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="h-3 w-3" />
                      <span className="text-[11px] font-medium">{item.user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:px-4 md:border-x border-slate-100 dark:md:border-slate-800/50">
                  <div className="flex flex-col text-left shrink-0">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Access Level
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.role === "ADMIN" ? "Full Access" : `${itemPermissions.length} Pages`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors border-none bg-transparent">
                      <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                      <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 border-slate-200 dark:border-slate-800 shadow-lg text-xs font-medium">
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer py-2.5"
                        onClick={() => {
                          setSelectedStaff(item);
                          setIsProfileOpen(true);
                        }}
                      >
                        <UserCircle className="mr-3 h-4 w-4 text-indigo-500" />
                        See Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer py-2.5"
                        onClick={() => handleEditClick(item)}
                      >
                        <ShieldCheck className="mr-3 h-4 w-4 text-emerald-500" />
                        Edit Access
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer py-2.5"
                        onClick={() => {
                          setSelectedStaff(item);
                          setIsAccessLogOpen(true);
                        }}
                      >
                        <Activity className="mr-3 h-4 w-4 text-blue-500" />
                        Access Log
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />
                      
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer py-2.5 text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                        onClick={() => {
                          toast.success(`Access restricted for ${item.user.name}.`);
                        }}
                      >
                        <Ban className="mr-3 h-4 w-4" />
                        Restrict Access
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 font-bold"
                        onClick={() => {
                          setSelectedStaff(item);
                          // Delay slightly so the dropdown can close naturally
                          setTimeout(() => handleRemove(), 100);
                        }}
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete Staff
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          {filteredStaff.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-xs text-slate-500 font-medium">No team members found.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">Manage Access</DialogTitle>
            <p className="text-xs text-slate-500">
              Select role and page access for <span className="font-semibold text-slate-900 dark:text-white">{selectedStaff?.user?.name || "this staff member"}</span>.
            </p>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-1">
                <Label className="text-xs font-medium">System Role</Label>
                <Select value={editFormData.role} onValueChange={val => setEditFormData({...editFormData, role: val as any})}>
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 font-semibold text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="STAFF">Manager / Staff</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editFormData.role !== "ADMIN" && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Page Permissions</Label>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {editFormData.permissions.length} Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PERMISSION_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <Checkbox 
                          id={`edit-${opt.id}`} 
                          checked={editFormData.permissions.includes(opt.id)}
                          onCheckedChange={() => togglePermission(opt.id, 'edit')}
                          className="rounded-[4px]"
                        />
                        <label htmlFor={`edit-${opt.id}`} className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5 flex-1 select-none">
                          <opt.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleRemove} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700">
                Remove
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="h-8 sm:h-9 px-3 rounded-lg text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-8 sm:h-9 px-4 rounded-lg font-semibold text-xs">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Avatar className="h-14 w-14 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg rounded-xl uppercase">
                {selectedStaff?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">{selectedStaff?.user?.name || "Unknown Staff"}</DialogTitle>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {selectedStaff?.user?.email}
              </p>
            </div>
          </div>
          <div className="py-3 space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">Role</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">{selectedStaff?.role?.toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium">Permissions</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedStaff?.role === "ADMIN" ? "Full Access" : `${selectedStaff?.permissions?.length || 0} Pages`}
                </span>
              </div>
            </div>
            <Button onClick={() => setIsProfileOpen(false)} variant="outline" className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold">
              Close Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccessLogOpen} onOpenChange={setIsAccessLogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Access Log
            </DialogTitle>
            <p className="text-xs text-slate-500">Recent activity for <span className="font-semibold text-slate-900 dark:text-white">{selectedStaff?.user?.name}</span></p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2 text-xs">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Activity className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Logged In</p>
                      <p className="text-[10px] text-slate-400">From Dashboard</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{i === 0 ? "Just now" : `${i * 2} days ago`}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => setIsAccessLogOpen(false)} variant="outline" className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold">
              Close Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
