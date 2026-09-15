"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe, Layout, Palette, Phone, Save, Settings2, Trash2,
  ChevronDown, ChevronUp, Cpu, LayoutDashboard, FileText, Play, Rocket,
  Mail, ShieldCheck, UserCheck, BookOpenCheck, Menu,
  MousePointer2, ExternalLink, Plus, Check, X, Zap, Bell,
  Calendar, Trophy, Handshake, Star, HelpCircle, MapPin, Clock, Send, Search, Image as ImageIcon, Pencil,
  Link2, Sparkles
} from "lucide-react";
import { updateSiteSettings, updateLandingSection, syncAllSections } from "@/app/actions/site-settings";
import { createEvent, updateEvent, deleteEvent } from "@/app/actions/events";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/app/actions/gallery";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { cn } from "@/lib/utils";
import { ThemeContrastIndicator } from "@/components/theme/ThemeContrastIndicator";

const THEME_PRESETS = [
  { name: "Academic Indigo", primary: "#4f46e5", accent: "#4338ca", description: "Standard professional indigo." },
  { name: "Sky Professional", primary: "#0ea5e9", accent: "#0284c7", description: "Clean and airy professional blue." },
  { name: "Institute Orange", primary: "#f97316", accent: "#ea580c", description: "Energetic and vibrant orange." },
  { name: "Prestige Emerald", primary: "#059669", accent: "#047857", description: "Trustworthy academic green." },
  { name: "Mint Academic", primary: "#10b981", accent: "#059669", description: "Fresh and modern educational feel." },
  { name: "Lavender Modern", primary: "#8b5cf6", accent: "#7c3aed", description: "Creative and modern purple." },
  { name: "Rose Elegant", primary: "#f43f5e", accent: "#e11d48", description: "Soft yet impactful rose theme." },
  { name: "Sand Premium", primary: "#d97706", accent: "#b45309", description: "Sophisticated and warm gold." },
];

const HEADER_BANNER_PRESETS = [
  {
    name: "Modern Campus",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070",
    description: "Architectural university campus with bright open sky."
  },
  {
    name: "Digital Tech Lab",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
    description: "Modern computer and technology lab workstations."
  },
  {
    name: "Academic Library",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070",
    description: "Spacious university library with study desks."
  },
  {
    name: "Graduation Ceremony",
    url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070",
    description: "Celebratory graduation convocation ceremony with caps in the air."
  }
];

