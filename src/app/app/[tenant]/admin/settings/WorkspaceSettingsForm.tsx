"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, Layout, Palette, Phone, Save, Settings2, Trash2, 
  ChevronDown, Cpu, LayoutDashboard, FileText, Play, Rocket, 
  Mail, ShieldCheck, UserCheck, BookOpenCheck, Menu, 
  MousePointer2, ExternalLink, Plus, Check, X, Zap, Bell,
  Calendar, Trophy, Handshake, Star, HelpCircle, MapPin, Clock, Send, Search, Image as ImageIcon
} from "lucide-react";
import { updateSiteSettings, updateLandingSection, syncAllSections } from "@/app/actions/site-settings";
import { createEvent, updateEvent, deleteEvent } from "@/app/actions/events";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/app/actions/gallery";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { cn } from "@/lib/utils";

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

export function WorkspaceSettingsForm({ settings }: { settings: any }) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
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
  const DEFAULT_NAV = [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Courses", href: "/courses", id: "courses", isActive: true },
    { name: "Learners", href: "/learners", id: "learners", isActive: true },
    { name: "Enquery", href: "/enquiry", id: "enquiry", isActive: true },
    { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
    { name: "Events", href: "/events", id: "events", isActive: true },
    { name: "Guidance", href: "/guidance", id: "guidance", isActive: true },
    { name: "Notice", href: "/notice", id: "notice", isActive: true },
    { name: "Contact", href: "/contact", id: "contact", isActive: true },
  ];

  const [navigation, setNavigation] = useState(() => {
    if (!settings.navigation || settings.navigation.length === 0) return DEFAULT_NAV;
    // Merge: ensure all defaults exist
    const current = [...settings.navigation];
    DEFAULT_NAV.forEach(def => {
      const exists = current.some(item => item.id === def.id);
      if (!exists) current.push(def);
    });
    // Remove franchise if present
    return current.filter(item => item.id !== 'franchise' && item.name?.toLowerCase() !== 'franchise');
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [sectionSearch, setSectionSearch] = useState("");

  const mediaFolderBase = `ABCDEduHub/Workspaces/${settings.workspace?.subdomain || 'Unknown'}`;

  useEffect(() => {
    setSiteName(settings.siteName);
    setLogoUrl(settings.logoUrl);
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
    
    // Update navigation with defaults if needed
    const nav = settings.navigation && settings.navigation.length > 0 
      ? [...settings.navigation] 
      : [...DEFAULT_NAV];
    
    const filteredNav = nav.filter(item => item.id !== 'franchise' && item.name?.toLowerCase() !== 'franchise');
    
    // Ensure all required are there
    DEFAULT_NAV.forEach(def => {
      if (!filteredNav.some(item => item.id === def.id)) {
        filteredNav.push(def);
      }
    });
    setNavigation(filteredNav);

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
        pageHeaderBanner,
      });
      if (result.success) toast.success("Institute settings updated");
      else toast.error(result.error || "Update failed");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-12">
        <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 py-4">
          <TabsList className="flex w-full h-12 bg-transparent p-0 gap-8 overflow-x-auto no-scrollbar justify-start border-none shadow-none">
            {[
              { value: "branding", label: "Branding", icon: Palette },
              { value: "navigation", label: "Menu", icon: Globe },
              { value: "sections", label: "Landing Page", icon: Layout },
              { value: "events", label: "Events", icon: Calendar },
              { value: "notices", label: "Notice Board", icon: Bell },
              { value: "gallery", label: "Gallery", icon: ImageIcon },
              { value: "legal", label: "Legal & Help", icon: ShieldCheck },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="group relative flex items-center gap-2.5 px-2 h-full rounded-none bg-transparent data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-primary transition-all text-sm font-semibold border-none shadow-none"
              >
                <tab.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                {tab.label}
                <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-primary scale-x-0 data-[state=active]:group-[]:scale-x-100 transition-transform origin-left" />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
          <TabsContent value="branding" className="mt-0 w-full space-y-10 focus-visible:outline-none">
            <Accordion className="space-y-6">
              <AccordionItem value="identity" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden shadow-md">
                <AccordionTrigger className="hover:no-underline py-8 px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Institute Identity</h3>
                      <p className="text-sm text-muted-foreground font-medium">Manage your institute's name, logo, and theme.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 px-8 space-y-10 border-t border-border/20 pt-8">
                  <div className="space-y-6">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Theme Presets</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(preset.primary);
                            setAccentColor(preset.accent);
                          }}
                          className={cn(
                            "group relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left h-32 justify-between",
                            primaryColor === preset.primary && accentColor === preset.accent
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]"
                              : "border-border/40 hover:border-primary/20 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: preset.primary }} />
                            <div className="w-3 h-3 rounded-full shadow-inner opacity-60" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <div>
                             <span className="font-black text-xs block mb-1">{preset.name}</span>
                             <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{preset.description}</p>
                          </div>
                          {primaryColor === preset.primary && accentColor === preset.accent && (
                            <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1 shadow-lg">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                      
                      {/* Custom indicator button */}
                      <button
                        type="button"
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed transition-all text-center gap-2 h-32",
                          !THEME_PRESETS.some(p => p.primary === primaryColor && p.accent === accentColor)
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                            : "border-border/40 hover:border-primary/20"
                        )}
                      >
                        <Zap className={cn("w-5 h-5 transition-transform group-hover:rotate-12", 
                          !THEME_PRESETS.some(p => p.primary === primaryColor && p.accent === accentColor) ? "text-primary" : "text-muted-foreground")} />
                        <div className="flex flex-col">
                           <span className="font-black text-xs uppercase tracking-widest">Custom</span>
                           <p className="text-[9px] text-muted-foreground font-bold">Manual Colors</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <Label htmlFor="siteName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Institute Name</Label>
                      <Input id="siteName" value={siteName || ""} onChange={(e) => setSiteName(e.target.value)} className="h-14 bg-background border-border/40 rounded-2xl px-6 font-bold text-lg" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Logo Placement</Label>
                       <div className="flex items-center gap-4 p-2 bg-background rounded-2xl border border-border/40 h-20">
                          <ImageUpload value={logoUrl} onChange={setLogoUrl} folder={`${mediaFolderBase}/branding`} />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Typography (Font Family)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                            "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all text-center gap-2 h-32",
                            fontFamily === f.font
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]"
                              : "border-border/40 hover:border-primary/20 hover:bg-muted/50"
                          )}
                        >
                          <span className="text-3xl font-black" style={{ fontFamily: f.font }}>Aa</span>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase">{f.name}</span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">{f.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Color</Label>
                      <div className="flex items-center gap-6 p-4 bg-background rounded-2xl border border-border/40 h-20 w-full">
                        <Input type="color" value={primaryColor || "#4f46e5"} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 p-0.5 border-none bg-transparent cursor-pointer shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-black uppercase tracking-widest">{primaryColor}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black">Main Identity</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Accent Color</Label>
                      <div className="flex items-center gap-6 p-4 bg-background rounded-2xl border border-border/40 h-20 w-full">
                        <Input type="color" value={accentColor || "#4338ca"} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-12 p-0.5 border-none bg-transparent cursor-pointer shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-black uppercase tracking-widest">{accentColor}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black">Interaction Highlight</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Default Page Header Banner</Label>
                    <ImageUpload value={pageHeaderBanner} onChange={setPageHeaderBanner} label="Page Banner" folder={`${mediaFolderBase}/branding`} />
                    <p className="text-[10px] text-muted-foreground font-medium ml-1">This image will appear at the top of informational pages like Events, Notice, and About Us.</p>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-14 px-10 gap-3 rounded-2xl font-black text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none">
                      <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Save Identity"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden shadow-md">
                <AccordionTrigger className="hover:no-underline py-8 px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Contact Information</h3>
                      <p className="text-sm text-muted-foreground font-medium">Public contact details for students.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 px-8 space-y-8 border-t border-border/20 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Support Email</Label>
                      <Input value={contactEmail || ""} onChange={(e) => setContactEmail(e.target.value)} className="h-14 bg-background border-border/40 rounded-2xl px-6 font-bold" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                      <Input value={contactPhone || ""} onChange={(e) => setContactPhone(e.target.value)} className="h-14 bg-background border-border/40 rounded-2xl px-6 font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
                      <Input value={whatsapp || ""} onChange={(e) => setWhatsapp(e.target.value)} className="h-14 bg-background border-border/40 rounded-2xl px-6 font-bold" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Campus Address</Label>
                      <Input value={address || ""} onChange={(e) => setAddress(e.target.value)} className="h-14 bg-background border-border/40 rounded-2xl px-6 font-bold" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Google Maps Embed Link</Label>
                    <Input value={googleMapLink || ""} onChange={(e) => setGoogleMapLink(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className="h-14 bg-background border-border/40 rounded-2xl px-6 font-bold" />
                    <p className="text-[10px] text-muted-foreground font-medium ml-1">Paste the <span className="text-primary font-bold">src</span> attribute from the Google Maps "Embed a map" iframe.</p>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-14 px-10 gap-3 rounded-2xl font-black text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none">
                      <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Update Contact"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="social" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden shadow-md">
                <AccordionTrigger className="hover:no-underline py-8 px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Social Media Links</h3>
                      <p className="text-sm text-muted-foreground font-medium">Connect your community profiles.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 px-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/20 pt-8">
                  {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                    <div key={platform} className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{platform}</Label>
                      <Input value={socialLinks[platform] || ""} onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })} placeholder={`https://${platform}.com/...`} className="h-12 bg-background border-border/40 rounded-2xl px-4" />
                    </div>
                  ))}
                  <div className="md:col-span-2 pt-4 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-14 px-10 gap-3 rounded-2xl font-black text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none">
                      <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Save Links"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="navigation" className="mt-0 w-full space-y-10 focus-visible:outline-none">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black tracking-tight">Navigation Ecosystem</h2>
              <p className="text-muted-foreground text-sm">Control which pages are visible on your header.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {navigation.map((nav: any, index: number) => (
                <div key={nav.id || index} className={`group flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${nav.isActive ? "bg-white dark:bg-zinc-900 border-border/60 shadow-sm" : "bg-muted/30 border-transparent opacity-60 grayscale"}`}>
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${nav.isActive ? "bg-primary text-primary-foreground" : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"}`}>
                      {index + 1}
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <Input value={nav.name || ""} onChange={(e) => {
                        const newNav = [...navigation];
                        newNav[index] = { ...newNav[index], name: e.target.value };
                        setNavigation(newNav);
                      }} className="h-8 font-black border-none bg-transparent p-0 focus-visible:ring-0 text-xl tracking-tight" />
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <ExternalLink className="w-3 h-3 text-primary" />
                        <Input value={nav.href || ""} onChange={(e) => {
                          const newNav = [...navigation];
                          newNav[index] = { ...newNav[index], href: e.target.value };
                          setNavigation(newNav);
                        }} className="h-6 border-none bg-transparent p-0 focus-visible:ring-0 text-[10px] text-primary/60" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-6 md:mt-0 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-border/40">
                      <span className="text-[10px] font-black uppercase tracking-widest">{nav.isActive ? "Active" : "Hidden"}</span>
                      <Switch 
                        checked={!!nav.isActive} 
                        disabled={nav.name === "Home"}
                        onCheckedChange={(val) => {
                          const newNav = [...navigation];
                          newNav[index] = { ...newNav[index], isActive: val };
                          setNavigation(newNav);
                        }} 
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setNavigation(navigation.filter((_: any, i: number) => i !== index));
                    }} className="h-12 w-12 rounded-2xl text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={() => {
                setNavigation([...navigation, { name: "New Link", href: "#", id: Math.random().toString(), isActive: true }]);
              }} className="h-28 border-dashed border-2 rounded-[2.5rem] flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all w-full group">
                <Plus className="h-8 w-8 text-muted-foreground group-hover:scale-125 transition-transform" />
                <span className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Add Menu Link</span>
              </Button>
              
              <div className="pt-10 flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-16 px-12 gap-3 rounded-[1.5rem] font-black text-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all bg-primary text-primary-foreground border-none">
                  <Save className="h-6 w-6" /> {isSaving ? "Saving..." : "Update Menu"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0 w-full space-y-10 focus-visible:outline-none">
             <EventsManagement 
                workspaceId={settings.workspaceId} 
                events={settings.workspace?.events || []} 
                mediaFolderBase={mediaFolderBase}
             />
          </TabsContent>

          <TabsContent value="notices" className="mt-0 w-full space-y-10 focus-visible:outline-none">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black tracking-tight">Notice Board</h2>
              <p className="text-muted-foreground text-sm">Publish important updates for your students.</p>
            </div>

            {(() => {
              const aboutSection = settings.sections?.find((s: any) => s.type === 'about');
              if (!aboutSection) return (
                <div className="p-16 border-2 border-dashed rounded-[3rem] text-center space-y-4 bg-muted/20">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Section Not Found</p>
                  <Button variant="outline" onClick={() => setActiveTab("sections")} className="rounded-2xl h-12 font-bold">Go to Sections</Button>
                </div>
              );

              return (
                <div className="p-10 bg-white dark:bg-zinc-900 border border-border/60 rounded-[3rem] shadow-md space-y-10">
                  <div className="flex items-center justify-between pb-8 border-b border-border/40">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                        <Bell className="w-7 h-7 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">Live Notice Board</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Updates shown on landing page</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 bg-muted/50 rounded-2xl border border-border/20">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{aboutSection.isActive ? "Online" : "Offline"}</span>
                       <Switch 
                         checked={aboutSection.isActive} 
                         onCheckedChange={(val) => updateLandingSection(aboutSection.id, { ...aboutSection, isActive: val })} 
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

          <TabsContent value="gallery" className="mt-0 w-full space-y-10 focus-visible:outline-none">
             <GalleryManagement 
                workspaceId={settings.workspaceId} 
                galleryItems={settings.workspace?.galleryItems || []} 
                mediaFolderBase={mediaFolderBase}
             />
          </TabsContent>

          <TabsContent value="legal" className="mt-0 w-full space-y-10 focus-visible:outline-none">
             <div className="flex flex-col gap-2 mb-8">
               <h2 className="text-2xl font-black tracking-tight">Legal & Help Management</h2>
               <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 Manage your official documentation and student support center.
               </p>
             </div>
             <LegalContentEditor settings={settings} />
          </TabsContent>

          <TabsContent value="sections" className="mt-0 w-full space-y-10 focus-visible:outline-none">
             <div className="flex flex-col gap-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                 <div className="flex flex-col gap-1">
                   <h2 className="text-2xl font-black tracking-tight">Page Sections</h2>
                   <p className="text-muted-foreground text-sm">Toggle visibility of specific landing page areas.</p>
                 </div>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={async () => {
                     const types = ['hero', 'about', 'counters', 'courses', 'why-choose-us', 'achievements', 'partners', 'events', 'testimonials', 'faq', 'contact'];
                     const res = await syncAllSections(settings.id, types);
                     if (res.success) {
                       toast.success(res.created ? `Initialized ${res.created} new sections!` : "Sections already synced.");
                       if (res.created) window.location.reload();
                     }
                   }}
                   className="rounded-2xl h-12 px-6 gap-3 border-primary/20 text-primary hover:bg-primary/5 font-black shadow-md hover:shadow-primary/10 active:scale-95 transition-all"
                 >
                   <Plus className="h-5 w-5" /> Sync Content
                 </Button>
               </div>

               {/* Search Bar */}
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={sectionSearch || ""}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder="Search sections (e.g. Hero, Courses, FAQ...)" 
                    className="h-16 pl-14 pr-6 rounded-[2rem] bg-white dark:bg-zinc-900 border-border/60 shadow-sm focus:shadow-md transition-all text-lg font-medium"
                  />
               </div>
             </div>

            <div className="space-y-6">
                {filteredSections.length > 0 ? (
                  filteredSections.map((section: any) => (
                    <SectionEditor key={section.id} section={section} settings={settings} mediaFolderBase={mediaFolderBase} />
                  ))
                ) : (
                  <div className="p-20 border-2 border-dashed rounded-[3rem] text-center space-y-4 bg-muted/10 opacity-60">
                     <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                     <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">No sections matching "{sectionSearch}"</p>
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
    <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${isActive ? 'bg-white dark:bg-zinc-900 border-border shadow-md' : 'bg-muted/30 border-transparent opacity-60 grayscale'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${isActive ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground'}`}>
            <Layout className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="capitalize font-black text-lg tracking-tight">{section.type.replace("-", " ")}</h3>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{isActive ? 'Live on Site' : 'Hidden from Site'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-12 px-6 rounded-2xl font-black text-xs gap-3 transition-all ${isExpanded ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted/50 hover:bg-muted'}`}
          >
            <Settings2 className="h-5 w-5" /> {isExpanded ? 'Close' : 'Edit'}
          </Button>
          <div className="h-10 w-px bg-border/40 mx-2" />
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
        <div className="mt-8 pt-8 border-t border-border/40 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Main Heading</Label>
                <Input value={title || ""} onChange={(e) => setTitle(e.target.value)} className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Subheading / Tagline</Label>
                <Input value={subtitle || ""} onChange={(e) => setSubtitle(e.target.value)} className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none px-6 font-bold" />
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-border/20 shadow-inner">
               {section.type === 'hero' && <HeroContentEditor content={content} setContent={setContent} mediaFolderBase={mediaFolderBase} />}
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

            <div className="flex justify-end">
              <Button onClick={handleUpdate} disabled={isSaving} className="h-14 px-10 gap-3 rounded-2xl font-black bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none">
                <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Commit Changes"}
              </Button>
            </div>
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
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Hero Slides</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, slides: [...slides, { 
          title: "New Slide", 
          tagline: "Empowering Future", 
          description: "Description here", 
          banner: "", 
          offerImage: "",
          btn1Text: "Get Started",
          btn1Link: "/login",
          btn2Text: "Learn More",
          btn2Link: "/about"
        }] })} className="rounded-xl font-bold h-10 border-primary/20 text-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>
      <div className="space-y-6">
        {slides.map((slide: any, idx: number) => (
          <div key={idx} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm relative group">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => setContent({ ...content, slides: slides.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-5 h-5" />
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Tagline (Badge)</Label>
                     <Input value={slide.tagline || ""} onChange={(e) => {
                       const next = [...slides];
                       next[idx].tagline = e.target.value;
                       setContent({ ...content, slides: next });
                     }} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Hero Title</Label>
                     <Input value={slide.title || ""} onChange={(e) => {
                       const next = [...slides];
                       next[idx].title = e.target.value;
                       setContent({ ...content, slides: next });
                     }} className="h-12 rounded-xl font-bold text-lg" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</Label>
                     <Textarea value={slide.description || ""} onChange={(e) => {
                       const next = [...slides];
                       next[idx].description = e.target.value;
                       setContent({ ...content, slides: next });
                     }} className="min-h-[80px] rounded-xl resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Primary Button</Label>
                        <Input value={slide.btn1Text || ""} onChange={(e) => {
                          const next = [...slides];
                          next[idx].btn1Text = e.target.value;
                          setContent({ ...content, slides: next });
                        }} placeholder="Text" className="h-10 rounded-xl" />
                        <Input value={slide.btn1Link || ""} onChange={(e) => {
                          const next = [...slides];
                          next[idx].btn1Link = e.target.value;
                          setContent({ ...content, slides: next });
                        }} placeholder="Link" className="h-10 rounded-xl text-[10px]" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Secondary Button</Label>
                        <Input value={slide.btn2Text || ""} onChange={(e) => {
                          const next = [...slides];
                          next[idx].btn2Text = e.target.value;
                          setContent({ ...content, slides: next });
                        }} placeholder="Text" className="h-10 rounded-xl" />
                        <Input value={slide.btn2Link || ""} onChange={(e) => {
                          const next = [...slides];
                          next[idx].btn2Link = e.target.value;
                          setContent({ ...content, slides: next });
                        }} placeholder="Link" className="h-10 rounded-xl text-[10px]" />
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Background Banner</Label>
                    <ImageUpload value={slide.banner || slide.src} onChange={(url) => {
                       const next = [...slides];
                       next[idx].banner = url;
                       next[idx].src = url;
                       setContent({ ...content, slides: next });
                    }} folder={`${mediaFolderBase}/hero`} />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Right Side Image (Promo)</Label>
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Button Text</Label>
          <Input 
            value={content.btnText || ""} 
            onChange={(e) => setContent({ ...content, btnText: e.target.value })} 
            placeholder="e.g. Read More" 
            className="h-10 rounded-xl" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Button Link</Label>
          <Input 
            value={content.btnLink || ""} 
            onChange={(e) => setContent({ ...content, btnLink: e.target.value })} 
            placeholder="e.g. /about" 
            className="h-10 rounded-xl" 
          />
        </div>
      </div>

      <div className="space-y-4">
         <Label className="text-xs font-black uppercase tracking-widest text-primary">About Full Description</Label>
         <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[160px] rounded-2xl bg-white dark:bg-zinc-900 border-border/40 p-6" placeholder="Detailed about description..." />
      </div>

      <div className="pt-8 border-t border-border/40 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Notices List</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, notices: [...notices, { title: "New Notice", date: new Date().toLocaleDateString(), link: "#" }] })} className="rounded-xl font-bold h-10 border-primary/20 text-primary">
            <Plus className="w-4 h-4 mr-2" /> Post Notice
          </Button>
        </div>
        <div className="space-y-4">
          {notices.map((notice: any, idx: number) => (
            <div key={idx} className="flex gap-4 items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-border/40 group">
              <Input value={notice.title || ""} onChange={(e) => {
                const next = [...notices];
                next[idx].title = e.target.value;
                setContent({ ...content, notices: next });
              }} className="flex-1 h-10 rounded-lg border-none bg-zinc-50 dark:bg-zinc-800 font-bold" />
              <Input value={notice.date || ""} onChange={(e) => {
                const next = [...notices];
                next[idx].date = e.target.value;
                setContent({ ...content, notices: next });
              }} className="w-32 h-10 rounded-lg border-none bg-zinc-50 dark:bg-zinc-800 text-xs font-bold" />
              <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setContent({ ...content, notices: notices.filter((_: any, i: number) => i !== idx) })}>
                <Trash2 className="w-4 h-4" />
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Live Counters</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, stats: [...stats, { label: "Students", value: "1000", icon: "Users" }] })} className="rounded-xl font-bold h-10">
          <Plus className="w-4 h-4 mr-2" /> Add Counter
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-border/40 relative flex gap-4 items-center">
            <select value={stat.icon || "Users"} onChange={(e) => {
               const next = [...stats];
               next[idx].icon = e.target.value;
               setContent({ ...content, stats: next });
            }} className="h-10 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs font-bold outline-none">
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
            }} placeholder="Label" className="h-10 font-bold" />
            <Input value={stat.value || ""} onChange={(e) => {
              const next = [...stats];
              next[idx].value = e.target.value;
              setContent({ ...content, stats: next });
            }} placeholder="Value" className="w-32 h-10 font-black text-primary text-center" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 rounded-lg" onClick={() => setContent({ ...content, stats: stats.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoursesContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Section Description</Label>
        <Textarea 
          value={content.description || ""} 
          onChange={(e) => setContent({ ...content, description: e.target.value })} 
          placeholder="e.g. Unlock your potential with our meticulously crafted curriculum..." 
          className="min-h-[120px] rounded-2xl bg-white dark:bg-zinc-900 border-border/40 p-6 font-medium leading-relaxed" 
        />
        <p className="text-[10px] text-muted-foreground font-medium ml-1 italic">
          This description appears at the top of the Courses section on your home page.
        </p>
      </div>
      
      <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
          <BookOpenCheck className="w-4 h-4" />
          The courses themselves are managed from the main <span className="uppercase tracking-widest">Courses</span> tab in the sidebar.
        </p>
      </div>
    </div>
  );
}

function EventsContentEditor({ content, setContent, mediaFolderBase }: any) {
  const events = content.events || [];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Events List</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, events: [...events, { title: "New Event", date: "01 Jan, 2026", time: "10:00 AM", location: "Campus", image: "" }] })} className="rounded-xl font-bold h-10 border-primary/20 text-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm relative group">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 text-red-500 rounded-xl bg-red-50 dark:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all" onClick={() => setContent({ ...content, events: events.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-5 h-5" />
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Event Title</Label>
                     <Input value={event.title || ""} onChange={(e) => {
                       const next = [...events];
                       next[idx].title = e.target.value;
                       setContent({ ...content, events: next });
                     }} className="h-12 rounded-xl font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Date</Label>
                        <Input value={event.date || ""} onChange={(e) => {
                          const next = [...events];
                          next[idx].date = e.target.value;
                          setContent({ ...content, events: next });
                        }} placeholder="15 May, 2026" className="h-10 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Time</Label>
                        <Input value={event.time || ""} onChange={(e) => {
                          const next = [...events];
                          next[idx].time = e.target.value;
                          setContent({ ...content, events: next });
                        }} placeholder="10:00 AM" className="h-10 rounded-xl" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Location</Label>
                     <Input value={event.location || ""} onChange={(e) => {
                       const next = [...events];
                       next[idx].location = e.target.value;
                       setContent({ ...content, events: next });
                     }} className="h-10 rounded-xl" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Event Image</Label>
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Image</Label>
          <ImageUpload 
            value={content.image || ""} 
            onChange={(url) => setContent({ ...content, image: url })} 
            folder={`${mediaFolderBase}/why-choose-us`} 
          />
        </div>
        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
           <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Floating Badge Card</Label>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Icon</Label>
                 <select 
                   value={content.floatingCard?.icon || "Users"} 
                   onChange={(e) => setContent({ ...content, floatingCard: { ...(content.floatingCard || {}), icon: e.target.value } })}
                   className="w-full h-10 bg-background border border-border/40 rounded-xl px-3 text-sm font-bold appearance-none"
                 >
                    <option value="Users">Users</option>
                    <option value="Trophy">Trophy</option>
                    <option value="Star">Star</option>
                    <option value="GraduationCap">Education</option>
                    <option value="Rocket">Launch</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Value</Label>
                 <Input 
                   value={content.floatingCard?.value || ""} 
                   onChange={(e) => setContent({ ...content, floatingCard: { ...(content.floatingCard || {}), value: e.target.value } })}
                   placeholder="10K+"
                   className="h-10 rounded-xl"
                 />
              </div>
           </div>
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Label</Label>
              <Input 
                value={content.floatingCard?.label || ""} 
                onChange={(e) => setContent({ ...content, floatingCard: { ...(content.floatingCard || {}), label: e.target.value } })}
                placeholder="Happy Students"
                className="h-10 rounded-xl"
              />
           </div>
        </div>
      </div>

      <div className="space-y-4">
         <Label className="text-xs font-black uppercase tracking-widest text-primary">Section Description</Label>
         <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[100px] rounded-2xl bg-white dark:bg-zinc-900 border-border/40 p-6" />
      </div>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Feature List</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, features: [...items, { title: "New Feature", description: "", icon: "Zap" }] })} className="rounded-xl font-bold h-10">
          <Plus className="w-4 h-4 mr-2" /> Add Feature
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 shadow-sm relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-red-500 rounded-lg" onClick={() => setContent({ ...content, features: items.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Icon</Label>
                  <select 
                    value={item.icon || "Zap"} 
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].icon = e.target.value;
                      setContent({ ...content, features: next });
                    }}
                    className="w-full h-10 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-3 text-sm font-bold appearance-none"
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
               }} placeholder="Feature Title" className="h-10 rounded-xl font-bold" />
               <Textarea value={item.description || ""} onChange={(e) => {
                 const next = [...items];
                 next[idx].description = e.target.value;
                 setContent({ ...content, features: next });
               }} placeholder="Feature Description" className="h-20 rounded-xl resize-none text-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementsContentEditor({ content, setContent, mediaFolderBase }: any) {
  const stats = content.stats || [];
  const gallery = content.items || [];
  return (
    <div className="space-y-12">
      <div className="space-y-4">
         <Label className="text-xs font-black uppercase tracking-widest text-primary">Section Description</Label>
         <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} placeholder="Describe your institute's pride and achievements..." className="min-h-[100px] rounded-2xl bg-white dark:bg-zinc-900 border-border/40 p-6" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Achievement Stats</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, stats: [...stats, { label: "Success", value: "100", suffix: "%", icon: "Trophy" }] })} className="rounded-xl font-bold h-10">
            <Plus className="w-4 h-4 mr-2" /> Add Stat
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat: any, idx: number) => (
            <div key={idx} className="group p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-border/40 relative flex flex-wrap sm:flex-nowrap items-center gap-4">
              <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => setContent({ ...content, stats: stats.filter((_: any, i: number) => i !== idx) })}>
                <X className="w-3 h-3" />
              </Button>
              
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <select value={stat.icon || "Trophy"} onChange={(e) => {
                  const next = [...stats];
                  next[idx].icon = e.target.value;
                  setContent({ ...content, stats: next });
                }} className="h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs font-bold outline-none border border-transparent focus:border-primary/20 shrink-0">
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
                }} placeholder="Label (e.g. Students)" className="h-11 font-bold rounded-xl" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-32">
                  <Input value={stat.value || ""} onChange={(e) => {
                    const next = [...stats];
                    next[idx].value = e.target.value;
                    setContent({ ...content, stats: next });
                  }} placeholder="Value" className="h-11 text-center font-black text-primary rounded-xl" />
                </div>
                <div className="relative w-16">
                  <Input value={stat.suffix || ""} onChange={(e) => {
                    const next = [...stats];
                    next[idx].suffix = e.target.value;
                    setContent({ ...content, stats: next });
                  }} placeholder="Suffix" className="h-11 text-center font-bold text-muted-foreground rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-border/40">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Pride Gallery</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, items: [...gallery, { title: "Moment", description: "", src: "" }] })} className="rounded-xl font-bold h-10">
            <Plus className="w-4 h-4 mr-2" /> Add Image
          </Button>
        </div>
        <div className="space-y-6">
          {gallery.map((item: any, idx: number) => (
            <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 relative group">
               <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-red-500 rounded-lg" onClick={() => setContent({ ...content, items: gallery.filter((_: any, i: number) => i !== idx) })}>
                 <Trash2 className="w-4 h-4" />
               </Button>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <Input value={item.title || ""} onChange={(e) => {
                        const next = [...gallery];
                        next[idx].title = e.target.value;
                        setContent({ ...content, items: next });
                     }} placeholder="Image Title" className="h-10 rounded-xl font-bold" />
                     <Textarea value={item.description || ""} onChange={(e) => {
                        const next = [...gallery];
                        next[idx].description = e.target.value;
                        setContent({ ...content, items: next });
                     }} placeholder="Description" className="h-20 rounded-xl resize-none text-xs" />
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
    <div className="space-y-12">
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Partner Logos</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, logos: [...logos, ""] })} className="rounded-xl font-bold h-10">
          <Plus className="w-4 h-4 mr-2" /> Add Logo
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {logos.map((logo: string, idx: number) => (
          <div key={idx} className="space-y-2 relative group">
             <ImageUpload value={logo} onChange={(url) => {
               const next = [...logos];
               next[idx] = url;
               setContent({ ...content, logos: next });
             }} folder={`${mediaFolderBase}/partners`} />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -top-3 -right-3 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl z-50 flex items-center justify-center transition-all hover:scale-110 border-2 border-white dark:border-zinc-900" 
                onClick={() => setContent({ ...content, logos: logos.filter((_: any, i: number) => i !== idx) })}
              >
                <X className="w-4 h-4" />
              </Button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function ListContentEditor({ title, content, setContent, itemFields, mediaFolderBase }: any) {
  const items = content.items || [];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{title} List</h4>
        <Button size="sm" variant="outline" onClick={() => setContent({ ...content, items: [...items, {}] })} className="rounded-xl font-bold h-10">
          <Plus className="w-4 h-4 mr-2" /> Add {title}
        </Button>
      </div>
      <div className="space-y-6">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 relative group">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => setContent({ ...content, items: items.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-5 h-5" />
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  {itemFields.filter((f: string) => f !== 'avatar' && f !== 'image').map((field: string) => (
                    <div key={field} className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{field}</Label>
                       {field === 'text' || field === 'description' ? (
                         <Textarea value={item[field] || ""} onChange={(e) => {
                           const next = [...items];
                           next[idx][field] = e.target.value;
                           setContent({ ...content, items: next });
                         }} className="min-h-[80px] rounded-xl" />
                       ) : (
                         <Input value={item[field] || ""} onChange={(e) => {
                           const next = [...items];
                           next[idx][field] = e.target.value;
                           setContent({ ...content, items: next });
                         }} className="h-10 rounded-xl font-bold" />
                       )}
                    </div>
                  ))}
               </div>
               {(itemFields.includes('avatar') || itemFields.includes('image')) && (
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Media</Label>
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
    <div className="space-y-12">
      <div className="space-y-4">
         <Label className="text-xs font-black uppercase tracking-widest text-primary">Section Description</Label>
         <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} placeholder="Describe your FAQ section..." className="min-h-[100px] rounded-2xl bg-white dark:bg-zinc-900 border-border/40 p-6" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Frequently Asked Questions</h4>
          <Button size="sm" variant="outline" onClick={() => setContent({ ...content, faqs: [...faqs, { question: "New Question", answer: "" }] })} className="rounded-xl font-bold h-10">
            <Plus className="w-4 h-4 mr-2" /> Add FAQ
          </Button>
        </div>
      <div className="space-y-6">
        {faqs.map((faq: any, idx: number) => (
          <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 relative group">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setContent({ ...content, faqs: faqs.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="space-y-4">
               <Input value={faq.question || ""} onChange={(e) => {
                 const next = [...faqs];
                 next[idx].question = e.target.value;
                 setContent({ ...content, faqs: next });
               }} placeholder="Question" className="h-10 rounded-xl font-bold" />
               <Textarea value={faq.answer || ""} onChange={(e) => {
                 const next = [...faqs];
                 next[idx].answer = e.target.value;
                 setContent({ ...content, faqs: next });
               }} placeholder="Answer" className="min-h-[80px] rounded-xl text-sm" />
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className="space-y-8 pt-12 border-t border-border/40">
         <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Call to Action Banner</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CTA Title</Label>
               <Input value={content.ctaTitle || ""} onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })} placeholder="Still have questions?" className="h-11 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CTA Description</Label>
               <Input value={content.ctaDesc || ""} onChange={(e) => setContent({ ...content, ctaDesc: e.target.value })} placeholder="We're here to help you..." className="h-11 rounded-xl font-medium" />
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Text</Label>
               <Input value={content.ctaButtonText || ""} onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })} placeholder="Chat with Admissions" className="h-11 rounded-xl font-black text-primary" />
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Link</Label>
               <Input value={content.ctaButtonLink || ""} onChange={(e) => setContent({ ...content, ctaButtonLink: e.target.value })} placeholder="/contact" className="h-11 rounded-xl font-bold" />
            </div>
         </div>
      </div>
    </div>
  );
}

