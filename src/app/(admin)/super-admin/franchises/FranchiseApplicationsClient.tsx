"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Laptop, 
  Users, 
  ArrowUpRight, 
  Trash2, 
  AlertCircle,
  FileText,
  Check,
  X,
  User,
  ExternalLink,
  Search,
  Plus,
  Filter,
  Globe,
  Settings,
  MoreVertical,
  Activity,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  Shield,
  ShieldOff,
  ArrowRight,
  Phone,
  Printer,
  Download,
  Loader2,
  Award,
  IdCard,
  SlidersHorizontal,
  FileCheck,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { updateFranchiseApplicationStatus } from "@/app/actions/franchise";
import { createWorkspace, updateCenterConfig, toggleWorkspaceStatus, deleteWorkspace, toggleDocumentAuthority } from "@/app/actions/workspaces";
import { importWorkspacesCSV } from "@/app/actions/workspaces-import";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getRootDomain } from "@/lib/domain";
import type { PlatformRoutingConfig } from "@/lib/routing-config";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FranchiseApplicationsClientProps {
  initialApplications: any[];
  initialWorkspaces: any[];
  platformRoutingConfig?: PlatformRoutingConfig;
  activeTemplates?: any[];
}

function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function FranchiseApplicationsClient({ 
  initialApplications, 
  initialWorkspaces,
  platformRoutingConfig,
  activeTemplates = []
}: FranchiseApplicationsClientProps) {
  const [activeTab, setActiveTab] = useState<"centers" | "applications">("centers");
  const [mounted, setMounted] = useState(false);
  const [rootDomain, setRootDomain] = useState(process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
      setRootDomain(getRootDomain());
    }
  }, []);

  /**
   * Generates rootHost without super-admin. prefix
   */
  const getRootHost = () => {
    if (typeof window === 'undefined') return rootDomain;
    const host = window.location.host;
    const cleanHost = host.split(':')[0];
    const cleanRoot = rootDomain.split(':')[0];
    
    let base = host;
    if (base.startsWith('super-admin.')) {
      base = base.replace(/^super-admin\./, '');
    } else if (cleanRoot && !cleanRoot.includes('localhost') && cleanHost.endsWith(cleanRoot)) {
      base = rootDomain;
    }
    return base;
  };

  /**
   * Detects the effective platform routing mode: "SUBDIRECTORY" | "SUBDOMAIN" | "BOTH"
   */
  const getEffectiveRoutingMode = (): "SUBDIRECTORY" | "SUBDOMAIN" | "BOTH" => {
    if (typeof window === 'undefined') return platformRoutingConfig?.routingMode || "BOTH";

    const host = window.location.host;
    const cleanHost = host.split(':')[0];
    const cleanRoot = rootDomain.split(':')[0];
    if (cleanHost.includes("vercel.app") || cleanRoot.includes("vercel.app")) {
      return "SUBDIRECTORY";
    }

    const cookieSubdomainDisabled = typeof document !== 'undefined' && document.cookie.includes("platform_routing_subdomain=0");
    if (cookieSubdomainDisabled) return "SUBDIRECTORY";

    const cookieMode = typeof document !== 'undefined' 
      ? document.cookie.match(/platform_routing_mode=([^;]+)/)?.[1]
      : null;
    if (cookieMode === "SUBDOMAIN" || cookieMode === "SUBDIRECTORY" || cookieMode === "BOTH") {
      return cookieMode;
    }

    if (platformRoutingConfig?.routingMode) {
      if (platformRoutingConfig.enableSubdomains === false) return "SUBDIRECTORY";
      return platformRoutingConfig.routingMode;
    }

    return "BOTH";
  };

  /**
   * Builds explicit Subdomain URL (e.g. http://chandpara.localhost:3000/admin)
   */
  const getSubdomainUrl = (subdomain: string, path: string = "") => {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : "https:";
    const normalizedPath = path.startsWith('/') ? path : (path ? `/${path}` : "");
    return `${protocol}//${subdomain}.${rootDomain}${normalizedPath}`;
  };

  /**
   * Builds explicit Subdirectory URL (e.g. http://localhost:3000/app/chandpara/admin)
   */
  const getSubdirectoryUrl = (subdomain: string, path: string = "") => {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : "https:";
    const rootHost = getRootHost();
    const normalizedPath = path.startsWith('/') ? path : (path ? `/${path}` : "");
    return `${protocol}//${rootHost}/app/${subdomain}${normalizedPath}`;
  };

  /**
   * Checks if subdomain mode is active for this center
   */
  const isSubdomainActiveForCenter = (isSubdomainEnabled: boolean = true) => {
    if (!isSubdomainEnabled) return false;
    const mode = getEffectiveRoutingMode();
    return mode === "SUBDOMAIN" || mode === "BOTH";
  };

  /**
   * Generates default external tenant URL for public buttons or direct links
   */
  const getExternalTenantUrl = (subdomain: string, path: string = "", isSubdomainEnabled: boolean = true) => {
    if (isSubdomainActiveForCenter(isSubdomainEnabled)) {
      return getSubdomainUrl(subdomain, path);
    }
    return getSubdirectoryUrl(subdomain, path);
  };

  const [searchWorkspace, setSearchWorkspace] = useState("");
  const debouncedSearchWorkspace = useDebounce(searchWorkspace, 250);
  const [statusFilter, setStatusFilter] = useState("All");
  const [wsCurrentPage, setWsCurrentPage] = useState(1);
  const [wsOpen, setWsOpen] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const DEFAULT_WORKSPACE_FORM_DATA = {
    name: "",
    subdomain: "",
    isSubdomainEnabled: true,
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    contactPhone: "",
    whatsapp: "",
    contactEmail: "",
    address: "",
    state: "",
    district: "",
    pinCode: "",
    primaryColor: "#3b82f6",
    brandDescription: "Welcome to our center",
    centerCode: "",
    ownerAddress: "",
    ownerState: "",
    ownerDistrict: "",
    ownerPinCode: "",
    ownerPhotoUrl: "",
    signatureUrl: "",
    idProofUrl: ""
  };

  const [workspaceFormData, setWorkspaceFormData] = useState(DEFAULT_WORKSPACE_FORM_DATA);

  const wsItemsPerPage = 8;
  const [activeWsStep, setActiveWsStep] = useState<number>(0);

  // Franchise Applications State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 250);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const appItemsPerPage = 10;
  
  // Application Approval states
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [customSubdomain, setCustomSubdomain] = useState<string>("");
  const [customStateCode, setCustomStateCode] = useState<string>("");
  const [customPassword, setCustomPassword] = useState<string>("");
  const [showApprovePassword, setShowApprovePassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Application Rejection states
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Edit Center Config State
  const [editConfigOpen, setEditConfigOpen] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [activeEditStep, setActiveEditStep] = useState<number>(0);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editConfigData, setEditConfigData] = useState<any>({
    workspaceId: "",
    name: "",
    subdomain: "",
    isSubdomainEnabled: true,
    centerCode: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    contactPhone: "",
    address: "",
    logoUrl: "",
    signatureUrl: "",
    idProofUrl: "",
    isActive: true
  });

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditConfigData((prev: any) => ({ ...prev, password: pwd }));
    setShowEditPassword(true);
    toast.info("Generated new random password");
  };

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);

  const [suspendAlertOpen, setSuspendAlertOpen] = useState(false);
  const [workspaceToSuspend, setWorkspaceToSuspend] = useState<{id: string, currentStatus: boolean} | null>(null);

  const [authorityAlertOpen, setAuthorityAlertOpen] = useState(false);
  const [workspaceToToggleAuthority, setWorkspaceToToggleAuthority] = useState<{id: string, currentAuthority: boolean} | null>(null);

  // Document Designer Templates & Print Engine for Franchises
  const initialTemplates = activeTemplates || [];
  const [selectedWsForDoc, setSelectedWsForDoc] = useState<any | null>(null);
  const [docModalType, setDocModalType] = useState<"FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "VISITING_CARD">("FRANCHISE_CERTIFICATE");
  const [selectedDocTemplateId, setSelectedDocTemplateId] = useState<string>("");
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [printLayoutMode, setPrintLayoutMode] = useState<"SINGLE" | "TWICE">("SINGLE");
  const singleRendererRef = useRef<DocumentRendererRef>(null);

  // Multi-selection for bulk printing franchises
  const [selectedWsIds, setSelectedWsIds] = useState<string[]>([]);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [bulkPrintType, setBulkPrintType] = useState<"FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "VISITING_CARD">("FRANCHISE_CERTIFICATE");
  const [bulkPrintLayout, setBulkPrintLayout] = useState<"SINGLE" | "TWICE">("SINGLE");
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, text: "" });
  const bulkRendererRef = useRef<DocumentRendererRef>(null);

  // Format a Workspace object into DocumentRenderer data payload
  const formatWorkspaceForDocument = (ws: any) => {
    if (!ws) return null;
    const owner = ws.roles?.[0]?.user;
    return {
      id: owner?.id || ws.id,
      name: owner?.name || ws.name,
      fullName: owner?.name || ws.name,
      email: owner?.email || ws.contactEmail || "",
      username: owner?.username || ws.centerCode || "",
      photoUrl: owner?.image || ws.logoUrl,
      image: owner?.image || ws.logoUrl,
      phone: owner?.phone || ws.contactPhone || ws.siteSettings?.contactPhone || "",
      address: ws.address || ws.siteSettings?.address || "",
      certificateNo: ws.centerCode || `FR-${ws.id.slice(0, 6).toUpperCase()}`,
      enrollmentNo: ws.centerCode || owner?.username || `FR-${ws.id.slice(0, 6).toUpperCase()}`,
      dob: ws.createdAt,
      admissionDate: ws.createdAt,
      centerCode: ws.centerCode,
      workspace: {
        id: ws.id,
        name: ws.name,
        subdomain: ws.subdomain,
        centerCode: ws.centerCode,
        logoUrl: ws.logoUrl,
        signatureUrl: ws.signatureUrl,
        state: ws.state || "",
        district: ws.district || ""
      }
    };
  };

  // Available Designer Templates strictly for Franchise types (Never mix with Student templates)
  const availableTemplatesForType = useMemo(() => {
    return initialTemplates.filter((t: any) => {
      if (docModalType === "FRANCHISE_CERTIFICATE") return t.type === "FRANCHISE_CERTIFICATE";
      if (docModalType === "FRANCHISE_ID") return t.type === "FRANCHISE_ID";
      if (docModalType === "VISITING_CARD") return t.type === "VISITING_CARD";
      return false;
    });
  }, [initialTemplates, docModalType]);

  // Open Document Modal for single franchise
  const handleOpenDocModal = (ws: any, docType: "FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "VISITING_CARD") => {
    setSelectedWsForDoc(ws);
    setDocModalType(docType);
    setDocPreviewUrl(null);
    const matching = initialTemplates.filter((t: any) => t.type === docType);
    setSelectedDocTemplateId(matching[0]?.id || "");
    setIsDocModalOpen(true);
  };

  // Single Print with 1-Up or 2-Up (Twice) mode
  const handlePrintSingleDocument = async () => {
    if (!singleRendererRef.current) return;
    setIsGeneratingDoc(true);

    try {
      const { jsPDF } = await import("jspdf");
      const imgData = await singleRendererRef.current.getImgData();
      const dims = singleRendererRef.current.getTemplateDimensions();

      if (!imgData || !dims) {
        toast.error("Template rendering in progress. Please try again in a moment.");
        setIsGeneratingDoc(false);
        return;
      }

      if (printLayoutMode === "TWICE") {
        const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: [18, 12] });
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

        pdf.addImage(imgData, "PNG", xOffset, yOffset, printWidth, printHeight, undefined, "FAST");
        pdf.addImage(imgData, "PNG", 9 + xOffset, yOffset, printWidth, printHeight, undefined, "FAST");

        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");
      } else {
        const pdf = new jsPDF({ orientation: dims.orientation, unit: "pt", format: [dims.width, dims.height] });
        pdf.addImage(imgData, "PNG", 0, 0, dims.width, dims.height, undefined, "FAST");
        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");
      }

      toast.success("Print document generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate document for print.");
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Bulk Print Execution Engine
  const handleExecuteBulkPrint = async () => {
    const selectedWorkspaces = initialWorkspaces.filter((w: any) => selectedWsIds.includes(w.id));
    if (selectedWorkspaces.length === 0) {
      toast.error("No franchises selected.");
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: selectedWorkspaces.length, text: "Initializing print engine..." });

    try {
      const { jsPDF } = await import("jspdf");
      let pdf: any = null;
      let docsOnPage = 0;

      for (let i = 0; i < selectedWorkspaces.length; i++) {
        const ws = selectedWorkspaces[i];
        setBulkProgress({
          current: i + 1,
          total: selectedWorkspaces.length,
          text: `Processing (${i + 1}/${selectedWorkspaces.length}): ${ws.name}...`
        });

        setSelectedWsForDoc(ws);
        await new Promise(r => setTimeout(r, 120));

        if (bulkRendererRef.current) {
          const imgData = await bulkRendererRef.current.getImgData();
          const dims = bulkRendererRef.current.getTemplateDimensions();

          if (imgData && dims) {
            if (!pdf) {
              if (bulkPrintLayout === "TWICE") {
                pdf = new jsPDF({ orientation: "landscape", unit: "in", format: [18, 12] });
              } else {
                pdf = new jsPDF({ orientation: dims.orientation, unit: "pt", format: [dims.width, dims.height] });
              }
            }

            if (bulkPrintLayout === "TWICE") {
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
        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");
        toast.success(`Successfully compiled ${selectedWorkspaces.length} documents.`);
        setIsBulkPrintOpen(false);
      } else {
        toast.error("Failed to generate PDF pages.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Bulk printing process failed.");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleOpenEditConfig = (ws: any) => {
    const adminUser = ws.roles?.[0]?.user;
    setEditConfigData({
      workspaceId: ws.id,
      name: ws.name,
      subdomain: ws.subdomain,
      isSubdomainEnabled: ws.isSubdomainEnabled ?? true,
      centerCode: ws.centerCode || adminUser?.username || "",
      ownerName: adminUser?.name || "",
      ownerEmail: adminUser?.email || "",
      password: "",
      contactPhone: ws.siteSettings?.contactPhone || "",
      address: ws.siteSettings?.address || "",
      logoUrl: ws.logoUrl || "",
      signatureUrl: ws.signatureUrl || "",
      idProofUrl: ws.idProofUrl || "",
      isActive: ws.isActive !== false
    });
    setShowEditPassword(false);
    setActiveEditStep(0);
    setEditConfigOpen(true);
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingConfig(true);
    try {
      const res = await updateCenterConfig(editConfigData.workspaceId, editConfigData);
      if (res.success) {
        toast.success("Center configuration updated successfully.");
        setEditConfigOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Update failed.");
      }
    } catch (err) {
      toast.error("Something went wrong updating center config.");
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const confirmToggleWorkspaceStatus = (wsId: string, currentStatus: boolean) => {
    setWorkspaceToSuspend({ id: wsId, currentStatus });
    setSuspendAlertOpen(true);
  };

  const handleToggleWorkspaceStatus = async () => {
    if (!workspaceToSuspend) return;
    
    const { id, currentStatus } = workspaceToSuspend;
    const loadingToast = toast.loading(`Updating center status...`);
    try {
      const res = await toggleWorkspaceStatus(id, !currentStatus);
      if (res.success) {
        toast.success(`Center successfully ${currentStatus ? 'suspended' : 'activated'}.`, { id: loadingToast });
        setSuspendAlertOpen(false);
        setWorkspaceToSuspend(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong.", { id: loadingToast });
    }
  };

  const confirmDeleteWorkspace = (wsId: string) => {
    setWorkspaceToDelete(wsId);
    setDeleteAlertOpen(true);
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    
    const loadingToast = toast.loading("Deleting center...");
    try {
      const res = await deleteWorkspace(workspaceToDelete);
      if (res.success) {
        toast.success("Center permanently deleted.", { id: loadingToast });
        setDeleteAlertOpen(false);
        setWorkspaceToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete center.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong.", { id: loadingToast });
    }
  };

  const confirmToggleAuthority = (wsId: string, currentAuthority: boolean) => {
    setWorkspaceToToggleAuthority({ id: wsId, currentAuthority });
    setAuthorityAlertOpen(true);
  };

  const handleToggleAuthority = async () => {
    if (!workspaceToToggleAuthority) return;
    
    const { id, currentAuthority } = workspaceToToggleAuthority;
    const loadingToast = toast.loading(`Updating Authority Power...`);
    try {
      const res = await toggleDocumentAuthority(id, !currentAuthority);
      if (res.success) {
        toast.success(`Authority Power ${!currentAuthority ? 'granted' : 'revoked'}.`, { id: loadingToast });
        setAuthorityAlertOpen(false);
        setWorkspaceToToggleAuthority(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update authority power.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong.", { id: loadingToast });
    }
  };

  // CSV Import State
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  // Stats calculation
  const totalFranchises = initialWorkspaces.length;
  const activeFranchises = initialWorkspaces.filter(ws => ws.isActive !== false).length;
  
  // Filter applications logic
  const filteredApps = useMemo(() => {
    const q = debouncedSearchTerm.toLowerCase().trim();
    return initialApplications.filter(app => {
      const matchesSearch = !q ||
        app.centerName.toLowerCase().includes(q) ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.username && app.username.toLowerCase().includes(q));

      if (filterStatus === "ALL") return matchesSearch;
      return app.status === filterStatus && matchesSearch;
    });
  }, [initialApplications, debouncedSearchTerm, filterStatus]);

  const appTotalPages = Math.ceil(filteredApps.length / appItemsPerPage);
  const paginatedApps = filteredApps.slice((appCurrentPage - 1) * appItemsPerPage, appCurrentPage * appItemsPerPage);

  const pendingApplications = initialApplications.filter(a => a.status === "PENDING").length;
  const totalPlatformStudents = initialWorkspaces.reduce((acc, ws) => acc + (ws._count?.studentProfiles || 0), 0);

  // Filter workspaces logic
  const filteredWorkspaces = useMemo(() => {
    const searchLower = debouncedSearchWorkspace.toLowerCase().trim();
    return initialWorkspaces.filter(ws => {
      const wsStatus = ws.isActive !== false ? "active" : "inactive";
      const matchesStatus = statusFilter === "All" || wsStatus === statusFilter;
      if (!matchesStatus) return false;

      if (!searchLower) return true;

      return (
        ws.name?.toLowerCase().includes(searchLower) || 
        ws.subdomain?.toLowerCase().includes(searchLower) ||
        ws.roles?.[0]?.user?.name?.toLowerCase().includes(searchLower) ||
        ws.roles?.[0]?.user?.email?.toLowerCase().includes(searchLower) ||
        ws.roles?.[0]?.user?.username?.toLowerCase().includes(searchLower)
      );
    });
  }, [initialWorkspaces, debouncedSearchWorkspace, statusFilter]);

  // Workspace pagination logic
  const wsTotalPages = Math.ceil(filteredWorkspaces.length / wsItemsPerPage);
  const paginatedWorkspaces = filteredWorkspaces.slice(
    (wsCurrentPage - 1) * wsItemsPerPage,
    wsCurrentPage * wsItemsPerPage
  );

  useEffect(() => {
    setWsCurrentPage(1);
  }, [debouncedSearchWorkspace, statusFilter]);

  // Handle manual workspace provisioning
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingWorkspace(true);
    const result = await createWorkspace(workspaceFormData);
    setIsCreatingWorkspace(false);

    if (result.success) {
      toast.success("Franchise center created successfully!");
      setWsOpen(false);
      router.refresh();
      setWorkspaceFormData(DEFAULT_WORKSPACE_FORM_DATA);
    } else {
      toast.error(result.error || "Failed to create center");
    }
  };



  const handleOpenDetails = (app: any) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  const handleOpenApprove = () => {
    if (!selectedApp) return;
    
    const stateName = selectedApp.state.trim().toLowerCase();
    let codeSuggestion = "WB";
    if (stateName.includes("bengal")) codeSuggestion = "WB";
    else if (stateName.includes("delhi")) codeSuggestion = "DL";
    else if (stateName.includes("bihar")) codeSuggestion = "BR";
    else if (stateName.includes("maharashtra")) codeSuggestion = "MH";
    else if (stateName.includes("assam")) codeSuggestion = "AS";
    else if (stateName.includes("uttar")) codeSuggestion = "UP";
    else {
      codeSuggestion = stateName.substring(0, 2).toUpperCase();
    }

    setCustomStateCode(codeSuggestion);
    setCustomSubdomain("");
    setCustomPassword("");
    setShowApprovePassword(false);
    setApproveOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    try {
      const res = await updateFranchiseApplicationStatus(selectedApp.id, "APPROVED", {
        customStateCode: customStateCode.trim() || undefined,
        customSubdomain: customSubdomain.trim() || undefined,
        customPassword: customPassword.trim() || undefined
      });

      if (res.success) {
        toast.success(`Franchise approved! Code: ${res.username}, Subdomain: ${res.subdomain}`);
        setApproveOpen(false);
        setDetailsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to approve application.");
      }
    } catch (err: any) {
      toast.error("Approval process failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await updateFranchiseApplicationStatus(selectedApp.id, "REJECTED", {
        rejectionReason: rejectionReason.trim()
      });

      if (res.success) {
        toast.success("Franchise application rejected.");
        setRejectOpen(false);
        setDetailsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reject application.");
      }
    } catch (err: any) {
      toast.error("Rejection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // CSV Import Handlers
  const handleDownloadTemplate = () => {
    const csvContent = "centerCode,name,subdomain,ownerName,ownerEmail,ownerPassword,contactPhone,whatsapp,contactEmail,address,state,district,pinCode,primaryColor,brandDescription\nWB-123,Example Institute,example,Admin User,admin@example.com,password123,9876543210,9876543210,support@example.com,123 Main St,West Bengal,Kolkata,700001,#3b82f6,Welcome to Example Institute";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "franchises_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      setIsParsing(true);
      
      const Papa = (await import("papaparse")).default;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          setIsParsing(false);
          setImportResults(null);
        },
        error: (error: any) => {
          console.error("CSV Parse Error", error);
          toast.error("Failed to parse CSV file");
          setIsParsing(false);
        }
      });
    }
  };

  const handleImportCSV = async () => {
    if (!csvData || csvData.length === 0) {
      toast.error("No valid data to import");
      return;
    }
    
    setIsImporting(true);
    try {
      const result = await importWorkspacesCSV(csvData);
      setImportResults(result);
      if (result.success && result.summary.failure === 0) {
        toast.success(`Successfully imported ${result.summary.success} franchises!`);
      } else if (result.success) {
        toast.warning(`Imported ${result.summary.success} franchises with ${result.summary.failure} errors.`);
      } else {
        toast.error((result as any).error || "Import failed");
      }
      
      if (result.success && result.summary.success > 0) {
        router.refresh();
      }
    } catch (err) {
      toast.error("Something went wrong during import.");
    } finally {
      setIsImporting(false);
    }
  };

  const renderPagination = (borderClass: string) => {
    if (wsTotalPages <= 1) return null;
    return (
      <div className={cn("px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/20 dark:bg-slate-800/10", borderClass)}>
        <p className="text-xs font-medium text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-semibold">{((wsCurrentPage - 1) * wsItemsPerPage) + 1}</span> to <span className="text-slate-900 dark:text-white font-semibold">{Math.min(wsCurrentPage * wsItemsPerPage, filteredWorkspaces.length)}</span> of <span className="text-slate-900 dark:text-white font-semibold">{filteredWorkspaces.length}</span> centers
        </p>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={wsCurrentPage === 1}
            onClick={() => setWsCurrentPage(prev => prev - 1)}
            className="h-7 w-7 rounded-md"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: wsTotalPages }).map((_, i) => (
              <Button
                key={i}
                variant={wsCurrentPage === i + 1 ? "default" : "ghost"}
                onClick={() => setWsCurrentPage(i + 1)}
                className={cn(
                  "h-7 w-7 rounded-md text-xs font-semibold",
                  wsCurrentPage === i + 1 ? "shadow-sm" : ""
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            disabled={wsCurrentPage === wsTotalPages}
            onClick={() => setWsCurrentPage(prev => prev + 1)}
            className="h-7 w-7 rounded-md"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const renderAppPagination = (borderClass: string) => {
    if (appTotalPages <= 1) return null;
    return (
      <div className={cn("px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/20 dark:bg-slate-800/10", borderClass)}>
        <p className="text-xs font-medium text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-semibold">{((appCurrentPage - 1) * appItemsPerPage) + 1}</span> to <span className="text-slate-900 dark:text-white font-semibold">{Math.min(appCurrentPage * appItemsPerPage, filteredApps.length)}</span> of <span className="text-slate-900 dark:text-white font-semibold">{filteredApps.length}</span> applications
        </p>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={appCurrentPage === 1}
            onClick={() => setAppCurrentPage(prev => prev - 1)}
            className="h-7 w-7 rounded-md"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: appTotalPages }).map((_, i) => (
              <Button
                key={i}
                variant={appCurrentPage === i + 1 ? "default" : "ghost"}
                onClick={() => setAppCurrentPage(i + 1)}
                className={cn(
                  "h-7 w-7 rounded-md text-xs font-semibold",
                  appCurrentPage === i + 1 ? "shadow-sm" : ""
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            disabled={appCurrentPage === appTotalPages}
            onClick={() => setAppCurrentPage(prev => prev + 1)}
            className="h-7 w-7 rounded-md"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Franchise Management" 
        description="Monitor and manage active computer center workspaces and process online franchise requests."
      >
        <div className="flex gap-2">
          <Dialog open={csvOpen} onOpenChange={(open) => {
            if(!open) {
              setCsvFile(null);
              setCsvData([]);
              setImportResults(null);
            }
            setCsvOpen(open);
          }}>
            <DialogTrigger 
              render={
                <Button variant="outline" className="h-8 px-3 rounded-lg gap-1.5 text-xs font-semibold shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <FileText className="h-3.5 w-3.5" />
                  Import CSV
                </Button>
              }
            />
            <DialogContent className="max-w-4xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <FileText className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bulk Import Franchises</h2>
                      <p className="text-slate-500 font-medium text-sm">Upload a CSV file to create multiple computer center workspaces at once.</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2 rounded-xl h-11 border-dashed border-2">
                    <FileText className="h-4 w-4" /> Download Template
                  </Button>
                </div>
              </div>
              
              <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {!csvFile ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      id="csv-upload" 
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">Click to upload CSV file</p>
                        <p className="text-xs text-slate-500 mt-1">Ensure headers match the template exactly.</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{csvFile.name}</p>
                          <p className="text-xs text-slate-500">{csvData.length} rows detected</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setCsvFile(null); setCsvData([]); setImportResults(null); }} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                        Remove
                      </Button>
                    </div>

                    {importResults && importResults.summary && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total Processed</p>
                          <p className="text-2xl font-black">{importResults.summary.total}</p>
                        </div>
                        <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                          <p className="text-xs text-green-600 uppercase font-bold tracking-widest mb-1">Success</p>
                          <p className="text-2xl font-black text-green-700 dark:text-green-400">{importResults.summary.success}</p>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                          <p className="text-xs text-red-600 uppercase font-bold tracking-widest mb-1">Failed</p>
                          <p className="text-2xl font-black text-red-700 dark:text-red-400">{importResults.summary.failure}</p>
                        </div>
                      </div>
                    )}

                    {csvData.length > 0 && (
                      <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                              <TableHead className="w-16">Row</TableHead>
                              <TableHead>Center Code</TableHead>
                              <TableHead>Institute Name</TableHead>
                              <TableHead>Subdomain</TableHead>
                              <TableHead>Owner Email</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.slice(0, 10).map((row, i) => {
                              const result = importResults?.results?.find((r: any) => r.row === i + 1);
                              return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium text-slate-400">{i + 1}</TableCell>
                                  <TableCell className="font-bold">{row.centerCode || '-'}</TableCell>
                                  <TableCell className="font-bold">{row.name || '-'}</TableCell>
                                  <TableCell className="text-slate-500">{row.subdomain || '-'}</TableCell>
                                  <TableCell className="text-slate-500">{row.ownerEmail || '-'}</TableCell>
                                  <TableCell>
                                    {!importResults ? (
                                      <Badge variant="outline" className="text-slate-500">Ready</Badge>
                                    ) : result?.success ? (
                                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Imported</Badge>
                                    ) : (
                                      <div className="group relative flex items-center">
                                        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Failed</Badge>
                                        <p className="text-[10px] text-red-500 ml-2 line-clamp-1 max-w-[200px]" title={result?.error}>{result?.error}</p>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        {csvData.length > 10 && (
                          <div className="p-3 text-center bg-slate-50 dark:bg-slate-800/20 text-xs font-bold text-slate-500">
                            Showing first 10 rows of {csvData.length}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setCsvOpen(false)}
                  className="h-12 flex-1 rounded-xl font-bold"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleImportCSV}
                  disabled={!csvData.length || isImporting || isParsing || !!importResults}
                  className="h-12 flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-bold"
                >
                  {isImporting ? "Processing Import..." : importResults ? "Import Complete" : "Import All Franchises"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={wsOpen} onOpenChange={(open) => { setWsOpen(open); if (!open) setActiveWsStep(0); }}>
            <DialogTrigger 
              render={
                <Button className="h-8 px-3 rounded-lg gap-1.5 text-xs font-semibold shadow-sm bg-primary text-primary-foreground transition-all">
                  <Plus className="h-3.5 w-3.5" />
                  Provision Center
                </Button>
              }
            />
              <DialogContent className="max-w-5xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row h-[85vh] md:h-[650px]">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Provision Center</h2>
                      <p className="text-slate-500 font-medium text-xs mt-1">Initialize a new workspace</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    {[
                      { id: 0, title: "Institutional Identity", icon: Building2, desc: "Name & subdomain" },
                      { id: 1, title: "Location Details", icon: MapPin, desc: "Institute address" },
                      { id: 2, title: "Director Details", icon: User, desc: "Master admin info" },
                      { id: 3, title: "Director Location", icon: MapPin, desc: "Director address" },
                      { id: 4, title: "Documents Upload", icon: FileText, desc: "Upload proofs" },
                      { id: 5, title: "Theme & Branding", icon: Globe, desc: "Brand colors" },
                    ].map((step) => {
                      const isActive = activeWsStep === step.id;
                      const Icon = step.icon;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setActiveWsStep(step.id)}
                          className={cn(
                            "w-full text-left px-4 py-3.5 rounded-2xl transition-all flex items-start gap-3.5 relative overflow-hidden group",
                            isActive 
                              ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 ring-1 ring-primary/5" 
                              : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                          )}
                          <div className={cn(
                            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300",
                            isActive ? "bg-primary/10 text-primary shadow-inner" : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:scale-105"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="pt-0.5">
                            <h4 className={cn("text-sm font-bold transition-colors", isActive ? "text-primary dark:text-white" : "text-slate-600 dark:text-slate-400")}>{step.title}</h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{step.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Area */}
                <form onSubmit={handleCreateWorkspace} className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative h-full">
                  <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar">
                    
                    {/* Step 0: Identity */}
                    <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeWsStep === 0 ? "block" : "hidden")}>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Identity</h3>
                        <p className="text-slate-500 text-sm font-medium">Define the core identity of the franchise center.</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2.5">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Institute Name</Label>
                          <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              required
                              placeholder="e.g. Zenith Academy"
                              className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-base shadow-sm"
                              value={workspaceFormData.name}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, name: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Subdomain</Label>
                          <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 group-focus-within:text-primary transition-colors" />
                            <Input 
                              required
                              placeholder="zenith"
                              className="h-14 pl-12 pr-32 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-base shadow-sm"
                              value={workspaceFormData.subdomain}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            />
                            <div className="absolute right-0 top-0 bottom-0 px-5 flex items-center bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 rounded-r-2xl text-slate-500 text-sm font-bold">
                              .{rootDomain}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold text-slate-900 dark:text-white">Subdomain Access</Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Enable or disable the public landing page for this franchise.</p>
                          </div>
                          <Switch
                            checked={workspaceFormData.isSubdomainEnabled}
                            onCheckedChange={(checked) => setWorkspaceFormData({ ...workspaceFormData, isSubdomainEnabled: checked })}
                          />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Brief Description</Label>
                          <div className="relative group">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="Short summary of the center..."
                              className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all shadow-sm"
                              value={workspaceFormData.brandDescription}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, brandDescription: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Location */}
                    <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeWsStep === 1 ? "block" : "hidden")}>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Location Details</h3>
                        <p className="text-slate-500 text-sm font-medium">Where is the institute located?</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2.5">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Address</Label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="Complete street address..."
                              className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all shadow-sm"
                              value={workspaceFormData.address}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, address: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">State</Label>
                            <Input 
                              placeholder="e.g. West Bengal"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.state}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, state: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">District</Label>
                            <Input 
                              placeholder="e.g. North 24 Parganas"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.district}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, district: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">PIN Code</Label>
                            <Input 
                              placeholder="e.g. 700123"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.pinCode}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, pinCode: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Director Details */}
                    <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeWsStep === 2 ? "block" : "hidden")}>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Director Details</h3>
                        <p className="text-slate-500 text-sm font-medium">Create the master admin account for the franchise director.</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Center Code</Label>
                            <Input 
                              required
                              placeholder="e.g. WB-001"
                              className="h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 font-bold uppercase text-blue-700 dark:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 transition-all px-4 shadow-sm shadow-blue-500/5"
                              value={workspaceFormData.centerCode}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, centerCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Director Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <Input 
                                required
                                placeholder="Full Name"
                                className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all shadow-sm"
                                value={workspaceFormData.ownerName}
                                onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerName: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Login Email</Label>
                            <Input 
                              required
                              type="email"
                              placeholder="admin@institute.edu"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.ownerEmail}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerEmail: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Initial Password</Label>
                            <Input 
                              required
                              type="password"
                              placeholder="••••••••"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.ownerPassword}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerPassword: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Contact Phone</Label>
                            <Input 
                              placeholder="+91 XXXXX XXXXX"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.contactPhone}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, contactPhone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">WhatsApp</Label>
                            <Input 
                              placeholder="+91 XXXXX XXXXX"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.whatsapp}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, whatsapp: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5 col-span-2">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Support Email (Optional)</Label>
                            <Input 
                              type="email"
                              placeholder="support@institute.edu"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.contactEmail}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, contactEmail: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Director Location */}
                    <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeWsStep === 3 ? "block" : "hidden")}>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Director Location Details</h3>
                        <p className="text-slate-500 text-sm font-medium">Permanent address of the director/owner.</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2.5">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Address</Label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="Complete street address..."
                              className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all shadow-sm"
                              value={workspaceFormData.ownerAddress}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerAddress: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">State</Label>
                            <Input 
                              placeholder="e.g. West Bengal"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.ownerState}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerState: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">District</Label>
                            <Input 
                              placeholder="e.g. North 24 Parganas"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.ownerDistrict}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerDistrict: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">PIN Code</Label>
                            <Input 
                              placeholder="e.g. 700123"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all px-4 shadow-sm"
                              value={workspaceFormData.ownerPinCode}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerPinCode: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Documents */}
                    <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeWsStep === 4 ? "block" : "hidden")}>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Documents Upload</h3>
                        <p className="text-slate-500 text-sm font-medium">Upload required proofs for the director.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Director Image</Label>
                          <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <ImageUpload
                              value={workspaceFormData.ownerPhotoUrl}
                              onChange={(url) => setWorkspaceFormData({ ...workspaceFormData, ownerPhotoUrl: url })}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Director Signature</Label>
                          <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <ImageUpload
                              value={workspaceFormData.signatureUrl}
                              onChange={(url) => setWorkspaceFormData({ ...workspaceFormData, signatureUrl: url })}
                            />
                          </div>
                        </div>
                        <div className="space-y-3 col-span-1 md:col-span-2">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">ID Proof (Aadhaar/PAN/Voter)</Label>
                          <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <ImageUpload
                              value={workspaceFormData.idProofUrl}
                              onChange={(url) => setWorkspaceFormData({ ...workspaceFormData, idProofUrl: url })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 5: Theme */}
                    <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeWsStep === 5 ? "block" : "hidden")}>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Branding & Theme</h3>
                        <p className="text-slate-500 text-sm font-medium">Set the primary color for the center's portal.</p>
                      </div>
                      
                      <div className="flex items-center gap-6 p-8 rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                        <div className="space-y-4 flex-1">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Primary Brand Color</Label>
                          <div className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm">
                            <input 
                              type="color"
                              className="h-12 w-12 rounded-xl border-none bg-transparent cursor-pointer ml-1 hover:scale-105 transition-transform"
                              value={workspaceFormData.primaryColor}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, primaryColor: e.target.value })}
                            />
                            <Input 
                              value={workspaceFormData.primaryColor}
                              onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, primaryColor: e.target.value })}
                              className="h-12 flex-1 border-none shadow-none focus-visible:ring-0 font-mono text-base uppercase bg-transparent font-bold text-slate-700 dark:text-slate-300"
                            />
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-1">
                            This color will be used for buttons, links, and accents across the franchise portal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Navigation */}
                  <div className="p-6 md:px-10 md:py-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-md">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => activeWsStep > 0 ? setActiveWsStep(activeWsStep - 1) : setWsOpen(false)}
                      className="h-12 px-6 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      {activeWsStep > 0 ? "Previous" : "Cancel"}
                    </Button>
                    
                    {activeWsStep < 5 ? (
                      <Button 
                        type="button"
                        onClick={() => setActiveWsStep(activeWsStep + 1)}
                        className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10"
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={isCreatingWorkspace}
                        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5"
                      >
                        {isCreatingWorkspace ? "Provisioning..." : "Provision Center"}
                      </Button>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>

          <Dialog open={editConfigOpen} onOpenChange={(open) => { setEditConfigOpen(open); if (!open) setActiveEditStep(0); }}>
            <DialogContent className="max-w-4xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh] md:h-[500px]">
              {/* Sidebar */}
              <div className="w-full md:w-[260px] shrink-0 bg-slate-50/90 dark:bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Center Config</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Update franchise settings</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: 0, title: "General Information", icon: Building2, desc: "Name & subdomain" },
                      { id: 1, title: "Owner Details", icon: User, desc: "Master admin info" },
                      { id: 2, title: "Documents", icon: FileText, desc: "Update proofs" },
                      { id: 3, title: "Danger Zone", icon: AlertCircle, desc: "Suspend or delete" },
                    ].map((step) => {
                      const isActive = activeEditStep === step.id;
                      const Icon = step.icon;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setActiveEditStep(step.id)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 relative overflow-hidden group",
                            isActive 
                              ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 font-semibold" 
                              : "hover:bg-slate-200/50 dark:hover:bg-slate-800/40 border border-transparent text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                          )}
                          <div className={cn(
                            "h-7 w-7 shrink-0 rounded-lg flex items-center justify-center transition-all",
                            isActive 
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                              : "bg-slate-200/60 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={cn("text-xs font-semibold truncate leading-tight", isActive ? "text-blue-600 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{step.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{step.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Center Status Pill in Sidebar */}
                <div className="pt-3 mt-4 border-t border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[10px]">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Status</span>
                    <span className={cn(
                      "font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                      editConfigData.isActive 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", editConfigData.isActive ? "bg-emerald-500" : "bg-amber-500")} />
                      {editConfigData.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <form onSubmit={handleUpdateConfig} className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative min-w-0 h-full">
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                  
                  {/* Step Header */}
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {activeEditStep === 0 && "General Information"}
                        {activeEditStep === 1 && "Owner Details"}
                        {activeEditStep === 2 && "Verification Documents"}
                        {activeEditStep === 3 && "Danger Zone"}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {activeEditStep === 0 && "Update the institute's core identity, public URL and center contact info."}
                        {activeEditStep === 1 && "Configure the franchise master administrator credentials."}
                        {activeEditStep === 2 && "Update institutional proofs, logos and verification signatures."}
                        {activeEditStep === 3 && "Critical lifecycle actions and permanent deletion for this franchise."}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 dark:border-slate-700 uppercase tracking-wider shrink-0 ml-2">
                      Step {activeEditStep + 1} of 4
                    </Badge>
                  </div>

                  {/* Step 0: General Info */}
                  <div className={cn("space-y-3.5 animate-in fade-in duration-200", activeEditStep === 0 ? "block" : "hidden")}>
                    {/* Institute Name */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Institute Name <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input 
                          required
                          className="h-8 sm:h-9 pl-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                          placeholder="e.g. RGYCSP Chandpara"
                          value={editConfigData.name}
                          onChange={(e) => setEditConfigData({ ...editConfigData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Subdomain */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Subdomain Prefix <span className="text-rose-500">*</span>
                      </Label>
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <div className="pl-3 pr-1 text-slate-400">
                          <Globe className="h-4 w-4" />
                        </div>
                        <Input 
                          required
                          className="h-8 sm:h-9 border-0 bg-transparent px-2 text-xs font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-slate-900 dark:text-white"
                          placeholder="chandpara"
                          value={editConfigData.subdomain}
                          onChange={(e) => setEditConfigData({ ...editConfigData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })}
                        />
                        <div className="px-3 py-1.5 bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold select-none whitespace-nowrap">
                          .{rootDomain}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">Used for the franchise's public showcase and student portal link.</p>
                    </div>

                    {/* Subdomain Access Switch */}
                    <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/30 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Public Subdomain Access</span>
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border-none", editConfigData.isSubdomainEnabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-500")}>
                            {editConfigData.isSubdomainEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Enable or disable the public franchise landing page and public admission check.
                        </p>
                      </div>
                      <Switch
                        checked={editConfigData.isSubdomainEnabled}
                        onCheckedChange={(checked) => setEditConfigData({ ...editConfigData, isSubdomainEnabled: checked })}
                      />
                    </div>

                    {/* Contact Phone & Address 2-column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Contact Phone
                        </Label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            value={editConfigData.contactPhone}
                            onChange={(e) => setEditConfigData({ ...editConfigData, contactPhone: e.target.value })}
                            placeholder="e.g. 09647602100"
                            className="h-8 sm:h-9 pl-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Center Location / Address
                        </Label>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            value={editConfigData.address}
                            onChange={(e) => setEditConfigData({ ...editConfigData, address: e.target.value })}
                            placeholder="e.g. City, District, State"
                            className="h-8 sm:h-9 pl-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Owner Details */}
                  <div className={cn("space-y-3.5 animate-in fade-in duration-200", activeEditStep === 1 ? "block" : "hidden")}>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Center Code / Franchise UID <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={editConfigData.centerCode}
                        onChange={(e) => setEditConfigData({ ...editConfigData, centerCode: e.target.value })}
                        className="h-8 sm:h-9 rounded-lg bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 px-3 font-mono font-bold uppercase tracking-wider text-xs text-blue-700 dark:text-blue-400 focus-visible:ring-1 focus-visible:ring-blue-500"
                        required
                        placeholder="e.g. WB-001"
                      />
                      <p className="text-[10px] text-slate-400">This code serves as the primary admin username and certificate identifier.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Owner Full Name <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            value={editConfigData.ownerName}
                            onChange={(e) => setEditConfigData({ ...editConfigData, ownerName: e.target.value })}
                            placeholder="Director / Head Name"
                            className="h-8 sm:h-9 pl-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Owner Email Address <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          value={editConfigData.ownerEmail}
                          onChange={(e) => setEditConfigData({ ...editConfigData, ownerEmail: e.target.value })}
                          placeholder="director@institute.org"
                          className="h-8 sm:h-9 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Direct Password Reset Section */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Admin Account Password
                        </Label>
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Direct Reset • No Old Password Required
                        </span>
                      </div>
                      <div className="relative group">
                        <Input
                          type={showEditPassword ? "text" : "password"}
                          value={editConfigData.password || ""}
                          onChange={(e) => setEditConfigData({ ...editConfigData, password: e.target.value })}
                          placeholder="Enter new password (leave blank to keep current)"
                          className="h-8 sm:h-9 pl-3 pr-28 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-mono font-medium focus-visible:ring-1 focus-visible:ring-blue-500 transition-all placeholder:font-sans placeholder:text-slate-400"
                          autoComplete="new-password"
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEditPassword(!showEditPassword)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
                            title={showEditPassword ? "Hide password" : "Show password"}
                          >
                            {showEditPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleGeneratePassword}
                            className="h-6 px-2 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors"
                            title="Generate random password"
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Leave blank to keep existing password. If entered, super admin can directly overwrite or create the password without knowing the previous password.
                      </p>
                    </div>

                    {/* Login Username & Auth Notice */}
                    <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300 text-[11px]">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Franchise Admin Login Identity</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        The center admin can sign in to their portal using either identifier as their login username, paired with this password:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-blue-200/50 dark:border-blue-900/50 flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Username 1 (Center Code)</span>
                          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                            {editConfigData.centerCode || "e.g. WB-001"}
                          </span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-blue-200/50 dark:border-blue-900/50 flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Username 2 (Email Address)</span>
                          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                            {editConfigData.ownerEmail || "director@institute.org"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Documents */}
                  <div className={cn("space-y-3 animate-in fade-in duration-200", activeEditStep === 2 ? "block" : "hidden")}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <ImageUpload 
                          value={editConfigData.logoUrl} 
                          onChange={(url) => setEditConfigData({ ...editConfigData, logoUrl: url })} 
                          label="Institute Logo" 
                          compact={true}
                          hideFootnote={true}
                          folder={`RGYCSP/Workspaces/${editConfigData.subdomain}`} 
                        />
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <ImageUpload 
                          value={editConfigData.signatureUrl} 
                          onChange={(url) => setEditConfigData({ ...editConfigData, signatureUrl: url })} 
                          label="Owner Signature" 
                          compact={true}
                          hideFootnote={true}
                          folder={`RGYCSP/Workspaces/${editConfigData.subdomain}`} 
                        />
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <ImageUpload 
                          value={editConfigData.idProofUrl} 
                          onChange={(url) => setEditConfigData({ ...editConfigData, idProofUrl: url })} 
                          label="KYC / ID Proof" 
                          compact={true}
                          hideFootnote={true}
                          folder={`RGYCSP/Workspaces/${editConfigData.subdomain}`} 
                        />
                      </div>
                    </div>
                    
                    {/* Document Specifications & Checklist */}
                    <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Institutional Guidelines
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Auto-compressed for fast loading
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          <strong className="text-slate-800 dark:text-slate-200 block text-[11px] mb-0.5">Logo</strong>
                          Square 1:1 transparent PNG recommended for student certificates.
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          <strong className="text-slate-800 dark:text-slate-200 block text-[11px] mb-0.5">Signature</strong>
                          Dark ink on white paper for automatic marksheet generation.
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          <strong className="text-slate-800 dark:text-slate-200 block text-[11px] mb-0.5">KYC Proof</strong>
                          Center trade deed, registration proof, or director identity card.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Danger Zone */}
                  <div className={cn("space-y-3.5 animate-in fade-in duration-200", activeEditStep === 3 ? "block" : "hidden")}>
                    <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            {editConfigData.isActive ? "Suspend Center Operations" : "Activate Center Operations"}
                          </h4>
                        </div>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 mt-0.5">
                          {editConfigData.isActive 
                            ? "Temporarily restricts portal logins and disables public landing page access for this center."
                            : "Restores portal access and reactivates public landing page services."}
                        </p>
                      </div>
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-8 px-3 rounded-lg text-xs font-semibold shrink-0 border",
                          editConfigData.isActive 
                            ? "text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/30" 
                            : "text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/30"
                        )}
                        onClick={() => {
                          confirmToggleWorkspaceStatus(editConfigData.workspaceId, editConfigData.isActive);
                          setEditConfigOpen(false);
                        }}
                      >
                        {editConfigData.isActive ? <><ShieldOff className="h-3.5 w-3.5 mr-1.5" /> Suspend Center</> : <><Shield className="h-3.5 w-3.5 mr-1.5" /> Activate Center</>}
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Permanent Center Deletion</h4>
                        </div>
                        <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 mt-0.5">
                          Permanently deletes this franchise center, all its courses, batches, and student data. This cannot be undone.
                        </p>
                      </div>
                      <Button 
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-8 px-3 rounded-lg text-xs font-semibold shrink-0 bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={() => {
                          confirmDeleteWorkspace(editConfigData.workspaceId);
                          setEditConfigOpen(false);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Center
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditConfigOpen(false)}
                      className="h-8 sm:h-9 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border-slate-200 dark:border-slate-700"
                    >
                      Cancel
                    </Button>
                    {activeEditStep > 0 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setActiveEditStep(activeEditStep - 1)}
                        className="h-8 sm:h-9 px-2.5 text-xs font-medium text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {activeEditStep < 3 && (
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveEditStep(activeEditStep + 1)}
                        className="h-8 sm:h-9 px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={isUpdatingConfig}
                      className="h-8 sm:h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      {isUpdatingConfig ? (
                        <>
                          <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AdminPageHeader>

      {/* Sync platform statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Franchises", value: totalFranchises, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Centers", value: activeFranchises, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pending Applications", value: pendingApplications, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Platform Students", value: totalPlatformStudents, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-start">
        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/50 w-fit">
          <button
            onClick={() => setActiveTab("centers")}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
              activeTab === "centers"
                ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Active Centers
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === "applications"
                ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Applications
            {pendingApplications > 0 && (
              <span className="h-4 min-w-4 px-1 bg-amber-500 text-white text-[9px] font-bold rounded flex items-center justify-center">
                {pendingApplications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TABS WORKSPACE vs APPLICATION */}
      {activeTab === "centers" ? (
        /* ACTIVE FRANCHISE CENTERS TAB CONTENT */
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
          <CardHeader className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/50">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="relative w-full max-w-sm group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <Input 
                  placeholder="Search by center code, institute, domain or owner..." 
                  value={searchWorkspace}
                  onChange={(e) => setSearchWorkspace(e.target.value)}
                  className="pl-9 pr-4 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 rounded-lg h-8 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:text-xs" 
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as string)}>
                  <SelectTrigger className="w-[140px] h-8 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold px-3 focus:ring-primary/20">
                    <div className="flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-none shadow-xl p-1.5 bg-white dark:bg-slate-800">
                    <SelectItem value="All" className="rounded-md text-xs font-semibold py-1.5">All Centers</SelectItem>
                    <SelectItem value="active" className="rounded-md text-xs font-semibold py-1.5">Active Only</SelectItem>
                    <SelectItem value="inactive" className="rounded-md text-xs font-semibold py-1.5">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 h-8">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Total: <span className="text-slate-900 dark:text-white">{filteredWorkspaces.length}</span>
                  </span>
                </div>

                {selectedWsIds.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setIsBulkPrintOpen(true)}
                    className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Bulk Print ({selectedWsIds.length})</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {renderPagination("border-b border-slate-50 dark:border-slate-800/50")}

          <CardContent className="p-0 overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
                <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-10 px-3 py-2.5">
                    <input 
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                      checked={paginatedWorkspaces.length > 0 && paginatedWorkspaces.every((ws: any) => selectedWsIds.includes(ws.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const pageIds = paginatedWorkspaces.map((ws: any) => ws.id);
                          setSelectedWsIds(prev => Array.from(new Set([...prev, ...pageIds])));
                        } else {
                          const pageIds = new Set(paginatedWorkspaces.map((ws: any) => ws.id));
                          setSelectedWsIds(prev => prev.filter(id => !pageIds.has(id)));
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-[260px] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Center Identity</TableHead>
                  <TableHead className="py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Center Code</TableHead>
                  <TableHead className="w-[220px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Owner Details</TableHead>
                  <TableHead className="py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Capacity</TableHead>
                  <TableHead className="py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Created At</TableHead>
                  <TableHead className="text-right py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWorkspaces.length > 0 ? (
                  paginatedWorkspaces.map((ws: any) => {
                    const owner = ws.roles?.[0]?.user;
                    const isActive = ws.isActive !== false;
                    const hasSubdomain = ws.isSubdomainEnabled !== false;
                    const effectiveMode = getEffectiveRoutingMode();
                    const isCenterSubdomainActive = isSubdomainActiveForCenter(hasSubdomain);
                    
                    return (
                      <TableRow key={ws.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                        <TableCell className="px-3 py-3">
                          <input 
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                            checked={selectedWsIds.includes(ws.id)}
                            onChange={() => {
                              setSelectedWsIds(prev => 
                                prev.includes(ws.id) ? prev.filter(id => id !== ws.id) : [...prev, ws.id]
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-9 w-9 shadow rounded-lg">
                                <AvatarImage src={ws.logoUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm rounded-lg">
                                  {ws.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                                isActive ? "bg-green-500" : "bg-red-500"
                              )}></div>
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white leading-tight truncate max-w-[200px]" title={ws.name}>{ws.name}</span>
                              <div className="flex items-center gap-1.5">
                                <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="text-xs font-medium text-slate-500 tracking-tight truncate max-w-[200px]" title={isCenterSubdomainActive ? `${ws.subdomain}.${rootDomain}` : `/app/${ws.subdomain}`}>
                                  {isCenterSubdomainActive ? (
                                    `${ws.subdomain}.${rootDomain}`
                                  ) : (
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <span>/app/{ws.subdomain}</span>
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-400">Subdir</span>
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ws.centerCode || owner?.username || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 border shrink-0">
                              <AvatarImage src={owner?.image} />
                              <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-[10px]">
                                {owner?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]" title={owner?.name || "Unassigned"}>{owner?.name || "Unassigned"}</span>
                              <span className="text-[10px] font-medium text-slate-400 lowercase truncate max-w-[160px]" title={owner?.email || "n/a"}>{owner?.email || "n/a"}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/5 text-blue-600 border border-blue-500/10 w-fit">
                            <Users className="h-3 w-3" />
                            <span className="text-xs font-semibold">{ws._count?.studentProfiles || 0} Students</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {new Date(ws.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-medium">
                              {new Date(ws.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title={isCenterSubdomainActive ? `Visit Public Site (${ws.subdomain}.${rootDomain})` : `Visit Public Center (/app/${ws.subdomain})`}
                              className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => {
                                const url = getExternalTenantUrl(ws.subdomain, "", hasSubdomain);
                                window.open(url, "_blank");
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger 
                                render={
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors"
                                    title="Franchise Documents & ID Card"
                                  >
                                    <IdCard className="h-3.5 w-3.5" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end" className="w-[200px] rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-xl bg-white dark:bg-slate-900">
                                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Franchise Documents
                                </DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDocModal(ws, "FRANCHISE_CERTIFICATE")}
                                  className="gap-2 text-xs font-semibold py-2 cursor-pointer"
                                >
                                  <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span className="truncate">Franchise Certificate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDocModal(ws, "FRANCHISE_ID")}
                                  className="gap-2 text-xs font-semibold py-2 cursor-pointer"
                                >
                                  <IdCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                  <span className="truncate">Franchise ID Card</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDocModal(ws, "VISITING_CARD")}
                                  className="gap-2 text-xs font-semibold py-2 cursor-pointer"
                                >
                                  <CreditCard className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <span className="truncate">Visiting Card</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger 
                                render={
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end" className="w-[225px] rounded-lg border-none shadow-xl p-1.5 bg-white dark:bg-slate-900">
                                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Administrative Tools</DropdownMenuLabel>
                                
                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                  onClick={() => {
                                    const url = getSubdirectoryUrl(ws.subdomain, "/admin");
                                    window.open(url, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">Open Center Admin</span>
                                </DropdownMenuItem>

                                {hasSubdomain && isCenterSubdomainActive && (
                                  <DropdownMenuItem 
                                    className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                    onClick={() => {
                                      const url = getSubdomainUrl(ws.subdomain, "/admin");
                                      window.open(url, "_blank");
                                    }}
                                  >
                                    <Globe className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span className="truncate">Open As Sub domain</span>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                  onClick={() => {
                                    const url = getExternalTenantUrl(ws.subdomain, "/admin/analytics", hasSubdomain);
                                    window.open(url, "_blank");
                                  }}
                                >
                                  <Activity className="h-3.5 w-3.5 text-slate-400 shrink-0" /> Analytics Report
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                  onClick={() => handleOpenEditConfig(ws)}
                                >
                                  <Settings className="h-3.5 w-3.5 text-slate-400" /> Center Config
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-50 dark:bg-slate-800" />
                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                  onClick={() => handleOpenDocModal(ws, "FRANCHISE_CERTIFICATE")}
                                >
                                  <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span className="truncate">Franchise Certificate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                  onClick={() => handleOpenDocModal(ws, "FRANCHISE_ID")}
                                >
                                  <IdCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                  <span className="truncate">Franchise ID Card</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                  onClick={() => handleOpenDocModal(ws, "VISITING_CARD")}
                                >
                                  <CreditCard className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <span className="truncate">Visiting Card</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-50 dark:bg-slate-800" />
                                <DropdownMenuItem 
                                  className={cn(
                                    "gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer",
                                    isActive ? "text-amber-600 bg-amber-500/5" : "text-green-600 bg-green-500/5"
                                  )}
                                  onClick={() => confirmToggleWorkspaceStatus(ws.id, isActive)}
                                >
                                  {isActive ? (
                                    <><ShieldOff className="h-3.5 w-3.5" /> Suspend Instance</>
                                  ) : (
                                    <><Shield className="h-3.5 w-3.5" /> Re-Activate System</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-50 dark:bg-slate-800" />
                                <DropdownMenuItem 
                                  className={cn(
                                    "gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer",
                                    ws.hasDocumentAuthority ? "text-amber-600 bg-amber-500/5" : "text-emerald-600 bg-emerald-500/5"
                                  )}
                                  onClick={() => confirmToggleAuthority(ws.id, !!ws.hasDocumentAuthority)}
                                >
                                  {ws.hasDocumentAuthority ? (
                                    <><ShieldOff className="h-3.5 w-3.5" /> Revoke Authority Power</>
                                  ) : (
                                    <><Shield className="h-3.5 w-3.5" /> Grant Authority Power</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-50 dark:bg-slate-800" />
                                <DropdownMenuItem 
                                  className="gap-2 rounded-md py-2 text-xs font-semibold cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  onClick={() => confirmDeleteWorkspace(ws.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Terminate Data
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
                    <TableCell colSpan={4} className="h-[300px] text-center py-20 text-muted-foreground font-bold">
                      No active computer centers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination Footer */}
          {renderPagination("border-t border-slate-50 dark:border-slate-800/50")}
        </Card>
      ) : (
        /* FRANCHISE REGISTRATION APPLICATIONS TAB CONTENT */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search center, director, code..." 
                className="pl-9 pr-4 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 rounded-lg h-8 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:text-xs" 
              />
            </div>

            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
            {renderAppPagination("border-b border-slate-50 dark:border-slate-800/50")}
            <CardContent className="p-0 overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
                  <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[220px] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Center Name</TableHead>
                    <TableHead className="w-[180px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Owner</TableHead>
                    <TableHead className="w-[130px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Location</TableHead>
                    <TableHead className="w-[160px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Contact</TableHead>
                    <TableHead className="w-[130px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Timing</TableHead>
                    <TableHead className="w-[110px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Status</TableHead>
                    <TableHead className="text-right py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApps.map((app: any) => (
                    <TableRow key={app.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[180px]" title={app.centerName}>{app.centerName}</span>
                          {app.username ? (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{app.username}</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">No Code</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-xs truncate max-w-[140px] block" title={app.fullName}>{app.fullName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="truncate max-w-[110px]" title={app.district}>{app.district}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[110px]" title={app.state}>{app.state}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">{app.mobile}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={app.email}>{app.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold">{new Date(app.createdAt).toLocaleDateString('en-GB')}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(app.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.status === "PENDING" && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold uppercase text-[9px]"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>}
                        {app.status === "APPROVED" && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold uppercase text-[9px]"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>}
                        {app.status === "REJECTED" && <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-semibold uppercase text-[9px]"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            onClick={() => handleOpenDetails(app)}
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group/delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/delete:text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {paginatedApps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem]">
                          <AlertCircle className="h-12 w-12 opacity-20" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-slate-600 dark:text-slate-400">No Applications Found</p>
                          <p className="text-xs font-medium uppercase tracking-widest">Adjust your search or filters to see more results</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </CardContent>
            {renderAppPagination("border-t border-slate-50 dark:border-slate-800/50")}
          </Card>
        </div>
      )}

      {/* Details View Application Dialog */}
      {selectedApp && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <DialogHeader className="bg-slate-950 p-6 sm:p-8 text-white shrink-0 relative">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pr-6">
                <div className="space-y-1">
                  <DialogTitle className="font-bold text-xl sm:text-2xl leading-tight text-white">{selectedApp.centerName}</DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm">
                    Franchise Application review portal
                  </DialogDescription>
                </div>
                <Badge className={cn("border-none font-black text-[10px] tracking-wider uppercase px-4 py-1.5", 
                  selectedApp.status === "APPROVED" ? "bg-emerald-500 text-white" : 
                  selectedApp.status === "REJECTED" ? "bg-red-500 text-white" : 
                  "bg-amber-500 text-white"
                )}>
                  {selectedApp.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Director Profile */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5">
                  <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Director Profile</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.fullName}>{selectedApp.fullName}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span> <span className="font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{new Date(selectedApp.dob).toLocaleDateString('en-GB')}</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</span> <span className="font-bold text-slate-900 dark:text-white">{selectedApp.mobile}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</span> <span className="font-bold text-slate-900 dark:text-white">{selectedApp.whatsapp || "N/A"}</span></div>
                    </div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.email}>{selectedApp.email}</span></div>
                  </div>
                </div>

                {/* Center Location */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5">
                  <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Center Location</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Center Name</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.centerName}>{selectedApp.centerName}</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.state}>{selectedApp.state}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">District</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.district}>{selectedApp.district}</span></div>
                    </div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pin Code</span> <span className="font-bold text-slate-900 dark:text-white">{selectedApp.pinCode}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Address</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.addressDetail}>{selectedApp.addressDetail}</span></div>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Infrastructure Details</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Computers</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.computerCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teachers</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.teacherCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rooms</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.roomCount || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Space (Sq Ft)</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.spaceSqFt || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Document Previews */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Document Previews</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Verify the submitted credentials</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3 group/card">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block text-center">Profile Photo</span>
                    <div className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-center relative group transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30">
                      {selectedApp.photoUrl ? (
                        <>
                          <img src={selectedApp.photoUrl} alt="Photo" className="w-full h-full object-contain p-2 transition-transform duration-500 group-" />
                          <a href={selectedApp.photoUrl} target="_blank" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5" /> <span>View Full</span>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 group/card">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block text-center">Signature Specimen</span>
                    <div className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-center relative group transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30">
                      {selectedApp.signatureUrl ? (
                        <>
                          <img src={selectedApp.signatureUrl} alt="Signature" className="w-full h-full object-contain p-2 transition-transform duration-500 group-" />
                          <a href={selectedApp.signatureUrl} target="_blank" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5" /> <span>View Full</span>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 group/card">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block text-center">ID Proof Document</span>
                    <div className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-center relative group transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30">
                      {selectedApp.idProofUrl ? (
                        <>
                          <img src={selectedApp.idProofUrl} alt="ID Proof" className="w-full h-full object-contain p-2 transition-transform duration-500 group-" />
                          <a href={selectedApp.idProofUrl} target="_blank" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5" /> <span>View Full</span>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-center sm:items-center gap-3 sm:space-x-0 border-t border-slate-200 dark:border-slate-700 shrink-0 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <Button 
                  onClick={() => setDetailsOpen(false)}
                  variant="outline" 
                  className="rounded-xl font-bold h-11 px-6 border-2 w-full sm:w-auto"
                >
                  Close
                </Button>

                {selectedApp.status === "PENDING" && (
                  <>
                    <Button 
                      onClick={() => setRejectOpen(true)}
                      variant="destructive" 
                      className="rounded-xl font-bold h-11 gap-1.5 px-6 w-full sm:w-auto"
                    >
                      <X className="w-4 h-4" /> Reject Request
                    </Button>
                    <Button 
                      onClick={handleOpenApprove}
                      className="rounded-xl font-bold h-11 gap-1.5 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto"
                    >
                      <Check className="w-4 h-4" /> Approve Application
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Confirm Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-none">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-bold text-lg">Approve Franchise Center</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Verify credentials settings and set the active domain subdomain details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-bold text-xs text-slate-500">Suggested State Prefix Code</Label>
              <Input 
                value={customStateCode}
                onChange={(e) => setCustomStateCode(e.target.value.toUpperCase())}
                placeholder="e.g. WB" 
                maxLength={3}
                className="rounded-xl font-bold"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-bold text-xs text-slate-500">Custom Subdomain (Optional)</Label>
              <Input 
                value={customSubdomain}
                onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="Leave blank to use lowercased generated username" 
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs text-slate-500">Initial Password (Optional)</Label>
                <span className="text-[10px] text-slate-400">Leave blank to use applicant's password</span>
              </div>
              <div className="relative group">
                <Input 
                  type={showApprovePassword ? "text" : "password"}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Set custom franchise password" 
                  className="rounded-xl pr-10 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApprovePassword(!showApprovePassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showApprovePassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-slate-400">
                Franchise admin can log in using either their generated Center Code or Email address.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setApproveOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={handleApproveConfirm}
              className="rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {isProcessing ? "Approving..." : "Confirm Affiliation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-none">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-bold text-lg">Reject Franchise Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Provide feedback detailing the application shortcomings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="font-bold text-xs text-slate-500">Rejection Reason</Label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide clear reasons (e.g., Computer lab count insufficient)."
              className="w-full min-h-[100px] border border-input focus:border-primary outline-none text-xs p-3 rounded-xl bg-background font-medium"
            />
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRejectOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              disabled={isProcessing}
              variant="destructive"
              onClick={handleRejectConfirm}
              className="rounded-xl font-bold"
            >
              {isProcessing ? "Processing..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Alert */}
      <AlertDialog open={suspendAlertOpen} onOpenChange={setSuspendAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-6 sm:max-w-md">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full mb-2",
              workspaceToSuspend?.currentStatus ? "bg-amber-100 dark:bg-amber-900/30" : "bg-green-100 dark:bg-green-900/30"
            )}>
              {workspaceToSuspend?.currentStatus ? (
                <ShieldOff className="h-8 w-8 text-amber-600 dark:text-amber-500" />
              ) : (
                <Shield className="h-8 w-8 text-green-600 dark:text-green-500" />
              )}
            </div>
            
            <div className="space-y-2 w-full">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {workspaceToSuspend?.currentStatus ? "Suspend this Center?" : "Re-Activate Center?"}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                {workspaceToSuspend?.currentStatus 
                  ? "Suspending will instantly revoke login access for this center's admin and students until re-activated."
                  : "Activating will restore login access and all operations for this center."}
              </p>
            </div>

            <div className="flex flex-row w-full gap-3 mt-6 pt-2">
              <Button 
                variant="outline" 
                className="h-12 flex-1 rounded-xl font-bold border-slate-200"
                onClick={() => {
                  setSuspendAlertOpen(false);
                  setWorkspaceToSuspend(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className={cn(
                  "h-12 flex-[1.5] rounded-xl font-bold text-white",
                  workspaceToSuspend?.currentStatus ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleWorkspaceStatus();
                }}
              >
                {workspaceToSuspend?.currentStatus ? "Yes, Suspend" : "Yes, Activate"}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-6 sm:max-w-md">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            
            <div className="space-y-2 w-full">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Terminate Center?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                This action is irreversible. All data, admin accounts, and records associated with this franchise will be permanently deleted.
              </p>
            </div>

            <div className="flex flex-row w-full gap-3 mt-6 pt-2">
              <Button 
                variant="outline" 
                className="h-12 flex-1 rounded-xl font-bold border-slate-200"
                onClick={() => {
                  setDeleteAlertOpen(false);
                  setWorkspaceToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="h-12 flex-[1.5] rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteWorkspace();
                }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Authority Power Alert Dialog */}
      <AlertDialog open={authorityAlertOpen} onOpenChange={setAuthorityAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-sm">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 pb-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="mx-auto w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-3 relative z-10 border-4 border-white/30 shadow-inner">
              {workspaceToToggleAuthority?.currentAuthority ? (
                <ShieldOff className="h-7 w-7 text-white" />
              ) : (
                <Shield className="h-7 w-7 text-white" />
              )}
            </div>
            <AlertDialogTitle className="text-xl font-black text-white relative z-10 tracking-tight">
              {workspaceToToggleAuthority?.currentAuthority ? "Revoke Authority?" : "Grant Authority?"}
            </AlertDialogTitle>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900">
            <AlertDialogDescription className="text-center text-slate-500 font-medium text-sm leading-relaxed">
              {workspaceToToggleAuthority?.currentAuthority 
                ? "This center will require Super Admin approval for all documents again."
                : "This center will be able to issue documents without Super Admin approval. Proceed?"
              }
            </AlertDialogDescription>
            <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-center">
              <AlertDialogCancel className="flex-1 rounded-xl h-11 font-bold bg-slate-50 border-none hover:bg-slate-100">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleToggleAuthority}
                className={cn(
                  "flex-1 rounded-xl h-11 font-bold text-white shadow-lg",
                  workspaceToToggleAuthority?.currentAuthority 
                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                )}
              >
                {workspaceToToggleAuthority?.currentAuthority ? "Yes, Revoke" : "Yes, Grant"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================================= */}
      {/* MODAL 1: Single Franchise Document Preview & Print Modal                 */}
      {/* ========================================================================= */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl p-0 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between gap-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {docModalType === "FRANCHISE_CERTIFICATE" ? (
                  <Award className="h-5 w-5 text-amber-400" />
                ) : docModalType === "FRANCHISE_ID" ? (
                  <IdCard className="h-5 w-5 text-blue-400" />
                ) : (
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                )}
                <h3 className="text-base sm:text-lg font-bold">
                  {docModalType === "FRANCHISE_CERTIFICATE" 
                    ? "Franchise Authorization Certificate" 
                    : docModalType === "FRANCHISE_ID" 
                    ? "Franchise Center ID Card" 
                    : "Franchise Visiting Card"}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {selectedWsForDoc?.name} &bull; Code: {selectedWsForDoc?.centerCode || "N/A"}
              </p>
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
                student={formatWorkspaceForDocument(selectedWsForDoc)}
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
                    ) : (
                      <CreditCard className="h-6 w-6 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {availableTemplatesForType.length === 0
                      ? `No Active ${docModalType === "FRANCHISE_CERTIFICATE" ? "Franchise Certificate" : docModalType === "FRANCHISE_ID" ? "Franchise ID Card" : "Visiting Card"} Template`
                      : "Rendering Document Canvas..."}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    {availableTemplatesForType.length === 0
                      ? "Franchise templates are separate from student documents and can be designed in Super Admin > Documents."
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
      {/* MODAL 2: Bulk Document Print Engine (Single & Twice across Franchises)     */}
      {/* ========================================================================= */}
      <Dialog open={isBulkPrintOpen} onOpenChange={setIsBulkPrintOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white">
            <div className="flex items-center gap-2.5 mb-1">
              <Printer className="h-5 w-5 text-emerald-200" />
              <h3 className="text-base font-bold">Bulk Print Franchises</h3>
            </div>
            <p className="text-xs text-emerald-100/80">
              Generating documents for {selectedWsIds.length} selected franchise centers.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkPrintType("FRANCHISE_CERTIFICATE")}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all",
                    bulkPrintType === "FRANCHISE_CERTIFICATE"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <Award className="h-4 w-4 mb-1 text-amber-500" />
                  <p className="text-xs font-bold truncate">Certificate</p>
                  <p className="text-[9px] text-slate-400">Franchise pass</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkPrintType("FRANCHISE_ID")}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all",
                    bulkPrintType === "FRANCHISE_ID"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <IdCard className="h-4 w-4 mb-1 text-blue-500" />
                  <p className="text-xs font-bold truncate">ID Card</p>
                  <p className="text-[9px] text-slate-400">Franchise ID</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkPrintType("VISITING_CARD")}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all",
                    bulkPrintType === "VISITING_CARD"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-emerald-500" />
                  <p className="text-xs font-bold truncate">Visiting Card</p>
                  <p className="text-[9px] text-slate-400">Business Card</p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Print Sheet Layout</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkPrintLayout("SINGLE")}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all text-xs font-semibold",
                    bulkPrintLayout === "SINGLE"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400"
                  )}
                >
                  Single (1-Up)
                </button>

                <button
                  type="button"
                  onClick={() => setBulkPrintLayout("TWICE")}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all text-xs font-semibold flex items-center justify-center gap-1",
                    bulkPrintLayout === "TWICE"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Layers className="h-3 w-3" />
                  Twice (2-Up / 18x12)
                </button>
              </div>
            </div>

            {isBulkGenerating && (
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    {bulkProgress.text}
                  </span>
                  <span className="text-primary font-bold">
                    {Math.round((bulkProgress.current / (bulkProgress.total || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${(bulkProgress.current / (bulkProgress.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 px-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
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
              className="h-8 px-4 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isBulkGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
              <span>{isBulkGenerating ? "Compiling PDF..." : `Generate & Print (${selectedWsIds.length})`}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden container for rendering document offscreen during bulk print */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
        {selectedWsForDoc && (
          <DocumentRenderer 
            ref={bulkRendererRef}
            type={bulkPrintType}
            templateId={
              initialTemplates.find((t: any) => {
                if (bulkPrintType === "FRANCHISE_CERTIFICATE") return t.type === "FRANCHISE_CERTIFICATE";
                if (bulkPrintType === "FRANCHISE_ID") return t.type === "FRANCHISE_ID";
                return t.type === "VISITING_CARD";
              })?.id || null
            }
            student={formatWorkspaceForDocument(selectedWsForDoc)}
          />
        )}
      </div>

      {/* Floating Bulk Selection Action Bar */}
      {selectedWsIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700 dark:border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold">{selectedWsIds.length} franchises selected</span>
          </div>

          <Button 
            size="sm" 
            onClick={() => setIsBulkPrintOpen(true)}
            className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Bulk Print</span>
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedWsIds([])}
            className="h-8 px-2 text-xs font-medium text-slate-400 hover:text-white dark:hover:text-slate-900"
          >
            Clear
          </Button>
        </div>
      )}

    </div>
  );
}