export function WorkspaceSettingsForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [navbarConfig, setNavbarConfig] = useState(settings.navbarConfig || {});
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily || "Inter");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [address, setAddress] = useState(settings.address);
  const [googleMapLink, setGoogleMapLink] = useState(settings.googleMapLink);
  const [brandDescription, setBrandDescription] = useState(settings.brandDescription);
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks || {});
  const [pageHeaderBanner, setPageHeaderBanner] = useState(settings.pageHeaderBanner);
  const [attendanceConfig, setAttendanceConfig] = useState(settings.attendanceConfig || { enableAlerts: false, threshold: 75 });
  const DEFAULT_NAV = [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Admission", href: "/admission", id: "admission", isActive: false },
    { name: "Learners", href: "/learners", id: "learners", isActive: false },
    { name: "Courses", href: "/courses", id: "courses", isActive: true },
    { name: "Guidance", href: "/guidance", id: "guidance", isActive: true },
    { name: "Notice", href: "/notice", id: "notice", isActive: true },
    { name: "Events", href: "/events", id: "events", isActive: true },
    { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
    { name: "Enquiry", href: "/enquiry", id: "enquiry", isActive: false },
    { name: "Contact", href: "/contact", id: "contact", isActive: true },
  ];

  const [navigation, setNavigation] = useState(() => {
    if (!settings.navigation || !Array.isArray(settings.navigation) || settings.navigation.length === 0) return DEFAULT_NAV;

    // Filter out unwanted legacy items but maintain the database order
    return settings.navigation.filter((item: any) =>
      item &&
      item.id !== 'franchise' && item.name?.toLowerCase() !== 'franchise' &&
      item.name?.toLowerCase() !== 'learner' &&
      item.href !== '/students'
    );
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [sectionSearch, setSectionSearch] = useState("");
  const [editingNavIndex, setEditingNavIndex] = useState<number | null>(null);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  const mediaFolderBase = `RGYCSP/Workspaces/${settings.workspace?.subdomain || 'Unknown'}`;

  useEffect(() => {
    setSiteName(settings.siteName);
    setLogoUrl(settings.logoUrl);
    setFaviconUrl(settings.faviconUrl);
    setNavbarConfig(settings.navbarConfig || {});
    setPrimaryColor(settings.primaryColor);
    setAccentColor(settings.accentColor);
    setFontFamily(settings.fontFamily || "Inter");
    setContactEmail(settings.contactEmail);
    setContactPhone(settings.contactPhone);
    setWhatsapp(settings.whatsapp);
    setAddress(settings.address);
    setGoogleMapLink(settings.googleMapLink);
    setBrandDescription(settings.brandDescription);
    setSocialLinks(settings.socialLinks || {});
    setPageHeaderBanner(settings.pageHeaderBanner);

    // Update navigation directly from settings, maintaining database order
    if (settings.navigation && Array.isArray(settings.navigation) && settings.navigation.length > 0) {
      const filteredNav = settings.navigation.filter((item: any) =>
        item &&
        item.id !== 'franchise' && item.name?.toLowerCase() !== 'franchise' &&
        item.name?.toLowerCase() !== 'learner' &&
        item.href !== '/students'
      );
      setNavigation(filteredNav);
    } else {
      setNavigation(DEFAULT_NAV);
    }

    // --- Load Fonts for Preview ---
    const fontsToLoad = [
      "Plus Jakarta Sans",
      "Manrope",
      "Outfit",
      "Space Grotesk",
      "Urbanist",
      "Montserrat",
      "Playfair Display"
    ];
    const fontId = "admin-preview-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      const familyString = fontsToLoad.map(f => `family=${f.replace(/\s+/g, "+")}:wght@400;700;900`).join("&");
      link.href = `https://fonts.googleapis.com/css2?${familyString}&display=swap`;
      document.head.appendChild(link);
    }
  }, [settings]);

  const filteredSections = useMemo(() => {
    if (!settings.sections) return [];
    return settings.sections
      .filter((s: any) => !s.type.startsWith('page-header-') && !s.type.startsWith('legal-'))
      .filter((s: any) =>
        s.type.replace("-", " ").toLowerCase().includes(sectionSearch.toLowerCase()) ||
        (s.title && s.title.toLowerCase().includes(sectionSearch.toLowerCase()))
      );
  }, [settings.sections, sectionSearch]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      const result = await updateSiteSettings({
        workspaceId: settings.workspaceId,
        siteName,
        logoUrl,
        faviconUrl: logoUrl,
        primaryColor,
        accentColor,
        fontFamily,
        contactEmail,
        contactPhone,
        whatsapp,
        address,
        googleMapLink,
        brandDescription,
        socialLinks,
        navigation,
        navbarConfig,
        pageHeaderBanner,
        attendanceConfig,
      });
      if (result.success) {
        toast.success("Institute settings updated");
        router.refresh();
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full pb-12">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-4 sm:gap-5">
        <div className="sticky top-0 z-30 w-full bg-background/90 backdrop-blur-md border-b border-border/40 py-2">
          <div className="w-full">
            <TabsList className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-full w-full justify-start">
              {[
                { value: "branding", label: "Branding", icon: Palette },
                { value: "navigation", label: "Menu", icon: Globe },
                { value: "sections", label: "Page Sections", icon: Layout },
                { value: "events", label: "Events", icon: Calendar },
                { value: "notices", label: "Notice Board", icon: Bell },
                { value: "attendance", label: "Attendance Config", icon: UserCheck },
                { value: "gallery", label: "Gallery", icon: ImageIcon },
                { value: "legal", label: "Legal & Help", icon: ShieldCheck },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-inner text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50 data-[state=inactive]:bg-transparent"
                >
                  <tab.icon className="h-3.5 w-3.5 transition-transform" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="w-full">
          <TabsContent value="branding" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <Accordion className="space-y-4">
              <AccordionItem value="identity" className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
                <AccordionTrigger className="hover:no-underline py-3 px-3.5 sm:px-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">Institute Identity</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Manage your institute's name, logo, typography, and color theme.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-3.5 sm:px-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Theme Presets</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(preset.primary);
                            setAccentColor(preset.accent);
                          }}
                          className={cn(
                            "group relative flex flex-col items-start p-2.5 sm:p-3 rounded-xl border transition-all text-left h-24 justify-between",
                            primaryColor === preset.primary && accentColor === preset.accent
                              ? "border-primary bg-primary/5 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full shadow-inner shrink-0" style={{ backgroundColor: preset.primary }} />
                            <div className="w-2.5 h-2.5 rounded-full shadow-inner opacity-60 shrink-0" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <div>
                            <span className="font-bold text-xs block truncate w-full text-slate-900 dark:text-white">{preset.name}</span>
                            <p className="text-[9px] text-slate-400 font-medium truncate">{preset.description}</p>
                          </div>
                          {primaryColor === preset.primary && accentColor === preset.accent && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      ))}

                      {/* Custom indicator button */}
                      <button
                        type="button"
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border border-dashed transition-all text-center gap-1.5 h-24",
                          !THEME_PRESETS.some(p => p.primary === primaryColor && p.accent === accentColor)
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-primary/30"
                        )}
                      >
                        <Zap className={cn("w-4 h-4 transition-transform group-hover:rotate-12",
                          !THEME_PRESETS.some(p => p.primary === primaryColor && p.accent === accentColor) ? "text-primary" : "text-slate-400")} />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">Custom</span>
                          <p className="text-[9px] text-slate-400 font-medium">Manual Colors</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Institute Identity & Logo */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-start">
                    {/* Left Column: Institute Name & Navbar Subtitle */}
                    <div className="lg:col-span-7 space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="siteName" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                          Institute Name
                        </Label>
                        <Input
                          id="siteName"
                          value={siteName || ""}
                          onChange={(e) => setSiteName(e.target.value)}
                          placeholder="e.g. RGYCSP Chandpara"
                          className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold"
                        />
                        <p className="text-[9px] text-slate-400 font-medium">Main title displayed in the franchise navbar and official records.</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="navbarSubtitle" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                          Navbar Subtitle / Tagline
                        </Label>
                        <Input
                          id="navbarSubtitle"
                          value={navbarConfig?.subtitle || ""}
                          onChange={(e) => setNavbarConfig({ ...navbarConfig, subtitle: e.target.value })}
                          placeholder="e.g. An Authorized Study & Training Center"
                          className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                        />
                        <p className="text-[9px] text-slate-400 font-medium">Shows under main title in navbar. Defaults to &quot;An Authorized Study & Training Center&quot;.</p>
                      </div>
                    </div>

                    {/* Right Column: Single Logo Upload (automatically used for favicon) */}
                    <div className="lg:col-span-5 space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                        Institute Logo & Favicon
                      </Label>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
                        <ImageUpload
                          value={logoUrl}
                          onChange={(url) => {
                            setLogoUrl(url);
                            setFaviconUrl(url);
                          }}
                          label="Institute Logo"
                          folder={`${mediaFolderBase}/branding`}
                        />
                        <p className="text-[9px] text-slate-400 font-medium px-1 leading-snug">
                          * Your logo is automatically synced and used as both the website brand logo and the browser tab favicon.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Branding Sub-section */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Footer Branding & Description
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Configure the brand title, subtitle, and about message shown at the bottom of your franchise public site.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="footerBrandName" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                          Footer Title
                        </Label>
                        <Input
                          id="footerBrandName"
                          value={navbarConfig?.footerBrandName || ""}
                          onChange={(e) => setNavbarConfig({ ...navbarConfig, footerBrandName: e.target.value })}
                          placeholder={siteName || "e.g. RGYCSP Chandpara"}
                          className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                        />
                        <p className="text-[9px] text-slate-400 font-medium">Defaults to Institute Name if left empty.</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="footerTagline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                          Footer Subtitle
                        </Label>
                        <Input
                          id="footerTagline"
                          value={navbarConfig?.footerTagline || ""}
                          onChange={(e) => setNavbarConfig({ ...navbarConfig, footerTagline: e.target.value })}
                          placeholder="e.g. Official Institute Portal"
                          className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                        />
                        <p className="text-[9px] text-slate-400 font-medium">Small uppercase badge under footer title.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="brandDescription" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                        Footer Description
                      </Label>
                      <Textarea
                        id="brandDescription"
                        value={brandDescription || ""}
                        onChange={(e) => setBrandDescription(e.target.value)}
                        placeholder="e.g. Providing quality education and digital resources to learners. Your success is our mission."
                        rows={2}
                        className="text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium resize-none"
                      />
                      <p className="text-[9px] text-slate-400 font-medium">Brief mission or description displayed under the brand in your footer.</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Typography (Font Family)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { name: "Inter", font: "Inter", description: "Modern Sans" },
                        { name: "Plus Jakarta", font: "Plus Jakarta Sans", description: "Neo-Grotesque" },
                        { name: "Manrope", font: "Manrope", description: "Geometric" },
                        { name: "Outfit", font: "Outfit", description: "Modern & Clean" },
                        { name: "Space Grotesk", font: "Space Grotesk", description: "Tech-focused" },
                        { name: "Urbanist", font: "Urbanist", description: "Sophisticated" },
                        { name: "Montserrat", font: "Montserrat", description: "Geometric Bold" },
                        { name: "Playfair", font: "Playfair Display", description: "Elegant Serif" },
                      ].map((f) => (
                        <button
                          key={f.font}
                          type="button"
                          onClick={() => setFontFamily(f.font)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1 h-20",
                            fontFamily === f.font
                              ? "border-primary bg-primary/5 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <span className="text-xl font-bold" style={{ fontFamily: f.font }}>Aa</span>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{f.name}</span>
                            <span className="text-[8px] text-slate-400 font-medium">{f.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Primary Color</Label>
                      <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 h-11 w-full">
                        <Input type="color" value={primaryColor || "#4f46e5"} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer shrink-0 rounded-md" />
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold uppercase text-slate-900 dark:text-white">{primaryColor}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Main Brand Color</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Accent Color</Label>
                      <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 h-11 w-full">
                        <Input type="color" value={accentColor || "#4338ca"} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer shrink-0 rounded-md" />
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold uppercase text-slate-900 dark:text-white">{accentColor}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Interactive Highlight</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ThemeContrastIndicator primaryColor={primaryColor} accentColor={accentColor} />

                  <div className="pt-2 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-primary text-primary-foreground shadow-xs">
                      <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Identity"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="header-banner" className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
                <AccordionTrigger className="hover:no-underline py-3 px-3.5 sm:px-4">
                  <div className="flex items-center gap-3 text-left w-full justify-between pr-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">Page Header Banner</h3>
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                            pageHeaderBanner ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          )}>
                            {pageHeaderBanner ? "Custom Banner Active" : "Default Template"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Background banner shown across all public inner pages.</p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-3.5 sm:px-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {/* Single Unified Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Left: Direct File Upload */}
                    <div className="lg:col-span-6 space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                        Upload Banner File
                      </Label>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <ImageUpload
                          value={pageHeaderBanner || ""}
                          onChange={(url) => setPageHeaderBanner(url)}
                          label="Upload Banner (1920x600 px)"
                          folder={`${mediaFolderBase}/banners`}
                        />
                        <p className="text-[9px] text-slate-400 font-medium mt-1 px-1">
                          Recommended: 1920x600 px (JPG, PNG up to 2MB).
                        </p>
                      </div>
                    </div>

                    {/* Right: Direct Image URL & Preset Selection */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pageHeaderBannerUrl" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                            Or Image URL
                          </Label>
                          {pageHeaderBanner && (
                            <button
                              type="button"
                              onClick={() => setPageHeaderBanner("")}
                              className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Reset to default
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            id="pageHeaderBannerUrl"
                            value={pageHeaderBanner || ""}
                            onChange={(e) => setPageHeaderBanner(e.target.value.trim())}
                            placeholder="https://images.unsplash.com/... or paste any image URL"
                            className="h-8 sm:h-9 pl-8 pr-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                          />
                          {pageHeaderBanner && (
                            <button
                              type="button"
                              onClick={() => setPageHeaderBanner("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                              title="Clear URL"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium px-0.5">
                          Paste any direct web or CDN image link.
                        </p>
                      </div>

                      {/* Quick Academic Presets */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                          Academic Presets
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {HEADER_BANNER_PRESETS.map((preset) => {
                            const isSelected = pageHeaderBanner === preset.url;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => setPageHeaderBanner(preset.url)}
                                className={cn(
                                  "group relative flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer",
                                  isSelected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                )}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-10 h-8 rounded object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-[11px] text-slate-900 dark:text-white block truncate">{preset.name}</span>
                                  <span className="text-[8px] text-slate-400 block truncate">{preset.description}</span>
                                </div>
                                {isSelected && (
                                  <div className="shrink-0 text-primary">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Simulation Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">
                        Live Header Preview
                      </Label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Simulated inner page header
                      </span>
                    </div>

                    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-inner">
                      {/* Simulated Background */}
                      <div
                        className="absolute inset-0 z-0 transition-opacity duration-300"
                        style={{
                          backgroundImage: `url(${pageHeaderBanner || "https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg"})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: 0.35
                        }}
                      />
                      {/* Grid overlay simulation */}
                      <div
                        className="absolute inset-0 z-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/30 to-transparent z-10" />

                      {/* Foreground Mock Content */}
                      <div className="relative z-20 space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-xs text-[9px] font-bold uppercase tracking-widest text-white/70">
                          <span>Home</span>
                          <span className="text-white/30">&gt;</span>
                          <span className="text-primary font-bold">About Us</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-0.5 w-5 bg-primary" />
                            <span className="text-primary text-[9px] font-black uppercase tracking-[0.25em]">Official Page</span>
                          </div>
                          <h4 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                            About Our <span className="text-primary">Campus</span>
                          </h4>
                          <p className="text-xs text-white/60 font-medium max-w-md line-clamp-1">
                            Explore our history, vision, and modern facilities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">
                      Applies across all inner pages on save.
                    </p>
                    <Button
                      onClick={handleSaveGeneral}
                      disabled={isSaving}
                      className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-primary text-primary-foreground shadow-xs cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Header Banner"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact" className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
                <AccordionTrigger className="hover:no-underline py-3 px-3.5 sm:px-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">Contact Information</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Public contact details displayed on your landing page and footer.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-3.5 sm:px-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Support Email</Label>
                      <Input value={contactEmail || ""} onChange={(e) => setContactEmail(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Phone Number</Label>
                      <Input value={contactPhone || ""} onChange={(e) => setContactPhone(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">WhatsApp</Label>
                      <Input value={whatsapp || ""} onChange={(e) => setWhatsapp(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Campus Address</Label>
                      <Input value={address || ""} onChange={(e) => setAddress(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Google Maps Embed Link</Label>
                    <Input value={googleMapLink || ""} onChange={(e) => setGoogleMapLink(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    <p className="text-[10px] text-slate-400 font-medium ml-0.5">Paste the <span className="text-primary font-semibold">src</span> attribute from the Google Maps "Embed a map" iframe.</p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-primary text-primary-foreground shadow-xs">
                      <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Update Contact"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="social" className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
                <AccordionTrigger className="hover:no-underline py-3 px-3.5 sm:px-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">Social Media Links</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Connect your community social channels.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-3.5 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                    <div key={platform} className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5 capitalize">{platform}</Label>
                      <Input value={socialLinks[platform] || ""} onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })} placeholder={`https://${platform}.com/...`} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    </div>
                  ))}
                  <div className="md:col-span-2 pt-2 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-primary text-primary-foreground shadow-xs">
                      <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Links"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="navigation" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">Navigation Menu</h2>
              <p className="text-xs text-slate-500 font-medium">Control which pages and links are displayed on your public website navbar.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {navigation.map((nav: any, index: number) => (
                <div key={nav.id || index} className={cn(
                  "group flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all shadow-xs gap-2.5",
                  nav.isActive
                    ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                    : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60"
                )}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                      nav.isActive ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 group/edit h-6">
                        {editingNavIndex === index ? (
                          <Input
                            autoFocus
                            value={nav.name || ""}
                            onChange={(e) => {
                              const newNav = [...navigation];
                              newNav[index] = { ...newNav[index], name: e.target.value };
                              setNavigation(newNav);
                            }}
                            onBlur={() => setEditingNavIndex(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingNavIndex(null); }}
                            className="h-6 font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 text-xs rounded-md w-full max-w-[180px]"
                          />
                        ) : (
                          <>
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{nav.name || "Unnamed"}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingNavIndex(index)}
                              className="h-5 w-5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 group/edit h-5">
                        <ExternalLink className="w-2.5 h-2.5 text-primary shrink-0" />
                        {editingLinkIndex === index ? (
                          <Input
                            autoFocus
                            value={nav.href || ""}
                            onChange={(e) => {
                              const newNav = [...navigation];
                              newNav[index] = { ...newNav[index], href: e.target.value };
                              setNavigation(newNav);
                            }}
                            onBlur={() => setEditingLinkIndex(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingLinkIndex(null); }}
                            className="h-5 font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1 text-[10px] text-primary rounded max-w-[180px]"
                          />
                        ) : (
                          <>
                            <span className="font-mono text-[10px] text-slate-500 truncate">{nav.href || "No link"}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingLinkIndex(index)}
                              className="h-4 w-4 opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md shrink-0"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 sm:mt-0 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{nav.isActive ? "Active" : "Hidden"}</span>
                      <Switch
                        checked={!!nav.isActive}
                        disabled={nav.name === "Home"}
                        onCheckedChange={(val) => {
                          const newNav = [...navigation];
                          newNav[index] = { ...newNav[index], isActive: val };
                          setNavigation(newNav);
                        }}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => {
                        const newNav = [...navigation];
                        [newNav[index - 1], newNav[index]] = [newNav[index], newNav[index - 1]];
                        setNavigation(newNav);
                      }} className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronUp className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" disabled={index === navigation.length - 1} onClick={() => {
                        const newNav = [...navigation];
                        [newNav[index + 1], newNav[index]] = [newNav[index], newNav[index + 1]];
                        setNavigation(newNav);
                      }} className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronDown className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setNavigation(navigation.filter((_: any, i: number) => i !== index));
                      }} className="h-7 w-7 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={() => {
                setNavigation([...navigation, { name: "New Link", href: "#", id: Math.random().toString(), isActive: true }]);
              }} className="h-9 border-dashed border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full">
                <Plus className="h-4 w-4" />
                <span>Add Menu Link</span>
              </Button>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-primary text-primary-foreground shadow-xs">
                  <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Update Menu"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <EventsManagement
              workspaceId={settings.workspaceId}
              events={settings.workspace?.events || []}
              mediaFolderBase={mediaFolderBase}
            />
          </TabsContent>

          <TabsContent value="notices" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">Notice Board</h2>
              <p className="text-xs text-slate-500 font-medium">Publish important announcements and circulars on your website.</p>
            </div>

            {(() => {
              const aboutSection = settings.sections?.find((s: any) => s.type === 'about');
              if (!aboutSection) return (
                <div className="p-10 border border-dashed rounded-xl text-center space-y-2 bg-slate-50 dark:bg-slate-900/50">
                  <Bell className="w-8 h-8 text-slate-400 mx-auto opacity-40" />
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Section Not Found</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("sections")} className="rounded-lg h-8 text-xs font-semibold">Go to Sections</Button>
                </div>
              );

              return (
                <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">Live Notice Board</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Updates shown on your landing page notice ticker</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{aboutSection.isActive ? "Online" : "Offline"}</span>
                      <Switch
                        checked={aboutSection.isActive}
                        onCheckedChange={(val) => updateLandingSection(aboutSection.id, { ...aboutSection, isActive: val })}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  <AboutNoticeContentEditor
                    content={aboutSection.content || {}}
                    setContent={async (newContent: any) => {
                      await updateLandingSection(aboutSection.id, { ...aboutSection, content: newContent });
                      toast.success("Notice board updated");
                    }}
                    mediaFolderBase={mediaFolderBase}
                  />
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="gallery" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <GalleryManagement
              workspaceId={settings.workspaceId}
              galleryItems={settings.workspace?.galleryItems || []}
              mediaFolderBase={mediaFolderBase}
            />
          </TabsContent>

          <TabsContent value="legal" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <div className="flex flex-col gap-0.5 mb-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">Legal & Help Management</h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Manage your official policy documents and student support center.
              </p>
            </div>
            <LegalContentEditor settings={settings} />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">Attendance Configurations</h2>
              <p className="text-xs text-slate-500 font-medium">Configure automated low attendance alerts and thresholds.</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Automated Low Attendance Alerts</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Send notifications to students when their attendance drops below the threshold.</p>
                </div>
                <Switch
                  checked={attendanceConfig.enableAlerts}
                  onCheckedChange={(val) => setAttendanceConfig({ ...attendanceConfig, enableAlerts: val })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {attendanceConfig.enableAlerts && (
                <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Alert Threshold (%)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={attendanceConfig.threshold || 75}
                      onChange={(e) => setAttendanceConfig({ ...attendanceConfig, threshold: parseInt(e.target.value) || 75 })}
                      className="h-8 sm:h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg px-3 font-bold text-xs w-24"
                    />
                    <span className="font-medium text-xs text-slate-500">Alert triggers when student attendance drops below this percentage.</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
                <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-primary text-primary-foreground shadow-xs">
                  <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="mt-0 w-full space-y-4 focus-visible:outline-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">Landing Page Sections</h2>
                <p className="text-xs text-slate-500 font-medium">Toggle visibility and customize content of specific homepage sections.</p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                <div className="relative flex-1 sm:w-[220px] group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    value={sectionSearch || ""}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder="Filter sections..."
                    className="h-8 sm:h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const types = ['hero', 'quick-links', 'about', 'counters', 'courses', 'why-choose-us', 'achievements', 'partners', 'events', 'testimonials', 'faq', 'contact'];
                    const res = await syncAllSections(settings.id, types);
                    if (res.success) {
                      toast.success(res.created ? `Initialized ${res.created} new sections!` : "Sections already synced.");
                      if (res.created) window.location.reload();
                    }
                  }}
                  className="h-8 sm:h-9 px-3 gap-1.5 rounded-lg border-primary/20 text-primary hover:bg-primary/5 font-semibold text-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" /> Sync Content
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredSections.length > 0 ? (
                filteredSections.map((section: any) => (
                  <SectionEditor key={section.id} section={section} settings={settings} mediaFolderBase={mediaFolderBase} />
                ))
              ) : (
                <div className="p-12 border border-dashed rounded-xl text-center space-y-2 bg-slate-50 dark:bg-slate-900/50">
                  <Search className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="font-bold text-slate-600 dark:text-slate-400 text-xs">No sections matching "{sectionSearch}"</p>
                  <p className="text-[11px] text-slate-400">Try clearing your search query.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function SectionEditor({ section, settings, mediaFolderBase }: { section: any, settings: any, mediaFolderBase: string }) {
  const [isActive, setIsActive] = useState(section.isActive);
  const [title, setTitle] = useState(section.title);
  const [subtitle, setSubtitle] = useState(section.subtitle);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(section.content || {});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    const result = await updateLandingSection(section.id, {
      ...section,
      title,
      subtitle,
      isActive,
      content,
    });
    setIsSaving(false);
    if (result.success) toast.success(`${section.type} updated`);
  };

  return (
    <div className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${isActive ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs' : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-70'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Layout className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="capitalize font-semibold text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">{section.type.replace("-", " ")}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{isActive ? 'Live on Site' : 'Hidden from Site'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg font-semibold text-xs gap-1.5 transition-all ${isExpanded ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'}`}
          >
            <Settings2 className="h-3.5 w-3.5" /> {isExpanded ? 'Close' : 'Configure'}
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <Switch
            checked={isActive}
            onCheckedChange={(val) => {
              setIsActive(val);
              updateLandingSection(section.id, { ...section, isActive: val });
            }}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Heading</Label>
              <Input value={title || ""} onChange={(e) => setTitle(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subheading / Tagline</Label>
              <Input value={subtitle || ""} onChange={(e) => setSubtitle(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" />
            </div>
          </div>

          <div className="bg-slate-50/60 dark:bg-slate-950/40 p-3.5 sm:p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
            {section.type === 'hero' && <HeroContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'quick-links' && <QuickLinksContentEditor content={content} setContent={setContent} />}
            {section.type === 'about' && <AboutNoticeContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'counters' && <CountersContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'courses' && <CoursesContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'events' && <EventsContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'why-choose-us' && <WhyChooseUsContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'achievements' && <AchievementsContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'partners' && <PartnersContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'testimonials' && <ListContentEditor title="Testimonial" content={content} setContent={setContent} itemFields={['name', 'role', 'text', 'avatar']} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'faq' && <FaqContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
            {section.type === 'contact' && <ContactContentEditor content={content} setContent={setContent} settings={settings} mediaFolderBase={mediaFolderBase} />}
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleUpdate} disabled={isSaving} className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 border-none">
              <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Commit Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Specialized Content Editors ---

function HeroContentEditor({ content, setContent, mediaFolderBase }: any) {
  const slides = content.slides || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hero Slides ({slides.length})</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({
          ...content, slides: [...slides, {
            title: "New Slide",
            tagline: "Empowering Future",
            description: "Description here",
            banner: "",
            offerImage: "",
            btn1Text: "Get Started",
            btn1Link: "/login",
            btn2Text: "Learn More",
            btn2Link: "/about"
          }]
        })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add Slide
        </Button>
      </div>
      <div className="space-y-3">
        {slides.map((slide: any, idx: number) => (
          <div key={idx} className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative group">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all" onClick={() => setContent({ ...content, slides: slides.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tagline (Badge)</Label>
                  <Input value={slide.tagline || ""} onChange={(e) => {
                    const next = [...slides];
                    next[idx].tagline = e.target.value;
                    setContent({ ...content, slides: next });
                  }} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hero Title</Label>
                  <Input value={slide.title || ""} onChange={(e) => {
                    const next = [...slides];
                    next[idx].title = e.target.value;
                    setContent({ ...content, slides: next });
                  }} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</Label>
                  <Textarea value={slide.description || ""} onChange={(e) => {
                    const next = [...slides];
                    next[idx].description = e.target.value;
                    setContent({ ...content, slides: next });
                  }} className="min-h-[60px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Button</Label>
                    <Input value={slide.btn1Text || ""} onChange={(e) => {
                      const next = [...slides];
                      next[idx].btn1Text = e.target.value;
                      setContent({ ...content, slides: next });
                    }} placeholder="Text" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    <Input value={slide.btn1Link || ""} onChange={(e) => {
                      const next = [...slides];
                      next[idx].btn1Link = e.target.value;
                      setContent({ ...content, slides: next });
                    }} placeholder="Link (/courses)" className="h-8 text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary Button</Label>
                    <Input value={slide.btn2Text || ""} onChange={(e) => {
                      const next = [...slides];
                      next[idx].btn2Text = e.target.value;
                      setContent({ ...content, slides: next });
                    }} placeholder="Text" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    <Input value={slide.btn2Link || ""} onChange={(e) => {
                      const next = [...slides];
                      next[idx].btn2Link = e.target.value;
                      setContent({ ...content, slides: next });
                    }} placeholder="Link (/about)" className="h-8 text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Background Banner</Label>
                  <ImageUpload value={slide.banner || slide.src} onChange={(url) => {
                    const next = [...slides];
                    next[idx].banner = url;
                    next[idx].src = url;
                    setContent({ ...content, slides: next });
                  }} folder={`${mediaFolderBase}/hero`} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Right Side Promo Graphic</Label>
                  <ImageUpload value={slide.offerImage} onChange={(url) => {
                    const next = [...slides];
                    next[idx].offerImage = url;
                    setContent({ ...content, slides: next });
                  }} folder={`${mediaFolderBase}/hero`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutNoticeContentEditor({ content, setContent, mediaFolderBase }: any) {
  const notices = content.notices || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CTA Button Text</Label>
          <Input
            value={content.btnText || ""}
            onChange={(e) => setContent({ ...content, btnText: e.target.value })}
            placeholder="e.g. Read More"
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CTA Button Link</Label>
          <Input
            value={content.btnLink || ""}
            onChange={(e) => setContent({ ...content, btnLink: e.target.value })}
            placeholder="e.g. /about"
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">About Full Description</Label>
        <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[90px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" placeholder="Detailed about description..." />
      </div>

      <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notices List ({notices.length})</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, notices: [...notices, { title: "New Notice", date: new Date().toLocaleDateString(), link: "#" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Post Notice
          </Button>
        </div>
        <div className="space-y-2">
          {notices.map((notice: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 group">
              <Input value={notice.title || ""} onChange={(e) => {
                const next = [...notices];
                next[idx].title = e.target.value;
                setContent({ ...content, notices: next });
              }} placeholder="Notice title..." className="flex-1 h-8 text-xs rounded-md bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" />
              <Input value={notice.date || ""} onChange={(e) => {
                const next = [...notices];
                next[idx].date = e.target.value;
                setContent({ ...content, notices: next });
              }} placeholder="Date" className="w-28 sm:w-32 h-8 text-[11px] rounded-md bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium text-center" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-md transition-colors" onClick={() => setContent({ ...content, notices: notices.filter((_: any, i: number) => i !== idx) })}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CountersContentEditor({ content, setContent, mediaFolderBase }: any) {
  const stats = content.stats || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Counters ({stats.length})</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, stats: [...stats, { label: "Students", value: "1000", icon: "Users" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add Counter
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 relative flex gap-2 items-center">
            <select value={stat.icon || "Users"} onChange={(e) => {
              const next = [...stats];
              next[idx].icon = e.target.value;
              setContent({ ...content, stats: next });
            }} className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none">
              <option value="Users">Users</option>
              <option value="BookOpen">Books</option>
              <option value="Clock">Clock</option>
              <option value="GraduationCap">Cap</option>
              <option value="Award">Award</option>
              <option value="Trophy">Trophy</option>
              <option value="Star">Star</option>
              <option value="Zap">Zap</option>
            </select>
            <Input value={stat.label || ""} onChange={(e) => {
              const next = [...stats];
              next[idx].label = e.target.value;
              setContent({ ...content, stats: next });
            }} placeholder="Label" className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
            <Input value={stat.value || ""} onChange={(e) => {
              const next = [...stats];
              next[idx].value = e.target.value;
              setContent({ ...content, stats: next });
            }} placeholder="Value" className="w-24 h-8 text-xs font-bold text-primary text-center rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg shrink-0" onClick={() => setContent({ ...content, stats: stats.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoursesContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section Description</Label>
        <Textarea
          value={content.description || ""}
          onChange={(e) => setContent({ ...content, description: e.target.value })}
          placeholder="e.g. Unlock your potential with our meticulously crafted curriculum..."
          className="min-h-[80px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal"
        />
        <p className="text-[10px] text-slate-400 font-normal">
          This description appears at the top of the Courses section on your home page.
        </p>
      </div>

      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
          <BookOpenCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          The courses themselves are managed from the main <span className="font-bold">Courses</span> tab in the sidebar.
        </p>
      </div>
    </div>
  );
}

function EventsContentEditor({ content, setContent, mediaFolderBase }: any) {
  const events = content.events || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Events List ({events.length})</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, events: [...events, { title: "New Event", date: "01 Jan, 2026", time: "10:00 AM", location: "Campus", image: "" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add Event
        </Button>
      </div>
      <div className="space-y-3">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative group">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all" onClick={() => setContent({ ...content, events: events.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Title</Label>
                  <Input value={event.title || ""} onChange={(e) => {
                    const next = [...events];
                    next[idx].title = e.target.value;
                    setContent({ ...content, events: next });
                  }} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</Label>
                    <Input value={event.date || ""} onChange={(e) => {
                      const next = [...events];
                      next[idx].date = e.target.value;
                      setContent({ ...content, events: next });
                    }} placeholder="15 May, 2026" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</Label>
                    <Input value={event.time || ""} onChange={(e) => {
                      const next = [...events];
                      next[idx].time = e.target.value;
                      setContent({ ...content, events: next });
                    }} placeholder="10:00 AM" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</Label>
                  <Input value={event.location || ""} onChange={(e) => {
                    const next = [...events];
                    next[idx].location = e.target.value;
                    setContent({ ...content, events: next });
                  }} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Image</Label>
                <ImageUpload value={event.image} onChange={(url) => {
                  const next = [...events];
                  next[idx].image = url;
                  setContent({ ...content, events: next });
                }} folder={`${mediaFolderBase}/events`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyChooseUsContentEditor({ content, setContent, mediaFolderBase }: any) {
  const items = content.features || content.items || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Feature Graphic</Label>
          <ImageUpload
            value={content.image || ""}
            onChange={(url) => setContent({ ...content, image: url })}
            folder={`${mediaFolderBase}/why-choose-us`}
          />
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">Floating Badge Card</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Icon</Label>
              <select
                value={content.floatingCard?.icon || "Users"}
                onChange={(e) => setContent({ ...content, floatingCard: { ...(content.floatingCard || {}), icon: e.target.value } })}
                className="w-full h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs font-medium"
              >
                <option value="Users">Users</option>
                <option value="Trophy">Trophy</option>
                <option value="Star">Star</option>
                <option value="GraduationCap">Education</option>
                <option value="Rocket">Launch</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Value</Label>
              <Input
                value={content.floatingCard?.value || ""}
                onChange={(e) => setContent({ ...content, floatingCard: { ...(content.floatingCard || {}), value: e.target.value } })}
                placeholder="10K+"
                className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold text-primary"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Label</Label>
            <Input
              value={content.floatingCard?.label || ""}
              onChange={(e) => setContent({ ...content, floatingCard: { ...(content.floatingCard || {}), label: e.target.value } })}
              placeholder="Happy Students"
              className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section Description</Label>
        <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[70px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
      </div>

      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feature List ({items.length})</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, features: [...items, { title: "New Feature", description: "", icon: "Zap" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Add Feature
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs relative group">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500 rounded-md" onClick={() => setContent({ ...content, features: items.filter((_: any, i: number) => i !== idx) })}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Icon</Label>
                  <select
                    value={item.icon || "Zap"}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].icon = e.target.value;
                      setContent({ ...content, features: next });
                    }}
                    className="w-full h-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs font-medium"
                  >
                    <option value="Zap">Zap (Fast)</option>
                    <option value="ShieldCheck">Shield (Secure)</option>
                    <option value="Cpu">CPU (Tech)</option>
                    <option value="Globe">Globe (Global)</option>
                    <option value="Rocket">Rocket (Growth)</option>
                    <option value="Brain">Brain (Smart)</option>
                    <option value="GraduationCap">Education</option>
                    <option value="Users">Users</option>
                    <option value="Layout">Layout</option>
                  </select>
                </div>
                <Input value={item.title || ""} onChange={(e) => {
                  const next = [...items];
                  next[idx].title = e.target.value;
                  setContent({ ...content, features: next });
                }} placeholder="Feature Title" className="h-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                <Textarea value={item.description || ""} onChange={(e) => {
                  const next = [...items];
                  next[idx].description = e.target.value;
                  setContent({ ...content, features: next });
                }} placeholder="Feature Description" className="min-h-[50px] text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementsContentEditor({ content, setContent, mediaFolderBase }: any) {
  const stats = content.stats || [];
  const gallery = content.items || [];
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section Description</Label>
        <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} placeholder="Describe your institute's pride and achievements..." className="min-h-[70px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Achievement Stats ({stats.length})</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, stats: [...stats, { label: "Success", value: "100", suffix: "%", icon: "Trophy" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Add Stat
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {stats.map((stat: any, idx: number) => (
            <div key={idx} className="group p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 relative flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => setContent({ ...content, stats: stats.filter((_: any, i: number) => i !== idx) })}>
                <X className="w-3 h-3" />
              </Button>

              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <select value={stat.icon || "Trophy"} onChange={(e) => {
                  const next = [...stats];
                  next[idx].icon = e.target.value;
                  setContent({ ...content, stats: next });
                }} className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none shrink-0">
                  <option value="Trophy">Trophy</option>
                  <option value="Star">Star</option>
                  <option value="GraduationCap">Cap</option>
                  <option value="Award">Award</option>
                  <option value="Users">Users</option>
                  <option value="BookOpen">Book</option>
                </select>

                <Input value={stat.label || ""} onChange={(e) => {
                  const next = [...stats];
                  next[idx].label = e.target.value;
                  setContent({ ...content, stats: next });
                }} placeholder="Label (e.g. Students)" className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-24">
                  <Input value={stat.value || ""} onChange={(e) => {
                    const next = [...stats];
                    next[idx].value = e.target.value;
                    setContent({ ...content, stats: next });
                  }} placeholder="Value" className="h-8 text-center text-xs font-bold text-primary rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative w-16">
                  <Input value={stat.suffix || ""} onChange={(e) => {
                    const next = [...stats];
                    next[idx].suffix = e.target.value;
                    setContent({ ...content, stats: next });
                  }} placeholder="Suffix" className="h-8 text-center text-xs font-medium text-slate-500 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pride Gallery ({gallery.length})</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, items: [...gallery, { title: "Moment", description: "", src: "" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Add Image
          </Button>
        </div>
        <div className="space-y-2.5">
          {gallery.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 relative group">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500 rounded-md" onClick={() => setContent({ ...content, items: gallery.filter((_: any, i: number) => i !== idx) })}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Input value={item.title || ""} onChange={(e) => {
                    const next = [...gallery];
                    next[idx].title = e.target.value;
                    setContent({ ...content, items: next });
                  }} placeholder="Image Title" className="h-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                  <Textarea value={item.description || ""} onChange={(e) => {
                    const next = [...gallery];
                    next[idx].description = e.target.value;
                    setContent({ ...content, items: next });
                  }} placeholder="Description" className="min-h-[50px] text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
                </div>
                <ImageUpload value={item.src} onChange={(url) => {
                  const next = [...gallery];
                  next[idx].src = url;
                  setContent({ ...content, items: next });
                }} folder={`${mediaFolderBase}/achievements`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnersContentEditor({ content, setContent, mediaFolderBase }: any) {
  const logos = content.logos || [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Partner Logos ({logos.length})</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, logos: [...logos, ""] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add Logo
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {logos.map((logo: string, idx: number) => (
          <div key={idx} className="space-y-1 relative group">
            <ImageUpload value={logo} onChange={(url) => {
              const next = [...logos];
              next[idx] = url;
              setContent({ ...content, logos: next });
            }} folder={`${mediaFolderBase}/partners`} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md z-50 flex items-center justify-center transition-all hover:scale-105 border-2 border-white dark:border-slate-900"
              onClick={() => setContent({ ...content, logos: logos.filter((_: any, i: number) => i !== idx) })}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListContentEditor({ title, content, setContent, itemFields, mediaFolderBase }: any) {
  const items = content.items || [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title} List ({items.length})</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, items: [...items, {}] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add {title}
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs relative group">
            <Button variant="ghost" size="icon" className="absolute top-2.5 right-2.5 h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg transition-colors" onClick={() => setContent({ ...content, items: items.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                {itemFields.filter((f: string) => f !== 'avatar' && f !== 'image').map((field: string) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{field}</Label>
                    {field === 'text' || field === 'description' ? (
                      <Textarea value={item[field] || ""} onChange={(e) => {
                        const next = [...items];
                        next[idx][field] = e.target.value;
                        setContent({ ...content, items: next });
                      }} className="min-h-[60px] text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
                    ) : (
                      <Input value={item[field] || ""} onChange={(e) => {
                        const next = [...items];
                        next[idx][field] = e.target.value;
                        setContent({ ...content, items: next });
                      }} className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                    )}
                  </div>
                ))}
              </div>
              {(itemFields.includes('avatar') || itemFields.includes('image')) && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media</Label>
                  <ImageUpload value={item.avatar || item.image} onChange={(url) => {
                    const next = [...items];
                    if (itemFields.includes('avatar')) next[idx].avatar = url;
                    else next[idx].image = url;
                    setContent({ ...content, items: next });
                  }} folder={`${mediaFolderBase}/items`} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqContentEditor({ content, setContent, mediaFolderBase }: any) {
  const faqs = content.faqs || [];
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section Description</Label>
        <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} placeholder="Describe your FAQ section..." className="min-h-[70px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Frequently Asked Questions ({faqs.length})</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, faqs: [...faqs, { question: "New Question", answer: "" }] })} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Add FAQ
          </Button>
        </div>
        <div className="space-y-2.5">
          {faqs.map((faq: any, idx: number) => (
            <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 relative group">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500 rounded-md transition-opacity" onClick={() => setContent({ ...content, faqs: faqs.filter((_: any, i: number) => i !== idx) })}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <div className="space-y-2">
                <Input value={faq.question || ""} onChange={(e) => {
                  const next = [...faqs];
                  next[idx].question = e.target.value;
                  setContent({ ...content, faqs: next });
                }} placeholder="Question" className="h-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                <Textarea value={faq.answer || ""} onChange={(e) => {
                  const next = [...faqs];
                  next[idx].answer = e.target.value;
                  setContent({ ...content, faqs: next });
                }} placeholder="Answer" className="min-h-[50px] text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Call to Action Banner</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CTA Title</Label>
            <Input value={content.ctaTitle || ""} onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })} placeholder="Still have questions?" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CTA Description</Label>
            <Input value={content.ctaDesc || ""} onChange={(e) => setContent({ ...content, ctaDesc: e.target.value })} placeholder="We're here to help you..." className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-normal" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Button Text</Label>
            <Input value={content.ctaButtonText || ""} onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })} placeholder="Chat with Admissions" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold text-primary" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Button Link</Label>
            <Input value={content.ctaButtonLink || ""} onChange={(e) => setContent({ ...content, ctaButtonLink: e.target.value })} placeholder="/contact" className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactContentEditor({ content, setContent, settings, mediaFolderBase }: any) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Social Visibility</span>
            <p className="text-[10px] text-slate-500 font-normal">Show social links in contact section.</p>
          </div>
          <Switch checked={content.showSocials !== false} onCheckedChange={(val) => setContent({ ...content, showSocials: val })} />
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Tagline</span>
          <Input value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Office Hours</span>
          <Input value={content.officeHours || ""} onChange={(e) => setContent({ ...content, officeHours: e.target.value })} placeholder="Mon - Sat: 9:00 AM - 6:00 PM" className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inquiry Form Title</span>
          <Input value={content.formTitle || ""} onChange={(e) => setContent({ ...content, formTitle: e.target.value })} placeholder="Admissions Inquiry" className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
        </div>
      </div>

      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-center">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Contact details are managed in the <span className="font-bold">Branding</span> tab to maintain consistency across the site.</p>
      </div>
    </div>
  );
}

function EventsManagement({ workspaceId, events, mediaFolderBase }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  const filteredEvents = events.filter((e: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return e.title.toLowerCase().includes(searchLower) ||
      (e.category && e.category.toLowerCase().includes(searchLower));
  });

  const handleSave = async (formData: any) => {
    setIsProcessing(true);
    try {
      if (editingEvent) {
        const res = await updateEvent(editingEvent.id, formData);
        if (res.success) toast.success("Event updated successfully");
        else toast.error(res.error || "Update failed");
      } else {
        const res = await createEvent({ ...formData, workspaceId });
        if (res.success) toast.success("Event created successfully");
        else toast.error(res.error || "Creation failed");
      }
      setIsAdding(false);
      setEditingEvent(null);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsProcessing(true);
    try {
      const res = await deleteEvent(eventToDelete.id);
      if (res.success) toast.success("Event deleted");
      else toast.error(res.error || "Delete failed");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsProcessing(false);
      setEventToDelete(null);
    }
  };

  if (isAdding || editingEvent) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{editingEvent ? "Edit Event" : "Create New Event"}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingEvent(null); }} className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <EventForm initialData={editingEvent} onSave={handleSave} isProcessing={isProcessing} mediaFolderBase={mediaFolderBase} />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <Input
            placeholder="Search events by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 sm:h-9 text-xs rounded-lg border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50"
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg font-semibold text-xs gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Add New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredEvents.map((event: any) => (
          <div key={event.id} className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                  {event.isFeatured && (
                    <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">Featured</span>
                  )}
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs text-white", event.isActive ? "bg-emerald-600" : "bg-slate-600")}>
                    {event.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="p-3 sm:p-3.5 space-y-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{event.category || "General Event"}</span>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{event.title}</h4>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {new Date(event.date).toLocaleDateString('en-GB')}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {event.location || "Online"}</div>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 pt-0 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)} className="flex-1 h-7 sm:h-8 rounded-lg text-xs font-semibold hover:bg-primary/5 hover:text-primary border-slate-200 dark:border-slate-700 transition-colors">Edit</Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(event)} className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">No events found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your search query or add a new event.</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        title="Delete Event"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{eventToDelete?.title}</strong>? This action cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive={true}
      />
    </div>
  );
}

function GalleryManagement({ workspaceId, galleryItems, mediaFolderBase }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any>(null);

  const filteredItems = galleryItems.filter((e: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (e.title?.toLowerCase().includes(searchLower)) ||
      (e.category?.toLowerCase().includes(searchLower));
  });

  const handleSave = async (formData: any) => {
    setIsProcessing(true);

    let res;
    if (editingItem) {
      res = await updateGalleryItem(editingItem.id, formData);
    } else {
      res = await createGalleryItem(workspaceId, formData);
    }

    if (res.success) {
      toast.success(editingItem ? "Image updated" : "Image added to gallery");
      setEditingItem(null);
      setIsAdding(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Operation failed");
    }
    setIsProcessing(false);
  };

  const handleDeleteClick = (item: any) => {
    setImageToDelete(item);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    const res = await deleteGalleryItem(imageToDelete.id);
    if (res.success) {
      toast.success("Image removed from gallery");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to delete");
    }
    setImageToDelete(null);
  };

  if (isAdding || editingItem) {
    return (
      <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{editingItem ? "Edit Gallery Item" : "Add to Gallery"}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <GalleryForm initialData={editingItem} onSave={handleSave} isProcessing={isProcessing} mediaFolderBase={mediaFolderBase} />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <Input
            placeholder="Search gallery by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 sm:h-9 text-xs rounded-lg border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50"
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg font-semibold text-xs gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Add Gallery Image
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredItems.map((item: any) => (
          <div key={item.id} className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/40 transition-all shadow-xs">
            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-xs text-white", item.isActive ? "bg-emerald-600" : "bg-slate-600")}>
                  {item.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                <div className="flex items-center gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => setEditingItem(item)} className="flex-1 h-7 text-xs font-semibold rounded-md">Edit</Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item)} className="h-7 w-7 rounded-md">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-2.5 space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{item.category || "General"}</span>
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title || "Untitled Image"}</h4>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Gallery is empty</p>
            <p className="text-[11px] text-slate-400">Upload your institute photos to showcase here.</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        title="Delete Image"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{imageToDelete?.title || "Untitled Image"}</strong> from the gallery? This action cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive={true}
      />
    </div>
  );
}

function GalleryForm({ initialData, onSave, isProcessing, mediaFolderBase }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "",
    image: initialData?.image || "",
    isActive: initialData?.isActive !== false,
  });

  useEffect(() => {
    setFormData({
      title: initialData?.title || "",
      category: initialData?.category || "",
      image: initialData?.image || "",
      isActive: initialData?.isActive !== false,
    });
  }, [initialData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image Title (Optional)</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Convocation 2026" className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Topic / Category</Label>
            <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Campus, Sports, Event, Classroom" className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active / Visible on Site</Label>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <p className="text-xs text-slate-400 font-normal">Provide a clear category for better filtering.</p>
          <Button onClick={() => onSave(formData)} disabled={isProcessing || !formData.image} className="h-8 sm:h-9 px-4 rounded-lg font-semibold text-xs shadow-xs">
            {isProcessing ? "Saving..." : initialData ? "Update Item" : "Add to Gallery"}
          </Button>
        </div>
      </div>

      <div>
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-center">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upload Photo</Label>
          <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} label="Gallery Image" folder={`${mediaFolderBase}/gallery`} />
          <p className="text-[10px] text-slate-400 font-normal">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
        </div>
      </div>
    </div>
  );
}

function EventForm({ initialData, onSave, isProcessing, mediaFolderBase }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
    time: initialData?.time || "",
    location: initialData?.location || "",
    category: initialData?.category || "",
    image: initialData?.image || "",
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive !== false,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Annual Science Fair 2026" className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell us more about the event..." className="min-h-[90px] text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none font-normal" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category / Topic</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Workshop, Seminar, Cultural" className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Main Hall, Computer Lab 1, Online" className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={formData.isFeatured} onCheckedChange={(val) => setFormData({ ...formData, isFeatured: val })} />
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active</Label>
            </div>
          </div>
          <Button onClick={() => onSave(formData)} disabled={isProcessing || !formData.title || !formData.date} className="h-8 sm:h-9 px-4 rounded-lg font-semibold text-xs shadow-xs">
            {isProcessing ? "Saving..." : initialData ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</Label>
            <Input value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="e.g., 10:00 AM - 1:00 PM" className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-center">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Banner Image</Label>
          <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} label="Event Banner" folder={`${mediaFolderBase}/events`} />
          <p className="text-[10px] text-slate-400 font-normal italic">Recommended: 16:9 aspect ratio</p>
        </div>
      </div>
    </div>
  );
}

function LegalContentEditor({ settings }: { settings: any }) {
  const [activeLegal, setActiveLegal] = useState<string>("help-center");
  const [isProcessing, setIsProcessing] = useState(false);

  const legalPages = [
    { type: "help-center", label: "Help Center", icon: HelpCircle },
    { type: "legal-privacy", label: "Privacy Policy", icon: ShieldCheck },
    { type: "legal-terms", label: "Terms of Service", icon: FileText },
    { type: "legal-cookie", label: "Cookie Policy", icon: Cpu }
  ];

  const currentSection = settings.sections?.find((s: any) => s.type === activeLegal);

  const [formData, setFormData] = useState<any>({
    title: "",
    subtitle: "",
    text: "",
    categories: [],
    cta: {
      ticketText: "Open a Ticket",
      ticketLink: "#",
      emailText: "Email Support",
      emailLink: ""
    }
  });

  useEffect(() => {
    const rawContent = currentSection?.content as any;
    let initialText = rawContent?.text || "";

    if (!initialText && rawContent?.html) {
      initialText = rawContent.html.replace(/<[^>]*>?/gm, '');
    }

    setFormData({
      title: currentSection?.title || "",
      subtitle: currentSection?.subtitle || "",
      text: initialText,
      categories: rawContent?.categories || [],
      cta: rawContent?.cta || {
        ticketText: "Open a Ticket",
        ticketLink: "#",
        emailText: "Email Support",
        emailLink: ""
      }
    });
  }, [activeLegal, currentSection]);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      let sectionId = currentSection?.id;

      if (!sectionId) {
        const syncRes = await syncAllSections(settings.id, [activeLegal], true);
        if (syncRes.success) {
          toast.info("Initializing section... please try saving again in a moment.");
          window.location.reload();
          return;
        } else {
          toast.error("Failed to initialize section. Please use 'Sync Content' in the Sections tab.");
          return;
        }
      }

      const result = await updateLandingSection(sectionId, {
        title: formData.title,
        subtitle: formData.subtitle,
        content: activeLegal === 'help-center'
          ? { text: formData.text, categories: formData.categories, cta: formData.cta }
          : { text: formData.text },
        isActive: true
      });

      if (result.success) {
        toast.success(`${legalPages.find(p => p.type === activeLegal)?.label} updated`);
        window.location.reload();
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { title: "", desc: "", icon: "HelpCircle", link: "#" }]
    });
  };

  const removeCategory = (index: number) => {
    const newCats = [...formData.categories];
    newCats.splice(index, 1);
    setFormData({ ...formData, categories: newCats });
  };

  const updateCategory = (index: number, field: string, value: string) => {
    const newCats = [...formData.categories];
    newCats[index] = { ...newCats[index], [field]: value };
    setFormData({ ...formData, categories: newCats });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {legalPages.map((page) => (
          <button
            key={page.type}
            onClick={() => setActiveLegal(page.type)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0",
              activeLegal === page.type
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <page.icon className="w-3.5 h-3.5" />
            {page.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Page Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`e.g., ${legalPages.find(p => p.type === activeLegal)?.label}`}
                className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtitle / Subheader</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., How can we assist you today?"
                className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            {activeLegal === 'help-center' && (
              <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Help Categories</h4>
                  <Button onClick={addCategory} variant="outline" size="sm" className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {formData.categories.map((cat: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCategory(i)}
                        className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Card Title</Label>
                          <Input value={cat.title} onChange={(e) => updateCategory(i, "title", e.target.value)} placeholder="e.g., Getting Started" className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Icon Name (Lucide)</Label>
                          <Input value={cat.icon} onChange={(e) => updateCategory(i, "icon", e.target.value)} placeholder="e.g., BookOpen, Mail, HelpCircle" className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</Label>
                        <Input value={cat.desc} onChange={(e) => updateCategory(i, "desc", e.target.value)} placeholder="Short description of the category..." className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Link URL</Label>
                        <Input value={cat.link} onChange={(e) => updateCategory(i, "link", e.target.value)} placeholder="/help/getting-started" className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Support Call-To-Action</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Button Text</Label>
                        <Input value={formData.cta.ticketText} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, ticketText: e.target.value } })} className="h-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Button Link</Label>
                        <Input value={formData.cta.ticketLink} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, ticketLink: e.target.value } })} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary Button Text</Label>
                        <Input value={formData.cta.emailText} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, emailText: e.target.value } })} className="h-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary Button Link</Label>
                        <Input value={formData.cta.emailLink} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, emailLink: e.target.value } })} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeLegal !== 'help-center' && (
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Content (Markdown Supported)</Label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Write your policy content here..."
                  className="min-h-[300px] text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-normal leading-relaxed"
                />
              </div>
            )}
          </div>

          <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Changes reflect immediately on the live page.
            </div>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="h-8 sm:h-9 px-4 rounded-lg font-semibold text-xs shadow-xs"
            >
              {isProcessing ? "Saving..." : "Save Content"}
            </Button>
          </div>
        </div>

        <div>
          <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Content Guide</h4>
            <ul className="space-y-2.5">
              {[
                { t: "Markdown Support", d: "Use # for headings, ** for bold, and - for lists." },
                { t: "Dynamic Headers", d: "The title and subtitle appear in the header banner." },
                { t: "SEO Optimized", d: "Clean semantic HTML is generated automatically." },
                { t: "Auto-Sync", d: "Links in the footer are automatically updated." }
              ].map((item, i) => (
                <li key={i} className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{item.t}</div>
                  <div className="text-[11px] text-slate-500 font-normal">{item.d}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinksContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Links</h4>
        <Button size="sm" variant="outline" onClick={() => {
          const newLinks = [...(content.links || []), { title: "New Link", description: "Description", url: "#", icon: "Link" }];
          setContent({ ...content, links: newLinks });
        }} className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add Link
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {(content.links || []).map((link: any, idx: number) => (
          <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl space-y-2 shadow-xs relative group">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Link #{idx + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 rounded-md transition-colors" onClick={() => {
                const newLinks = content.links.filter((_: any, i: number) => i !== idx);
                setContent({ ...content, links: newLinks });
              }}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</Label>
              <Input value={link.title || ""} onChange={(e) => { const n = [...content.links]; n[idx].title = e.target.value; setContent({ ...content, links: n }); }} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</Label>
              <Input value={link.description || ""} onChange={(e) => { const n = [...content.links]; n[idx].description = e.target.value; setContent({ ...content, links: n }); }} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">URL</Label>
                <Input value={link.url || ""} onChange={(e) => { const n = [...content.links]; n[idx].url = e.target.value; setContent({ ...content, links: n }); }} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" placeholder="/student/dashboard" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Icon Name</Label>
                <Input value={link.icon || ""} onChange={(e) => { const n = [...content.links]; n[idx].icon = e.target.value; setContent({ ...content, links: n }); }} className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" placeholder="Building2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
