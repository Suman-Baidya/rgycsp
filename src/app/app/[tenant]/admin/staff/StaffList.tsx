"use client";

import React, { useState } from "react";
import { UserPlus, Search, ShieldCheck, Mail, Shield, Eye, Pencil, Loader2, BookOpen, Users, LayoutDashboard, Calendar, Wallet, Settings, Sparkles, ShoppingCart } from "lucide-react";
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
  { id: "exam-gen", label: "Exam Gen", icon: Sparkles },
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
      role: staff.role as "ADMIN" | "STAFF" | "TEACHER",
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
                      <SelectItem value="ADMIN">Admin (Full Control)</SelectItem>
                      <SelectItem value="STAFF">Staff (Custom Access)</SelectItem>
                      <SelectItem value="TEACHER">Teacher (Courses)</SelectItem>
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
                  <Button 
                    onClick={() => handleEditClick(item)}
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-10 font-bold text-[10px] gap-2 border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5 text-primary" />
                    Edit Access
                  </Button>
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
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 border-2 border-slate-100 overflow-hidden">
          <DialogHeader className="p-8 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Edit Staff Access</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="p-8 pt-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Role</Label>
              <Select value={editFormData.role} onValueChange={val => setEditFormData({...editFormData, role: val as any})}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ADMIN">Admin (Full Control)</SelectItem>
                  <SelectItem value="STAFF">Staff (Custom Access)</SelectItem>
                  <SelectItem value="TEACHER">Teacher (Courses)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editFormData.role !== "ADMIN" && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-bold">Page Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PERMISSION_OPTIONS.map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Checkbox 
                        id={`edit-${opt.id}`} 
                        checked={editFormData.permissions.includes(opt.id)}
                        onCheckedChange={() => togglePermission(opt.id, 'edit')}
                      />
                      <label htmlFor={`edit-${opt.id}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <opt.icon className="w-4 h-4 text-slate-400" />
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={handleRemove} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold rounded-xl h-11">
                Remove Staff
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl font-bold px-8">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
