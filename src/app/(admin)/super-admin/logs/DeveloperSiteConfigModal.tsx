"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  FolderTree, 
  Layers, 
  Smartphone,
  Save, 
  RefreshCw, 
  Copy, 
  Check, 
  Info,
  Zap,
  Sliders,
  Server
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  getPlatformRoutingConfig, 
  updatePlatformRoutingConfig 
} from "@/app/actions/platform-routing";
import { 
  type PlatformRoutingConfig, 
  type PlatformRoutingMode, 
  DEFAULT_ROUTING_CONFIG 
} from "@/lib/routing-config";

interface DeveloperSiteConfigModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  developerEmail: string;
  isDeveloper: boolean;
}

export function DeveloperSiteConfigModal({
  isOpen,
  onClose,
  developerEmail,
  isDeveloper
}: DeveloperSiteConfigModalProps) {
  const [activeTab, setActiveTab] = useState<"routing" | "pwa" | "maintenance">("routing");
  const [config, setConfig] = useState<PlatformRoutingConfig>(DEFAULT_ROUTING_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [previewTenant, setPreviewTenant] = useState("wb-101");
  const [hostDomain, setHostDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostDomain(window.location.host);
    }
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await getPlatformRoutingConfig();
      setConfig(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!isDeveloper) {
      toast.error("Permission Denied: Only verified Developer Administrators can update these settings.");
      return;
    }

    setIsSaving(true);
    toast.loading("Applying configuration...", { id: "config-save" });

    try {
      const res = await updatePlatformRoutingConfig(config);
      if (res.success && res.config) {
        setConfig(res.config);
        toast.success("Site configuration saved & applied!", { id: "config-save" });
        onClose(false);
      } else {
        toast.error(res.error || "Failed to update configuration", { id: "config-save" });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving", { id: "config-save" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectMode = (mode: PlatformRoutingMode) => {
    if (mode === "SUBDIRECTORY") {
      setConfig(prev => ({
        ...prev,
        routingMode: "SUBDIRECTORY",
        enableSubdomains: false,
        enableSubdirectories: true,
        autoRedirectSubdomain: true,
        defaultUrlMode: "SUBDIRECTORY"
      }));
    } else if (mode === "SUBDOMAIN") {
      setConfig(prev => ({
        ...prev,
        routingMode: "SUBDOMAIN",
        enableSubdomains: true,
        enableSubdirectories: true,
        autoRedirectSubdomain: false,
        defaultUrlMode: "SUBDOMAIN"
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        routingMode: "BOTH",
        enableSubdomains: true,
        enableSubdirectories: true,
        autoRedirectSubdomain: false,
        defaultUrlMode: prev.defaultUrlMode || "SUBDIRECTORY"
      }));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const cleanHost = hostDomain || "example.com";
  
  const publicUrl = config.routingMode === "SUBDOMAIN"
    ? `${protocol}//${previewTenant}.${cleanHost}`
    : `${protocol}//${cleanHost}/app/${previewTenant}`;

  const adminDashboardUrl = config.routingMode === "SUBDOMAIN"
    ? `${protocol}//${previewTenant}.${cleanHost}/admin`
    : `${protocol}//${cleanHost}/app/${previewTenant}/admin`;

  const studentPortalUrl = config.routingMode === "SUBDOMAIN"
    ? `${protocol}//${previewTenant}.${cleanHost}/student/dashboard`
    : `${protocol}//${cleanHost}/app/${previewTenant}/student/dashboard`;

  const isVercelFreeDetected = cleanHost.includes("vercel.app");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-4xl max-h-[88vh] flex flex-col p-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* STATIC TOP HEADER: Title, Reload, Cancel, Save ALL HERE */}
        <div className="shrink-0 p-3.5 sm:px-5 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title & Badge */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    Developer Site Configuration
                  </DialogTitle>
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-none text-[8px] font-bold px-1.5 py-0.5">
                    DEV ONLY
                  </Badge>
                </div>
                <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-tenant routing architecture, PWA flags, and system infrastructure.
                </DialogDescription>
              </div>
            </div>

            {/* Static Action Buttons: Reload, Cancel, Save */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchConfig}
                disabled={isLoading || isSaving}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                <span className="hidden sm:inline">Reload</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClose(false)}
                disabled={isSaving}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !isDeveloper}
                className="h-8 px-3.5 rounded-lg text-xs font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1 mt-3 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80 max-w-fit">
            <button
              onClick={() => setActiveTab("routing")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "routing"
                  ? "bg-white dark:bg-slate-900 text-primary dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Multi-Tenant & Domains</span>
            </button>

            <button
              onClick={() => setActiveTab("pwa")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "pwa"
                  ? "bg-white dark:bg-slate-900 text-primary dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>PWA & Mobile App</span>
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "maintenance"
                  ? "bg-white dark:bg-slate-900 text-primary dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Server className="h-3.5 w-3.5" />
              <span>Health & Maintenance</span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE MODAL BODY WITH SLEEK CUSTOM SCROLLBAR */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* TAB 1: ROUTING & DOMAINS */}
          {activeTab === "routing" && (
            <div className="space-y-3.5">
              {isVercelFreeDetected && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    <strong>Vercel Free Tier ({cleanHost})</strong>: Wildcard subdomains are not supported. <strong>Subdirectory Mode</strong> is recommended.
                  </span>
                </div>
              )}

              {/* SHORT & CONCISE ROUTING ARCHITECTURE CARDS */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Global Routing Architecture
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* Mode 1: Subdirectory */}
                  <div 
                    onClick={() => handleSelectMode("SUBDIRECTORY")}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all relative flex flex-col justify-between group",
                      config.routingMode === "SUBDIRECTORY"
                        ? "border-emerald-500 bg-emerald-500/5 shadow-xs ring-1 ring-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          config.routingMode === "SUBDIRECTORY" ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                          <FolderTree className="h-4 w-4" />
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-bold px-1.5 py-0.2 border-none",
                          config.routingMode === "SUBDIRECTORY" ? "bg-emerald-600 text-white" : "bg-emerald-500/10 text-emerald-600"
                        )}>
                          {config.routingMode === "SUBDIRECTORY" ? "ACTIVE" : "RECOMMENDED"}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Subdirectory Mode
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Uses <span className="font-mono text-[10px]">/app/[tenant]</span>. No wildcard DNS or SSL needed.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                      domain.com/app/delhi
                    </div>
                  </div>

                  {/* Mode 2: Hybrid / Both */}
                  <div 
                    onClick={() => handleSelectMode("BOTH")}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all relative flex flex-col justify-between group",
                      config.routingMode === "BOTH"
                        ? "border-blue-500 bg-blue-500/5 shadow-xs ring-1 ring-blue-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          config.routingMode === "BOTH" ? "bg-blue-500/15 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                          <Layers className="h-4 w-4" />
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-bold px-1.5 py-0.2 border-none",
                          config.routingMode === "BOTH" ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-600"
                        )}>
                          {config.routingMode === "BOTH" ? "ACTIVE" : "BOTH ACTIVE"}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Dual / Hybrid Mode
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Supports both <span className="font-mono text-[10px]">delhi.domain.com</span> and <span className="font-mono text-[10px]">/app/delhi</span>.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate">
                      delhi.domain + /app/delhi
                    </div>
                  </div>

                  {/* Mode 3: Subdomain Only */}
                  <div 
                    onClick={() => handleSelectMode("SUBDOMAIN")}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition-all relative flex flex-col justify-between group",
                      config.routingMode === "SUBDOMAIN"
                        ? "border-purple-500 bg-purple-500/5 shadow-xs ring-1 ring-purple-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          config.routingMode === "SUBDOMAIN" ? "bg-purple-500/15 text-purple-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                          <Globe className="h-4 w-4" />
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-bold px-1.5 py-0.2 border-none",
                          config.routingMode === "SUBDOMAIN" ? "bg-purple-600 text-white" : "bg-purple-500/10 text-purple-600"
                        )}>
                          {config.routingMode === "SUBDOMAIN" ? "ACTIVE" : "DNS REQUIRED"}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Subdomain Enforced
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Dedicated subdomains. Requires <span className="font-mono text-[10px]">*.domain</span> wildcard DNS.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-mono text-purple-600 dark:text-purple-400 truncate">
                      delhi.domain.com/admin
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPACT GRANULAR TOGGLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Subdomain Resolution
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Toggle subdomain handling across site.
                    </p>
                  </div>
                  <Switch
                    checked={config.enableSubdomains}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({
                        ...prev,
                        enableSubdomains: checked,
                        routingMode: checked ? (prev.enableSubdirectories ? "BOTH" : "SUBDOMAIN") : "SUBDIRECTORY",
                        defaultUrlMode: checked ? prev.defaultUrlMode : "SUBDIRECTORY"
                      }));
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Subdirectory Paths (/app)
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Allow /app/[tenant] workspace URLs.
                    </p>
                  </div>
                  <Switch
                    checked={config.enableSubdirectories}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({
                        ...prev,
                        enableSubdirectories: checked,
                        routingMode: checked ? (prev.enableSubdomains ? "BOTH" : "SUBDIRECTORY") : "SUBDOMAIN"
                      }));
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Auto-Redirect Subdomain to Subdirectory
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Forwards subdomain traffic to /app/[tenant].
                    </p>
                  </div>
                  <Switch
                    checked={config.autoRedirectSubdomain}
                    onCheckedChange={(checked) => {
                      setConfig(prev => ({ ...prev, autoRedirectSubdomain: checked }));
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Default Shareable URL
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Format used for franchise badges & links.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-700/60 p-0.5 rounded-md text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, defaultUrlMode: "SUBDIRECTORY" }))}
                      className={cn(
                        "px-2 py-0.5 rounded text-[11px] font-semibold transition-all",
                        config.defaultUrlMode === "SUBDIRECTORY" 
                          ? "bg-white dark:bg-slate-900 text-primary dark:text-white shadow-xs" 
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      /app/tenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, defaultUrlMode: "SUBDOMAIN" }))}
                      disabled={!config.enableSubdomains}
                      className={cn(
                        "px-2 py-0.5 rounded text-[11px] font-semibold transition-all",
                        config.defaultUrlMode === "SUBDOMAIN" 
                          ? "bg-white dark:bg-slate-900 text-primary dark:text-white shadow-xs" 
                          : "text-slate-600 dark:text-slate-400",
                        !config.enableSubdomains && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      tenant.domain
                    </button>
                  </div>
                </div>
              </div>

              {/* COMPACT LIVE ROUTE SIMULATOR */}
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Live Route Simulator</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 text-[11px]">Tenant:</span>
                    <Input
                      value={previewTenant}
                      onChange={(e) => setPreviewTenant(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="h-6 w-20 text-[11px] font-mono bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 truncate">
                      <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/10 text-blue-600 border-none shrink-0">
                        Public
                      </Badge>
                      <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">{publicUrl}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(publicUrl, "pub")} className="h-6 px-1.5 text-[11px]">
                      {copiedLink === "pub" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 truncate">
                      <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/10 text-amber-600 border-none shrink-0">
                        Admin
                      </Badge>
                      <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">{adminDashboardUrl}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(adminDashboardUrl, "adm")} className="h-6 px-1.5 text-[11px]">
                      {copiedLink === "adm" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 truncate">
                      <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-500/10 text-purple-600 border-none shrink-0">
                        Student
                      </Badge>
                      <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">{studentPortalUrl}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(studentPortalUrl, "stu")} className="h-6 px-1.5 text-[11px]">
                      {copiedLink === "stu" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PWA & MOBILE APP */}
          {activeTab === "pwa" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">
                      Progressive Web App (PWA)
                    </Label>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-bold px-1.5 py-0 border-none",
                      config.enablePwa ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    )}>
                      {config.enablePwa ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enables manifest and service worker. Allows installing the platform on mobile & desktop devices.
                  </p>
                </div>
                <Switch
                  checked={config.enablePwa}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enablePwa: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="space-y-0.5 pr-3">
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Install App Prompt Banner
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Show install prompt banner to mobile and desktop visitors.
                  </p>
                </div>
                <Switch
                  checked={config.enablePwaInstallPrompt}
                  disabled={!config.enablePwa}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enablePwaInstallPrompt: checked }))}
                />
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-blue-500/5 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-[11px]">
                  Manifest endpoint: <span className="font-mono text-primary">/manifest.webmanifest</span>
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM HEALTH & MAINTENANCE */}
          {activeTab === "maintenance" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">
                        Platform Maintenance Mode
                      </Label>
                      {config.maintenanceMode && (
                        <Badge className="bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0">
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Blocks non-developer visitors with a maintenance message. Developers have full access.
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>

                {config.maintenanceMode && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Maintenance Notice
                    </Label>
                    <Textarea
                      value={config.maintenanceMessage}
                      onChange={(e) => setConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      rows={2}
                      className="text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="space-y-0.5 pr-3">
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Verbose System Diagnostics
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Logs detailed query timings in system audit logs.
                  </p>
                </div>
                <Switch
                  checked={config.enableVerboseLogging}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableVerboseLogging: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="space-y-0.5 pr-3">
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Purge Edge & Database Cache
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Revalidates platform tags and layout caches.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchConfig();
                    toast.success("Cache purged & revalidated!");
                  }}
                  className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Purge</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