function ContactContentEditor({ content, setContent, settings, mediaFolderBase }: any) {
  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm">
             <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Social Visibility</span>
                <p className="text-[10px] text-muted-foreground font-medium">Show social links in contact section.</p>
             </div>
             <Switch checked={content.showSocials !== false} onCheckedChange={(val) => setContent({ ...content, showSocials: val })} />
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm space-y-4">
             <span className="text-xs font-black uppercase tracking-widest text-primary">Contact Tagline</span>
             <Input value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="h-10 rounded-xl text-xs font-medium" />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm space-y-4">
             <span className="text-xs font-black uppercase tracking-widest text-primary">Office Hours</span>
             <Input value={content.officeHours || ""} onChange={(e) => setContent({ ...content, officeHours: e.target.value })} placeholder="Mon - Sat: 9:00 AM - 6:00 PM" className="h-10 rounded-xl text-xs font-medium" />
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm space-y-4">
             <span className="text-xs font-black uppercase tracking-widest text-primary">Inquiry Form Title</span>
             <Input value={content.formTitle || ""} onChange={(e) => setContent({ ...content, formTitle: e.target.value })} placeholder="Admissions Inquiry" className="h-10 rounded-xl text-xs font-medium" />
          </div>
       </div>

       <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Contact details are managed in the <span className="uppercase tracking-widest">Branding</span> tab to maintain consistency across the site.</p>
       </div>
    </div>
  );
}

