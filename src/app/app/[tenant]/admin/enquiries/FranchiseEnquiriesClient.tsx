"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Inbox, 
  Search, 
  Trash2, 
  RefreshCcw, 
  GraduationCap, 
  Mail, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Download, 
  Eye, 
  Sparkles, 
  Megaphone, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Building2, 
  Sliders, 
  Settings2, 
  Plus, 
  X, 
  User, 
  CheckCircle2,
  Calendar,
  MessageSquareQuote
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  getEnquiries, 
  getEnquiryStatistics, 
  updateEnquiryStatus, 
  deleteEnquiry,
  getFunnelConfig,
  saveFunnelConfig
} from "@/app/actions/enquiries";
import { 
  type FunnelConfig, 
  DEFAULT_FUNNEL_CONFIG, 
  type FunnelQuestion,
  DEFAULT_STUDENT_QUESTIONS
} from "@/types/funnel";
import { SocialMediaLeadFunnel } from "@/components/enquiry/SocialMediaLeadFunnel";

interface FranchiseEnquiriesClientProps {
  workspaceId: string;
  workspaceName: string;
  workspaceSubdomain: string;
  initialHost?: string;
  isSubdomainMode?: boolean;
}

export default function FranchiseEnquiriesClient({
  workspaceId,
  workspaceName,
  workspaceSubdomain,
  initialHost = "",
  isSubdomainMode = false,
}: FranchiseEnquiriesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "STUDENTS" | "CONTACTS" | "NEWSLETTER" | "CAMPAIGNS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [leads, setLeads] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    studentLeads: 0,
    newsletterSubscribers: 0,
    generalContacts: 0,
  });

  // Selected Lead for View Dialog
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Delete Confirm Dialog
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Center Social Campaign Builder State
  const [campaignPlatform, setCampaignPlatform] = useState("facebook");
  const [campaignTag, setCampaignTag] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic Funnel Configuration State for this Franchise Center (Student Leads Only)
  const [funnelConfig, setFunnelConfig] = useState<FunnelConfig>({
    ...DEFAULT_FUNNEL_CONFIG,
    visitorTitle: `Admissions Open - Enroll Today at ${workspaceName}`,
    visitorSubtitle: "Take a 60-second eligibility check to find the best career course for you",
    redirection: {
      ...DEFAULT_FUNNEL_CONFIG.redirection,
      studentUrl: `/app/${workspaceSubdomain}/admission`,
    }
  });
  const [activeEditorTab, setActiveEditorTab] = useState<"NONE" | "FIELDS" | "QUESTIONS" | "REDIRECTION">("NONE");
  const [isSavingFunnel, setIsSavingFunnel] = useState(false);
  const [isTestingFunnel, setIsTestingFunnel] = useState(false);

  // New Question sub-state for Franchise Student questions
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState("");

  // Host resolution for links
  const [hostDomain, setHostDomain] = useState(initialHost);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostDomain(window.location.host);
    }
  }, []);

  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const cleanHost = hostDomain || "example.com";

  // Generate Franchise Student Marketing Link
  const campaignShareableUrl = useMemo(() => {
    let base = "";
    if (isSubdomainMode) {
      base = `${protocol}//${cleanHost}/enquiry/lead`;
    } else {
      base = `${protocol}//${cleanHost}/app/${workspaceSubdomain}/enquiry/lead`;
    }
    const params = new URLSearchParams();
    params.set("type", "student");
    params.set("source", campaignPlatform);
    if (campaignTag.trim()) {
      params.set("tag", campaignTag.trim().toLowerCase().replace(/\s+/g, "_"));
    }
    return `${base}?${params.toString()}`;
  }, [protocol, cleanHost, workspaceSubdomain, isSubdomainMode, campaignPlatform, campaignTag]);

  // Fetch Enquiries, Stats & Funnel Configuration for this workspace
  const fetchData = async () => {
    setIsLoading(true);
    try {
      let sourceFilter = "ALL";
      if (activeTab === "STUDENTS") sourceFilter = "SOCIAL_CAMPAIGN_STUDENT";
      else if (activeTab === "CONTACTS") sourceFilter = "FRANCHISE_CONTACT";
      else if (activeTab === "NEWSLETTER") sourceFilter = "NEWSLETTER_SUBSCRIBE";

      const [enquiryRes, statsRes, funnelRes] = await Promise.all([
        getEnquiries({
          workspaceId,
          status: statusFilter,
          source: sourceFilter !== "ALL" ? sourceFilter : undefined,
          search: debouncedSearch,
          page: currentPage,
          pageSize: 15,
        }),
        getEnquiryStatistics(workspaceId),
        getFunnelConfig(workspaceId)
      ]);

      if (enquiryRes.success) {
        setLeads(enquiryRes.leads || []);
        setTotalCount(enquiryRes.totalCount || 0);
        setTotalPages(enquiryRes.totalPages || 1);
      }
      setStats({
        totalEnquiries: statsRes.totalEnquiries,
        newLeads: statsRes.newLeads,
        contactedLeads: statsRes.contactedLeads,
        convertedLeads: statsRes.convertedLeads,
        studentLeads: statsRes.studentLeads,
        newsletterSubscribers: statsRes.newsletterSubscribers,
        generalContacts: statsRes.generalContacts,
      });

      if (funnelRes) {
        setFunnelConfig({
          ...funnelRes,
          visitorTitle: funnelRes.visitorTitle || `Admissions Open - Enroll Today at ${workspaceName}`,
          visitorSubtitle: funnelRes.visitorSubtitle || "Take a 60-second eligibility check to find the best career course for you",
          studentQuestions: Array.isArray(funnelRes.studentQuestions) && funnelRes.studentQuestions.length > 0 
            ? funnelRes.studentQuestions 
            : DEFAULT_STUDENT_QUESTIONS,
          redirection: {
            ...funnelRes.redirection,
            studentUrl: funnelRes.redirection?.studentUrl || `/app/${workspaceSubdomain}/admission`
          }
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load center inquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, debouncedSearch, currentPage]);

  // When clicking View on a lead, if it is currently NEW, mark it as CONTACTED to decrease the notification badge
  const handleViewLead = async (lead: any) => {
    setSelectedLead(lead);
    if (lead.status === "NEW") {
      try {
        const res = await updateEnquiryStatus(lead.id, "CONTACTED");
        if (res.success) {
          setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "CONTACTED" } : l));
          setSelectedLead((prev: any) => prev ? { ...prev, status: "CONTACTED" } : null);
          setStats(prev => ({
            ...prev,
            newLeads: Math.max(0, prev.newLeads - 1),
            contactedLeads: prev.contactedLeads + 1,
          }));
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to auto-update viewed enquiry status:", err);
      }
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await updateEnquiryStatus(leadId, newStatus);
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
        }
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err: any) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteEnquiry(leadToDelete.id);
      if (res.success) {
        toast.success("Inquiry removed");
        setLeadToDelete(null);
        fetchData();
        router.refresh();
      } else {
        toast.error("Failed to remove inquiry");
      }
    } catch (err: any) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  // Funnel Question Management for Franchise Center (Students Only)
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error("Please enter a question");
      return;
    }
    const parsedOptions = newQuestionOptions
      .split(",")
      .map(o => o.trim())
      .filter(Boolean)
      .map(label => ({ label }));

    if (parsedOptions.length === 0) {
      toast.error("Please provide at least one option (comma separated)");
      return;
    }

    const newQ: FunnelQuestion = {
      id: `q_${Date.now()}`,
      question: newQuestionText.trim(),
      options: parsedOptions,
    };

    setFunnelConfig(prev => ({
      ...prev,
      studentQuestions: [...(prev.studentQuestions || []), newQ]
    }));

    setNewQuestionText("");
    setNewQuestionOptions("");
    toast.success("Question added to student funnel");
  };

  const handleDeleteQuestion = (qId: string) => {
    setFunnelConfig(prev => ({
      ...prev,
      studentQuestions: (prev.studentQuestions || []).filter(q => q.id !== qId)
    }));
    toast.info("Question removed");
  };

  const handleSaveFunnel = async () => {
    setIsSavingFunnel(true);
    try {
      const res = await saveFunnelConfig(funnelConfig, workspaceId);
      if (res.success) {
        toast.success("Center Student Funnel saved successfully!");
        setActiveEditorTab("NONE");
      } else {
        toast.error(res.error || "Failed to save funnel");
      }
    } catch (e: any) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSavingFunnel(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(campaignShareableUrl);
    setCopiedLink(true);
    toast.success("Marketing link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.info("No records to export");
      return;
    }
    const headers = ["SL", "ID", "Name", "Email", "Phone", "Subject", "Status", "Date"];
    const rows = leads.map((l, idx) => [
      idx + 1,
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      l.email || "",
      l.phone || "",
      `"${(l.intent || "").replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `center_student_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${leads.length} inquiries to CSV`);
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const metricCards = [
    { title: "Total Enquiries", value: stats.totalEnquiries.toLocaleString(), icon: Inbox, color: "text-slate-600", bg: "bg-slate-500/10" },
    { title: "Student Leads", value: stats.studentLeads.toLocaleString(), icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-500/10" },
    { title: "Contact Queries", value: stats.generalContacts.toLocaleString(), icon: MessageSquareQuote, color: "text-purple-600", bg: "bg-purple-500/10" },
    { title: "Newsletter Subs", value: stats.newsletterSubscribers.toLocaleString(), icon: Mail, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        {/* Header */}
        <AdminPageHeader
          title="Student Enquiries & Admission Leads"
          description={`Direct student inquiries, contact requests, and marketing funnels for ${workspaceName}.`}
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab(prev => prev === "CAMPAIGNS" ? "ALL" : "CAMPAIGNS")}
              variant={activeTab === "CAMPAIGNS" ? "default" : "outline"}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <Megaphone className="h-3.5 w-3.5 text-primary" />
              <span>Campaigns & Marketing Funnel</span>
            </Button>

            <Button
              onClick={fetchData}
              disabled={isLoading}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </Button>
          </div>
        </AdminPageHeader>

        {/* Delete Confirm Alert Box */}
        <ConfirmDialog
          open={!!leadToDelete}
          onOpenChange={(open) => !open && setLeadToDelete(null)}
          title="Delete Inquiry Record"
          description={`Are you sure you want to remove the inquiry from "${leadToDelete?.name || leadToDelete?.email || 'this prospect'}"?`}
          onConfirm={handleDeleteConfirm}
          confirmText="Delete Record"
          destructive={true}
        />

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metricCards.map((metric) => (
            <Card key={metric.title} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">{metric.title}</p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{metric.value}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-lg shrink-0", metric.bg)}>
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Standardized Navigation Tabs with Icons */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
          {[
            { id: "ALL", label: "All Inquiries", icon: Inbox, count: stats.totalEnquiries },
            { id: "STUDENTS", label: "Student Marketing Leads", icon: GraduationCap, count: stats.studentLeads },
            { id: "CONTACTS", label: "Contact Form Queries", icon: MessageSquareQuote, count: stats.generalContacts },
            { id: "NEWSLETTER", label: "Newsletter Subscribers", icon: Mail, count: stats.newsletterSubscribers },
            { id: "CAMPAIGNS", label: "Campaigns & Marketing Funnel", icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary dark:text-white" : "text-slate-400")} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 ml-0.5">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SOCIAL CAMPAIGN BUILDER & INTERACTIVE 3-STEP FUNNEL CONFIGURATOR (MATCHING SUPER ADMIN) */}
        {activeTab === "CAMPAIGNS" ? (
          <div className="space-y-4">
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      Social Marketing Funnel Link Generator & Configurator
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Generate campaign links for Facebook, Instagram, WhatsApp, and manage your 3-step visitor funnel.
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTestingFunnel(true)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:text-primary shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Test My Funnel</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(campaignShareableUrl, "_blank")}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:text-primary shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                      <span>View Live Funnel</span>
                    </Button>

                    <Button
                      onClick={handleSaveFunnel}
                      disabled={isSavingFunnel}
                      size="sm"
                      className="h-8 px-3.5 rounded-lg text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm"
                    >
                      {isSavingFunnel ? (
                        <>
                          <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
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
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Dynamic 3-Step Interactive Funnel Workflow (EXACT SUPER ADMIN MATCH) */}
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Interactive 3-Step Funnel (Click Any Card Below to Customize):
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {activeEditorTab !== "NONE" ? "Click active card or 'Close' to collapse editor" : "Click to edit fields, MCQ questions, or redirect URLs"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Card 1: Fields Capture */}
                    <div 
                      onClick={() => setActiveEditorTab(prev => prev === "FIELDS" ? "NONE" : "FIELDS")}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 group select-none relative",
                        activeEditorTab === "FIELDS"
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-primary flex items-center gap-1">
                          1. Click & Contact Capture
                        </span>
                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border-none font-bold", activeEditorTab === "FIELDS" ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                          {activeEditorTab === "FIELDS" ? "Editing" : "Config Fields"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Toggle fields (Name, WhatsApp, Email, PIN, City) and visitor title/description.
                      </p>
                    </div>

                    {/* Card 2: Student Questions & MCQ */}
                    <div 
                      onClick={() => setActiveEditorTab(prev => prev === "QUESTIONS" ? "NONE" : "QUESTIONS")}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 group select-none relative",
                        activeEditorTab === "QUESTIONS"
                          ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-blue-600 flex items-center gap-1">
                          2. Institute Intro & MCQ
                        </span>
                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border-none font-bold", activeEditorTab === "QUESTIONS" ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-600")}>
                          {activeEditorTab === "QUESTIONS" ? "Editing" : `${funnelConfig.studentQuestions?.length || 0} Questions`}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Manage interactive questions and multiple choice options for prospective students.
                      </p>
                    </div>

                    {/* Card 3: Smart Auto-Redirection */}
                    <div 
                      onClick={() => setActiveEditorTab(prev => prev === "REDIRECTION" ? "NONE" : "REDIRECTION")}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 group select-none relative",
                        activeEditorTab === "REDIRECTION"
                          ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-emerald-600 flex items-center gap-1">
                          3. Smart Auto-Redirection
                        </span>
                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border-none font-bold", activeEditorTab === "REDIRECTION" ? "bg-emerald-600 text-white" : "bg-emerald-500/10 text-emerald-600")}>
                          {activeEditorTab === "REDIRECTION" ? "Editing" : "Direct Admission"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Control target URLs (Direct student admission destination for your center).
                      </p>
                    </div>
                  </div>

                  {/* ACTIVE DYNAMIC EDITOR PANEL 1: FIELDS CONFIGURATION */}
                  {activeEditorTab === "FIELDS" && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-primary/30 space-y-4 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Settings2 className="h-4 w-4 text-primary" />
                            Step 1: Contact Form Input Fields Configuration
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Choose which input fields should be shown or required on the lead capture form for students.
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setActiveEditorTab("NONE")}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Visitor Single-Line Title
                          </label>
                          <Input 
                            value={funnelConfig.visitorTitle || ""}
                            onChange={(e) => setFunnelConfig(prev => ({ ...prev, visitorTitle: e.target.value }))}
                            placeholder={`Admissions Open - Enroll Today at ${workspaceName}`}
                            className="h-8 text-xs bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Visitor Short Description
                          </label>
                          <Input 
                            value={funnelConfig.visitorSubtitle || ""}
                            onChange={(e) => setFunnelConfig(prev => ({ ...prev, visitorSubtitle: e.target.value }))}
                            placeholder="Take a 60-second eligibility check to find the best career course for you"
                            className="h-8 text-xs bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      {/* Field Toggles Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Full Name</span>
                          <Badge variant="outline" className="text-[9px] bg-slate-200/60 dark:bg-slate-700 text-slate-600 border-none font-bold">Always Required</Badge>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">WhatsApp / Phone</span>
                          <Badge variant="outline" className="text-[9px] bg-slate-200/60 dark:bg-slate-700 text-slate-600 border-none font-bold">Always Required</Badge>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Email Address</span>
                            <span className="text-[9px] text-slate-400">{funnelConfig.fields.requireEmail ? "Required" : "Optional"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={funnelConfig.fields.showEmail} 
                                onChange={(e) => setFunnelConfig(prev => ({
                                  ...prev,
                                  fields: { ...prev.fields, showEmail: e.target.checked }
                                }))}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="text-[10px] font-medium">Show</span>
                            </label>
                            {funnelConfig.fields.showEmail && (
                              <label className="flex items-center gap-1 cursor-pointer ml-1">
                                <input 
                                  type="checkbox" 
                                  checked={funnelConfig.fields.requireEmail} 
                                  onChange={(e) => setFunnelConfig(prev => ({
                                    ...prev,
                                    fields: { ...prev.fields, requireEmail: e.target.checked }
                                  }))}
                                  className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="text-[10px] font-medium">Req</span>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">PIN Code</span>
                            <span className="text-[9px] text-slate-400">{funnelConfig.fields.requirePinCode ? "Required" : "Optional"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={funnelConfig.fields.showPinCode} 
                                onChange={(e) => setFunnelConfig(prev => ({
                                  ...prev,
                                  fields: { ...prev.fields, showPinCode: e.target.checked }
                                }))}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="text-[10px] font-medium">Show</span>
                            </label>
                            {funnelConfig.fields.showPinCode && (
                              <label className="flex items-center gap-1 cursor-pointer ml-1">
                                <input 
                                  type="checkbox" 
                                  checked={funnelConfig.fields.requirePinCode} 
                                  onChange={(e) => setFunnelConfig(prev => ({
                                    ...prev,
                                    fields: { ...prev.fields, requirePinCode: e.target.checked }
                                  }))}
                                  className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="text-[10px] font-medium">Req</span>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">City / Town</span>
                            <span className="text-[9px] text-slate-400">{funnelConfig.fields.requireCity ? "Required" : "Optional"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={funnelConfig.fields.showCity} 
                                onChange={(e) => setFunnelConfig(prev => ({
                                  ...prev,
                                  fields: { ...prev.fields, showCity: e.target.checked }
                                }))}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="text-[10px] font-medium">Show</span>
                            </label>
                            {funnelConfig.fields.showCity && (
                              <label className="flex items-center gap-1 cursor-pointer ml-1">
                                <input 
                                  type="checkbox" 
                                  checked={funnelConfig.fields.requireCity} 
                                  onChange={(e) => setFunnelConfig(prev => ({
                                    ...prev,
                                    fields: { ...prev.fields, requireCity: e.target.checked }
                                  }))}
                                  className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="text-[10px] font-medium">Req</span>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">State / Region</span>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={funnelConfig.fields.showState} 
                              onChange={(e) => setFunnelConfig(prev => ({
                                ...prev,
                                fields: { ...prev.fields, showState: e.target.checked }
                              }))}
                              className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span className="text-[10px] font-medium">Show</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE DYNAMIC EDITOR PANEL 2: STUDENT QUESTIONS CONFIGURATION (STUDENTS ONLY) */}
                  {activeEditorTab === "QUESTIONS" && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-500/30 space-y-4 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                            Step 2: Student Interactive Questions & Multiple Choice Options
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Configure interactive questions asked to prospective students during enrollment inquiry.
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setActiveEditorTab("NONE")}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Add New Question Input Box */}
                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-2.5 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Plus className="h-3.5 w-3.5 text-blue-600" />
                          Add New Student Question:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            placeholder="e.g. Which course are you interested in?"
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                          <Input
                            value={newQuestionOptions}
                            onChange={(e) => setNewQuestionOptions(e.target.value)}
                            placeholder="Options separated by comma (e.g. ADCA, DCA, Tally, Coding)"
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleAddQuestion}
                          className="h-7 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Question</span>
                        </Button>
                      </div>

                      {/* Existing Questions List */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Current Questions:
                        </span>
                        {funnelConfig.studentQuestions?.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs">
                            <div className="space-y-1.5 flex-1">
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 text-[10px] flex items-center justify-center font-bold">
                                  {qIdx + 1}
                                </span>
                                <span>{q.question}</span>
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {q.options?.map((opt, oIdx) => (
                                  <Badge key={oIdx} variant="outline" className="text-[10px] font-normal bg-white dark:bg-slate-800 border-slate-200">
                                    {opt.label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE DYNAMIC EDITOR PANEL 3: REDIRECTION CONFIGURATION */}
                  {activeEditorTab === "REDIRECTION" && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ExternalLink className="h-4 w-4 text-emerald-600" />
                            Step 3: Direct Admission Redirection Destination
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Where students land after completing questions (prefills their name & contact details).
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setActiveEditorTab("NONE")}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Student Destination URL
                        </label>
                        <Input 
                          value={funnelConfig.redirection.studentUrl || `/app/${workspaceSubdomain}/admission`}
                          onChange={(e) => setFunnelConfig(prev => ({
                            ...prev,
                            redirection: { ...prev.redirection, studentUrl: e.target.value }
                          }))}
                          placeholder={`/app/${workspaceSubdomain}/admission`}
                          className="h-8 text-xs font-mono bg-slate-50 dark:bg-slate-800"
                        />
                        <p className="text-[10px] text-slate-400">
                          When students submit their enquiry, they will be forwarded to this admission desk with their answers and contact information pre-filled.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campaign Link Generator */}
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Select Promotion Channel
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "facebook", label: "Facebook" },
                          { id: "whatsapp", label: "WhatsApp" },
                          { id: "instagram", label: "Instagram" },
                          { id: "poster_qr", label: "Poster / QR" },
                          { id: "pamphlet", label: "Pamphlet" },
                          { id: "sms_promo", label: "SMS Blast" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCampaignPlatform(item.id)}
                            className={cn(
                              "py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all text-center",
                              campaignPlatform === item.id
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Campaign Tag (Optional)
                      </label>
                      <Input
                        placeholder="e.g. summer_admissions, batch_july"
                        value={campaignTag}
                        onChange={(e) => setCampaignTag(e.target.value)}
                        className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      />
                      <p className="text-[10px] text-slate-400">
                        Helps track which banner or batch generated the most student leads.
                      </p>
                    </div>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Your Center Marketing Funnel Link:</span>
                      <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border-none">
                        ACTIVE
                      </Badge>
                    </span>

                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={campaignShareableUrl}
                        className="h-10 text-xs font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      />

                      <Button
                        onClick={handleCopyLink}
                        className="h-10 px-4 text-xs font-bold bg-primary text-primary-foreground shrink-0 gap-1.5 shadow-sm"
                      >
                        {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => window.open(campaignShareableUrl, "_blank")}
                        className="h-10 px-3 text-xs font-semibold shrink-0 gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* TAB 2: INQUIRIES TABLE & TOOLBAR */
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 sm:gap-3 w-full overflow-x-auto no-scrollbar py-0.5">
                {/* Search */}
                <div className="relative shrink-0 w-36 sm:w-56 md:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-8 pl-8 pr-2.5 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs"
                  />
                </div>

                {/* Vertical Divider */}
                <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* Status Filter Select Box */}
                <div className="shrink-0 w-[135px] sm:w-[150px]">
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => {
                      setStatusFilter((val as string) || "ALL");
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-full">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            statusFilter === "NEW" ? "bg-amber-500 ring-2 ring-amber-500/20" :
                            statusFilter === "CONTACTED" ? "bg-blue-500 ring-2 ring-blue-500/20" :
                            statusFilter === "CONVERTED" ? "bg-emerald-500 ring-2 ring-emerald-500/20" :
                            statusFilter === "ARCHIVED" ? "bg-slate-400" :
                            "bg-slate-400"
                          )}
                        />
                        <SelectValue placeholder="All Status">
                          {statusFilter === "ALL" ? "All Status" : statusFilter === "CONVERTED" ? "ENROLLED" : statusFilter}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-lg min-w-[170px]">
                      <SelectItem value="ALL" className="rounded-lg text-xs py-1.5 cursor-pointer">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">All Status</span>
                          </div>
                          {stats.totalEnquiries > 0 && (
                            <span className="text-[10px] font-bold text-slate-400 ml-auto">
                              {stats.totalEnquiries}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="NEW" className="rounded-lg text-xs py-1.5 cursor-pointer">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 ring-2 ring-amber-500/20" />
                            <span className="font-bold text-amber-700 dark:text-amber-400">NEW</span>
                          </div>
                          {stats.newLeads > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ml-auto">
                              {stats.newLeads}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="CONTACTED" className="rounded-lg text-xs py-1.5 cursor-pointer">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-500/20" />
                            <span className="font-bold text-blue-700 dark:text-blue-400">CONTACTED</span>
                          </div>
                          {stats.contactedLeads > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ml-auto">
                              {stats.contactedLeads}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="CONVERTED" className="rounded-lg text-xs py-1.5 cursor-pointer">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-500/20" />
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">ENROLLED</span>
                          </div>
                          {stats.convertedLeads > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ml-auto">
                              {stats.convertedLeads}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="ARCHIVED" className="rounded-lg text-xs py-1.5 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                          <span className="font-medium text-slate-600 dark:text-slate-400">ARCHIVED</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions (Export) */}
                <div className="ml-auto shrink-0 pl-1">
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs"
                    title="Export CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[50px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">SL</TableHead>
                    <TableHead className="w-[180px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Prospect / Student</TableHead>
                    <TableHead className="w-[140px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone / WhatsApp</TableHead>
                    <TableHead className="w-[140px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Source Channel</TableHead>
                    <TableHead className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Course Query / Subject</TableHead>
                    <TableHead className="w-[110px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                    <TableHead className="w-[130px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp</TableHead>
                    <TableHead className="text-right px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-xs text-slate-500 font-medium">
                        Loading student inquiries...
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-500 font-medium">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Inbox className="h-8 w-8 text-slate-400" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">No student inquiries found</p>
                          <p className="text-[11px] text-slate-400">Share your center marketing link on social media to capture leads.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead, index) => {
                      const slNumber = (currentPage - 1) * 15 + index + 1;
                      return (
                        <TableRow
                          key={lead.id}
                          className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-none"
                        >
                          <TableCell className="px-3.5 py-2.5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                              {slNumber}
                            </span>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                                {lead.name || "Anonymous Subscriber"}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[170px]">
                                {lead.email || "No email provided"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5">
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{lead.phone}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5">
                            <div className="space-y-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none w-fit",
                                  lead.source === "FRANCHISE_CONTACT" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                  lead.source?.includes("STUDENT") ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                  lead.source === "NEWSLETTER_SUBSCRIBE" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                  "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                                )}
                              >
                                {lead.source === "FRANCHISE_CONTACT" ? "Campus Contact" :
                                 lead.source?.replace("SOCIAL_CAMPAIGN_", "").replace(/_/g, " ")}
                              </Badge>
                              {lead.metadata?.socialSource && (
                                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                                  <span>App:</span>
                                  <strong className="capitalize text-slate-800 dark:text-slate-200">
                                    {lead.metadata.socialSource.replace("_", " ")}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 max-w-[260px]">
                            <Tooltip>
                              <TooltipTrigger className="text-xs text-slate-800 dark:text-slate-200 truncate cursor-default block text-left w-full outline-none font-medium">
                                {lead.intent || lead.metadata?.message || "General Query"}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md text-xs">
                                {lead.metadata?.message || lead.intent}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                              className={cn(
                                "h-6 px-1.5 text-[10px] font-bold uppercase rounded border-none cursor-pointer focus:ring-1 focus:ring-primary",
                                lead.status === "NEW" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                                lead.status === "CONTACTED" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                                lead.status === "CONVERTED" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                                "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              )}
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="CONVERTED">ENROLLED</option>
                              <option value="ARCHIVED">ARCHIVED</option>
                            </select>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5">
                            <span className="text-[10px] text-slate-500 whitespace-nowrap block">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>

                          <TableCell className="text-right px-3.5 py-2.5">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLead(lead)}
                                title="View & Mark as Contacted"
                                className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLeadToDelete(lead)}
                                className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Standardized Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="text-xs font-medium text-slate-500">
                    Showing {Math.min(totalCount, (currentPage - 1) * 15 + 1)} to {Math.min(totalCount, currentPage * 15)} of {totalCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    {getPageNumbers().map((page, index) => {
                      if (page === "...") {
                        return <span key={`ellipsis-${index}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
                      }
                      const isCurrent = page === currentPage;
                      return (
                        <Button
                          key={`page-${page}`}
                          variant={isCurrent ? "default" : "ghost"}
                          size="sm"
                          className={cn("h-7 w-7 rounded-md font-semibold text-xs", isCurrent && "shadow-xs")}
                          onClick={() => setCurrentPage(page as number)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lead Profile & Details Modal (Matching Super Admin High-End Layout) */}
        <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <DialogContent className="max-w-2xl rounded-2xl p-4 sm:p-6 border-slate-200 dark:border-slate-800 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0">
                    {(selectedLead?.name || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {selectedLead?.name || "Prospective Student"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Received {selectedLead ? new Date(selectedLead.createdAt).toLocaleString() : ""}
                    </DialogDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border-none w-fit",
                    selectedLead?.status === "NEW" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                    selectedLead?.status === "CONTACTED" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                    selectedLead?.status === "CONVERTED" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                    "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {selectedLead?.status === "CONVERTED" ? "ENROLLED" : selectedLead?.status}
                </Badge>
              </div>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-4 pt-2">
                {/* Contact Card & Channel Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Phone / WhatsApp</span>
                    {selectedLead.phone ? (
                      <a href={`tel:${selectedLead.phone}`} className="font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{selectedLead.phone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">None</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Email</span>
                    {selectedLead.email ? (
                      <a href={`mailto:${selectedLead.email}`} className="font-semibold text-slate-800 dark:text-slate-200 hover:text-primary truncate block mt-0.5">
                        {selectedLead.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">None</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Channel</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {selectedLead.source?.replace("SOCIAL_CAMPAIGN_", "").replace("_", " ") || "DIRECT"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Location / PIN</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {[selectedLead.metadata?.city, selectedLead.metadata?.pinCode].filter(Boolean).join(" - ") || "Not Provided"}
                    </span>
                  </div>
                </div>

                {/* Questionnaire Responses */}
                {selectedLead.metadata?.questionnaireAnswers && Object.keys(selectedLead.metadata.questionnaireAnswers).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Student Course Preferences & Answers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedLead.metadata.questionnaireAnswers).map(([k, v]: any, idx) => (
                        <div key={k} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            #{idx + 1} {k.replace("_", " ")}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message if any */}
                {selectedLead.metadata?.message && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Query Message</span>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedLead.metadata.message}
                    </div>
                  </div>
                )}

                {/* High Contrast Status Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Update Lead Status:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "NEW", label: "NEW" },
                      { id: "CONTACTED", label: "CONTACTED" },
                      { id: "CONVERTED", label: "ENROLLED" },
                      { id: "ARCHIVED", label: "ARCHIVED" },
                    ].map((st) => (
                      <Button
                        key={st.id}
                        size="sm"
                        variant={selectedLead.status === st.id ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(selectedLead.id, st.id)}
                        className={cn(
                          "h-7.5 px-3 text-xs font-semibold rounded-lg transition-all",
                          selectedLead.status === st.id 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs" 
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {st.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Live Center Funnel Modal Preview */}
        {isTestingFunnel && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsTestingFunnel(false);
              }
            }}
          >
            <div 
              className="w-full max-w-lg my-auto relative z-10" 
              onClick={(e) => e.stopPropagation()}
            >
              <SocialMediaLeadFunnel
                initialType="STUDENT"
                socialSource="franchise_admin_preview"
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                workspaceSubdomain={workspaceSubdomain}
                config={funnelConfig}
                isModal={true}
                onClose={() => setIsTestingFunnel(false)}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
