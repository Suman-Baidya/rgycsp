"use client";

import React, { useState } from "react";
import { UserPlus, Search, ShieldCheck, Mail, Shield, Eye, Pencil, Loader2, BookOpen, Users, LayoutDashboard, Calendar, Wallet, Settings, GraduationCap, ShoppingCart, Activity, Ban, Trash2, MoreVertical, MoreHorizontal, UserCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const filteredStaff = initialStaff.filter(s => 
    s.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search team members..." 
            className="pl-9 rounded-xl border-slate-200 font-medium h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2 rounded-xl h-11 font-bold" />}>
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 border-2 border-slate-100 overflow-hidden">
            <DialogHeader className="p-8 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold">Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Full Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Email Address</Label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11 rounded-xl" placeholder="john@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Password</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="h-11 rounded-xl" placeholder="••••••••" />
                  <p className="text-[10px] text-muted-foreground">Leave blank if user already has an account.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Role</Label>
                  <Select value={formData.role} onValueChange={val => setFormData({...formData, role: val as any})}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="STAFF">Manager / Staff</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.role !== "ADMIN" && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-bold">Page Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {PERMISSION_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Checkbox 
                          id={`add-${opt.id}`} 
                          checked={formData.permissions.includes(opt.id)}
                          onCheckedChange={() => togglePermission(opt.id, 'add')}
                        />
                        <label htmlFor={`add-${opt.id}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <opt.icon className="w-4 h-4 text-slate-400" />
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl font-bold mt-4">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSubmitting ? "Adding..." : "Add to Workspace"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modern Vertical List */}
      <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
        <div className="space-y-4">
          {filteredStaff.map((item) => {
            let itemPermissions = [];
            try {
              if (Array.isArray(item.permissions)) itemPermissions = item.permissions;
              else if (typeof item.permissions === 'string') itemPermissions = JSON.parse(item.permissions);
            } catch (e) {}

            return (
              <div 
                key={item.id} 
                className="group bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 p-6 transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-black/60 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <Avatar className="h-14 w-14 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 shrink-0">
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-bold text-lg rounded-2xl uppercase">
                      {item.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg leading-none">{item.user.name || "Unknown User"}</h3>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "capitalize text-[10px] py-0 border-none font-bold",
                          item.role === "ADMIN" ? "bg-primary/10 text-primary" :
                          item.role === "TEACHER" ? "bg-orange-500/10 text-orange-600" :
                          "bg-slate-100 text-slate-600"
                        )}
                      >
                        {item.role === "ADMIN" && <Shield className="h-3 w-3 mr-1" />}
                        {item.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs font-medium">{item.user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:px-8 md:border-x-2 md:border-slate-100 dark:md:border-slate-800/50">
                  <div className="flex flex-col">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Access Level
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.role === "ADMIN" ? "Full Access" : `${itemPermissions.length} Pages`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors border-none bg-transparent">
                      <MoreVertical className="h-5 w-5 text-slate-500" />
                      <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 dark:border-slate-800 shadow-xl font-medium">
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
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-muted-foreground font-medium">No team members found.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <DialogTitle className="text-3xl font-black mb-2 relative z-10">Manage Access</DialogTitle>
            <p className="text-indigo-200 relative z-10 text-sm">
              Select the role and page access for <span className="font-bold text-white">{selectedStaff?.user?.name || "this staff member"}</span>.
            </p>
          </div>
          <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-950 flex flex-col max-h-[70vh]">
            <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Role</Label>
                <Select value={editFormData.role} onValueChange={val => setEditFormData({...editFormData, role: val as any})}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="STAFF" className="font-medium">Manager / Staff</SelectItem>
                    <SelectItem value="TEACHER" className="font-medium">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editFormData.role !== "ADMIN" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Page Permissions</Label>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                      {editFormData.permissions.length} Pages Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSION_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group">
                        <Checkbox 
                          id={`edit-${opt.id}`} 
                          checked={editFormData.permissions.includes(opt.id)}
                          onCheckedChange={() => togglePermission(opt.id, 'edit')}
                          className="rounded-[4px] data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <label htmlFor={`edit-${opt.id}`} className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2.5 flex-1 select-none">
                          <opt.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={handleRemove} className="h-12 px-6 rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Remove
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="h-12 px-6 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden flex flex-col items-center">
            <Avatar className="h-24 w-24 rounded-2xl border-4 border-white/20 shadow-xl mb-4 relative z-10">
              <AvatarFallback className="bg-white text-indigo-700 font-black text-3xl rounded-2xl uppercase">
                {selectedStaff?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-2xl font-black mb-1 relative z-10 text-center">{selectedStaff?.user?.name || "Unknown Staff"}</DialogTitle>
            <p className="text-indigo-100 font-medium relative z-10 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> {selectedStaff?.user?.email}
            </p>
          </div>
          <div className="p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold text-sm">Role</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedStaff?.role?.toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-sm">Permissions</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedStaff?.role === "ADMIN" ? "Full Access" : `${selectedStaff?.permissions?.length || 0} Pages`}
                </span>
              </div>
            </div>
            <Button onClick={() => setIsProfileOpen(false)} variant="outline" className="w-full h-12 rounded-xl font-bold border-2">
              Close Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccessLogOpen} onOpenChange={setIsAccessLogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
          <div className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black mb-2 flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400" />
              Access Log
            </DialogTitle>
            <p className="text-slate-400 text-sm">Recent activity for <span className="text-white font-bold">{selectedStaff?.user?.name}</span></p>
          </div>
          <div className="p-8 bg-slate-50 dark:bg-slate-950">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900/30 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Logged In</span>
                      <span className="text-[10px] font-bold text-slate-400">{i === 0 ? "Just now" : `${i * 2} days ago`}</span>
                    </div>
                    <p className="text-xs text-slate-500">From Dashboard</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setIsAccessLogOpen(false)} variant="outline" className="w-full h-12 mt-8 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800">
              Close Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
