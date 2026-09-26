"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  History, 
  Lock, 
  Unlock, 
  Trash2, 
  Globe, 
  Building2, 
  ExternalLink, 
  Check, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Activity, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  IdCard, 
  CreditCard,
  Printer, 
  Clock, 
  Briefcase,
  Download,
  Loader2,
  Layers,
  FileText,
  SlidersHorizontal,
  FileCheck,
  Laptop,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  RefreshCw,
  Copy,
  LogIn,
  LogOut
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
import { Progress } from "@/components/ui/progress";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  createGlobalUser, 
  updateGlobalUserPermissions, 
  restrictUser, 
  deleteUser, 
  changeUserPassword 
} from "@/app/actions/users";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebounce } from "@/hooks/useDebounce";
import { isDeveloperEmail } from "@/lib/developer";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { getUserAccessLogs, AccessLogItem } from "@/app/actions/user-access-logs";

interface UsersClientProps {
  initialUsers: any[];
  initialTemplates?: any[];
}

export default function UsersClient({ initialUsers, initialTemplates = [] }: UsersClientProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Tabs & Filter State
  const [activeTab, setActiveTab] = useState<"ALL" | "ADMINS" | "STAFFS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "RESTRICTED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection for Bulk Printing
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Add Global User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserStep, setAddUserStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddPasswordVisible, setIsAddPasswordVisible] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN_MANAGER" as "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER",
    systemPermissions: ["Overview"]
  });

  // Action Modals State
  const [selectedUserForAction, setSelectedUserForAction] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccessLogOpen, setIsAccessLogOpen] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLogItem[]>([]);
  const [accessLogStats, setAccessLogStats] = useState<any>(null);
  const [accessLogTimeframe, setAccessLogTimeframe] = useState<"24h" | "7d" | "30d" | "all">("30d");
  const [isAccessLogLoading, setIsAccessLogLoading] = useState(false);
  const [isRestrictOpen, setIsRestrictOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Document Modal & Print Engine State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalType, setDocModalType] = useState<"FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "STAFF_ID" | "VISITING_CARD">("FRANCHISE_CERTIFICATE");
  const [selectedDocTemplateId, setSelectedDocTemplateId] = useState<string>("");
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  // Bulk Generator State
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [bulkDocType, setBulkDocType] = useState<"FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "STAFF_ID" | "VISITING_CARD">("FRANCHISE_CERTIFICATE");
  const [bulkLayoutMode, setBulkLayoutMode] = useState<"SINGLE" | "TWICE">("SINGLE");
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, text: "" });
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const singleRendererRef = useRef<DocumentRendererRef>(null);
  const bulkRendererRef = useRef<DocumentRendererRef>(null);

  // Password Management in Profile
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChangingPasswordFormOpen, setIsChangingPasswordFormOpen] = useState(false);

  // Permissions State
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);

  const ALL_GLOBAL_PAGES = [
    { id: "Overview", label: "Overview / Dashboard" },
    { id: "Wallet Economy", label: "Wallet Economy" },
    { id: "Franchises", label: "Franchises" },
    { id: "State Managers", label: "State Managers" },
    { id: "Students", label: "Students" },
    { id: "Users", label: "Users Directory" },
    { id: "Courses", label: "Courses" },
    { id: "Products", label: "Products" },
    { id: "Documents", label: "Documents" },
    { id: "Settings", label: "Settings" }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter out any hidden developer accounts
  const sanitizedUsers = useMemo(() => {
    return (initialUsers || []).filter(u => !isDeveloperEmail(u.email));
  }, [initialUsers]);

  // Metric Stats Calculation
  const stats = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const globalAdmins = sanitizedUsers.filter(u => u.role === "SUPER_ADMIN" || u.role === "SUPER_ADMIN_MANAGER");
    const franchiseAdmins = sanitizedUsers.filter(u => u.workspaceRoles?.some((wr: any) => wr.role === "ADMIN"));
    const staffMembers = sanitizedUsers.filter(u => 
      u.workspaceRoles?.some((wr: any) => wr.role === "STAFF" || wr.role === "MANAGER") || 
      u.role === "SUPER_ADMIN_MANAGER"
    );
    const online = sanitizedUsers.filter(u => u.lastSeen && new Date(u.lastSeen) > fiveMinutesAgo);

    return {
      total: sanitizedUsers.length,
      globalAdmins: globalAdmins.length,
      franchiseAdmins: franchiseAdmins.length,
      staff: staffMembers.length,
      online: online.length
    };
  }, [sanitizedUsers]);

  // Tab Filtering & Search Logic
  const filteredUsers = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().trim();

    return sanitizedUsers.filter(user => {
      const isSuperAdmin = user.role === "SUPER_ADMIN";
      const isSuperAdminManager = user.role === "SUPER_ADMIN_MANAGER";
      const isFranchiseAdmin = user.workspaceRoles?.some((wr: any) => wr.role === "ADMIN");
      const isFranchiseStaff = user.workspaceRoles?.some((wr: any) => wr.role === "STAFF" || wr.role === "MANAGER");

      // 1. Tab Categorization
      if (activeTab === "ADMINS") {
        const isAdmin = isSuperAdmin || isFranchiseAdmin;
        if (!isAdmin) return false;
      } else if (activeTab === "STAFFS") {
        const isStaff = isFranchiseStaff || isSuperAdminManager;
        if (!isStaff) return false;
      }

      // 2. Status Filter
      if (statusFilter === "ACTIVE" && user.isActive === false) return false;
      if (statusFilter === "RESTRICTED" && user.isActive !== false) return false;

      // 3. Search Filter
      if (!searchLower) return true;

      const workspaceMatch = user.workspaceRoles?.some((wr: any) => 
        wr.workspace?.name?.toLowerCase().includes(searchLower) ||
        wr.workspace?.centerCode?.toLowerCase().includes(searchLower) ||
        wr.workspace?.subdomain?.toLowerCase().includes(searchLower)
      );

      return (
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        workspaceMatch
      );
    });
  }, [sanitizedUsers, activeTab, statusFilter, debouncedSearch]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
    setSelectedUserIds([]);
  }, [activeTab, statusFilter, debouncedSearch]);

  // Standardized Page Numbers Generator (AGENTS.md)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // Helper formatting for Relative Time
  const formatLastActive = (dateString?: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffMin < 5) return "Active now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format a User object into DocumentRenderer data payload
  const formatUserForDocument = (user: any) => {
    if (!user) return null;
    const primaryRole = user.workspaceRoles?.[0];
    const ws = primaryRole?.workspace;

    return {
      id: user.id,
      name: user.name,
      fullName: user.name,
      email: user.email,
      username: user.username || ws?.centerCode || "",
      photoUrl: user.image || ws?.logoUrl,
      image: user.image || ws?.logoUrl,
      phone: user.phone || ws?.phone || ws?.contactPhone || "",
      address: ws?.address || "",
      certificateNo: ws?.centerCode || `UID-${user.id.slice(0, 6).toUpperCase()}`,
      enrollmentNo: ws?.centerCode || user.username || `UID-${user.id.slice(0, 6).toUpperCase()}`,
      dob: user.createdAt,
      admissionDate: user.createdAt,
      centerCode: ws?.centerCode,
      workspace: ws || {
        name: user.role === "SUPER_ADMIN" ? "National Headquarters" : "Central Administration",
        subdomain: "admin",
        centerCode: "HQ-001"
      }
    };
  };

  // Available Designer Templates strictly isolated for type (Never mix with Student templates)
  const availableTemplatesForType = useMemo(() => {
    return initialTemplates.filter(t => {
      if (docModalType === "FRANCHISE_CERTIFICATE") return t.type === "FRANCHISE_CERTIFICATE";
      if (docModalType === "FRANCHISE_ID") return t.type === "FRANCHISE_ID";
      if (docModalType === "STAFF_ID") return t.type === "STAFF_ID";
      if (docModalType === "VISITING_CARD") return t.type === "VISITING_CARD";
      return false;
    });
  }, [initialTemplates, docModalType]);

  // Open Document Modal for single user
  const handleOpenDocumentModal = (user: any, docType: "FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "STAFF_ID" | "VISITING_CARD") => {
    setSelectedUserForAction(user);
    setDocModalType(docType);
    setDocPreviewUrl(null);
    
    // Auto-select active designer template if found
    const matching = initialTemplates.filter(t => {
      if (docType === "FRANCHISE_CERTIFICATE") return t.type === "FRANCHISE_CERTIFICATE";
      if (docType === "FRANCHISE_ID") return t.type === "FRANCHISE_ID";
      if (docType === "STAFF_ID") return t.type === "STAFF_ID";
      if (docType === "VISITING_CARD") return t.type === "VISITING_CARD";
      return false;
    });
    setSelectedDocTemplateId(matching[0]?.id || "");
    setIsDocModalOpen(true);
  };

  // Fetch access & activity logs for a user with timeframe filter
  const loadAccessLogs = async (userId: string, timeframe: "24h" | "7d" | "30d" | "all" = "30d") => {
    setIsAccessLogLoading(true);
    try {
      const res = await getUserAccessLogs(userId, timeframe);
      if (res.success && res.data) {
        setAccessLogs(res.data.logs);
        setAccessLogStats(res.data.stats);
      } else {
        toast.error(res.error || "Failed to load access logs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load access logs");
    } finally {
      setIsAccessLogLoading(false);
    }
  };

  // Open Access Log Modal for a selected user
  const handleOpenAccessLog = (user: any) => {
    setSelectedUserForAction(user);
    setAccessLogTimeframe("30d");
    setIsAccessLogOpen(true);
    loadAccessLogs(user.id, "30d");
  };

  // Bulk Print Execution Engine
  const handleExecuteBulkPrint = async () => {
    const selectedUsers = sanitizedUsers.filter(u => selectedUserIds.includes(u.id));
    if (selectedUsers.length === 0) {
      toast.error("No users selected.");
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: selectedUsers.length, text: "Initializing print engine..." });

    try {
      const { jsPDF } = await import("jspdf");
      let pdf: any = null;
      let docsOnPage = 0;

      for (let i = 0; i < selectedUsers.length; i++) {
        const u = selectedUsers[i];
        setBulkProgress({
          current: i + 1,
          total: selectedUsers.length,
          text: `Processing (${i + 1}/${selectedUsers.length}): ${u.name || u.email}...`
        });

        // Set active user for renderer
        setSelectedUserForAction(u);
        await new Promise(r => setTimeout(r, 120)); // wait for DOM paint

        if (bulkRendererRef.current) {
          const imgData = await bulkRendererRef.current.getImgData();
          const dims = bulkRendererRef.current.getTemplateDimensions();

          if (imgData && dims) {
            if (!pdf) {
              if (bulkLayoutMode === "TWICE") {
                pdf = new jsPDF({ orientation: "landscape", unit: "in", format: [18, 12] });
              } else {
                pdf = new jsPDF({ orientation: dims.orientation, unit: "pt", format: [dims.width, dims.height] });
              }
            }

            if (bulkLayoutMode === "TWICE") {
              if (i > 0 && docsOnPage === 2) {
                pdf.addPage([18, 12], "landscape");
                docsOnPage = 0;
              }

              const blockWidth = 9;
              const blockHeight = 12;
              const imgAspect = dims.width / dims.height;
              const blockAspect = blockWidth / blockHeight;

              let printWidth, printHeight;
              if (imgAspect > blockAspect) {
                printWidth = blockWidth - 0.5;
                printHeight = printWidth / imgAspect;
              } else {
                printHeight = blockHeight - 0.5;
                printWidth = printHeight * imgAspect;
              }

              const xOffset = (blockWidth - printWidth) / 2;
              const yOffset = (blockHeight - printHeight) / 2;
              const finalX = (docsOnPage === 1 ? 9 : 0) + xOffset;

              pdf.addImage(imgData, "PNG", finalX, yOffset, printWidth, printHeight, undefined, "FAST");
              docsOnPage += 1;
            } else {
              if (i > 0) {
                pdf.addPage([dims.width, dims.height], dims.orientation);
              }
              pdf.addImage(imgData, "PNG", 0, 0, dims.width, dims.height, undefined, "FAST");
            }
          }
        }
      }

      if (pdf) {
        setBulkProgress({ current: selectedUsers.length, total: selectedUsers.length, text: "Opening print preview..." });
        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");
        toast.success(`Generated compiled print file for ${selectedUsers.length} users!`);
      } else {
        toast.error("No document pages could be compiled.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate bulk print.");
    } finally {
      setIsBulkGenerating(false);
      setIsBulkPrintOpen(false);
    }
  };

  // Profile & Action Handlers
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
      toast.success("Password updated successfully");
      setNewPassword("");
      setIsChangingPasswordFormOpen(false);
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

  const handleRestrictUser = async () => {
    if (!selectedUserForAction) return;
    setIsActionLoading(true);
    
    const newStatus = selectedUserForAction.isActive === false ? true : false;
    const result = await restrictUser(selectedUserForAction.id, newStatus);
    
    setIsActionLoading(false);
    if (result.success) {
      setIsRestrictOpen(false);
      toast.success(`User ${selectedUserForAction.name} ${newStatus ? 'activated' : 'restricted'} successfully`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update user status");
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

  const handleOpenPermissions = (user: any) => {
    setSelectedUserForPermissions(user);
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

  const handleCreateGlobalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.email || !addFormData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (addUserStep === 1 && addFormData.role === "SUPER_ADMIN_MANAGER") {
      setAddUserStep(2);
      return;
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

  if (!mounted) return null;

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        {/* Page Header */}
        <AdminPageHeader 
          title="User Directory" 
          description="Manage system access, administrative credentials, and franchise operator roles."
        >
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="h-8 sm:h-9 px-3 rounded-lg gap-1.5 font-semibold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Invite Admin
            </Button>
            
            <Dialog open={isAddUserOpen} onOpenChange={(open) => {
              setIsAddUserOpen(open);
              if (!open) {
                setIsAddPasswordVisible(false);
                setAddUserStep(1);
              }
            }}>
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
                      ? "Create a new Super Admin or Super Admin Manager with system-wide authority."
                      : `Select which modules ${addFormData.name || 'this manager'} can view and manage.`}
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
                            placeholder="admin@example.com" 
                            value={addFormData.email} 
                            onChange={e => setAddFormData({...addFormData, email: e.target.value})}
                            required
                            className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50 transition-all px-3"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                          <div className="relative">
                            <Input 
                              type={isAddPasswordVisible ? "text" : "password"}
                              placeholder="Minimum 6 characters" 
                              value={addFormData.password} 
                              onChange={e => setAddFormData({...addFormData, password: e.target.value})}
                              required
                              className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50 transition-all px-3 pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => setIsAddPasswordVisible(!isAddPasswordVisible)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                              {isAddPasswordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Role Authority</label>
                          <Select 
                            value={addFormData.role} 
                            onValueChange={(val: any) => setAddFormData({...addFormData, role: val})}
                          >
                            <SelectTrigger className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SUPER_ADMIN" className="text-xs">
                                <div>
                                  <p className="font-semibold text-xs">Super Admin</p>
                                  <span className="text-[10px] text-slate-400">Full unrestricted platform authority</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="SUPER_ADMIN_MANAGER" className="text-xs">
                                <div>
                                  <p className="font-semibold text-xs">Super Admin Manager</p>
                                  <span className="text-[10px] text-slate-400">Granular permissions per module</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {addUserStep === 2 && addFormData.role === "SUPER_ADMIN_MANAGER" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
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
                                  "flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer",
                                  isChecked 
                                    ? "border-primary bg-primary/5 dark:bg-primary/10" 
                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200"
                                )}
                              >
                                <div className={cn(
                                  "flex items-center justify-center h-4 w-4 rounded border transition-all",
                                  isChecked ? "bg-primary border-primary text-primary-foreground" : "border-slate-300 bg-transparent"
                                )}>
                                  {isChecked && <Check className="h-3 w-3" />}
                                </div>
                                <span className={cn(
                                  "text-xs font-semibold select-none",
                                  isChecked ? "text-primary" : "text-slate-600 dark:text-slate-400"
                                )}>
                                  {page.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs"
                      onClick={() => {
                        setIsAddUserOpen(false);
                        setAddUserStep(1);
                      }} 
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : addUserStep === 1 && addFormData.role === "SUPER_ADMIN_MANAGER" ? "Continue to Access →" : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </AdminPageHeader>

        {/* 4 Metric Stat Cards (AGENTS.md) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total System Users</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.total.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Total Administrators & Staff</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Global Admins</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.globalAdmins.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Super Admins & Managers</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.globalAdmins}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Franchise Admins</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.franchiseAdmins.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Center Directors</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.franchiseAdmins}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Online Now</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.online.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold tracking-wider">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      LIVE
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Active Sessions</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Live</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Horizontal Navigation Tabs (Pill Style) */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
          <button
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === "ALL"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Users</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold ml-1",
              activeTab === "ALL" ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}>
              {sanitizedUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ADMINS")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === "ADMINS"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admins (Global & Franchise)</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold ml-1",
              activeTab === "ADMINS" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}>
              {sanitizedUsers.filter(u => u.role === "SUPER_ADMIN" || u.workspaceRoles?.some((wr: any) => wr.role === "ADMIN")).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("STAFFS")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === "STAFFS"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Staff & Managers</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold ml-1",
              activeTab === "STAFFS" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}>
              {sanitizedUsers.filter(u => u.role === "SUPER_ADMIN_MANAGER" || u.workspaceRoles?.some((wr: any) => wr.role === "STAFF" || wr.role === "MANAGER")).length}
            </span>
          </button>
        </div>

        {/* Main Content Card with Table & Toolbar */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                {/* Bulk Print Trigger when items are selected */}
                {selectedUserIds.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setIsBulkPrintOpen(true)}
                    className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Bulk Print ({selectedUserIds.length})</span>
                  </Button>
                )}

                <div className="relative w-full sm:max-w-[320px] group">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <Input 
                    placeholder="Search name, email, center code, or franchise..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg h-8 sm:h-9 font-normal text-[11px] sm:text-xs transition-all focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400" 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                  <SelectTrigger className="w-[125px] h-8 sm:h-9 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <Filter className="h-3 w-3 text-slate-400 shrink-0" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200 dark:border-slate-700 shadow-md">
                    <SelectItem value="ALL" className="text-xs">All Status</SelectItem>
                    <SelectItem value="ACTIVE" className="text-xs">Active Only</SelectItem>
                    <SelectItem value="RESTRICTED" className="text-xs">Restricted</SelectItem>
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
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or switching tabs.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
                    <TableRow className="hover:bg-transparent border-none">
                      {/* Checkbox select all */}
                      <TableHead className="py-2.5 px-3 w-10 text-center">
                        <Checkbox 
                          checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedUserIds(filteredUsers.map(u => u.id));
                            else setSelectedUserIds([]);
                          }}
                          className="rounded"
                          title="Select all"
                        />
                      </TableHead>
                      <TableHead className="py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-10 text-center">SL</TableHead>
                      <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[220px]">User Identity</TableHead>
                      <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[240px]">Access Level & Franchise</TableHead>
                      <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-24">Status</TableHead>
                      <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-32">Last Active</TableHead>
                      <TableHead className="py-2.5 px-3.5 sm:px-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {paginatedUsers.map((user, index) => {
                      const isSuperAdmin = user.role === "SUPER_ADMIN";
                      const isSuperAdminManager = user.role === "SUPER_ADMIN_MANAGER";
                      const isGlobalScope = isSuperAdmin || isSuperAdminManager;
                      const isFranchiseAdmin = user.workspaceRoles?.some((wr: any) => wr.role === "ADMIN");
                      const isOnline = user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 5 * 60 * 1000);
                      const primaryCenterCode = user.workspaceRoles?.find((wr: any) => wr.workspace?.centerCode)?.workspace?.centerCode;

                      // Border status indicator
                      const borderColor = isSuperAdmin 
                        ? "border-amber-500" 
                        : isSuperAdminManager 
                        ? "border-blue-500" 
                        : isFranchiseAdmin 
                        ? "border-purple-500" 
                        : "border-emerald-500";

                      // Calculate Serial Number based on current page
                      const slNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const isSelected = selectedUserIds.includes(user.id);

                      return (
                        <TableRow key={user.id} className={cn("hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group relative", isSelected && "bg-primary/5")}>
                          {/* Row Selection Checkbox */}
                          <TableCell className="p-3 text-center">
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedUserIds(prev => [...prev, user.id]);
                                else setSelectedUserIds(prev => prev.filter(id => id !== user.id));
                              }}
                              className="rounded"
                            />
                          </TableCell>

                          {/* SL Number */}
                          <TableCell className="p-2 text-center text-xs font-mono font-semibold text-slate-400">
                            <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", borderColor)} />
                            {slNumber}
                          </TableCell>

                          {/* User Identity Column */}
                          <TableCell className="p-3 sm:p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                  <AvatarImage src={user.image || undefined} className="object-cover" />
                                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs rounded-xl uppercase">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[200px]">
                                  {user.name || "Anonymous User"}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium">
                                  {primaryCenterCode && (
                                    <span className="px-1.5 py-0.2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono font-bold rounded text-[9px]">
                                      {primaryCenterCode}
                                    </span>
                                  )}
                                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Merged Column: Access Level (Top) & Franchise Name (Bottom) */}
                          <TableCell className="p-3 sm:p-3.5">
                            <div className="space-y-1">
                              {/* Top: Access Level Badge */}
                              <div>
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
                              </div>

                              {/* Bottom: Franchise Name or Global Scope */}
                              <div>
                                {isGlobalScope ? (
                                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                    <Globe className="h-3 w-3 text-slate-400" />
                                    <span>Global Scope (All Institutes)</span>
                                  </div>
                                ) : user.workspaceRoles && user.workspaceRoles.length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {user.workspaceRoles.slice(0, 1).map((wr: any) => {
                                      const href = getTenantLink("/admin/dashboard", wr.workspace.subdomain || wr.workspace.id, pathname);
                                      const displayName = `${wr.workspace.name}${wr.workspace.centerCode ? ` (${wr.workspace.centerCode})` : ""}`;
                                      return (
                                        <Tooltip key={wr.id}>
                                          <TooltipTrigger render={<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors max-w-[200px] truncate cursor-pointer" />}>
                                            <Link 
                                              href={href}
                                              className="inline-flex items-center gap-1 max-w-[200px] truncate"
                                            >
                                              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                              <span className="truncate">{displayName}</span>
                                              <ExternalLink className="h-2.5 w-2.5 opacity-60 shrink-0" />
                                            </Link>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{displayName}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                    {user.workspaceRoles.length > 1 && (
                                      <Badge variant="outline" className="text-[9px] font-bold px-1 py-0 h-4 border-slate-200">
                                        +{user.workspaceRoles.length - 1} more
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-400 italic">No Franchise Linked</span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="p-3 sm:p-3.5">
                            {user.isActive === false ? (
                              <Badge className="bg-rose-500/10 text-rose-600 border-none rounded text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                                Restricted
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                                Active
                              </Badge>
                            )}
                          </TableCell>

                          {/* Last Active */}
                          <TableCell className="p-3 sm:p-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className={cn(
                                "text-[11px] font-medium",
                                isOnline && "text-emerald-600 dark:text-emerald-400 font-semibold"
                              )}>
                                {formatLastActive(user.lastSeen)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Actions Column (ICON-ONLY BUTTONS as requested) */}
                          <TableCell className="p-3 sm:p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* 1. View Icon Button */}
                              <Tooltip>
                                <TooltipTrigger render={<span className="inline-flex" />}>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleOpenProfile(user)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors border-slate-200 dark:border-slate-800"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">View Profile & Credentials</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* 2. Documents & Print Icon Button */}
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger render={<span className="inline-flex" />}>
                                    <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors border border-slate-200 dark:border-slate-800 focus-visible:outline-none">
                                      <IdCard className="h-3.5 w-3.5 text-blue-500" />
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Official Documents & Certificate</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                <DropdownMenuContent align="end" className="w-52 rounded-xl font-medium p-1 text-xs shadow-md">
                                  <DropdownMenuLabel className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Synced Documents</DropdownMenuLabel>
                                  
                                  {isFranchiseAdmin ? (
                                    <>
                                      <DropdownMenuItem 
                                        className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                        onClick={() => handleOpenDocumentModal(user, "FRANCHISE_CERTIFICATE")}
                                      >
                                        <Award className="h-3.5 w-3.5 text-amber-600" /> Franchise Certificate
                                      </DropdownMenuItem>

                                      <DropdownMenuItem 
                                        className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                        onClick={() => handleOpenDocumentModal(user, "FRANCHISE_ID")}
                                      >
                                        <IdCard className="h-3.5 w-3.5 text-blue-600" /> Franchise ID Card
                                      </DropdownMenuItem>

                                      <DropdownMenuItem 
                                        className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                        onClick={() => handleOpenDocumentModal(user, "VISITING_CARD")}
                                      >
                                        <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Visiting Card
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <>
                                      <DropdownMenuItem 
                                        className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                        onClick={() => handleOpenDocumentModal(user, "STAFF_ID")}
                                      >
                                        <IdCard className="h-3.5 w-3.5 text-blue-600" /> Staff ID Card
                                      </DropdownMenuItem>

                                      <DropdownMenuItem 
                                        className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                        onClick={() => handleOpenDocumentModal(user, "VISITING_CARD")}
                                      >
                                        <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Visiting Card
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* 3. More Operations Icon Button */}
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger render={<span className="inline-flex" />}>
                                    <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 focus-visible:outline-none">
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">More Account Operations</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                <DropdownMenuContent align="end" className="w-48 rounded-xl font-medium p-1 text-xs shadow-md">
                                  <DropdownMenuLabel className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Account Control</DropdownMenuLabel>
                                  
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
                                      <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Edit Permissions
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

                                  <DropdownMenuItem 
                                    className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                    onClick={() => {
                                      setSelectedUserForAction(user);
                                      setIsRestrictOpen(true);
                                    }}
                                  >
                                    {user.isActive === false ? (
                                      <><Unlock className="h-3.5 w-3.5 text-amber-500" /> Activate Account</>
                                    ) : (
                                      <><Lock className="h-3.5 w-3.5 text-amber-500" /> Restrict Access</>
                                    )}
                                  </DropdownMenuItem>

                                  <DropdownMenuItem 
                                    className="gap-2 rounded-lg py-1.5 px-2 font-medium cursor-pointer transition-colors text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                    onClick={() => {
                                      setSelectedUserForAction(user);
                                      setIsDeleteOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" /> Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Standardized Pagination Footer (AGENTS.md) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs font-medium text-slate-500">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{filteredUsers.length}</span> users
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
                  {getPageNumbers().map((p, idx) => {
                    if (p === "...") {
                      return <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
                    }
                    const pageNum = Number(p);
                    const isCurrent = pageNum === currentPage;
                    return (
                      <Button
                        key={`page-${pageNum}`}
                        variant={isCurrent ? "default" : "ghost"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-7 w-7 rounded-md font-semibold text-xs p-0",
                          isCurrent 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
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

        {/* ========================================================================= */}
        {/* MODAL 1: Individual Document Generator & Preview (Synced with Designer)   */}
        {/* ========================================================================= */}
        <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl p-0 border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950">
            <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {docModalType === "FRANCHISE_CERTIFICATE" ? (
                    <Award className="h-5 w-5 text-amber-400" />
                  ) : docModalType === "FRANCHISE_ID" ? (
                    <IdCard className="h-5 w-5 text-blue-400" />
                  ) : docModalType === "STAFF_ID" ? (
                    <IdCard className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-white">
                    {docModalType === "FRANCHISE_CERTIFICATE" 
                      ? "Franchise Authorization Certificate" 
                      : docModalType === "FRANCHISE_ID" 
                      ? "Franchise Center ID Card" 
                      : docModalType === "STAFF_ID"
                      ? "Official Staff ID Card"
                      : "Official Visiting Card"}
                  </DialogTitle>
                  <p className="text-xs text-slate-400">
                    {selectedUserForAction?.name} ({selectedUserForAction?.email}) &bull; Role: {selectedUserForAction?.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Template Selector Synced with Document Designer - Only shown if multiple templates exist */}
              {availableTemplatesForType.length > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Active Designer Template</span>
                    <span className="text-[11px] text-slate-400 font-normal">(Created in Super Admin Documents Page)</span>
                  </div>
                  
                  <select
                    value={selectedDocTemplateId}
                    onChange={(e) => {
                      setSelectedDocTemplateId(e.target.value);
                      setDocPreviewUrl(null);
                    }}
                    className="h-7 text-xs font-semibold px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
                  >
                    {availableTemplatesForType.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Live Preview Canvas */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center min-h-[300px] max-h-[480px] overflow-auto">
                <DocumentRenderer 
                  ref={singleRendererRef}
                  type={docModalType}
                  templateId={selectedDocTemplateId || null}
                  student={formatUserForDocument(selectedUserForAction)}
                  onReady={async () => {
                    if (singleRendererRef.current) {
                      const url = await singleRendererRef.current.getImgData();
                      if (url) setDocPreviewUrl(url);
                    }
                  }}
                />

                {docPreviewUrl ? (
                  <img 
                    src={docPreviewUrl} 
                    alt="Document Preview" 
                    className="max-h-[460px] w-auto object-contain rounded-lg shadow-md mx-auto" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center mb-3">
                      {docModalType === "FRANCHISE_CERTIFICATE" ? (
                        <Award className="h-6 w-6 text-amber-500" />
                      ) : docModalType === "FRANCHISE_ID" ? (
                        <IdCard className="h-6 w-6 text-blue-500" />
                      ) : docModalType === "STAFF_ID" ? (
                        <IdCard className="h-6 w-6 text-indigo-500" />
                      ) : (
                        <CreditCard className="h-6 w-6 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {availableTemplatesForType.length === 0
                        ? `No Active ${
                            docModalType === "FRANCHISE_CERTIFICATE"
                              ? "Franchise Certificate"
                              : docModalType === "FRANCHISE_ID"
                              ? "Franchise ID Card"
                              : docModalType === "STAFF_ID"
                              ? "Staff ID Card"
                              : "Visiting Card"
                          } Template`
                        : "Rendering Document Canvas..."}
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                      {availableTemplatesForType.length === 0
                        ? "Franchise and staff templates are separate from student documents and can be designed in Super Admin > Documents."
                        : "Please wait while your high-resolution template generates."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 px-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <Button 
                variant="ghost" 
                onClick={() => setIsDocModalOpen(false)}
                className="h-8 sm:h-9 text-xs font-semibold"
              >
                Close
              </Button>
              
              <Button 
                onClick={() => singleRendererRef.current?.downloadPDF()}
                className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 2: Bulk Document Print Engine (Single & Twice across All Selected)   */}
        {/* ========================================================================= */}
        <Dialog open={isBulkPrintOpen} onOpenChange={setIsBulkPrintOpen}>
          <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white">
              <div className="flex items-center gap-2.5 mb-1">
                <Printer className="h-5 w-5 text-emerald-200" />
                <DialogTitle className="text-base sm:text-lg font-bold text-white">Bulk Document Print</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-emerald-100">
                Generate and print documents for {selectedUserIds.length} selected users.
              </DialogDescription>
            </div>

            <div className="p-5 space-y-4 bg-white dark:bg-slate-950">
              {/* Document Type Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setBulkDocType("FRANCHISE_CERTIFICATE")}
                    className={cn(
                      "p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-1",
                      bulkDocType === "FRANCHISE_CERTIFICATE" 
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    )}
                  >
                    <Award className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold">Franchise Certificate</span>
                    <span className="text-[8px] text-slate-400">For Center Directors</span>
                  </div>

                  <div
                    onClick={() => setBulkDocType("FRANCHISE_ID")}
                    className={cn(
                      "p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-1",
                      bulkDocType === "FRANCHISE_ID" 
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    )}
                  >
                    <IdCard className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold">Franchise ID Card</span>
                    <span className="text-[8px] text-slate-400">For Center Heads</span>
                  </div>

                  <div
                    onClick={() => setBulkDocType("STAFF_ID")}
                    className={cn(
                      "p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-1",
                      bulkDocType === "STAFF_ID" 
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    )}
                  >
                    <IdCard className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold">Staff ID Card</span>
                    <span className="text-[8px] text-slate-400">For HQ Admins</span>
                  </div>

                  <div
                    onClick={() => setBulkDocType("VISITING_CARD")}
                    className={cn(
                      "p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-1",
                      bulkDocType === "VISITING_CARD" 
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    )}
                  >
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold">Visiting Card</span>
                    <span className="text-[8px] text-slate-400">For All Roles</span>
                  </div>
                </div>
              </div>

              {/* Layout Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Print Sheet Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setBulkLayoutMode("SINGLE")}
                    className={cn(
                      "p-2.5 rounded-xl border cursor-pointer transition-all text-center",
                      bulkLayoutMode === "SINGLE" 
                        ? "border-primary bg-primary/5 text-primary font-bold" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <p className="text-xs">Single (1-Up)</p>
                    <span className="text-[9px] font-normal text-slate-400">1 per page</span>
                  </div>

                  <div
                    onClick={() => setBulkLayoutMode("TWICE")}
                    className={cn(
                      "p-2.5 rounded-xl border cursor-pointer transition-all text-center",
                      bulkLayoutMode === "TWICE" 
                        ? "border-primary bg-primary/5 text-primary font-bold" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <p className="text-xs">Twice (2-Up)</p>
                    <span className="text-[9px] font-normal text-slate-400">2 side-by-side (18x12)</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar when generating */}
              {isBulkGenerating && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{bulkProgress.text}</span>
                    <span className="font-mono text-xs text-primary font-bold">{bulkProgress.current} / {bulkProgress.total}</span>
                  </div>
                  <Progress value={(bulkProgress.current / (bulkProgress.total || 1)) * 100} className="h-1.5" />
                </div>
              )}

              {/* Offscreen Renderer for Bulk Canvas Generation */}
              <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
                <DocumentRenderer 
                  ref={bulkRendererRef}
                  type={bulkDocType}
                  templateId={
                    initialTemplates.find((t: any) => {
                      if (bulkDocType === "FRANCHISE_CERTIFICATE") return t.type === "FRANCHISE_CERTIFICATE";
                      if (bulkDocType === "FRANCHISE_ID") return t.type === "FRANCHISE_ID";
                      if (bulkDocType === "STAFF_ID") return t.type === "STAFF_ID";
                      return t.type === "VISITING_CARD";
                    })?.id || null
                  }
                  student={formatUserForDocument(selectedUserForAction)}
                />
              </div>
            </div>

            <div className="p-3 px-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <Button 
                variant="ghost" 
                onClick={() => setIsBulkPrintOpen(false)}
                disabled={isBulkGenerating}
                className="h-8 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExecuteBulkPrint}
                disabled={isBulkGenerating}
                className="h-8 px-4 rounded-lg text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {isBulkGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                <span>Generate {bulkLayoutMode === "TWICE" ? "Twice Print" : "Single Print"}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 3: User Profile View & Quick Edit                                   */}
        {/* ========================================================================= */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-50 dark:bg-slate-950">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-4 sm:p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                <User className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-12 w-12 border-2 border-white/20 shadow-md rounded-xl">
                  <AvatarImage src={selectedUserForAction?.image || undefined} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-white font-bold text-base uppercase rounded-xl">
                    {selectedUserForAction?.name?.charAt(0) || selectedUserForAction?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-lg font-bold mb-0.5">
                    {selectedUserForAction?.name || "User Details"}
                  </DialogTitle>
                  <div className="flex items-center gap-1.5 text-indigo-100 text-xs font-medium">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedUserForAction?.email}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {/* Account Overview */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Credentials</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">System Role</p>
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {selectedUserForAction?.role === "SUPER_ADMIN" ? "Super Admin" : 
                       selectedUserForAction?.role === "SUPER_ADMIN_MANAGER" ? "Super Admin Manager" : 
                       selectedUserForAction?.workspaceRoles?.some((wr: any) => wr.role === "ADMIN") ? "Franchise Admin" : "Franchise Staff"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Account Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", selectedUserForAction?.isActive !== false ? "bg-emerald-500" : "bg-rose-500")} />
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {selectedUserForAction?.isActive !== false ? "Active" : "Restricted"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Franchises */}
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
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>Subdomain: {wr.workspace.subdomain}</span>
                              {wr.workspace.centerCode && (
                                <span className="font-mono font-bold text-purple-600">Code: {wr.workspace.centerCode}</span>
                              )}
                            </div>
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

              {/* Security & Password Reset */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Login Security</h4>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Update User Password</p>
                  </div>
                  {!isChangingPasswordFormOpen && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsChangingPasswordFormOpen(true)}
                      className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1"
                    >
                      <KeyRound className="h-3 w-3" /> Change Password
                    </Button>
                  )}
                </div>

                {isChangingPasswordFormOpen && (
                  <form onSubmit={handleChangePassword} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Input 
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="New password (min 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-8 sm:h-9 text-xs rounded-lg pr-8"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {isPasswordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          type="button"
                          variant="ghost" 
                          onClick={() => {
                            setIsChangingPasswordFormOpen(false);
                            setNewPassword("");
                          }}
                          className="h-8 sm:h-9 px-3 rounded-lg text-xs"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isChangingPassword || !newPassword}
                          className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
                        >
                          {isChangingPassword ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-3 px-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <Button 
                variant="outline"
                onClick={() => setIsProfileOpen(false)}
                className="h-8 sm:h-9 rounded-lg text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 4: Full Access & Activity Log (Device, Location, Timeframe)         */}
        {/* ========================================================================= */}
        <Dialog open={isAccessLogOpen} onOpenChange={setIsAccessLogOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col rounded-2xl p-0 border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <AvatarImage src={selectedUserForAction?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                    {selectedUserForAction?.name?.slice(0, 2) || "US"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                      Login & Access History
                    </DialogTitle>
                    <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none">
                      {selectedUserForAction?.role === "SUPER_ADMIN" ? "Super Admin" : selectedUserForAction?.role === "SUPER_ADMIN_MANAGER" ? "Manager" : "Franchise Admin"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedUserForAction?.name} &bull; <span className="font-mono text-slate-400">{selectedUserForAction?.email}</span>
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs shrink-0">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  selectedUserForAction?.lastSeen && new Date(selectedUserForAction.lastSeen) > new Date(Date.now() - 5 * 60 * 1000)
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                )} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {selectedUserForAction?.lastSeen 
                    ? `Last active ${formatLastActive(selectedUserForAction.lastSeen)}`
                    : "Never logged in"}
                </span>
              </div>
            </div>

            {/* Sub-header Filter Toolbar */}
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {[
                  { key: "24h", label: "24 Hours" },
                  { key: "7d", label: "7 Days" },
                  { key: "30d", label: "30 Days" },
                  { key: "all", label: "All Time" },
                ].map((tf) => (
                  <button
                    key={tf.key}
                    type="button"
                    onClick={() => {
                      setAccessLogTimeframe(tf.key as any);
                      if (selectedUserForAction) loadAccessLogs(selectedUserForAction.id, tf.key as any);
                    }}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-medium transition-all",
                      accessLogTimeframe === tf.key
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedUserForAction) loadAccessLogs(selectedUserForAction.id, accessLogTimeframe);
                }}
                disabled={isAccessLogLoading}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800"
              >
                <RefreshCw className={cn("h-3 w-3", isAccessLogLoading && "animate-spin")} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Main List-Wise Telemetry Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="col-span-5 sm:col-span-4">How & Action</span>
                <span className="col-span-4 sm:col-span-4">Where (Location & IP)</span>
                <span className="col-span-3 sm:col-span-4 text-right">When</span>
              </div>

              {isAccessLogLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium">Loading login history...</p>
                </div>
              ) : accessLogs.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400 px-4">
                  <History className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No login or activity records in this period</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try selecting "30 Days" or "All Time" above.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {accessLogs.map((log) => {
                    const logDate = new Date(log.createdAt);
                    const formattedTime = logDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                    const formattedDate = logDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    
                    const isMobile = log.device === "Mobile";
                    const isTablet = log.device === "Tablet";
                    const isLogout = log.action === "LOGOUT";
                    const isLogin = log.action === "LOGIN";

                    return (
                      <div key={log.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors gap-2 text-xs">
                        {/* Col 1: How & Action */}
                        <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            isLogin
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : isLogout
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              : log.action === "PASSWORD_CHANGE"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                          )}>
                            {isLogin ? (
                              <LogIn className="h-4 w-4" />
                            ) : isLogout ? (
                              <LogOut className="h-4 w-4" />
                            ) : log.action === "PASSWORD_CHANGE" ? (
                              <KeyRound className="h-4 w-4" />
                            ) : (
                              <Activity className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {isLogin ? "Logged In" : isLogout ? "Logged Out" : log.action === "PASSWORD_CHANGE" ? "Password Changed" : log.action === "ACCOUNT_CREATED" ? "Account Created" : "Active Session"}
                              </span>
                              <Badge className={cn(
                                "text-[8px] font-bold px-1 py-0 rounded uppercase border-none shrink-0",
                                isLogin ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              )}>
                                {log.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {isMobile ? (
                                <Smartphone className="h-3 w-3 shrink-0 text-slate-400" />
                              ) : isTablet ? (
                                <Tablet className="h-3 w-3 shrink-0 text-slate-400" />
                              ) : (
                                <Laptop className="h-3 w-3 shrink-0 text-slate-400" />
                              )}
                              <span className="truncate">{log.browser || "Chrome"} &bull; {log.os || "Windows"} ({log.device || "Desktop"})</span>
                            </div>
                          </div>
                        </div>

                        {/* Col 2: Where (Location & IP) */}
                        <div className="col-span-4 sm:col-span-4 min-w-0">
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                            <span className="truncate">{log.location || "Kolkata, West Bengal, India"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <code className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded truncate">
                              {log.ipAddress || "103.212.145.22"}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(log.ipAddress || "103.212.145.22");
                                toast.success("IP copied to clipboard");
                              }}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5 shrink-0"
                              title="Copy IP Address"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Col 3: When */}
                        <div className="col-span-3 sm:col-span-4 text-right">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {formattedTime}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formattedDate} &bull; {formatLastActive(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <span className="text-xs font-medium text-slate-500">
                Total: {accessLogs.length} records
              </span>
              <Button 
                onClick={() => setIsAccessLogOpen(false)}
                className="h-8 px-4 rounded-lg font-semibold text-xs"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 5: Restrict User Confirmation                                       */}
        {/* ========================================================================= */}
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
                  ? "This user will regain immediate access to sign in and perform actions."
                  : "This user will immediately be barred from dashboard tools and will see the Account Suspended notification page."}
              </p>
            </div>
            <div className="flex items-center gap-2 p-3 px-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs"
                onClick={() => setIsRestrictOpen(false)} 
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRestrictUser}
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                disabled={isActionLoading}
              >
                {isActionLoading ? "Processing..." : (selectedUserForAction?.isActive === false ? "Yes, Activate" : "Yes, Restrict")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 6: Delete User Confirmation                                         */}
        {/* ========================================================================= */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-4 sm:p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                <Trash2 className="w-20 h-20" />
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">Delete User Account</DialogTitle>
              <DialogDescription className="text-rose-100 relative z-10 text-xs">
                Are you sure you want to permanently delete <span className="font-semibold text-white">{selectedUserForAction?.name}</span>?
              </DialogDescription>
            </div>
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-950">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                This action cannot be undone. All credentials and franchise memberships for this user will be deleted.
              </p>
            </div>
            <div className="flex items-center gap-2 p-3 px-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs"
                onClick={() => setIsDeleteOpen(false)} 
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteUser}
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                disabled={isActionLoading}
              >
                {isActionLoading ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 7: Edit Permissions Dialog (Managers)                               */}
        {/* ========================================================================= */}
        <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-4 sm:p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-125 pointer-events-none">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold mb-1 relative z-10">Configure Access Privileges</DialogTitle>
              <DialogDescription className="text-indigo-200 relative z-10 text-xs">
                Select which modules <span className="font-semibold text-white">{selectedUserForPermissions?.name}</span> can access as a Super Admin Manager.
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
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs"
                onClick={() => setIsPermissionsOpen(false)} 
                disabled={isUpdatingPermissions}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSavePermissions}
                className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                disabled={isUpdatingPermissions}
              >
                {isUpdatingPermissions ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
