"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Layout, Palette, Phone, Save, Settings2, Trash2, ChevronDown, Cpu, LayoutDashboard, FileText, Play, Rocket, Mail, ShieldCheck, UserCheck, BookOpenCheck, Menu, MousePointer2, ExternalLink, Plus, Check, X, Zap } from "lucide-react";
import { updateSiteSettings, updateLandingSection, syncAllSections } from "@/app/actions/site-settings";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SettingsForm({ settings }: { settings: any }) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [address, setAddress] = useState(settings.address);
  const [brandDescription, setBrandDescription] = useState(settings.brandDescription);
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks || {});
  const [navbarConfig, setNavbarConfig] = useState(settings.navbarConfig || {
    showNavbar: true,
    showTopBar: true,
    showMenus: true,
    ctaPrimary: { text: "Login", link: "/login" },
    ctaSecondary: { text: "Call Now", link: `tel:${settings.contactPhone || "8944899747"}` }
  });
  const [navigation, setNavigation] = useState(settings.navigation || [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Services", href: "/services", id: "services", isActive: true },
    { name: "Guide", href: "/guide", id: "guide", isActive: true },
    { name: "Pricing", href: "/pricing", id: "pricing", isActive: true },
    { name: "Support", href: "/support", id: "support", isActive: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSiteName(settings.siteName);
    setLogoUrl(settings.logoUrl);
    setPrimaryColor(settings.primaryColor);
    setAccentColor(settings.accentColor);
    setContactEmail(settings.contactEmail);
    setContactPhone(settings.contactPhone);
    setWhatsapp(settings.whatsapp);
    setAddress(settings.address);
    setBrandDescription(settings.brandDescription);
    setSocialLinks(settings.socialLinks || {});
    setNavbarConfig(settings.navbarConfig || {
      showNavbar: true,
      showTopBar: true,
      showMenus: true,
      ctaPrimary: { text: "Login", link: "/login" },
      ctaSecondary: { text: "Call Now", link: `tel:${settings.contactPhone || "8944899747"}` }
    });
    setNavigation(settings.navigation || [
      { name: "Home", href: "/", id: "home", isActive: true },
      { name: "About", href: "/about", id: "about", isActive: true },
      { name: "Services", href: "/services", id: "services", isActive: true },
      { name: "Guide", href: "/guide", id: "guide", isActive: true },
      { name: "Pricing", href: "/pricing", id: "pricing", isActive: true },
      { name: "Support", href: "/support", id: "support", isActive: true }
    ]);
  }, [settings]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      const result = await updateSiteSettings({
        siteName,
        logoUrl,
        primaryColor,
        accentColor,
        contactEmail,
        contactPhone,
        whatsapp,
        address,
        brandDescription,
        socialLinks,
        navbarConfig,
        navigation,
      });
      if (result.success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState("branding");

  return (
    <div className="w-full pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-12">
        {/* ROW 1: Navigation (Refined Professional Top Bar) */}
        <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 transition-all duration-300">
          <TabsList className="flex w-full h-12 bg-transparent p-0 gap-8 overflow-x-auto no-scrollbar justify-start border-none shadow-none">
            {[
              { value: "branding", label: "Branding & Contact", icon: Palette },
              { value: "navigation", label: "Navigation", icon: Globe },
              { value: "sections", label: "Sections", icon: Layout },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="group relative flex items-center gap-2.5 px-2 h-full rounded-none bg-transparent data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-primary transition-all text-sm font-semibold border-none shadow-none overflow-visible"
              >
                <tab.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                {tab.label}
                <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-primary scale-x-0 data-[state=active]:group-[]:scale-x-100 transition-transform origin-left" />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ROW 2: Content (Premium Minimalist Cards) */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto px-4 sm:px-6">
          
          <TabsContent value="branding" className="mt-0 w-full focus-visible:outline-none">
            <Accordion defaultValue={[]} className="space-y-6">
              
              {/* 1. Visual Identity */}
              <AccordionItem value="identity" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-8 px-6 sm:px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Visual Identity</h3>
                      <p className="text-sm text-muted-foreground font-medium">Site name, logo, and brand colors.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 px-6 sm:px-8 space-y-10">
                  <div className="space-y-3">
                    <Label htmlFor="siteName" className="text-sm font-semibold text-foreground/80">Site Name</Label>
                    <Input id="siteName" value={siteName || ""} onChange={(e) => setSiteName(e.target.value)} placeholder="Enter site name" className="h-12 bg-background border-border/40 rounded-2xl" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground/80">Primary Color</Label>
                      <div className="flex items-center gap-6 p-4 bg-background rounded-2xl border border-border/40 h-16 w-full">
                        <Input type="color" value={primaryColor || "#000000"} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 p-0.5 border-none bg-transparent cursor-pointer shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold uppercase tracking-wider">{primaryColor}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Main Theme</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground/80">Accent Color</Label>
                      <div className="flex items-center gap-6 p-4 bg-background rounded-2xl border border-border/40 h-16 w-full">
                        <Input type="color" value={accentColor || "#000000"} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 p-0.5 border-none bg-transparent cursor-pointer shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold uppercase tracking-wider">{accentColor}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Secondary Theme</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo" folder="ABCDEdutHub/branding" />
                  
                  <div className="space-y-3">
                    <Label htmlFor="brandDescription" className="text-sm font-semibold text-foreground/80">Brand Description (Footer)</Label>
                    <Textarea id="brandDescription" value={brandDescription || ""} onChange={(e) => setBrandDescription(e.target.value)} placeholder="Rendering at footer..." className="min-h-[100px] bg-background border-border/40 rounded-2xl" />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-11 px-8 gap-2 rounded-xl font-bold">
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Update Identity"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Global Contact Info */}
              <AccordionItem value="contact" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-8 px-6 sm:px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Global Contact Info</h3>
                      <p className="text-sm text-muted-foreground font-medium">Direct support channels and location.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 px-6 sm:px-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground/80">Support Email</Label>
                      <Input value={contactEmail || ""} onChange={(e) => setContactEmail(e.target.value)} className="h-12 bg-background border-border/40 rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground/80">Phone Number</Label>
                      <Input value={contactPhone || ""} onChange={(e) => setContactPhone(e.target.value)} className="h-12 bg-background border-border/40 rounded-2xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground/80">WhatsApp Number</Label>
                      <Input value={whatsapp || ""} onChange={(e) => setWhatsapp(e.target.value)} className="h-12 bg-background border-border/40 rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground/80">Physical Address</Label>
                      <Input value={address || ""} onChange={(e) => setAddress(e.target.value)} className="h-12 bg-background border-border/40 rounded-2xl" />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-11 px-8 gap-2 rounded-xl font-bold">
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Update Contact Info"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Social Presence */}
              <AccordionItem value="social" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-8 px-6 sm:px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Social Presence</h3>
                      <p className="text-sm text-muted-foreground font-medium">Links to your community profiles.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                    <div key={platform} className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest">{platform}</Label>
                      <Input value={socialLinks[platform] || ""} onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })} placeholder={`https://${platform}.com/...`} className="h-12 bg-background border-border/40 rounded-2xl" />
                    </div>
                  ))}
                  <div className="md:col-span-2 pt-4 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-11 px-8 gap-2 rounded-xl font-bold">
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Update Social Links"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Navbar Configuration (NEW) */}
              <AccordionItem value="navbar" className="border border-border/50 bg-card/50 rounded-3xl overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-8 px-6 sm:px-8">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Menu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Navbar Logic</h3>
                      <p className="text-sm text-muted-foreground font-medium">Global header visibility and CTA buttons.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-10 px-6 sm:px-8 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center justify-between p-5 bg-background rounded-2xl border border-border/40">
                      <span className="text-sm font-bold">Show Navbar</span>
                      <Switch checked={!!navbarConfig.showNavbar} onCheckedChange={(val) => setNavbarConfig({...navbarConfig, showNavbar: val})} />
                    </div>
                    <div className="flex items-center justify-between p-5 bg-background rounded-2xl border border-border/40">
                      <span className="text-sm font-bold">Show Top Bar</span>
                      <Switch checked={!!navbarConfig.showTopBar} onCheckedChange={(val) => setNavbarConfig({...navbarConfig, showTopBar: val})} />
                    </div>
                    <div className="flex items-center justify-between p-5 bg-background rounded-2xl border border-border/40">
                      <span className="text-sm font-bold">Show Menus</span>
                      <Switch checked={!!navbarConfig.showMenus} onCheckedChange={(val) => setNavbarConfig({...navbarConfig, showMenus: val})} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <MousePointer2 className="w-5 h-5 text-primary" />
                      <h4 className="font-bold uppercase tracking-widest text-[10px]">Button Actions</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 p-6 bg-background rounded-[2rem] border border-border/40">
                        <Label className="text-xs font-black uppercase text-primary">Primary Button (Solid)</Label>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold">Text Label</Label>
                          <Input value={navbarConfig.ctaPrimary?.text} onChange={(e) => setNavbarConfig({...navbarConfig, ctaPrimary: {...navbarConfig.ctaPrimary, text: e.target.value}})} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold">Action URL</Label>
                          <Input value={navbarConfig.ctaPrimary?.link} onChange={(e) => setNavbarConfig({...navbarConfig, ctaPrimary: {...navbarConfig.ctaPrimary, link: e.target.value}})} className="h-10 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-4 p-6 bg-background rounded-[2rem] border border-border/40">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Secondary Button (Ghost)</Label>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold">Text Label</Label>
                          <Input value={navbarConfig.ctaSecondary?.text} onChange={(e) => setNavbarConfig({...navbarConfig, ctaSecondary: {...navbarConfig.ctaSecondary, text: e.target.value}})} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold">Action URL</Label>
                          <Input value={navbarConfig.ctaSecondary?.link} onChange={(e) => setNavbarConfig({...navbarConfig, ctaSecondary: {...navbarConfig.ctaSecondary, link: e.target.value}})} className="h-10 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-12 px-10 gap-3 rounded-2xl font-black bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                      <Save className="h-5 w-5" /> {isSaving ? "Updating..." : "Update Navbar Settings"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="navigation" className="mt-0 w-full focus-visible:outline-none">
            <div className="space-y-10">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Menu Ecosystem</h2>
                <p className="text-muted-foreground text-sm">Add, remove, or toggle visibility of navigation links.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {navigation.map((nav: any, index: number) => (
                  <div key={nav.id || index} className={`group flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${nav.isActive ? "bg-white dark:bg-zinc-900 border-border/60 shadow-sm" : "bg-muted/30 border-transparent opacity-60 grayscale"}`}>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${nav.isActive ? "bg-primary text-primary-foreground" : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"}`}>
                        {index + 1}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <Input value={nav.name} onChange={(e) => {
                          const newNav = [...navigation];
                          newNav[index] = { ...newNav[index], name: e.target.value };
                          setNavigation(newNav);
                        }} className="h-8 font-bold border-none bg-transparent p-0 focus-visible:ring-0 text-lg" />
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                          <ExternalLink className="w-3 h-3" />
                          <Input value={nav.href} onChange={(e) => {
                            const newNav = [...navigation];
                            newNav[index] = { ...newNav[index], href: e.target.value };
                            setNavigation(newNav);
                          }} className="h-6 border-none bg-transparent p-0 focus-visible:ring-0 text-xs text-primary underline" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6 md:mt-0 w-full md:w-auto justify-end">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-border/40">
                        <span className="text-[10px] font-black uppercase tracking-widest">{nav.isActive ? "Active" : "Hidden"}</span>
                        <Switch 
                          checked={!!nav.isActive} 
                          disabled={nav.name === "Home" || nav.name === "Support"}
                          onCheckedChange={(val) => {
                            const newNav = [...navigation];
                            newNav[index] = { ...newNav[index], isActive: val };
                            setNavigation(newNav);
                          }} 
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setNavigation(navigation.filter((_: any, i: number) => i !== index));
                      }} className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={() => {
                  setNavigation([...navigation, { name: "New Link", href: "#", id: Math.random().toString(), isActive: true }]);
                }} className="h-24 border-dashed border-2 rounded-[2rem] flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all w-full group">
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:scale-125 transition-transform" />
                  <span className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Append Navigation Link</span>
                </Button>
                
                <div className="pt-10 flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={isSaving} className="h-14 px-12 gap-3 rounded-[1.5rem] font-black text-lg shadow-2xl hover:shadow-primary/20 active:scale-95 transition-all">
                    <Save className="h-5 w-5" /> {isSaving ? "Applying Menus..." : "Save Navigation"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="mt-0 w-full space-y-8 focus-visible:outline-none">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="flex flex-col gap-1">
                 <h2 className="text-2xl font-bold tracking-tight">Page Sections</h2>
                 <p className="text-muted-foreground text-sm">Enable or disable specific areas of your landing page.</p>
               </div>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={async () => {
                   const types = ['hero', 'about', 'why-choose-us', 'achievements', 'partners', 'our-message', 'mission', 'vision', 'services', 'guide-steps', 'guide-resources', 'ready-to-modernize', 'custom-solution', 'pricing', 'testimonials', 'faq', 'contact'];
                   const res = await syncAllSections(settings.id, types);
                   if (res.success) {
                     toast.success(res.created ? `Initialized ${res.created} new sections!` : "All sections are already synced.");
                     if (res.created) window.location.reload();
                   }
                 }}
                 className="rounded-2xl h-12 px-6 gap-3 border-primary/20 text-primary hover:bg-primary/5 font-black shadow-lg shadow-primary/5 active:scale-95 transition-all"
               >
                 <Plus className="h-5 w-5" /> Sync Missing Sections
               </Button>
             </div>
            <div className="space-y-4">
                {settings.sections?.map((section: any) => (
                  <SectionEditor key={section.id} section={section} settings={settings} />
                ))}
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}

function SectionEditor({ section, settings }: { section: any, settings: any }) {
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
    <div className={`p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 ${isActive ? 'bg-white dark:bg-zinc-900 border-border/60 shadow-sm' : 'bg-muted/30 border-transparent opacity-60'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground'}`}>
            <Layout className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="capitalize font-black text-sm tracking-tight">{section.type.replace("-", " ")}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{isActive ? 'Visible to Public' : 'Hidden from Public'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-10 px-4 rounded-xl font-bold text-xs gap-2 ${isExpanded ? 'bg-primary/5 text-primary' : ''}`}
          >
            <Settings2 className="h-4 w-4" /> {isExpanded ? 'Close Editor' : 'Modify Content'}
          </Button>
          <div className="h-10 w-[1px] bg-border/40 mx-1" />
          <Switch 
            checked={isActive} 
            onCheckedChange={(val) => {
              setIsActive(val);
              // Auto-save toggle for better UX
              updateLandingSection(section.id, { ...section, isActive: val });
            }} 
            className="data-[state=checked]:bg-primary" 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-border/40 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Section Heading</Label>
                <Input value={title || ""} onChange={(e) => setTitle(e.target.value)} className="h-12 rounded-2xl bg-muted/5 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Section Tagline</Label>
                <Input value={subtitle || ""} onChange={(e) => setSubtitle(e.target.value)} className="h-12 rounded-2xl bg-muted/5 border-none" />
              </div>
            </div>

            {/* Specialized Content Editors */}
            <div className="bg-muted/5 p-6 rounded-[2rem] border border-border/20 shadow-inner">
               {section.type === 'hero' && <HeroContentEditor content={content} setContent={setContent} />}
               {section.type === 'about' && <AboutContentEditor content={content} setContent={setContent} />}
               {section.type === 'why-choose-us' && <WhyChooseUsContentEditor content={content} setContent={setContent} />}
               {section.type === 'achievements' && <AchievementsContentEditor content={content} setContent={setContent} />}
               {section.type === 'partners' && <PartnersContentEditor content={content} setContent={setContent} />}
               {section.type === 'testimonials' && <ListContentEditor title="Testimonials" content={content} setContent={setContent} itemFields={['name', 'role', 'text', 'avatar']} />}
               {section.type === 'faq' && <FaqContentEditor content={content} setContent={setContent} />}
               {section.type === 'our-message' && <OurMessageContentEditor content={content} setContent={setContent} />}
               {section.type === 'mission' && <MissionContentEditor content={content} setContent={setContent} />}
               {section.type === 'vision' && <VisionContentEditor content={content} setContent={setContent} />}
               {section.type === 'services' && <ServicesContentEditor content={content} setContent={setContent} />}
               {section.type === 'guide-steps' && <GuideStepsContentEditor content={content} setContent={setContent} />}
               {section.type === 'guide-resources' && <GuideResourcesContentEditor content={content} setContent={setContent} />}
               {section.type === 'ready-to-modernize' && <ReadyToModernizeContentEditor content={content} setContent={setContent} />}
               {section.type === 'custom-solution' && <CustomSolutionContentEditor content={content} setContent={setContent} />}
               {section.type === 'pricing' && <PricingContentEditor content={content} setContent={setContent} />}
               {section.type === 'contact' && <ContactContentEditor content={content} setContent={setContent} settings={settings} />}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleUpdate} disabled={isSaving} className="h-12 px-8 gap-3 rounded-2xl font-black shadow-xl shadow-primary/10">
                <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Commit Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Specialized Editors ---

function HeroContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-black uppercase text-primary tracking-widest">Slide Management</Label>
        <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-bold" onClick={() => {
          const newSlides = [...(content.slides || []), { 
            src: "", 
            tagline: "New Adventure", 
            title: "New Slide", 
            subtitle: "Description...", 
            primaryButtonText: "Get Started", 
            primaryButtonLink: "#",
            secondaryButtonText: "Book a Demo",
            secondaryButtonLink: "#"
          }];
          setContent({ ...content, slides: newSlides });
        }}>Add Slide</Button>
      </div>
      <div className="space-y-6">
        {(content.slides || []).map((slide: any, idx: number) => (
          <div key={idx} className="p-6 bg-background border border-border/40 rounded-2xl space-y-6 relative group shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary/60">SLIDE #{idx + 1}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 rounded-lg" onClick={() => {
                const newSlides = content.slides.filter((_: any, i: number) => i !== idx);
                setContent({ ...content, slides: newSlides });
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ImageUpload 
                  value={slide.src || ""} 
                  onChange={(url) => { const n = [...content.slides]; n[idx].src = url; setContent({ ...content, slides: n }); }} 
                  label="Background Banner" 
                  folder="ABCDEdutHub/hero"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Tagline</Label>
                <Input value={slide.tagline || ""} onChange={(e) => { const n = [...content.slides]; n[idx].tagline = e.target.value; setContent({ ...content, slides: n }); }} className="h-10 bg-muted/5" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">Slide Heading</Label>
              <Input value={slide.title || ""} onChange={(e) => { const n = [...content.slides]; n[idx].title = e.target.value; setContent({ ...content, slides: n }); }} className="h-10 bg-muted/5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">Description</Label>
              <Textarea value={slide.subtitle || ""} onChange={(e) => { const n = [...content.slides]; n[idx].subtitle = e.target.value; setContent({ ...content, slides: n }); }} className="min-h-[80px] bg-muted/5" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-primary">Primary Button Label</Label>
                <Input value={slide.primaryButtonText || ""} onChange={(e) => { const n = [...content.slides]; n[idx].primaryButtonText = e.target.value; setContent({ ...content, slides: n }); }} placeholder="e.g. Get Started" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-primary">Primary Button Link</Label>
                <Input value={slide.primaryButtonLink || ""} onChange={(e) => { const n = [...content.slides]; n[idx].primaryButtonLink = e.target.value; setContent({ ...content, slides: n }); }} placeholder="e.g. /register" className="h-9 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Secondary Button Label</Label>
                <Input value={slide.secondaryButtonText || ""} onChange={(e) => { const n = [...content.slides]; n[idx].secondaryButtonText = e.target.value; setContent({ ...content, slides: n }); }} placeholder="e.g. Book a Demo" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Secondary Button Link</Label>
                <Input value={slide.secondaryButtonLink || ""} onChange={(e) => { const n = [...content.slides]; n[idx].secondaryButtonLink = e.target.value; setContent({ ...content, slides: n }); }} placeholder="e.g. /contact" className="h-9 text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
             <ImageUpload 
               value={content.image || ""} 
               onChange={(url) => setContent({ ...content, image: url })} 
               label="Main Image" 
               folder="ABCDEdutHub/about"
             />
          </div>
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Floating Metric (e.g. "500+")</Label>
             <Input value={content.metricValue || ""} onChange={(e) => setContent({ ...content, metricValue: e.target.value })} className="h-11 bg-background" />
          </div>
       </div>
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Long Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[120px] bg-background" />
       </div>

       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Statistical Counters" 
            content={{ items: content.stats || [] }} 
            setContent={(newContent: any) => setContent({ ...content, stats: newContent.items })} 
            itemFields={['label', 'value', 'suffix', 'color']} 
          />
          <p className="text-[10px] text-muted-foreground mt-2 px-2 italic">Color options: text-primary, text-blue-600, text-pink-600, text-zinc-500</p>
       </div>

       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Core Features" 
            content={{ items: (content.features || []).map((i: string) => ({ text: i })) }} 
            setContent={(newContent: any) => setContent({ ...content, features: newContent.items.map((i: any) => i.text) })} 
            itemFields={['text']} 
          />
       </div>
    </div>
  );
}

function WhyChooseUsContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <div className="space-y-3">
          <ImageUpload 
            value={content.image || ""} 
            onChange={(url) => setContent({ ...content, image: url })} 
            label="Banner Image" 
            folder="ABCDEdutHub/why-choose-us"
          />
       </div>
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Intro Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[100px] bg-background" />
       </div>

       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Benefit Cards (Features)" 
            content={{ items: content.features || [] }} 
            setContent={(newContent: any) => setContent({ ...content, features: newContent.items })} 
            itemFields={['icon', 'title', 'description']} 
          />
          <p className="text-[10px] text-muted-foreground mt-2 px-2 italic">Available Icons: Zap, ShieldCheck, Cpu, Globe, Rocket, Brain, GraduationCap, Users, Layout</p>
       </div>
    </div>
  );
}

function AchievementsContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Intro Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[80px] bg-background" />
       </div>

       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Achievement Cards" 
            content={{ items: content.items || [] }} 
            setContent={(newContent: any) => setContent({ ...content, items: newContent.items })} 
            itemFields={['src', 'title', 'description']} 
          />
       </div>
    </div>
  );
}

function PartnersContentEditor({ content, setContent }: any) {
  return (
    <div className="pt-4">
       <ListContentEditor 
         title="Partner Logos" 
         content={{ items: (content.logos || []).map((l: string) => ({ image: l })) }} 
         setContent={(newContent: any) => setContent({ ...content, logos: newContent.items.map((i: any) => i.image) })} 
         itemFields={['image']} 
       />
    </div>
  );
}

function FaqContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <div className="space-y-3">
          <ImageUpload 
            value={content.image || ""} 
            onChange={(url) => setContent({ ...content, image: url })} 
            label="Left-side Support Image" 
            folder="ABCDEdutHub/faq"
          />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Image Title Overlay</Label>
             <Input value={content.imageTitle || ""} onChange={(e) => setContent({ ...content, imageTitle: e.target.value })} placeholder="e.g. 24/7 Support" className="h-11 bg-background" />
          </div>
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Image Desc Overlay</Label>
             <Input value={content.imageDesc || ""} onChange={(e) => setContent({ ...content, imageDesc: e.target.value })} placeholder="e.g. Always ready to help" className="h-11 bg-background" />
          </div>
       </div>
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Intro Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[100px] bg-background" />
       </div>

       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Questions & Answers" 
            content={{ items: content.items || [] }} 
            setContent={(newContent: any) => setContent({ ...content, items: newContent.items })} 
            itemFields={['question', 'answer']} 
          />
       </div>
    </div>
  );
}

function OurMessageContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUpload value={content.bgImage || ""} onChange={(url) => setContent({ ...content, bgImage: url })} label="Parallax Background Image" folder="ABCDEdutHub/about" />
          <ImageUpload value={content.sideImage || ""} onChange={(url) => setContent({ ...content, sideImage: url })} label="Side Cinematic Image" folder="ABCDEdutHub/about" />
       </div>
       <div className="space-y-6">
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Main Quote</Label>
             <Textarea value={content.quote || ""} onChange={(e) => setContent({ ...content, quote: e.target.value })} className="min-h-[80px] font-serif italic text-lg" />
          </div>
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Message Description</Label>
             <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[100px]" />
          </div>
       </div>
       <div className="pt-8 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-6">
             <div className="space-y-3">
                <Label className="text-xs font-bold uppercase">Author Name</Label>
                <Input value={content.authorName || ""} onChange={(e) => setContent({ ...content, authorName: e.target.value })} />
             </div>
             <div className="space-y-3">
                <Label className="text-xs font-bold uppercase">Author Role</Label>
                <Input value={content.authorRole || ""} onChange={(e) => setContent({ ...content, authorRole: e.target.value })} />
             </div>
          </div>
          <ImageUpload value={content.authorAvatar || ""} onChange={(url) => setContent({ ...content, authorAvatar: url })} label="Author Avatar" folder="ABCDEdutHub/about" />
       </div>
    </div>
  );
}

function MissionContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <ImageUpload value={content.image || ""} onChange={(url) => setContent({ ...content, image: url })} label="Mission Image" folder="ABCDEdutHub/about" />
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Mission Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[100px]" />
       </div>
       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Mission Highlights" 
            content={{ items: (content.items || []).map((i: string) => ({ text: i })) }} 
            setContent={(newContent: any) => setContent({ ...content, items: newContent.items.map((i: any) => i.text) })} 
            itemFields={['text']} 
          />
       </div>
    </div>
  );
}

function VisionContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
       <ImageUpload value={content.image || ""} onChange={(url) => setContent({ ...content, image: url })} label="Vision Image" folder="ABCDEdutHub/about" />
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Vision Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} className="min-h-[100px]" />
       </div>
       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Vision Cards" 
            content={{ items: content.items || [] }} 
            setContent={(newContent: any) => setContent({ ...content, items: newContent.items })} 
            itemFields={['icon', 'title', 'text']} 
          />
          <p className="text-[10px] text-muted-foreground mt-2 px-2 italic">Icons: rocket, sparkles, globe, eye, target, zap</p>
       </div>
    </div>
  );
}

function ServicesContentEditor({ content, setContent }: any) {
  const lms = content.lms || {};
  const ecosystem = content.ecosystem || {};
  const highlights = content.highlights || [];

  return (
    <div className="space-y-16">
       {/* 0. Global Toggles */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/20">
          <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
            <span className="text-sm font-bold">Show Highlights</span>
            <Switch checked={content.showHighlights !== false} onCheckedChange={(val) => setContent({...content, showHighlights: val})} />
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
            <span className="text-sm font-bold">Show LMS</span>
            <Switch checked={content.showLms !== false} onCheckedChange={(val) => setContent({...content, showLms: val})} />
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
            <span className="text-sm font-bold">Show Ecosystem</span>
            <Switch checked={content.showEcosystem !== false} onCheckedChange={(val) => setContent({...content, showEcosystem: val})} />
          </div>
       </div>

       {/* 1. Highlights Editor (The 4 Cards) */}
       <div className="space-y-8">
          <Label className="text-lg font-black uppercase text-primary border-b-2 border-primary/20 pb-2 flex items-center gap-2">
             <Zap className="h-5 w-5" /> Service Highlights (4 Cards)
          </Label>
          <ListContentEditor 
             title="Highlights" 
             content={{ items: highlights }} 
             setContent={(newContent: any) => setContent({ ...content, highlights: newContent.items })} 
             itemFields={['icon', 'title', 'desc']} 
          />
          <p className="text-[10px] text-muted-foreground mt-2 px-2 italic">Icons: globe, cpu, shield, zap, rocket, target</p>
       </div>

       {/* 2. LMS Part */}
       <div className="space-y-8">
          <Label className="text-lg font-black uppercase text-primary border-b-2 border-primary/20 pb-2 flex items-center gap-2">
             <Cpu className="h-5 w-5" /> Next-Gen LMS
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="space-y-3">
                   <Label className="text-xs font-bold uppercase">LMS Title</Label>
                   <Input value={lms.title || ""} onChange={(e) => setContent({ ...content, lms: { ...lms, title: e.target.value } })} />
                </div>
                <div className="space-y-3">
                   <Label className="text-xs font-bold uppercase">LMS Subtitle (Badge)</Label>
                   <Input value={lms.subtitle || ""} onChange={(e) => setContent({ ...content, lms: { ...lms, subtitle: e.target.value } })} />
                </div>
                <div className="space-y-3">
                   <Label className="text-xs font-bold uppercase">LMS Description</Label>
                   <Textarea value={lms.description || ""} onChange={(e) => setContent({ ...content, lms: { ...lms, description: e.target.value } })} className="min-h-[100px]" />
                </div>
             </div>
             <ImageUpload value={lms.image || ""} onChange={(url) => setContent({ ...content, lms: { ...lms, image: url } })} label="LMS Preview Image" folder="ABCDEdutHub/services" />
          </div>
          <div className="pt-4">
             <ListContentEditor 
                title="LMS Key Features" 
                content={{ items: lms.features || [] }} 
                setContent={(newContent: any) => setContent({ ...content, lms: { ...lms, features: newContent.items } })} 
                itemFields={['title', 'text']} 
             />
          </div>
       </div>

       {/* 3. Ecosystem Part */}
       <div className="space-y-8">
          <Label className="text-lg font-black uppercase text-primary border-b-2 border-primary/20 pb-2 flex items-center gap-2">
             <LayoutDashboard className="h-5 w-5" /> Dashboard Ecosystem
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase">Ecosystem Title</h4>
                <Input value={ecosystem.title || ""} onChange={(e) => setContent({ ...content, ecosystem: { ...ecosystem, title: e.target.value } })} />
             </div>
             <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase">Ecosystem Description</h4>
                <Textarea value={ecosystem.description || ""} onChange={(e) => setContent({ ...content, ecosystem: { ...ecosystem, description: e.target.value } })} />
             </div>
          </div>
          <div className="pt-4">
             <ListContentEditor 
                title="Role Management Cards" 
                content={{ items: ecosystem.roles || [] }} 
                setContent={(newContent: any) => setContent({ ...content, ecosystem: { ...ecosystem, roles: newContent.items } })} 
                itemFields={['title', 'description', 'icon', 'color']} 
             />
             <p className="text-[10px] text-muted-foreground mt-2 px-2 italic">Icons: shield, briefcase, wallet, users, graduation, heart, globe, zap, target</p>
          </div>
       </div>
    </div>
  );
}

function ReadyToModernizeContentEditor({ content, setContent }: any) {
  return (
    <div className="space-y-10">
        <ImageUpload value={content.bgImage || ""} onChange={(url) => setContent({ ...content, bgImage: url })} label="Parallax Background Image" folder="ABCDEdutHub/services" />
        <div className="space-y-3">
           <Label className="text-xs font-bold uppercase">Main Description</Label>
           <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} />
        </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 border border-border/40 rounded-2xl space-y-4">
             <Label className="text-xs font-bold uppercase">Primary Button (Pill)</Label>
             <div className="space-y-2">
                <Input value={content.primaryBtn?.label || ""} onChange={(e) => setContent({ ...content, primaryBtn: { ...content.primaryBtn, label: e.target.value } })} placeholder="Label" />
                <Input value={content.primaryBtn?.link || ""} onChange={(e) => setContent({ ...content, primaryBtn: { ...content.primaryBtn, link: e.target.value } })} placeholder="Link" />
             </div>
          </div>
          <div className="p-4 border border-border/40 rounded-2xl space-y-4">
             <Label className="text-xs font-bold uppercase">Secondary Button (Ghost)</Label>
             <div className="space-y-2">
                <Input value={content.secondaryBtn?.label || ""} onChange={(e) => setContent({ ...content, secondaryBtn: { ...content.secondaryBtn, label: e.target.value } })} placeholder="Label" />
                <Input value={content.secondaryBtn?.link || ""} onChange={(e) => setContent({ ...content, secondaryBtn: { ...content.secondaryBtn, link: e.target.value } })} placeholder="Link" />
             </div>
          </div>
       </div>
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Trust Badge Text</Label>
          <Input value={content.trustText || ""} onChange={(e) => setContent({ ...content, trustText: e.target.value })} />
       </div>
    </div>
  );
}

function GuideStepsContentEditor({ content, setContent }: any) {
  const steps = (content.steps || []).map((s: any) => ({
    ...s,
    substeps: Array.isArray(s.substeps) ? s.substeps.join(", ") : (s.substeps || "")
  }));

  return (
    <div className="space-y-10">
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} />
       </div>
       <div className="pt-8 border-t border-border/30">
          <ListContentEditor 
            title="Onboarding Steps" 
            content={{ items: steps }} 
            setContent={(newContent: any) => {
              const processed = newContent.items.map((s: any) => ({
                ...s,
                substeps: typeof s.substeps === 'string' ? s.substeps.split(",").map((i: string) => i.trim()).filter(Boolean) : s.substeps
              }));
              setContent({ ...content, steps: processed });
            }} 
            itemFields={['title', 'subtitle', 'desc', 'icon', 'substeps']} 
          />
          <p className="text-[10px] text-muted-foreground mt-2 px-2 italic">Icons: userPlus, settings, book, rocket, userCheck, dashboard, cpu, shield</p>
       </div>
    </div>
  );
}

function GuideResourcesContentEditor({ content, setContent }: any) {
  const video = content.video || {};
  const docs = content.docs || {};

  return (
    <div className="space-y-16">
       {/* Video Part */}
       <div className="space-y-8">
          <Label className="text-lg font-black uppercase text-primary border-b-2 border-primary/20 pb-2 flex items-center gap-2">
             <Play className="h-5 w-5" /> Video Tutorial
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Video Badge</Label>
                   <Input value={video.badge || ""} onChange={(e) => setContent({ ...content, video: { ...video, badge: e.target.value } })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Video Title</Label>
                   <Input value={video.title || ""} onChange={(e) => setContent({ ...content, video: { ...video, title: e.target.value } })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Video Description</Label>
                   <Textarea value={video.description || ""} onChange={(e) => setContent({ ...content, video: { ...video, description: e.target.value } })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">YouTube Embed URL</Label>
                   <Input value={video.url || ""} onChange={(e) => setContent({ ...content, video: { ...video, url: e.target.value } })} placeholder="https://www.youtube.com/embed/..." />
                </div>
             </div>
             <div className="p-8 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                <Play className="h-12 w-12 text-primary/20 mb-4" />
                <p className="text-xs text-muted-foreground">Video preview will appear on the guide page.</p>
             </div>
          </div>
       </div>

       {/* Documentation Part */}
       <div className="space-y-8">
          <Label className="text-lg font-black uppercase text-primary border-b-2 border-primary/20 pb-2 flex items-center gap-2">
             <FileText className="h-5 w-5" /> Documentation PDF
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Docs Title</Label>
                   <Input value={docs.title || ""} onChange={(e) => setContent({ ...content, docs: { ...docs, title: e.target.value } })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Docs Description</Label>
                   <Textarea value={docs.description || ""} onChange={(e) => setContent({ ...content, docs: { ...docs, description: e.target.value } })} />
                </div>
             </div>
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Button Label</Label>
                   <Input value={docs.btnLabel || ""} onChange={(e) => setContent({ ...content, docs: { ...docs, btnLabel: e.target.value } })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Download Link (PDF)</Label>
                   <Input value={docs.btnLink || ""} onChange={(e) => setContent({ ...content, docs: { ...docs, btnLink: e.target.value } })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase">Social Proof Text</Label>
                   <Input value={docs.joinedText || ""} onChange={(e) => setContent({ ...content, docs: { ...docs, joinedText: e.target.value } })} />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function CustomSolutionContentEditor({ content, setContent }: any) {
  const contact = content.contact || {};

  return (
    <div className="space-y-10">
       <ImageUpload value={content.bgImage || ""} onChange={(url) => setContent({ ...content, bgImage: url })} label="Parallax Background Image" folder="ABCDEdutHub/pricing" />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Badge Text</Label>
             <Input value={content.badge || ""} onChange={(e) => setContent({ ...content, badge: e.target.value })} />
          </div>
          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase">Section Heading</Label>
             <Input value={content.title || ""} onChange={(e) => setContent({ ...content, title: e.target.value })} />
          </div>
       </div>
       <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Main Description</Label>
          <Textarea value={content.description || ""} onChange={(e) => setContent({ ...content, description: e.target.value })} />
       </div>

       {/* Contact Details */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <Label className="text-xs font-bold uppercase">Phone Number</Label>
             <Input value={contact.phone || ""} onChange={(e) => setContent({ ...content, contact: { ...contact, phone: e.target.value } })} />
          </div>
          <div className="space-y-2">
             <Label className="text-xs font-bold uppercase">Email Address</Label>
             <Input value={contact.email || ""} onChange={(e) => setContent({ ...content, contact: { ...contact, email: e.target.value } })} />
          </div>
          <div className="space-y-2">
             <Label className="text-xs font-bold uppercase">WhatsApp Number</Label>
             <Input value={contact.whatsapp || ""} onChange={(e) => setContent({ ...content, contact: { ...contact, whatsapp: e.target.value } })} />
          </div>
       </div>

       {/* Buttons */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="p-4 border border-border/40 rounded-2xl space-y-4">
             <Label className="text-xs font-bold uppercase">Primary Button</Label>
             <div className="space-y-2">
                <Input value={content.primaryBtn?.label || ""} onChange={(e) => setContent({ ...content, primaryBtn: { ...content.primaryBtn, label: e.target.value } })} placeholder="Label" />
                <Input value={content.primaryBtn?.link || ""} onChange={(e) => setContent({ ...content, primaryBtn: { ...content.primaryBtn, link: e.target.value } })} placeholder="Link" />
             </div>
          </div>
          <div className="p-4 border border-border/40 rounded-2xl space-y-4">
             <Label className="text-xs font-bold uppercase">Secondary Button</Label>
             <div className="space-y-2">
                <Input value={content.secondaryBtn?.label || ""} onChange={(e) => setContent({ ...content, secondaryBtn: { ...content.secondaryBtn, label: e.target.value } })} placeholder="Label" />
                <Input value={content.secondaryBtn?.link || ""} onChange={(e) => setContent({ ...content, secondaryBtn: { ...content.secondaryBtn, link: e.target.value } })} placeholder="Link" />
             </div>
          </div>
       </div>
    </div>
  );
}

function PricingContentEditor({ content, setContent }: any) {
  const plans = content.plans || [
    { name: "Coaching Plan", monthlyPrice: "1,299", yearlyPrice: "999", description: "Ideal for individual coaches.", features: ["Complete Separate Workspace", "AI Assessments"] },
    { name: "Institute Plan", monthlyPrice: "2,499", yearlyPrice: "1,999", description: "Standard choice for schools.", features: ["All Coaching Features", "Financial Management"] },
    { name: "Enterprise Plan", monthlyPrice: "Custom", yearlyPrice: "Custom", description: "Unlimited for large franchises.", features: ["All Institute Features", "White-label Support"] }
  ];

  return (
    <div className="space-y-12">
      {/* Demo Banner Toggle */}
      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold">Free Demo Banner</h4>
            <p className="text-xs text-muted-foreground">Show the 30-day free trial offer at the top.</p>
          </div>
        </div>
        <Switch 
          checked={!!content.showDemoBanner} 
          onCheckedChange={(val) => setContent({ ...content, showDemoBanner: val })} 
        />
      </div>

      {/* Plans List */}
      <div className="space-y-8">
        <Label className="text-sm font-black uppercase text-primary tracking-widest px-2">Subscription Plans</Label>
        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan: any, idx: number) => (
            <div key={idx} className="p-8 bg-background border border-border/40 rounded-[2.5rem] space-y-6 relative group shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Plan Name</Label>
                      <Input value={plan.name} onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[idx].name = e.target.value;
                        setContent({ ...content, plans: newPlans });
                      }} className="h-10 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Description</Label>
                      <Input value={plan.description} onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[idx].description = e.target.value;
                        setContent({ ...content, plans: newPlans });
                      }} className="h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-primary">Monthly Price (₹)</Label>
                      <Input value={plan.monthlyPrice} onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[idx].monthlyPrice = e.target.value;
                        setContent({ ...content, plans: newPlans });
                      }} className="h-10 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-indigo-600">Yearly Price (₹)</Label>
                      <Input value={plan.yearlyPrice} onChange={(e) => {
                        const newPlans = [...plans];
                        newPlans[idx].yearlyPrice = e.target.value;
                        setContent({ ...content, plans: newPlans });
                      }} className="h-10 font-black" />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-3">
                   <Label className="text-[10px] uppercase font-bold text-muted-foreground">Features (Comma Separated)</Label>
                   <Textarea 
                     value={plan.features?.join(", ")} 
                     onChange={(e) => {
                       const newPlans = [...plans];
                       newPlans[idx].features = e.target.value.split(",").map(f => f.trim());
                       setContent({ ...content, plans: newPlans });
                     }} 
                     className="min-h-[120px] text-xs leading-relaxed" 
                   />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactContentEditor({ content, setContent, settings }: any) {
  return (
    <div className="space-y-12">
      <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/20 space-y-6">
        <div className="flex items-center gap-4 border-b border-indigo-500/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Contact Form Settings</h4>
            <p className="text-xs text-muted-foreground font-medium">Control what visitors see on the contact section.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Visible Fields</Label>
              <div className="grid grid-cols-2 gap-4">
                {['showPhone', 'showAddress', 'showSocials', 'showMap'].map((field) => (
                  <div key={field} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
                    <span className="text-[10px] font-bold uppercase">{field.replace("show", "")}</span>
                    <Switch 
                      checked={content[field] !== false} 
                      onCheckedChange={(val) => setContent({ ...content, [field]: val })} 
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
           </div>
           <div className="space-y-4">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Custom Text</Label>
              <div className="space-y-3">
                 <Label className="text-[10px]">Button Text</Label>
                 <Input value={content.buttonText || "Send Message"} onChange={(e) => setContent({ ...content, buttonText: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px]">Success Message</Label>
                 <Input value={content.successMsg || "Message sent successfully!"} onChange={(e) => setContent({ ...content, successMsg: e.target.value })} className="h-10 text-xs" />
              </div>
           </div>
        </div>
      </div>

      {/* CTA Box Settings */}
      <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 space-y-8">
        <div className="flex items-center justify-between border-b border-primary/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">CTA Box Settings</h4>
              <p className="text-xs text-muted-foreground font-medium">Customize the "Get Started" box on the left side.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-xl border border-border/40 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest">{content.ctaBox?.show !== false ? "Enabled" : "Disabled"}</span>
            <Switch 
              checked={content.ctaBox?.show !== false} 
              onCheckedChange={(val) => setContent({ ...content, ctaBox: { ...(content.ctaBox || {}), show: val } })} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Box Title</Label>
              <Input 
                value={content.ctaBox?.title || "Ready to Start?"} 
                onChange={(e) => setContent({ ...content, ctaBox: { ...(content.ctaBox || {}), title: e.target.value } })} 
                className="h-12 rounded-2xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Box Description</Label>
              <Textarea 
                value={content.ctaBox?.description || "Join 100+ institutes already scaling with us. Start your 30-day free trial."} 
                onChange={(e) => setContent({ ...content, ctaBox: { ...(content.ctaBox || {}), description: e.target.value } })} 
                className="min-h-[100px] rounded-2xl bg-background"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Label</Label>
              <Input 
                value={content.ctaBox?.buttonText || "Get Started"} 
                onChange={(e) => setContent({ ...content, ctaBox: { ...(content.ctaBox || {}), buttonText: e.target.value } })} 
                className="h-12 rounded-2xl bg-background font-bold text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Redirect URL</Label>
              <Input 
                value={content.ctaBox?.buttonLink || "/pricing"} 
                onChange={(e) => setContent({ ...content, ctaBox: { ...(content.ctaBox || {}), buttonLink: e.target.value } })} 
                className="h-12 rounded-2xl bg-background font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-bold tracking-tight">Data Integrity Info</h4>
         </div>
         <p className="text-sm text-zinc-400 font-medium leading-relaxed">
           The phone number, email, and social links in this section are automatically synced from your <span className="text-primary font-bold">General Branding</span> settings. This ensures a consistent brand identity across the whole site.
         </p>
      </div>
    </div>
  );
}

function ListContentEditor({ title, content, setContent, itemFields }: any) {
  const items = content.items || [];
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <Label className="text-sm font-black uppercase text-primary tracking-widest">{title}</Label>
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => {
             const newItem = itemFields.reduce((acc: any, field: string) => ({ ...acc, [field]: "" }), {});
             setContent({ ...content, items: [...items, newItem] });
          }}>Add Item</Button>
       </div>
       <div className="space-y-4">
          {items.map((item: any, idx: number) => (
             <div key={idx} className="p-6 bg-background border border-border/40 rounded-2xl relative">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 text-red-500" onClick={() => {
                   const n = items.filter((_: any, i: number) => i !== idx);
                   setContent({ ...content, items: n });
                }}><Trash2 className="h-4 w-4" /></Button>
                <div className="grid grid-cols-1 gap-6 pr-10">
                   {itemFields.map((field: string) => (
                      <div key={field} className="space-y-2">
                         {['src', 'avatar', 'image'].includes(field) ? (
                            <ImageUpload 
                              value={item[field] || ""} 
                              onChange={(url) => {
                                const n = [...items]; n[idx][field] = url; setContent({ ...content, items: n });
                              }} 
                              label={field.charAt(0).toUpperCase() + field.slice(1)}
                              folder={`ABCDEdutHub/${title.toLowerCase().replace(" ", "-")}`}
                            />
                         ) : field === 'description' || field === 'text' || field === 'answer' ? (
                            <div className="space-y-1">
                               <Label className="text-[10px] uppercase font-bold text-muted-foreground">{field}</Label>
                               <Textarea value={item[field] || ""} onChange={(e) => {
                                  const n = [...items]; n[idx][field] = e.target.value; setContent({ ...content, items: n });
                               }} className="min-h-[80px]" />
                            </div>
                         ) : (
                            <div className="space-y-1">
                               <Label className="text-[10px] uppercase font-bold text-muted-foreground">{field}</Label>
                               <Input 
                                 type={field === 'value' ? 'number' : 'text'}
                                 value={item[field] || ""} 
                                 onChange={(e) => {
                                  const n = [...items]; n[idx][field] = e.target.value; setContent({ ...content, items: n });
                               }} className="h-9" />
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
