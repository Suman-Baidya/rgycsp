"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Inbox, 
  Search, 
  Trash2, 
  RefreshCcw, 
  GraduationCap, 
  Building2, 
  Mail, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Calendar, 
  Download, 
  User, 
  Users,
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Sparkles,
  MessageSquareQuote,
  CheckCircle2,
  Clock,
  Send,
  Sliders,
  ShieldCheck,
  Megaphone,
  Home,
  Plus,
  X,
  Settings2
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
  type FunnelQuestion 
} from "@/types/funnel";


type TabType = "ALL" | "STUDENTS" | "FRANCHISE" | "CONTACTS" | "NEWSLETTER" | "CAMPAIGNS";

interface EnquiriesClientProps {
  initialHost?: string;
}

export default function EnquiriesClient({ initialHost = "" }: EnquiriesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "STUDENTS" | "FRANCHISES" | "CONTACTS" | "NEWSLETTER">("ALL");
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
    franchiseLeads: 0,
    newsletterSubscribers: 0,
    generalContacts: 0,
  });

  // Selected Lead for View Dialog
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // When clicking View on a lead, if it is currently NEW, mark it as CONTACTED to decrease the notification badge
  const handleViewLead = async (lead: any) => {
    setSelectedLead(lead);
    if (lead.status === "NEW") {
      try {
        const res = await updateEnquiryStatus(lead.id, "CONTACTED");
        if (res.success) {
          // Update local leads list
          setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "CONTACTED" } : l));
          // Update selected lead status
          setSelectedLead((prev: any) => prev ? { ...prev, status: "CONTACTED" } : null);
          // Decrement new leads count in stat cards
          setStats(prev => ({
            ...prev,
            newLeads: Math.max(0, prev.newLeads - 1),
            contactedLeads: prev.contactedLeads + 1,
          }));
          // Trigger sidebar and header notifications refresh
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to auto-update viewed enquiry status:", err);
      }
    }
  };

  // Delete Confirm Dialog
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Social Campaign Builder State
  const [campaignGoal, setCampaignGoal] = useState<"FRANCHISE" | "STUDENT">("FRANCHISE");
  const [campaignPlatform, setCampaignPlatform] = useState("facebook");
  const [campaignTag, setCampaignTag] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic Funnel Config State
  const [funnelConfig, setFunnelConfig] = useState<FunnelConfig>(DEFAULT_FUNNEL_CONFIG);
  const [activeEditorTab, setActiveEditorTab] = useState<"NONE" | "FIELDS" | "QUESTIONS" | "REDIRECTION">("NONE");
  const [isSavingFunnel, setIsSavingFunnel] = useState(false);

  // Question editing sub-state
  const [editingQuestionType, setEditingQuestionType] = useState<"FRANCHISE" | "STUDENT">("STUDENT");
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

  // Generate Campaign Shareable URL
  const campaignShareableUrl = useMemo(() => {
    const base = `${protocol}//${cleanHost}/enquiry/lead`;
    const params = new URLSearchParams();
    params.set("type", campaignGoal.toLowerCase());
    params.set("source", campaignPlatform);
    if (campaignTag.trim()) {
      params.set("tag", campaignTag.trim().toLowerCase().replace(/\s+/g, "_"));
    }
    return `${base}?${params.toString()}`;
  }, [protocol, cleanHost, campaignGoal, campaignPlatform, campaignTag]);

  // Fetch Enquiries & Stats & Funnel Config
  const fetchData = async () => {
    setIsLoading(true);
    try {
      let sourceFilter = "ALL";
      let reqCategory: "ALL" | "STUDENTS" | "FRANCHISES" | "CONTACTS" | "NEWSLETTER" | undefined = undefined;

      if (activeTab === "STUDENTS") sourceFilter = "SOCIAL_CAMPAIGN_STUDENT";
      else if (activeTab === "FRANCHISE") sourceFilter = "SOCIAL_CAMPAIGN_FRANCHISE";
      else if (activeTab === "CONTACTS") reqCategory = "CONTACTS";
      else if (activeTab === "NEWSLETTER") sourceFilter = "NEWSLETTER_SUBSCRIBE";
      else if (activeTab === "ALL" && categoryFilter !== "ALL") {
        reqCategory = categoryFilter;
      }

      const [enquiryRes, statsRes, funnelRes] = await Promise.all([
        getEnquiries({
          status: statusFilter,
          source: sourceFilter !== "ALL" ? sourceFilter : undefined,
          category: reqCategory,
          search: debouncedSearch,
          page: currentPage,
          pageSize: 15,
        }),
        getEnquiryStatistics(),
        getFunnelConfig(null)
      ]);

      if (enquiryRes.success) {
        setLeads(enquiryRes.leads || []);
        setTotalCount(enquiryRes.totalCount || 0);
        setTotalPages(enquiryRes.totalPages || 1);
      }
      setStats(statsRes);
      if (funnelRes) {
        setFunnelConfig(funnelRes);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFunnel = async (patch: Partial<FunnelConfig>) => {
    setIsSavingFunnel(true);
    try {
      const res = await saveFunnelConfig(patch, null);
      if (res.success && res.config) {
        setFunnelConfig(res.config);
        toast.success("Funnel settings updated & published!");
      } else {
        toast.error(res.error || "Failed to save funnel settings");
      }
    } catch (err: any) {
      toast.error("Failed to save settings");
    } finally {
      setIsSavingFunnel(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error("Please enter question text.");
      return;
    }
    const rawOptions = newQuestionOptions.split(",").map(o => o.trim()).filter(Boolean);
    const options = rawOptions.length > 0 ? rawOptions.map(l => ({ label: l })) : [{ label: "Yes" }, { label: "No" }];
    const newQ: FunnelQuestion = {
      id: `q_${Date.now()}`,
      question: newQuestionText.trim(),
      options,
    };
    if (editingQuestionType === "STUDENT") {
      const updated = [...funnelConfig.studentQuestions, newQ];
      handleSaveFunnel({ studentQuestions: updated });
    } else {
      const updated = [...funnelConfig.franchiseQuestions, newQ];
      handleSaveFunnel({ franchiseQuestions: updated });
    }
    setNewQuestionText("");
    setNewQuestionOptions("");
  };

  const handleDeleteQuestion = (qId: string) => {
    if (editingQuestionType === "STUDENT") {
      const updated = funnelConfig.studentQuestions.filter(q => q.id !== qId);
      handleSaveFunnel({ studentQuestions: updated });
    } else {
      const updated = funnelConfig.franchiseQuestions.filter(q => q.id !== qId);
      handleSaveFunnel({ franchiseQuestions: updated });
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, categoryFilter, debouncedSearch, currentPage]);

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await updateEnquiryStatus(leadId, newStatus);
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
        }
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
        toast.success("Enquiry deleted successfully");
        setLeadToDelete(null);
        fetchData();
      } else {
        toast.error("Failed to delete enquiry");
      }
    } catch (err: any) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(campaignShareableUrl);
    setCopiedLink(true);
    toast.success("Campaign link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.info("No records to export");
      return;
    }
    const headers = ["ID", "Name", "Email", "Phone", "Source", "Intent", "Status", "Date"];
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      l.email || "",
      l.phone || "",
      l.source,
      `"${(l.intent || "").replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `enquiries_${activeTab.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${leads.length} records to CSV`);
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
    { title: "Total Inquiries", value: stats.totalEnquiries.toLocaleString(), icon: Inbox, color: "text-slate-600", bg: "bg-slate-500/10" },
    { title: "Student Leads", value: stats.studentLeads.toLocaleString(), icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-500/10" },
    { title: "Franchise Seekers", value: stats.franchiseLeads.toLocaleString(), icon: Building2, color: "text-purple-600", bg: "bg-purple-500/10" },
    { title: "Contact Queries", value: stats.generalContacts.toLocaleString(), icon: MessageSquareQuote, color: "text-amber-600", bg: "bg-amber-500/10" },
    { title: "Newsletter Subs", value: stats.newsletterSubscribers.toLocaleString(), icon: Mail, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        {/* Header */}
        <AdminPageHeader
          title="Enquiries & Social Leads"
          description="Manage prospective student admissions, franchise applicants, contact messages, and social media marketing funnels."
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab("CAMPAIGNS")}
              variant="outline"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <Megaphone className="h-3.5 w-3.5 text-primary" />
              <span>Campaign Builder</span>
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
          title="Delete Enquiry Record"
          description={`Are you sure you want to permanently delete the inquiry from "${leadToDelete?.name || leadToDelete?.email || 'this user'}"? This action cannot be reversed.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Delete Record"
          destructive={true}
        />

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
            { id: "STUDENTS", label: "Student Leads", icon: GraduationCap, count: stats.studentLeads },
            { id: "FRANCHISE", label: "Franchise Seekers", icon: Building2, count: stats.franchiseLeads },
            { id: "CONTACTS", label: "Contact Messages", icon: MessageSquareQuote, count: stats.generalContacts },
            { id: "NEWSLETTER", label: "Newsletter Subscribers", icon: Mail, count: stats.newsletterSubscribers },
            { id: "CAMPAIGNS", label: "Social Campaign Builder", icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
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

        {/* TAB 1: SOCIAL CAMPAIGN BUILDER & FUNNEL CONFIGURATOR */}
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
                      onClick={() => window.open("/enquiry/lead", "_blank")}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:text-primary shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                      <span>View Live Funnel</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Dynamic 3-Step Interactive Funnel Workflow */}
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

                    {/* Card 2: Institute Intro & MCQ */}
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
                          {activeEditorTab === "QUESTIONS" ? "Editing" : "Add/Del MCQs"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Manage interactive questions and multiple choice options for students & franchise.
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
                          {activeEditorTab === "REDIRECTION" ? "Editing" : "Control URLs"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Control target URLs (Franchise & Student destination, PIN nearest center & Home popup).
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
                            Choose which input fields should be shown or required on the lead capture form.
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
                            placeholder="e.g. Quick Admission Check"
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
                            placeholder="e.g. Check instant eligibility & nearest center in 30 seconds"
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
                            <span className="text-[9px] text-slate-400">Routes to center</span>
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

                      <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          size="sm"
                          disabled={isSavingFunnel}
                          onClick={() => handleSaveFunnel(funnelConfig)}
                          className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{isSavingFunnel ? "Saving..." : "Save Fields Configuration"}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE DYNAMIC EDITOR PANEL 2: QUESTIONS CONFIGURATION */}
                  {activeEditorTab === "QUESTIONS" && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-500/30 space-y-4 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            Step 2: Institute Intro & MCQ Questions Configuration
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Add, customize, or delete questions presented to candidates in Step 2.
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

                      {/* Question Category Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingQuestionType("STUDENT")}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            editingQuestionType === "STUDENT"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          )}
                        >
                          Student Questions ({funnelConfig.studentQuestions?.length || 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingQuestionType("FRANCHISE")}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            editingQuestionType === "FRANCHISE"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          )}
                        >
                          Franchise Questions ({funnelConfig.franchiseQuestions?.length || 0})
                        </button>
                      </div>

                      {/* Add New Question Section */}
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                          Add New Question to {editingQuestionType === "STUDENT" ? "Student" : "Franchise"} Funnel:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
                        {(editingQuestionType === "STUDENT" ? funnelConfig.studentQuestions : funnelConfig.franchiseQuestions)?.map((q, qIdx) => (
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

                  {/* ACTIVE DYNAMIC EDITOR PANEL 3: REDIRECTION & POPUP CONFIGURATION */}
                  {activeEditorTab === "REDIRECTION" && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ExternalLink className="h-4 w-4 text-emerald-600" />
                            Step 3: Smart Auto-Redirection & Home Popup Configuration
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Control where users land after completing the questions, and enable home page popup.
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
                            Franchise Destination URL
                          </label>
                          <Input 
                            value={funnelConfig.redirection.franchiseUrl || ""}
                            onChange={(e) => setFunnelConfig(prev => ({
                              ...prev,
                              redirection: { ...prev.redirection, franchiseUrl: e.target.value }
                            }))}
                            placeholder="e.g. /franchises/apply"
                            className="h-8 text-xs font-mono bg-slate-50 dark:bg-slate-800"
                          />
                          <p className="text-[10px] text-slate-400">Where franchise seekers are redirected after submitting.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Student Default Destination URL
                          </label>
                          <Input 
                            value={funnelConfig.redirection.studentUrl || ""}
                            onChange={(e) => setFunnelConfig(prev => ({
                              ...prev,
                              redirection: { ...prev.redirection, studentUrl: e.target.value }
                            }))}
                            placeholder="e.g. /nearest-center or /study-center"
                            className="h-8 text-xs font-mono bg-slate-50 dark:bg-slate-800"
                          />
                          <p className="text-[10px] text-slate-400">Fallback URL if auto-route is disabled or PIN code doesn't match an active study center.</p>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs col-span-1 sm:col-span-2">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                Student Destination: Route to Nearest Franchise by PIN Code
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 border-none",
                                  funnelConfig.redirection.autoNearestCenter 
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                )}
                              >
                                {funnelConfig.redirection.autoNearestCenter ? "ENABLED: Auto-Route to Franchise" : "DISABLED: Central Campus Form"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {funnelConfig.redirection.autoNearestCenter ? (
                                <>
                                  <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Mode: </strong>
                                  When a student completes an inquiry with their 6-digit PIN code on the main landing page, the system matches them to the closest authorized franchise center and redirects them directly to that center's admission application form (<code className="text-primary font-mono text-[10px]">/app/[tenant]/admission</code>).
                                </>
                              ) : (
                                <>
                                  <strong className="text-slate-600 dark:text-slate-400 font-semibold">Campus Mode: </strong>
                                  Auto-routing is off. All prospective students from the main landing page will be redirected to the central headquarters/campus admission desk (<code className="text-primary font-mono text-[10px]">{funnelConfig.redirection.studentUrl || "/admission"}</code>).
                                </>
                              )}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center pt-0.5">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={funnelConfig.redirection.autoNearestCenter}
                                onChange={(e) => setFunnelConfig(prev => ({
                                  ...prev,
                                  redirection: { ...prev.redirection, autoNearestCenter: e.target.checked }
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              Enable Home Page Popup Modal
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight">
                              Displays floating 'Instant Eligibility Check' on the homepage so visitors can take the funnel directly.
                            </span>
                          </div>
                          <input 
                            type="checkbox"
                            checked={funnelConfig.popupEnabled}
                            onChange={(e) => setFunnelConfig(prev => ({
                              ...prev,
                              popupEnabled: e.target.checked
                            }))}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer mt-0.5"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          size="sm"
                          disabled={isSavingFunnel}
                          onClick={() => handleSaveFunnel(funnelConfig)}
                          className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{isSavingFunnel ? "Saving..." : "Save Redirection Settings"}</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Funnel Config Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Campaign Target Goal */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      1. Target Campaign Objective
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCampaignGoal("FRANCHISE")}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all",
                          campaignGoal === "FRANCHISE"
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Franchise Seekers</span>
                        <span className="text-[9px] font-normal text-slate-500">Redirects to Franchise Apply</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCampaignGoal("STUDENT")}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all",
                          campaignGoal === "STUDENT"
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Student Admissions</span>
                        <span className="text-[9px] font-normal text-slate-500">Auto-routes to Nearest Center</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Media Platform Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      2. Social Media Platform / Source
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "facebook", label: "Facebook Ad" },
                        { id: "instagram", label: "Instagram" },
                        { id: "whatsapp", label: "WhatsApp" },
                        { id: "linkedin", label: "LinkedIn" },
                        { id: "youtube", label: "YouTube" },
                        { id: "google_ads", label: "Google Ads" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCampaignPlatform(item.id)}
                          className={cn(
                            "py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all truncate text-center",
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
                </div>

                {/* Optional Campaign Tag */}
                <div className="space-y-1.5 max-w-md">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Optional Campaign Tag / Promo Name
                  </label>
                  <Input
                    placeholder="e.g. summer_2026, admission_fair, expo"
                    value={campaignTag}
                    onChange={(e) => setCampaignTag(e.target.value)}
                    className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Generated Shareable URL Container */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Generated Shareable Campaign Link:</span>
                    <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border-none">
                      READY TO POST
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
                      <span className="hidden sm:inline">Test Funnel</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* TAB 2: INQUIRIES & LEADS TABLE */
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-2.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 sm:gap-3 w-full overflow-x-auto no-scrollbar py-0.5">
                {/* Search - compact on mobile */}
                <div className="relative shrink-0 w-36 sm:w-56 md:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Search leads..."
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

                {/* Audience Category Sort (All Audience, Students, Franchise) */}
                <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs gap-1 shrink-0">
                  {[
                    { 
                      id: "ALL", 
                      label: "All Audience", 
                      icon: Users, 
                      count: stats.totalEnquiries,
                      color: "text-slate-700 dark:text-slate-200",
                      badgeColor: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    },
                    { 
                      id: "STUDENTS", 
                      label: "Students", 
                      icon: GraduationCap, 
                      count: stats.studentLeads,
                      color: "text-blue-600 dark:text-blue-400",
                      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    },
                    { 
                      id: "FRANCHISES", 
                      label: "Franchise", 
                      icon: Building2, 
                      count: stats.franchiseLeads,
                      color: "text-purple-600 dark:text-purple-400",
                      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    },
                    { 
                      id: "CONTACTS", 
                      label: "Contacts", 
                      icon: MessageSquareQuote, 
                      count: stats.generalContacts,
                      color: "text-amber-600 dark:text-amber-400",
                      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isActive = categoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(cat.id as any);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "h-7 sm:h-7.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap",
                          isActive
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 font-bold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/40"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", isActive ? cat.color : "text-slate-400 dark:text-slate-500")} />
                        <span>{cat.label}</span>
                        {cat.count !== undefined && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                              isActive ? cat.badgeColor : "bg-slate-200/60 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                            )}
                          >
                            {cat.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                          {statusFilter === "ALL" ? "All Status" : statusFilter}
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
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">CONVERTED</span>
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
                    <TableHead className="w-[180px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Prospect / Contact</TableHead>
                    <TableHead className="w-[140px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone / WhatsApp</TableHead>
                    <TableHead className="w-[140px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Source Channel</TableHead>
                    <TableHead className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Interest / Inquiry Subject</TableHead>
                    <TableHead className="w-[110px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                    <TableHead className="w-[130px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp</TableHead>
                    <TableHead className="text-right px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-xs text-slate-500 font-medium">
                        Loading inquiries...
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-500 font-medium">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Inbox className="h-8 w-8 text-slate-400" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">No inquiries found</p>
                          <p className="text-[11px] text-slate-400">Try changing your filters or share your marketing funnel link.</p>
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
                                (lead.source === "CONTACT_FORM" || lead.source === "FRANCHISE_CONTACT") ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                lead.source?.includes("STUDENT") ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                lead.source?.includes("FRANCHISE") ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                                lead.source === "NEWSLETTER_SUBSCRIBE" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                              )}
                            >
                              {lead.source === "FRANCHISE_CONTACT" ? "Campus Contact" :
                               lead.source === "CONTACT_FORM" ? "Web Contact" :
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
                              {lead.intent || lead.metadata?.message || "General Inquiry"}
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
                            <option value="CONVERTED">CONVERTED</option>
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

        {/* Lead Details Modal */}
        <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <DialogContent 
            className="max-w-xl w-[calc(100%-2rem)] rounded-2xl p-5 sm:p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            showCloseButton={true}
          >
            <DialogHeader className="pr-8 space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Lead Profile & Responses
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {selectedLead?.source?.replace(/_/g, " ")}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Captured on {selectedLead ? new Date(selectedLead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-4 pt-1 text-left max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                {/* Prospect Details Grid */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Name</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedLead.name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Phone</span>
                      <a href={`tel:${selectedLead.phone}`} className="font-semibold text-primary hover:underline text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{selectedLead.phone || "N/A"}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 break-all">{selectedLead.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Location</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {[selectedLead.metadata?.city, selectedLead.metadata?.pinCode].filter(Boolean).join(" - ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  {selectedLead.metadata?.socialSource && (
                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marketing Source:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary capitalize">
                        {selectedLead.metadata.socialSource.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Questionnaire / MCQ Answers */}
                {selectedLead.metadata?.questionnaireAnswers && Object.keys(selectedLead.metadata.questionnaireAnswers).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Questionnaire Responses:
                    </span>
                    <div className="space-y-1.5">
                      {Object.entries(selectedLead.metadata.questionnaireAnswers).map(([k, v]: any) => (
                        <div key={k} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between gap-3">
                          <span className="text-slate-500 font-medium capitalize text-left">{k.replace(/_/g, " ")}</span>
                          <span className="font-semibold text-slate-900 dark:text-white text-right shrink-0">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                {selectedLead.metadata?.message && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Message Content</span>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedLead.metadata.message}
                    </div>
                  </div>
                )}

                {/* Status Update Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-500">Quick Status Update:</span>
                  <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    {(["NEW", "CONTACTED", "CONVERTED"] as const).map((st) => {
                      const isActive = selectedLead.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(selectedLead.id, st)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                            isActive 
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs" 
                              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
                          )}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
