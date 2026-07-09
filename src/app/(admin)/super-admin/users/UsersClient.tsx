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
  MoreHorizontal,
  Building2,
  ExternalLink,
  Check,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  MapPin,
  Phone,
  MessageCircle,
  UserCircle
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
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getTenantLink } from "@/lib/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createGlobalUser, updateGlobalUserPermissions, restrictUser, deleteUser, changeUserPassword } from "@/app/actions/users";
import { Checkbox } from "@/components/ui/checkbox";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All User"); // All User, All Staff, All Admin
  const [statusFilter, setStatusFilter] = useState("All"); // active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserStep, setAddUserStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN_MANAGER" as "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER",
    systemPermissions: ["Overview"]
  });

  const handleCreateGlobalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.email || !addFormData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    // Intercept form submission if they are a Manager and still on Step 1
    if (addUserStep === 1 && addFormData.role === "SUPER_ADMIN_MANAGER") {
      setAddUserStep(2);
      return; // Stop here and show the second step
    }

    setIsSubmitting(true);
    const result = await createGlobalUser(addFormData);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success("Global user created successfully!");
      setIsAddUserOpen(false);
      setAddUserStep(1);
      setAddFormData({ name: "", email: "", password: "", role: "SUPER_ADMIN_MANAGER", systemPermissions: ["Overview"] });
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create user");
    }
  };

  // Permissions State
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);

  // User Actions State
  const [selectedUserForAction, setSelectedUserForAction] = useState<any>(null);
  const [isAccessLogOpen, setIsAccessLogOpen] = useState(false);
  const [isRestrictOpen, setIsRestrictOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChangingPasswordFormOpen, setIsChangingPasswordFormOpen] = useState(false);

  const handleOpenProfile = (user: any) => {
    setSelectedUserForAction(user);
    setNewPassword("");
    setIsPasswordVisible(false);
    setIsChangingPasswordFormOpen(false);
    setIsProfileOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsChangingPassword(true);
    const result = await changeUserPassword(selectedUserForAction.id, newPassword);
    setIsChangingPassword(false);
    
    if (result.success) {
      toast.success("Password changed successfully");
      setNewPassword("");
      setIsChangingPasswordFormOpen(false);
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

  const copyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    toast.success("Password copied to clipboard");
  };

  const handleOpenAccessLog = (user: any) => {
    setSelectedUserForAction(user);
    setIsAccessLogOpen(true);
  };

  const handleOpenRestrict = (user: any) => {
    setSelectedUserForAction(user);
    setIsRestrictOpen(true);
  };

  const handleOpenDelete = (user: any) => {
    setSelectedUserForAction(user);
    setIsDeleteOpen(true);
  };

  const handleRestrictUser = async () => {
    if (!selectedUserForAction) return;
    setIsActionLoading(true);
    
    // Toggle the current isActive state
    const newStatus = selectedUserForAction.isActive === false ? true : false;
    const result = await restrictUser(selectedUserForAction.id, newStatus);
    
    setIsActionLoading(false);
    if (result.success) {
      setIsRestrictOpen(false);
      toast.success(`User ${selectedUserForAction.name} ${newStatus ? 'activated' : 'restricted'} successfully`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to restrict user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForAction) return;
    setIsActionLoading(true);
    
    const result = await deleteUser(selectedUserForAction.id);
    
    setIsActionLoading(false);
    if (result.success) {
      setIsDeleteOpen(false);
      toast.success(`User ${selectedUserForAction.name} deleted successfully`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const ALL_GLOBAL_PAGES = [
    { id: "Overview", label: "Overview / Dashboard" },
    { id: "Wallet Economy", label: "Wallet Economy" },
    { id: "Franchises", label: "Franchises" },
    { id: "State Managers", label: "State Managers" },
    { id: "Students", label: "Students" },
    { id: "Users", label: "Users" },
    { id: "Courses", label: "Courses" },
    { id: "Products", label: "Products" },
    { id: "Documents", label: "Documents" },
    { id: "Settings", label: "Settings" }
  ];

  const handleOpenPermissions = (user: any) => {
    setSelectedUserForPermissions(user);
    // If they have no permissions saved yet, default to all except dangerous ones, or default to all.
    const defaultPerms = ALL_GLOBAL_PAGES.map(p => p.id);
    setEditingPermissions(user.systemPermissions || defaultPerms);
    setIsPermissionsOpen(true);
  };

  const handleTogglePermission = (pageId: string) => {
    setEditingPermissions(prev => 
      prev.includes(pageId) ? prev.filter(p => p !== pageId) : [...prev, pageId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUserForPermissions) return;
    setIsUpdatingPermissions(true);
    const result = await updateGlobalUserPermissions(selectedUserForPermissions.id, editingPermissions);
    setIsUpdatingPermissions(false);
    
    if (result.success) {
      toast.success("Permissions updated successfully");
      setIsPermissionsOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update permissions");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const students = initialUsers.filter(u => u.studentProfile);
    const registered = students.filter(u => u.studentProfile?.status === "REGISTERED").length;
    const unregistered = students.filter(u => u.studentProfile?.status === "UNREGISTERED").length;
    const passout = students.filter(u => u.studentProfile?.status === "PASS_OUT").length;

    // Use unique workspace count for "Total Institute"
    const uniqueWorkspaces = new Set();
    initialUsers.forEach(u => {
      u.workspaceRoles?.forEach((wr: any) => {
        if (wr.workspace?.id) uniqueWorkspaces.add(wr.workspace.id);
      });
    });

    return {
      total: initialUsers.length, // Overall Users including students
      students: { total: students.length, registered, unregistered, passout },
      institutes: uniqueWorkspaces.size,
      avgStudentsPerInstitute: uniqueWorkspaces.size > 0 ? Math.round(students.length / uniqueWorkspaces.size) : 0,
      staff: initialUsers.filter(u => u.workspaceRoles?.length > 0 && !u.studentProfile).length,
      online: initialUsers.filter(u => u.lastSeen && new Date(u.lastSeen) > fiveMinutesAgo).length,
    };
  }, [initialUsers]);

  // Sorting & Filtering logic
  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      const isStudent = !!user.studentProfile;
      if (isStudent) return false; // Hide students from the table view

      const searchLower = searchQuery.toLowerCase();
      const workspaceMatch = user.workspaceRoles?.some((wr: any) => 
        wr.workspace?.name?.toLowerCase().includes(searchLower)
      );

      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        workspaceMatch;
      
      const isAdmin = user.role === "SUPER_ADMIN";
      const isStaff = user.workspaceRoles?.length > 0;

      let matchesType = true;
      if (typeFilter === "All Staff") matchesType = isStaff;
      if (typeFilter === "All Admin") matchesType = isAdmin;

      return matchesSearch && matchesType;
    });
  }, [initialUsers, searchQuery, typeFilter]);

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
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="User Directory" 
        description="Manage system access, roles, and global security across all institutes."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 rounded-2xl gap-3 font-bold border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Mail className="h-5 w-5" />
            Invite Admin
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger className="inline-flex items-center justify-center h-12 px-8 rounded-2xl gap-3 shadow-xl shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
              <Plus className="h-5 w-5" />
              Add Global User
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
                  <ShieldCheck className="w-24 h-24" />
                </div>
                <DialogTitle className="text-2xl font-black mb-2 relative z-10">
                  {addUserStep === 1 ? "Add Global User" : "Configure Access"}
                </DialogTitle>
                <DialogDescription className="text-slate-300 relative z-10 text-sm">
                  {addUserStep === 1 
                    ? "Create a new Super Admin or Super Admin Manager. They will have global access to manage institutes."
                    : `Select which pages ${addFormData.name || 'this manager'} can view and manage.`}
                </DialogDescription>
              </div>
              <form onSubmit={handleCreateGlobalUser} className="p-8 pt-6 space-y-6 bg-white dark:bg-slate-950">
                <div className="space-y-4">
                  {addUserStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                        <Input 
                          placeholder="e.g. John Doe" 
                          value={addFormData.name} 
                          onChange={e => setAddFormData({...addFormData, name: e.target.value})}
                          required
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          value={addFormData.email} 
                          onChange={e => setAddFormData({...addFormData, email: e.target.value})}
                          required
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Secure Password</label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={addFormData.password} 
                          onChange={e => setAddFormData({...addFormData, password: e.target.value})}
                          required
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Global Role</label>
                        <Select 
                          value={addFormData.role} 
                          onValueChange={(val: any) => setAddFormData({...addFormData, role: val})}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            <SelectValue placeholder="Select role">
                              {addFormData.role === "SUPER_ADMIN" ? "Super Admin" : "Super Admin Manager"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-2">
                            <SelectItem value="SUPER_ADMIN_MANAGER" className="rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-500/10 cursor-pointer py-3 px-4 mb-1">
                              <div className="flex flex-col">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">Super Admin Manager</span>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Limited Access</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="SUPER_ADMIN" className="rounded-xl focus:bg-amber-50 dark:focus:bg-amber-500/10 cursor-pointer py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-amber-600 dark:text-amber-400">Super Admin</span>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Full Access</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {addUserStep === 2 && addFormData.role === "SUPER_ADMIN_MANAGER" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                        {ALL_GLOBAL_PAGES.map((page) => {
                          const isChecked = addFormData.systemPermissions.includes(page.id);
                          return (
                            <div 
                              key={page.id} 
                              onClick={() => {
                                setAddFormData(prev => ({
                                  ...prev,
                                  systemPermissions: isChecked
                                    ? prev.systemPermissions.filter(p => p !== page.id)
                                    : [...prev.systemPermissions, page.id]
                                }))
                              }}
                              className={cn(
                                "flex items-center space-x-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer group",
                                isChecked 
                                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" 
                                  : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center h-5 w-5 rounded-md border transition-all",
                                isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-transparent"
                              )}>
                                {isChecked && <Check className="h-3.5 w-3.5" />}
                              </div>
                              <label className={cn(
                                "text-[13px] font-bold select-none cursor-pointer",
                                isChecked ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                              )}>
                                {page.label}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-4 mt-8 border-t border-slate-100 dark:border-slate-800">
                  {addUserStep === 1 ? (
                    <>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 h-12 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => {
                          setIsAddUserOpen(false);
                          setAddUserStep(1);
                        }} 
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      {addFormData.role === "SUPER_ADMIN" ? (
                        <Button 
                          type="submit" 
                          className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Creating..." : "Create Super Admin"}
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          Continue to Access <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 h-12 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setAddUserStep(1)} 
                        disabled={isSubmitting}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Create Manager"}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Permissions Dialog */}
          <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
                  <ShieldCheck className="w-24 h-24" />
                </div>
                <DialogTitle className="text-2xl font-black mb-2 relative z-10">Manage Access</DialogTitle>
                <DialogDescription className="text-indigo-200 relative z-10 text-sm">
                  Select which pages <span className="font-bold text-white">{selectedUserForPermissions?.name}</span> can access as a Super Admin Manager.
                </DialogDescription>
              </div>
              <div className="p-8 pt-6 space-y-6 bg-white dark:bg-slate-950 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ALL_GLOBAL_PAGES.map((page) => (
                    <div key={page.id} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <Checkbox 
                        id={`perm-${page.id}`} 
                        checked={editingPermissions.includes(page.id)}
                        onCheckedChange={() => handleTogglePermission(page.id)}
                        className="rounded-[4px]"
                      />
                      <label htmlFor={`perm-${page.id}`} className="text-sm font-semibold cursor-pointer select-none">
                        {page.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-12 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsPermissionsOpen(false)} 
                  disabled={isUpdatingPermissions}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePermissions}
                  className="flex-1 h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isUpdatingPermissions}
                >
                  {isUpdatingPermissions ? "Saving..." : "Save Permissions"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Access Log Dialog */}
          <Dialog open={isAccessLogOpen} onOpenChange={setIsAccessLogOpen}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
                  <History className="w-24 h-24" />
                </div>
                <DialogTitle className="text-2xl font-black mb-2 relative z-10">Access Log</DialogTitle>
                <DialogDescription className="text-blue-200 relative z-10 text-sm">
                  Detailed information and credentials for <span className="font-bold text-white">{selectedUserForAction?.name}</span>.
                </DialogDescription>
              </div>
              <div className="p-8 pt-6 space-y-4 bg-white dark:bg-slate-950">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</p>
                  <p className="font-bold text-sm">{selectedUserForAction?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</p>
                  <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{selectedUserForAction?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role / Access</p>
                  <p className="font-bold text-sm">{selectedUserForAction?.role === "SUPER_ADMIN" ? "Super Admin" : "Super Admin Manager"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Last Seen</p>
                  <p className="font-bold text-sm">{selectedUserForAction?.lastSeen ? new Date(selectedUserForAction.lastSeen).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Button 
                  onClick={() => setIsAccessLogOpen(false)}
                  className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Restrict User Dialog */}
          <Dialog open={isRestrictOpen} onOpenChange={setIsRestrictOpen}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
                  <Lock className="w-24 h-24" />
                </div>
                <DialogTitle className="text-2xl font-black mb-2 relative z-10">
                  {selectedUserForAction?.isActive === false ? "Activate User" : "Restrict User"}
                </DialogTitle>
                <DialogDescription className="text-amber-100 relative z-10 text-sm">
                  Are you sure you want to {selectedUserForAction?.isActive === false ? "activate" : "deactivate"} <span className="font-bold text-white">{selectedUserForAction?.name}</span>?
                </DialogDescription>
              </div>
              <div className="p-8 pt-6 bg-white dark:bg-slate-950">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {selectedUserForAction?.isActive === false 
                    ? "This user will regain access to log in and use system features."
                    : "This user will no longer be able to log in or access any system features until you activate them again."}
                </p>
              </div>
              <div className="flex items-center gap-3 p-6 pt-0 bg-white dark:bg-slate-950">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-12 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsRestrictOpen(false)} 
                  disabled={isActionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRestrictUser}
                  className="flex-1 h-12 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 hover:shadow-amber-600/40 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Processing..." : (selectedUserForAction?.isActive === false ? "Yes, Activate" : "Yes, Restrict")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
                  <Trash2 className="w-24 h-24" />
                </div>
                <DialogTitle className="text-2xl font-black mb-2 relative z-10">Delete User</DialogTitle>
                <DialogDescription className="text-red-100 relative z-10 text-sm">
                  Are you sure you want to permanently delete <span className="font-bold text-white">{selectedUserForAction?.name}</span>?
                </DialogDescription>
              </div>
              <div className="p-8 pt-6 bg-white dark:bg-slate-950">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  This action cannot be undone. All data associated with this user will be permanently removed from the system.
                </p>
              </div>
              <div className="flex items-center gap-3 p-6 pt-0 bg-white dark:bg-slate-950">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-12 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsDeleteOpen(false)} 
                  disabled={isActionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteUser}
                  className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Profile Dialog */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10 bg-slate-50 dark:bg-slate-950">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
                  <User className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <Avatar className="h-16 w-16 border-2 border-white/20 shadow-xl">
                    <AvatarImage src={selectedUserForAction?.image || undefined} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white font-bold text-xl uppercase">
                      {selectedUserForAction?.name?.charAt(0) || selectedUserForAction?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-black mb-1">
                      {selectedUserForAction?.name || "User Profile"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      {selectedUserForAction?.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Basic Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Account Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">System Role</p>
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        {selectedUserForAction?.role === "SUPER_ADMIN" ? "Super Admin" : 
                         selectedUserForAction?.role === "SUPER_ADMIN_MANAGER" ? "Super Admin Manager" : "User"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", selectedUserForAction?.isActive ? "bg-green-500" : "bg-red-500")} />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          {selectedUserForAction?.isActive ? "Active" : "Restricted"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Associated Franchises */}
                {selectedUserForAction?.workspaceRoles?.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Associated Franchises</h4>
                    <div className="space-y-3">
                      {selectedUserForAction.workspaceRoles.map((wr: any) => (
                        <div key={wr.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{wr.workspace.name}</p>
                              <p className="text-xs font-medium text-slate-500">Subdomain: {wr.workspace.subdomain}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="uppercase text-[10px] font-bold tracking-wider">
                            {wr.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extended Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact & Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedUserForAction?.username || selectedUserForAction?.email) && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Username / Email</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">
                            {selectedUserForAction?.username || selectedUserForAction?.email}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {(selectedUserForAction?.phone || selectedUserForAction?.mobile) && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Mobile</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">
                            {selectedUserForAction?.phone || selectedUserForAction?.mobile}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedUserForAction?.whatsapp && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">WhatsApp</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">
                            {selectedUserForAction?.whatsapp}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedUserForAction?.address && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                        <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Address</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            {selectedUserForAction?.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Password */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-slate-500" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Change Password</h4>
                    </div>
                    {!isChangingPasswordFormOpen && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsChangingPasswordFormOpen(true)}
                        className="h-8 text-xs font-bold rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                      >
                        Change Password
                      </Button>
                    )}
                  </div>
                  
                  {isChangingPasswordFormOpen && (
                    <form onSubmit={handleChangePassword} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1 space-y-2 relative w-full">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Password</label>
                          <div className="relative">
                            <Input 
                              type={isPasswordVisible ? "text" : "password"}
                              placeholder="••••••••"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="h-11 pl-4 pr-20 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                              minLength={6}
                              required
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                title={isPasswordVisible ? "Hide password" : "Show password"}
                              >
                                {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={copyPassword}
                                disabled={!newPassword}
                                title="Copy password"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setIsChangingPasswordFormOpen(false);
                              setNewPassword("");
                            }}
                            className="h-11 flex-1 sm:flex-none px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isChangingPassword || !newPassword}
                            className="h-11 flex-1 sm:flex-none px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 shadow-md transition-all"
                          >
                            {isChangingPassword ? "Updating..." : "Save"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-2">
                        The user's current password is encrypted and cannot be viewed. Setting a new password here will immediately revoke their old one.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>


        </div>
      </AdminPageHeader>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Overall Users Card */}
        <Card className="border-none shadow-xl shadow-blue-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity scale-150 transform group-hover:brightness-110 duration-500 pointer-events-none">
            <Users className="w-28 h-28 text-blue-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:brightness-110 transition-transform duration-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Overall Users</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
               <div className="flex items-center gap-2">
                 <GraduationCap className="w-3 h-3 text-blue-500" />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg Students / Inst.</p>
               </div>
               <p className="text-sm font-black text-blue-600 dark:text-blue-400">{stats.avgStudentsPerInstitute.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Students Card (Clickable) */}
        <Card 
          onClick={() => router.push("/super-admin/students")}
          className="border-none shadow-xl shadow-purple-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-purple-500/30 hover:shadow-purple-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 transform group-hover:brightness-110 duration-500 pointer-events-none">
            <GraduationCap className="w-28 h-28 text-purple-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 group-hover:brightness-110 transition-transform duration-300">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Students</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.students.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Active Students</p>
               </div>
               <p className="text-sm font-black text-purple-600 dark:text-purple-400">{stats.students.registered + stats.students.unregistered}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Institute & Staff Card (Clickable) */}
        <Card 
          onClick={() => router.push("/super-admin/franchises")}
          className="border-none shadow-xl shadow-emerald-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 transform group-hover:brightness-110 duration-500 pointer-events-none">
            <Building2 className="w-28 h-28 text-emerald-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 group-hover:brightness-110 transition-transform duration-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Institutes</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.institutes.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
               <div className="flex items-center gap-2">
                 <Briefcase className="w-3 h-3 text-emerald-500" />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Staffs</p>
               </div>
               <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.staff.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Online Now Card */}
        <Card className="border-none shadow-xl shadow-green-900/5 dark:shadow-none rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative group border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity scale-150 transform group-hover:brightness-110 duration-500 pointer-events-none">
            <Activity className="w-28 h-28 text-green-500" />
          </div>
          <CardContent className="p-5 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 relative group-hover:brightness-110 transition-transform duration-300">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Online Now</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{stats.online.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="relative w-full max-w-[450px] group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
                <Input 
                  placeholder="Search identity, email, or franchise..." 
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
                  <SelectItem value="All User" className="rounded-xl font-bold py-3">All User</SelectItem>
                  <SelectItem value="All Staff" className="rounded-xl font-bold py-3">All Staff</SelectItem>
                  <SelectItem value="All Admin" className="rounded-xl font-bold py-3">All Admin</SelectItem>
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

        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Users Found</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your search criteria or changing tabs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-y border-slate-50 dark:border-slate-800/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 w-[350px]">User</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">Access Level</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">Franchises</TableHead>
                    <TableHead className="py-4 px-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const isSuperAdmin = user.role === "SUPER_ADMIN";
                    const isSuperAdminManager = user.role === "SUPER_ADMIN_MANAGER";
                    const isGlobalScope = isSuperAdmin || isSuperAdminManager;
                    const isFranchiseAdmin = user.workspaceRoles?.some((wr: any) => wr.role === "ADMIN");
                    const isStaff = user.workspaceRoles?.length > 0 && !isGlobalScope;
                    const isOnline = user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
                    const borderColor = isSuperAdmin ? "border-amber-500" : isSuperAdminManager ? "border-blue-500" : (isStaff && isFranchiseAdmin) ? "border-purple-500" : isStaff ? "border-emerald-500" : "border-slate-200";

                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group border-b border-slate-50 dark:border-slate-800/50 relative">
                        <TableCell className="p-6">
                           <div className={cn("absolute left-0 top-0 bottom-0 w-1", borderColor)} />
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shrink-0 shadow-sm">
                                  <AvatarImage src={user.image || undefined} className="object-cover" />
                                  <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-2xl uppercase">
                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900"></span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name || "Anonymous User"}</p>
                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-slate-400 shrink-0" /> {user.email}
                                </p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="p-6">
                            {isSuperAdmin ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-none rounded uppercase text-[10px] font-bold px-2 py-1 tracking-widest gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" /> SUPER ADMIN
                              </Badge>
                            ) : isSuperAdminManager ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border-none rounded uppercase text-[10px] font-bold px-2 py-1 tracking-widest gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5" /> SUPER ADMIN MANAGER
                              </Badge>
                            ) : isFranchiseAdmin ? (
                              <Badge className="bg-purple-500/10 text-purple-600 border-none rounded uppercase text-[10px] font-bold px-2 py-1 tracking-widest gap-1.5">
                                <Building2 className="h-3.5 w-3.5" /> FRANCHISES ADMIN
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded uppercase text-[10px] font-bold px-2 py-1 tracking-widest gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" /> FRANCHISES STAFF
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell className="p-6">
                           <div className="flex flex-col items-start gap-2">
                             {isGlobalScope ? (
                               <Link href="/super-admin" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic hover:text-indigo-500 transition-colors group/link">
                                 Global Scope <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                               </Link>
                             ) : user.workspaceRoles?.length > 0 ? (
                               <>
                                 {user.workspaceRoles.slice(0, 2).map((wr: any) => (
                                   <Link 
                                     key={wr.id} 
                                     href={getTenantLink("/admin/dashboard", wr.workspace.subdomain || wr.workspace.id, pathname)}
                                     className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group/link cursor-pointer"
                                     title="Access Dashboard"
                                   >
                                     <Globe className="h-3 w-3 text-slate-400 group-hover/link:text-indigo-500" />
                                     <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 truncate max-w-[120px]">{wr.workspace.name}</span>
                                     <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                                   </Link>
                                 ))}
                                 {user.workspaceRoles?.length > 2 && (
                                   <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                                     +{user.workspaceRoles.length - 2} more
                                   </div>
                                 )}
                               </>
                             ) : (
                               <span className="text-[10px] font-bold text-slate-400 italic">No Franchise Assigned</span>
                             )}
                           </div>
                        </TableCell>
                        <TableCell className="p-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              render={
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto">
                                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-[200px] rounded-2xl border-none shadow-xl p-2 bg-white dark:bg-slate-900">
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">User Control</DropdownMenuLabel>
                              
                              <DropdownMenuItem 
                                className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-black dark:hover:text-blue-400 focus:bg-slate-100 dark:focus:bg-blue-500/10 focus:text-black dark:focus:text-blue-400 text-slate-600 dark:text-slate-300 group/item"
                                onClick={() => handleOpenProfile(user)}
                              >
                                <User className="h-4 w-4 text-slate-400 group-hover/item:text-black group-focus/item:text-black dark:group-hover/item:text-blue-500 dark:group-focus/item:text-blue-500 transition-colors" /> Profile
                              </DropdownMenuItem>

                              <DropdownMenuItem 
                                className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-black dark:hover:text-blue-400 focus:bg-slate-100 dark:focus:bg-blue-500/10 focus:text-black dark:focus:text-blue-400 text-slate-600 dark:text-slate-300 group/item"
                                onClick={() => handleOpenAccessLog(user)}
                              >
                                <History className="h-4 w-4 text-slate-400 group-hover/item:text-black group-focus/item:text-black dark:group-hover/item:text-blue-500 dark:group-focus/item:text-blue-500 transition-colors" /> Access Log
                              </DropdownMenuItem>
                              
                              {user.role === "SUPER_ADMIN_MANAGER" && (
                                <DropdownMenuItem 
                                  className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-indigo-500/10 hover:text-black dark:hover:text-indigo-400 focus:bg-slate-100 dark:focus:bg-indigo-500/10 focus:text-black dark:focus:text-indigo-400 group/item"
                                  onClick={() => handleOpenPermissions(user)}
                                >
                                  <ShieldCheck className="h-4 w-4 text-slate-400 group-hover/item:text-black group-focus/item:text-black dark:group-hover/item:text-indigo-500 dark:group-focus/item:text-indigo-500 transition-colors" /> Edit Permission
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator className="my-1 bg-slate-50 dark:bg-slate-800" />

                              <DropdownMenuItem 
                                className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs text-amber-600 hover:bg-slate-100 dark:hover:bg-amber-500/10 hover:text-black dark:hover:text-amber-400 focus:bg-slate-100 dark:focus:bg-amber-500/10 focus:text-black dark:focus:text-amber-400 group/item"
                                onClick={() => handleOpenRestrict(user)}
                              >
                                {user.isActive === false ? (
                                  <><Unlock className="h-4 w-4 text-amber-500 group-hover/item:text-black group-focus/item:text-black dark:group-hover/item:text-amber-600 dark:group-focus/item:text-amber-600 transition-colors" /> Activate</>
                                ) : (
                                  <><Lock className="h-4 w-4 text-amber-500 group-hover/item:text-black group-focus/item:text-black dark:group-hover/item:text-amber-600 dark:group-focus/item:text-amber-600 transition-colors" /> Restrict</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-3 rounded-xl py-2.5 font-bold cursor-pointer transition-colors text-xs text-red-600 hover:bg-slate-100 dark:hover:bg-red-500/10 hover:text-black dark:hover:text-red-400 focus:bg-slate-100 dark:focus:bg-red-500/10 focus:text-black dark:focus:text-red-400 group/item"
                                onClick={() => handleOpenDelete(user)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500 group-hover/item:text-black group-focus/item:text-black dark:group-hover/item:text-red-600 dark:group-focus/item:text-red-600 transition-colors" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer - Match Students Page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-sm font-medium text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn("h-9 w-9 rounded-xl font-bold text-xs", currentPage === i + 1 ? "shadow-md shadow-primary/20" : "text-slate-500")}
                      >
                        {i + 1}
                      </Button>
                    );
                  } else if (
                    i === currentPage - 3 ||
                    i === currentPage + 1
                  ) {
                    return <span key={i} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
