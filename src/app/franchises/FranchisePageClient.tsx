"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  FileText,
  MapPinIcon,
  Sparkles,
  ArrowRight,
  Printer,
  Download,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { submitFranchiseApplication, checkFranchiseStatus, verifyCenterCode } from "@/app/actions/franchise";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FranchisePageClientProps {
  settings: any;
  initialWorkspaces: any[];
}

export function FranchisePageClient({ settings, initialWorkspaces }: FranchisePageClientProps) {
  const router = useRouter();

  // Verify Center State
  const [verifySearch, setVerifySearch] = useState<string>("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifyLoading, setIsVerifyLoading] = useState<boolean>(false);

  // Popup State
  const [showOfferBanner, setShowOfferBanner] = useState<boolean>(true);

  // Extract Sections
  const getSection = (type: string) => settings?.sections?.find((s: any) => s.type === type && s.isActive);
  
  const bannerSection = getSection('franchises-offer-banner');
  const rulesSection = getSection('franchises-rules');
  const guideSection = getSection('franchises-guidelines');
  const contactSection = getSection('contact');

  const handleVerifyCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySearch.trim()) return;
    setIsVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await verifyCenterCode(verifySearch);
      if (res.success) {
        setVerifyResult(res.data);
        toast.success("Center verified successfully!");
      } else {
        toast.error(res.error || "Center code not registered.");
      }
    } catch (err) {
      toast.error("Failed to verify center.");
    } finally {
      setIsVerifyLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background">
      
      {/* SECTION 1: Offer Banner Popup */}
      <AnimatePresence>
        {bannerSection && showOfferBanner && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowOfferBanner(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-2xl lg:max-w-3xl aspect-[4/3] sm:aspect-[3/2] md:aspect-video bg-background rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col group z-10"
            >
              <button 
                onClick={() => setShowOfferBanner(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute inset-0 z-0">
                {bannerSection.content?.bannerUrl && (
                  <img src={bannerSection.content.bannerUrl} alt="Offer Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
              </div>
              
              <div className="relative z-10 mt-auto p-8 lg:p-12 text-center flex flex-col items-center gap-4">
                <span className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/50 text-primary font-bold text-xs lg:text-sm uppercase tracking-widest backdrop-blur-sm animate-pulse shadow-xl">Special Offer</span>
                <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">{bannerSection.content?.title || bannerSection.title}</h2>
                {bannerSection.content?.subtitle && <p className="text-sm lg:text-base text-white/80 font-medium">{bannerSection.content.subtitle}</p>}
                
                <div className="flex gap-4 w-full mt-4">
                  {bannerSection.content?.link && (
                    <a href={bannerSection.content.link} className="flex-1" onClick={() => setShowOfferBanner(false)}>
                      <Button className="w-full h-12 rounded-xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
                        Claim Offer
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white" onClick={() => setShowOfferBanner(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION 2: Rules & Application Forms */}
      <section id="apply" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Rules & Criteria */}
            <div className="lg:col-span-6 space-y-10 lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-6 justify-start">
                <div className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/70">Affiliation Criteria</span>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">{rulesSection?.title || "Franchise Rules"}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  {rulesSection?.subtitle || "Please ensure your institute meets the following minimum criteria before submitting an application for affiliation."}
                </p>
              </div>

              {rulesSection?.content?.rules && rulesSection.content.rules.length > 0 && (
                <div className="mt-10">
                  <Accordion type="single" defaultValue="rule-0" className="w-full">
                    {rulesSection.content.rules.map((rule: any, idx: number) => {
                      // Support both old string arrays and new object arrays
                      let title = "";
                      let description = "";
                      
                      if (typeof rule === 'string') {
                        const parts = rule.includes(":") ? rule.split(":") : [rule, "This is a standard requirement for affiliation. Please ensure your center strictly follows this guideline to maintain active franchise status."];
                        title = parts[0];
                        description = parts.slice(1).join(":").trim() || "Please review our official documentation for full details regarding this specific rule.";
                      } else {
                        title = rule.title;
                        description = rule.description || "Please review our official documentation for full details regarding this specific rule.";
                      }
                      
                      return (
                        <AccordionItem key={idx} value={`rule-${idx}`} className="border-b border-border/50 px-2 py-2 group/item data-[state=open]:bg-primary/5 transition-colors">
                          <AccordionTrigger className="text-base sm:text-lg font-extrabold hover:no-underline py-4 text-left group-hover/item:text-primary transition-colors">
                            <div className="flex items-start sm:items-center gap-4">
                              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0 mt-0.5 sm:mt-0">{idx + 1}</span>
                              <span className="leading-tight">{title.trim()}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground font-medium leading-relaxed pb-6 pl-14 pr-4">
                            {description}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              )}
            </div>

            {/* Right: Apply & Status Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 gap-6 pt-10 lg:pt-0">
              
              {/* Apply Card */}
              <div 
                onClick={() => router.push("/franchises/apply")}
                className="relative bg-card dark:bg-zinc-900/40 border border-border/60 hover:border-primary/50 rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.15)] group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
                
                <div className="flex gap-6 items-start mb-6">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                    <FileText className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Apply for Affiliation</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                      Start your journey by submitting your franchise details, infrastructure count, and required verification documents.
                    </p>
                  </div>
                </div>
                
                <Button className="w-full mt-auto h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  Start Application <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Status Card */}
              <div 
                onClick={() => router.push("/franchises/status")}
                className="relative bg-card dark:bg-zinc-900/40 border border-border/60 hover:border-amber-500/50 rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-amber-500/10 transition-colors duration-500"></div>
                
                <div className="flex gap-6 items-start mb-6">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                    <Clock className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Track Application</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                      Already applied? Check your current affiliation stage, review approval comments, and get your portal login credentials.
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-auto h-12 rounded-xl font-bold border-2 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-500/20 shadow-sm">
                  Check Status <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Proposal PDF Card */}
              <div 
                onClick={() => {
                  if (rulesSection?.content?.downloadUrl) {
                    window.open(rulesSection.content.downloadUrl, "_blank");
                  } else {
                    toast.info("Proposal PDF is not yet uploaded.");
                  }
                }}
                className="relative bg-card dark:bg-zinc-900/40 border border-border/60 hover:border-indigo-500/50 rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] group cursor-pointer overflow-hidden flex flex-col"
              >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                  
                  <div className="flex gap-6 items-start mb-6">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                      <Download className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight">Franchise Proposal</h3>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                        Download our complete franchise affiliation proposal and terms & conditions document in PDF format.
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-auto h-12 rounded-xl font-bold border-2 hover:bg-indigo-500/5 hover:text-indigo-600 hover:border-indigo-500/20 shadow-sm">
                    Download PDF <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-y-1 group-hover:rotate-90 transition-transform" />
                  </Button>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: Verification Card */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <Card className="rounded-[3rem] border-2 border-border/40 overflow-hidden shadow-2xl relative bg-card">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <CardHeader className="text-center space-y-4 p-10 lg:p-14 border-b border-border/50">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Verify <span className="text-primary">Registration</span></CardTitle>
                <CardDescription className="text-base font-medium max-w-xl mx-auto">Verify the legitimacy and registration status of any computer training center using their unique affiliation code.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 lg:p-14">
                <form onSubmit={handleVerifyCenter} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <Input required value={verifySearch} onChange={(e) => setVerifySearch(e.target.value)} placeholder="Enter Center Code (e.g. WB-002)" className="rounded-2xl h-16 border-2 uppercase font-bold text-center sm:text-left text-lg shadow-inner" />
                  <Button type="submit" disabled={isVerifyLoading} className="rounded-2xl h-16 font-black px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg shrink-0">
                    {isVerifyLoading ? "Verifying..." : "Verify Now"}
                  </Button>
                </form>

                {verifyResult && (
                  <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 relative overflow-hidden shadow-2xl shadow-slate-900/20">
                       <div className="absolute top-0 right-0 p-6">
                         {verifyResult.isActive ? <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-500/40">Active Partner</span> : <span className="px-4 py-1.5 bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider rounded-xl border border-red-500/40">Inactive</span>}
                       </div>
                       <div className="space-y-1 max-w-[80%]">
                         <h4 className="text-2xl font-black">{verifyResult.centerName}</h4>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Code: {verifyResult.code}</p>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-800">
                         <div>
                           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Director</p>
                           <p className="font-bold">{verifyResult.ownerName}</p>
                         </div>
                         <div>
                           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Affiliated Since</p>
                           <p className="font-bold">{new Date(verifyResult.joinedAt).toLocaleDateString('en-GB')}</p>
                         </div>
                         <div className="sm:col-span-2">
                           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Location</p>
                           <p className="font-bold">{verifyResult.address}, {verifyResult.district}, {verifyResult.state}</p>
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>
      </section>

      {/* SECTION 4: Guidelines & Process */}
      {guideSection && (
        <section className="py-20 lg:py-32 bg-muted/5 relative border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">{guideSection.title || "Registration Process"}</h2>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">{guideSection.subtitle || "Simple steps to become our verified partner"}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Video */}
              {guideSection.content?.videoUrl && (
                <div className="rounded-[2.5rem] overflow-hidden border-8 border-background shadow-2xl aspect-video relative bg-slate-900">
                  <iframe src={guideSection.content.videoUrl} title="Guidelines Video" className="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              )}

              {/* Right: Steps */}
              <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-1 before:bg-border/60">
                {(guideSection.content?.steps || []).map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-6 relative items-start group">
                    <div className="w-12 h-12 rounded-2xl bg-background border-2 border-border flex items-center justify-center font-black shrink-0 relative z-10 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all shadow-sm text-sm">
                      {idx + 1}
                    </div>
                    <div className="space-y-2 pt-1">
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* SECTION 6: Contact */}
      {contactSection && (
        <section className="py-20 lg:py-32 bg-slate-900 dark:bg-slate-950 text-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-black italic tracking-tight">{contactSection.title || "Need Assistance?"}</h2>
              <p className="text-white/70 font-medium text-lg max-w-2xl mx-auto">{contactSection.subtitle || "Contact our support desk for any affiliation queries."}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
              <a href={`tel:${settings?.contactPhone}`}>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl font-bold bg-white/5 border-white/20 hover:bg-white hover:text-slate-900 gap-3 text-white w-full sm:w-auto text-lg border-2">
                  <PhoneCall className="w-5 h-5" /> Call {settings?.contactPhone}
                </Button>
              </a>
              <a href={`mailto:${settings?.contactEmail}`}>
                <Button size="lg" className="h-14 px-8 rounded-2xl font-bold gap-3 w-full sm:w-auto text-lg shadow-xl shadow-primary/20">
                  Email Us Now
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