function EventsManagement({ workspaceId, events, mediaFolderBase }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteEvent(id);
      if (res.success) toast.success("Event deleted");
      else toast.error(res.error || "Delete failed");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAdding || editingEvent) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                 <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black">{editingEvent ? "Edit Event" : "Create New Event"}</h3>
           </div>
           <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingEvent(null); }} className="rounded-full">
              <X className="w-5 h-5" />
           </Button>
        </div>
        <EventForm initialData={editingEvent} onSave={handleSave} isProcessing={isProcessing} mediaFolderBase={mediaFolderBase} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search events by title or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-border/40 bg-white dark:bg-zinc-900 shadow-sm focus:ring-primary/20"
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> Add New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event: any) => (
          <div key={event.id} className="group bg-white dark:bg-zinc-900 border border-border/40 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 right-4 flex gap-2">
                 {event.isFeatured && (
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Featured</div>
                 )}
                 <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg", event.isActive ? "bg-green-500 text-white" : "bg-zinc-500 text-white")}>
                    {event.isActive ? "Active" : "Inactive"}
                 </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{event.category || "General Event"}</span>
                 <h4 className="font-black text-lg line-clamp-1">{event.title}</h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                 <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('en-GB')}</div>
                 <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {event.location || "Online"}</div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                 <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)} className="flex-1 rounded-xl font-bold h-10 hover:bg-primary/5 hover:text-primary border-border/60 transition-all">Edit</Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="w-10 h-10 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                 </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border border-dashed border-border/60">
             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Calendar className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <p className="font-black text-muted-foreground">No events found</p>
                <p className="text-xs text-muted-foreground/60">Try adjusting your search or add a new event.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryManagement({ workspaceId, galleryItems, mediaFolderBase }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      window.location.reload(); // Refresh to show new data
    } else {
      toast.error(res.error || "Operation failed");
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const res = await deleteGalleryItem(id);
    if (res.success) {
      toast.success("Image removed from gallery");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  if (isAdding || editingItem) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
        <div className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                 <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black">{editingItem ? "Edit Gallery Item" : "Add to Gallery"}</h3>
           </div>
           <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="rounded-full">
              <X className="w-5 h-5" />
           </Button>
        </div>
        <GalleryForm initialData={editingItem} onSave={handleSave} isProcessing={isProcessing} mediaFolderBase={mediaFolderBase} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search gallery by title or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-border/40 bg-white dark:bg-zinc-900 shadow-sm focus:ring-primary/20"
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> Add Gallery Image
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item: any) => (
          <div key={item.id} className="group bg-white dark:bg-zinc-900 border border-border/40 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="relative aspect-square overflow-hidden">
              <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 right-4 flex gap-2">
                 <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg", item.isActive ? "bg-green-500 text-white" : "bg-zinc-500 text-white")}>
                    {item.isActive ? "Active" : "Hidden"}
                 </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                 <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditingItem(item)} className="flex-1 rounded-xl font-bold h-10 hover:bg-white hover:text-primary transition-all">Edit</Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl transition-all">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                 </div>
              </div>
            </div>
            <div className="p-5 space-y-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">{item.category || "General"}</span>
               <h4 className="font-bold text-sm line-clamp-1">{item.title || "Untitled Image"}</h4>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border border-dashed border-border/60">
             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <p className="font-black text-muted-foreground">Gallery is empty</p>
                <p className="text-xs text-muted-foreground/60">Upload your institute photos to showcase here.</p>
             </div>
          </div>
        )}
      </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Image Title (Optional)</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Convocation 2026" className="h-14 rounded-2xl font-bold text-lg" />
           </div>
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Topic / Category</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Campus, Sports, Event, Classroom" className="h-12 rounded-2xl font-bold" />
           </div>
           <div className="flex items-center gap-3">
              <Label className="text-sm font-black uppercase tracking-widest">Active / Visible</Label>
              <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
           </div>
        </div>

        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm flex items-center justify-between">
           <p className="text-sm text-muted-foreground font-medium italic">Make sure to provide a clear category for better sorting.</p>
           <Button onClick={() => onSave(formData)} disabled={isProcessing || !formData.image} className="h-14 px-10 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all">
              {isProcessing ? "Saving..." : initialData ? "Update Item" : "Add to Gallery"}
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6 text-center">
           <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Upload Photo</Label>
           <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} label="Gallery Image" folder={`${mediaFolderBase}/gallery`} />
           <p className="text-[10px] text-muted-foreground font-medium">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Event Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Annual Science Fair 2026" className="h-14 rounded-2xl font-bold text-lg" />
           </div>
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell us more about the event..." className="min-h-[160px] rounded-2xl p-6 font-medium leading-relaxed" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Category / Topic</Label>
                 <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Workshop, Seminar, Cultural" className="h-12 rounded-2xl font-bold" />
              </div>
              <div className="space-y-3">
                 <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location</Label>
                 <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Main Hall, Computer Lab 1, Online" className="h-12 rounded-2xl font-bold" />
              </div>
           </div>
        </div>

        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <Label className="text-sm font-black uppercase tracking-widest">Featured</Label>
                 <Switch checked={formData.isFeatured} onCheckedChange={(val) => setFormData({ ...formData, isFeatured: val })} />
              </div>
              <div className="flex items-center gap-3">
                 <Label className="text-sm font-black uppercase tracking-widest">Active</Label>
                 <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
              </div>
           </div>
           <Button onClick={() => onSave(formData)} disabled={isProcessing || !formData.title || !formData.date} className="h-14 px-10 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all">
              {isProcessing ? "Saving..." : initialData ? "Update Event" : "Create Event"}
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Event Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-12 rounded-2xl font-bold" />
           </div>
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time</Label>
              <Input value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="e.g., 10:00 AM - 1:00 PM" className="h-12 rounded-2xl font-bold" />
           </div>
        </div>

        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
           <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Event Banner Image</Label>
           <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} label="Event Banner" folder={`${mediaFolderBase}/events`} />
           <p className="text-[10px] text-muted-foreground font-medium text-center italic">Recommended: 16:9 aspect ratio</p>
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
    // Fallback logic for content loading
    const rawContent = currentSection?.content as any;
    let initialText = rawContent?.text || "";
    
    // If no markdown text exists but HTML does (from initial sync), use HTML as starting point
    if (!initialText && rawContent?.html) {
      initialText = rawContent.html.replace(/<[^>]*>?/gm, ''); // Very basic strip for legacy sync
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

      // If section doesn't exist, sync it first
      if (!sectionId) {
        const syncRes = await syncAllSections(settings.id, [activeLegal], true);
        if (syncRes.success) {
          // Find the newly created section ID
          // We might need to refresh settings or just use a more direct create action
          // To keep it simple for now, I'll advise syncing if it fails, 
          // but I'll try to make it smarter by using a dedicated create-or-update action.
          toast.info("Initializing section... please try saving again in a moment.");
          window.location.reload(); // Hard reload to get new IDs
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
        // Refresh to get updated settings props
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
    <div className="space-y-12">
      <div className="flex flex-wrap gap-4">
        {legalPages.map((page) => (
          <button
            key={page.type}
            onClick={() => setActiveLegal(page.type)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-bold",
              activeLegal === page.type 
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                : "bg-white dark:bg-zinc-900 border-border/40 hover:border-primary/20 text-zinc-600 dark:text-zinc-400"
            )}
          >
            <page.icon className="w-5 h-5" />
            {page.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Page Title</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder={`e.g., ${legalPages.find(p => p.type === activeLegal)?.label}`} 
                className="h-14 rounded-2xl font-bold text-lg" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Subtitle / Subheader</Label>
              <Input 
                value={formData.subtitle} 
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} 
                placeholder="e.g., How can we assist you today?" 
                className="h-12 rounded-2xl font-bold" 
              />
            </div>

            {activeLegal === 'help-center' && (
              <div className="space-y-8 pt-6 border-t border-border/40">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-black uppercase tracking-widest text-primary">Help Categories</h4>
                   <Button onClick={addCategory} variant="outline" className="rounded-xl h-10 gap-2 border-primary/20 text-primary hover:bg-primary/5">
                      <Plus className="w-4 h-4" /> Add Category
                   </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   {formData.categories.map((cat: any, i: number) => (
                     <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-border/40 space-y-4 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeCategory(i)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Card Title</Label>
                              <Input value={cat.title} onChange={(e) => updateCategory(i, "title", e.target.value)} placeholder="e.g., Getting Started" className="h-10 rounded-xl font-bold" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Icon Name (Lucide)</Label>
                              <Input value={cat.icon} onChange={(e) => updateCategory(i, "icon", e.target.value)} placeholder="e.g., BookOpen, Mail, HelpCircle" className="h-10 rounded-xl font-medium" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                           <Input value={cat.desc} onChange={(e) => updateCategory(i, "desc", e.target.value)} placeholder="Short description of the category..." className="h-10 rounded-xl font-medium text-xs" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Link URL</Label>
                           <Input value={cat.link} onChange={(e) => updateCategory(i, "link", e.target.value)} placeholder="/help/getting-started" className="h-10 rounded-xl font-medium text-xs" />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="space-y-6 pt-6 border-t border-border/40">
                   <h4 className="text-sm font-black uppercase tracking-widest text-primary">Support Call-To-Action</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Button Text</Label>
                            <Input value={formData.cta.ticketText} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, ticketText: e.target.value }})} className="h-10 rounded-xl font-bold" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Button Link</Label>
                            <Input value={formData.cta.ticketLink} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, ticketLink: e.target.value }})} className="h-10 rounded-xl font-medium text-xs" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secondary Button Text</Label>
                            <Input value={formData.cta.emailText} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, emailText: e.target.value }})} className="h-10 rounded-xl font-bold" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secondary Button Link</Label>
                            <Input value={formData.cta.emailLink} onChange={(e) => setFormData({ ...formData, cta: { ...formData.cta, emailLink: e.target.value }})} className="h-10 rounded-xl font-medium text-xs" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeLegal !== 'help-center' && (
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Content (Markdown Supported)</Label>
                <Textarea 
                  value={formData.text} 
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })} 
                  placeholder="Write your policy content here..." 
                  className="min-h-[400px] rounded-2xl p-8 font-medium leading-relaxed" 
                />
              </div>
            )}
          </div>

          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/40 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium italic">
               <ShieldCheck className="w-4 h-4 text-primary" />
               Changes reflect immediately on the live page.
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isProcessing} 
              className="h-14 px-10 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all"
            >
              {isProcessing ? "Saving..." : "Save Content"}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-6">
              <h4 className="text-xl font-black text-primary">Content Guide</h4>
              <ul className="space-y-4">
                 {[
                   { t: "Markdown Support", d: "Use # for headings, ** for bold, and - for lists." },
                   { t: "Dynamic Headers", d: "The title and subtitle appear in the premium page header." },
                   { t: "SEO Optimized", d: "Clean semantic HTML is generated from your content." },
                   { t: "Auto-Sync", d: "Links in the footer are automatically updated." }
                 ].map((item, i) => (
                   <li key={i} className="space-y-1">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{item.t}</div>
                      <div className="text-xs text-muted-foreground font-medium">{item.d}</div>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
