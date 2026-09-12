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
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="User Directory" 
        description="Manage system access, roles, and global security across all institutes."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 sm:h-9 px-3 rounded-lg gap-1.5 font-semibold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Mail className="h-3.5 w-3.5" />
            Invite Admin
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger className="inline-flex items-center justify-center h-8 sm:h-9 px-3.5 rounded-lg gap-1.5 shadow-sm shadow-primary/20 bg-primary font-semibold text-xs text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
              <Plus className="h-3.5 w-3.5" />
              Add Global User
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                  <ShieldCheck className="w-20 h-20" />
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">
                  {addUserStep === 1 ? "Add Global User" : "Configure Access"}
                </DialogTitle>
                <DialogDescription className="text-slate-300 relative z-10 text-xs">
                  {addUserStep === 1 
                    ? "Create a new Super Admin or Super Admin Manager. They will have global access to manage institutes."
                    : `Select which pages ${addFormData.name || 'this manager'} can view and manage.`}
                </DialogDescription>
              </div>
              <form onSubmit={handleCreateGlobalUser} className="p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-950">
                <div className="space-y-3">
                  {addUserStep === 1 && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                        <Input 
                          placeholder="e.g. John Doe" 
                          value={addFormData.name} 
                          onChange={e => setAddFormData({...addFormData, name: e.target.value})}
                          required
                          className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50 transition-all px-3"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          value={addFormData.email} 
                          onChange={e => setAddFormData({...addFormData, email: e.target.value})}
                          required
                          className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50 transition-all px-3"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Secure Password</label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={addFormData.password} 
                          onChange={e => setAddFormData({...addFormData, password: e.target.value})}
                          required
                          className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50 transition-all px-3"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Global Role</label>
                        <Select 
                          value={addFormData.role} 
                          onValueChange={(val: any) => setAddFormData({...addFormData, role: val})}
                        >
                          <SelectTrigger className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-3 font-medium text-slate-700 dark:text-slate-300">
                            <SelectValue placeholder="Select role">
                              {addFormData.role === "SUPER_ADMIN" ? "Super Admin" : "Super Admin Manager"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border-slate-200 dark:border-slate-800 shadow-lg p-1">
                            <SelectItem value="SUPER_ADMIN_MANAGER" className="rounded-md cursor-pointer py-2 px-3 mb-0.5 text-xs">
                              <div className="flex flex-col">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Super Admin Manager</span>
                                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Limited Access</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="SUPER_ADMIN" className="rounded-md cursor-pointer py-2 px-3 text-xs">
                              <div className="flex flex-col">
                                <span className="font-semibold text-amber-600 dark:text-amber-400">Super Admin</span>
                                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Full Access</span>
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
                                "flex items-center justify-center h-4 w-4 rounded border transition-all",
                                isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-transparent"
                              )}>
                                {isChecked && <Check className="h-3 w-3" />}
                              </div>
                              <label className={cn(
                                "text-xs font-semibold select-none cursor-pointer",
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
                <div className="flex items-center gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {addUserStep === 1 ? (
                    <>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
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
                          className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Creating..." : "Create Super Admin"}
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          Continue to Access <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setAddUserStep(1)} 
                        disabled={isSubmitting}
                      >
                        <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
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
            <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-4 sm:p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                  <ShieldCheck className="w-20 h-20" />
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">Manage Access</DialogTitle>
                <DialogDescription className="text-indigo-200 relative z-10 text-xs">
                  Select which pages <span className="font-semibold text-white">{selectedUserForPermissions?.name}</span> can access as a Super Admin Manager.
                </DialogDescription>
              </div>
              <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-950 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_GLOBAL_PAGES.map((page) => (
                    <div key={page.id} className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <Checkbox 
                        id={`perm-${page.id}`} 
                        checked={editingPermissions.includes(page.id)}
                        onCheckedChange={() => handleTogglePermission(page.id)}
                        className="rounded"
                      />
                      <label htmlFor={`perm-${page.id}`} className="text-xs font-semibold cursor-pointer select-none">
                        {page.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 px-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsPermissionsOpen(false)} 
                  disabled={isUpdatingPermissions}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePermissions}
                  className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isUpdatingPermissions}
                >
                  {isUpdatingPermissions ? "Saving..." : "Save Permissions"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Access Log Dialog */}
          <Dialog open={isAccessLogOpen} onOpenChange={setIsAccessLogOpen}>
            <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 sm:p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                  <History className="w-20 h-20" />
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">Access Log</DialogTitle>
                <DialogDescription className="text-blue-200 relative z-10 text-xs">
                  Detailed information and credentials for <span className="font-semibold text-white">{selectedUserForAction?.name}</span>.
                </DialogDescription>
              </div>
              <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-950">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</p>
                  <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{selectedUserForAction?.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                  <p className="font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400">{selectedUserForAction?.email}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role / Access</p>
                  <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{selectedUserForAction?.role === "SUPER_ADMIN" ? "Super Admin" : "Super Admin Manager"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Seen</p>
                  <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{selectedUserForAction?.lastSeen ? new Date(selectedUserForAction.lastSeen).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 px-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Button 
                  onClick={() => setIsAccessLogOpen(false)}
                  className="w-full h-8 sm:h-9 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Restrict User Dialog */}
          <Dialog open={isRestrictOpen} onOpenChange={setIsRestrictOpen}>
            <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-4 sm:p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                  <Lock className="w-20 h-20" />
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">
                  {selectedUserForAction?.isActive === false ? "Activate User" : "Restrict User"}
                </DialogTitle>
                <DialogDescription className="text-amber-100 relative z-10 text-xs">
                  Are you sure you want to {selectedUserForAction?.isActive === false ? "activate" : "deactivate"} <span className="font-semibold text-white">{selectedUserForAction?.name}</span>?
                </DialogDescription>
              </div>
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-950">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {selectedUserForAction?.isActive === false 
                    ? "This user will regain access to log in and use system features."
                    : "This user will no longer be able to log in or access any system features until you activate them again."}
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 px-4 pt-0 bg-white dark:bg-slate-950">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsRestrictOpen(false)} 
                  disabled={isActionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRestrictUser}
                  className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Processing..." : (selectedUserForAction?.isActive === false ? "Yes, Activate" : "Yes, Restrict")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 sm:p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                  <Trash2 className="w-20 h-20" />
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">Delete User</DialogTitle>
                <DialogDescription className="text-red-100 relative z-10 text-xs">
                  Are you sure you want to permanently delete <span className="font-semibold text-white">{selectedUserForAction?.name}</span>?
                </DialogDescription>
              </div>
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-950">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  This action cannot be undone. All data associated with this user will be permanently removed from the system.
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 px-4 pt-0 bg-white dark:bg-slate-950">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsDeleteOpen(false)} 
                  disabled={isActionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteUser}
                  className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Profile Dialog */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-50 dark:bg-slate-950">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 sm:p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                  <User className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <Avatar className="h-12 w-12 border border-white/20 shadow-md rounded-xl">
                    <AvatarImage src={selectedUserForAction?.image || undefined} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white font-bold text-base uppercase rounded-xl">
                      {selectedUserForAction?.name?.charAt(0) || selectedUserForAction?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-lg font-bold mb-0.5">
                      {selectedUserForAction?.name || "User Profile"}
                    </DialogTitle>
                    <div className="flex items-center gap-1.5 text-indigo-100 text-xs font-medium">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedUserForAction?.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Basic Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Details</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">System Role</p>
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {selectedUserForAction?.role === "SUPER_ADMIN" ? "Super Admin" : 
                         selectedUserForAction?.role === "SUPER_ADMIN_MANAGER" ? "Super Admin Manager" : "User"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Status</p>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-1.5 w-1.5 rounded-full", selectedUserForAction?.isActive ? "bg-green-500" : "bg-red-500")} />
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {selectedUserForAction?.isActive ? "Active" : "Restricted"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Associated Franchises */}
                {selectedUserForAction?.workspaceRoles?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Associated Franchises</h4>
                    <div className="space-y-2">
                      {selectedUserForAction.workspaceRoles.map((wr: any) => (
                        <div key={wr.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-slate-900 dark:text-white">{wr.workspace.name}</p>
                              <p className="text-[10px] font-medium text-slate-500">Subdomain: {wr.workspace.subdomain}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="uppercase text-[9px] font-bold px-1.5 py-0.5">
                            {wr.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extended Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact & Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(selectedUserForAction?.username || selectedUserForAction?.email) && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <UserCircle className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Username / Email</p>
                          <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">
                            {selectedUserForAction?.username || selectedUserForAction?.email}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {(selectedUserForAction?.phone || selectedUserForAction?.mobile) && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Phone className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Mobile</p>
                          <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">
                            {selectedUserForAction?.phone || selectedUserForAction?.mobile}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedUserForAction?.whatsapp && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">WhatsApp</p>
                          <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">
                            {selectedUserForAction?.whatsapp}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedUserForAction?.address && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                        <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Address</p>
                          <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                            {selectedUserForAction?.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Management */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Credentials</h4>
                      <p className="text-xs text-slate-500">Manage user access password directly from global settings.</p>
                    </div>
                    {!isChangingPasswordFormOpen && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsChangingPasswordFormOpen(true)}
                        className="h-8 text-xs font-semibold rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                      >
                        Change Password
                      </Button>
                    )}
                  </div>
                  
                  {isChangingPasswordFormOpen && (
                    <form onSubmit={handleChangePassword} className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col sm:flex-row items-end gap-2.5">
                        <div className="flex-1 space-y-1 relative w-full">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Password</label>
                          <div className="relative">
                            <Input 
                              type={isPasswordVisible ? "text" : "password"}
                              placeholder="••••••••"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="h-8 sm:h-9 pl-3 pr-16 rounded-lg text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                              minLength={6}
                              required
                            />
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                title={isPasswordVisible ? "Hide password" : "Show password"}
                              >
                                {isPasswordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={copyPassword}
                                disabled={!newPassword}
                                title="Copy password"
                              >
                                <Copy className="h-3 w-3" />
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
                            className="h-8 sm:h-9 flex-1 sm:flex-none px-3 rounded-lg font-semibold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isChangingPassword || !newPassword}
                            className="h-8 sm:h-9 flex-1 sm:flex-none px-4 rounded-lg font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 shadow-sm transition-all"
                          >
                            {isChangingPassword ? "Updating..." : "Save"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400">
                        The user's current password is encrypted. Setting a new password will immediately update their login.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Overall Users Card */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Overall Users</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <GraduationCap className="w-3 h-3 text-blue-500" /> Avg / Inst:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.avgStudentsPerInstitute.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Students Card (Clickable) */}
        <Card 
          onClick={() => router.push("/super-admin/students")}
          className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-500/30 transition-all"
        >
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Students</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.students.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active:
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.students.registered + stats.students.unregistered}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Institutes & Staff Card (Clickable) */}
        <Card 
          onClick={() => router.push("/super-admin/franchises")}
          className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-500/30 transition-all"
        >
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Institutes</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.institutes.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Briefcase className="w-3 h-3 text-emerald-500" /> Staffs:
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.staff.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Online Now Card */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Online Now</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.online.toLocaleString()}</p>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-bold tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    LIVE
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-[10px] text-slate-400">Session:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-[300px] group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <Input 
                placeholder="Search identity, email, or franchise..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg h-8 sm:h-9 font-normal text-[11px] sm:text-xs transition-all focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400" 
              />
            </div>
            
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as string)}>
                <SelectTrigger className="w-[125px] h-8 sm:h-9 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter className="h-3 w-3 text-slate-400 shrink-0" />
                    <SelectValue placeholder="User Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200 dark:border-slate-700 shadow-md">
                  <SelectItem value="All User" className="rounded-md text-xs">All User</SelectItem>
                  <SelectItem value="All Staff" className="rounded-md text-xs">All Staff</SelectItem>
                  <SelectItem value="All Admin" className="rounded-md text-xs">All Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 h-8 sm:h-9 shrink-0">
                <Activity className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Results: <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span>
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-3">
                <Search className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">No Users Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or changing filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[300px]">User</TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Level</TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Franchises</TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginatedUsers.map((user) => {
                    const isSuperAdmin = user.role === "SUPER_ADMIN";
                    const isSuperAdminManager = user.role === "SUPER_ADMIN_MANAGER";
                    const isGlobalScope = isSuperAdmin || isSuperAdminManager;
                    const isFranchiseAdmin = user.workspaceRoles?.some((wr: any) => wr.role === "ADMIN");
                    const isStaff = user.workspaceRoles?.length > 0 && !isGlobalScope;
                    const isOnline = user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
                    const borderColor = isSuperAdmin ? "border-amber-500" : isSuperAdminManager ? "border-blue-500" : (isStaff && isFranchiseAdmin) ? "border-purple-500" : isStaff ? "border-emerald-500" : "border-slate-200";

                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group relative">
                        <TableCell className="p-3 sm:p-3.5">
                           <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", borderColor)} />
                           <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                  <AvatarImage src={user.image || undefined} className="object-cover" />
                                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs rounded-xl uppercase">
                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-slate-900"></span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{user.name || "Anonymous User"}</p>
                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Mail className="h-2.5 w-2.5 text-slate-400 shrink-0" /> <span className="truncate">{user.email}</span>
                                </p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="p-3 sm:p-3.5">
                            {isSuperAdmin ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider gap-1">
                                <ShieldCheck className="h-3 w-3" /> SUPER ADMIN
                              </Badge>
                            ) : isSuperAdminManager ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider gap-1">
                                <ShieldAlert className="h-3 w-3" /> SUPER ADMIN MANAGER
                              </Badge>
                            ) : isFranchiseAdmin ? (
                              <Badge className="bg-purple-500/10 text-purple-600 border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider gap-1">
                                <Building2 className="h-3 w-3" /> FRANCHISE ADMIN
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider gap-1">
                                <Briefcase className="h-3 w-3" /> FRANCHISE STAFF
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell className="p-3 sm:p-3.5">
                           <div className="flex flex-wrap items-center gap-1.5">
                             {isGlobalScope ? (
                               <Link href="/super-admin" className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:text-indigo-500 transition-colors group/link">
                                 Global Scope <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                               </Link>
                             ) : user.workspaceRoles?.length > 0 ? (
                               <>
                                 {user.workspaceRoles.slice(0, 2).map((wr: any) => (
                                   <Link 
                                     key={wr.id} 
                                     href={getTenantLink("/admin/dashboard", wr.workspace.subdomain || wr.workspace.id, pathname)}
                                     className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group/link cursor-pointer text-[10px] font-medium"
                                     title="Access Dashboard"
                                   >
                                     <Globe className="h-2.5 w-2.5 text-slate-400 group-hover/link:text-indigo-500" />
                                     <span className="text-slate-600 dark:text-slate-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 truncate max-w-[110px]">{wr.workspace.name}</span>
                                     <ExternalLink className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                                   </Link>
                                 ))}
                                 {user.workspaceRoles?.length > 2 && (
                                   <div className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500">
                                     +{user.workspaceRoles.length - 2}
                                   </div>
                                 )}
                               </>
                             ) : (
                               <span className="text-[10px] font-medium text-slate-400 italic">No Franchise</span>
                             )}
                           </div>
                        </TableCell>
                        <TableCell className="p-3 sm:p-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl font-medium p-1 text-xs shadow-md">
                              <DropdownMenuLabel className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">User Control</DropdownMenuLabel>
                              
                              <DropdownMenuItem 
                                className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => handleOpenProfile(user)}
                              >
                                <User className="h-3.5 w-3.5 text-slate-400" /> Profile
                              </DropdownMenuItem>

                              <DropdownMenuItem 
                                className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => handleOpenAccessLog(user)}
                              >
                                <History className="h-3.5 w-3.5 text-slate-400" /> Access Log
                              </DropdownMenuItem>
                              
                              {user.role === "SUPER_ADMIN_MANAGER" && (
                                <DropdownMenuItem 
                                  className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => handleOpenPermissions(user)}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Edit Permission
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

                              <DropdownMenuItem 
                                className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                onClick={() => handleOpenRestrict(user)}
                              >
                                {user.isActive === false ? (
                                  <><Unlock className="h-3.5 w-3.5 text-amber-500" /> Activate</>
                                ) : (
                                  <><Lock className="h-3.5 w-3.5 text-amber-500" /> Restrict</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                onClick={() => handleOpenDelete(user)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" /> Delete
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-xs font-medium text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {(() => {
                  const getPageNumbers = () => {
                    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
                    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                  };
                  return getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
                    }
                    const pageNum = page as number;
                    return (
                      <Button
                        key={`page-${pageNum}`}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn("h-7 w-7 rounded-md font-semibold text-xs", currentPage === pageNum ? "shadow-sm shadow-primary/20" : "text-slate-500")}
                      >
                        {pageNum}
                      </Button>
                    );
                  });
                })()}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages} 
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

