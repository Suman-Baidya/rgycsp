"use client";

import React, { useState, useEffect } from "react";
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
import { ContactSection } from "@/components/landing/ContactSection";
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
  const verificationSection = getSection('franchises-verification');

  // Captcha State
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerifyCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySearch.trim()) return;
    
    if (parseInt(captchaAnswer) !== captchaNum1 + captchaNum2) {
      toast.error("Incorrect math answer. Please verify you are human.");
      generateCaptcha();
      return;
    }

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
                  <Accordion defaultValue={["rule-0"]} className="w-full">
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
      <section className="py-8 lg:py-12 relative flex items-center justify-center overflow-hidden min-h-[80vh]">
        {/* Static Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={verificationSection?.content?.backgroundUrl || "https://cdn.pixabay.com/photo/2021/01/05/11/24/india-5890889_1280.jpg"} alt="Network Background" className="w-full h-full object-cover object-center" />
          {/* Deep professional overlay - a mix of dark blue/slate to make the image look premium and not overpowering */}
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        {/* Huge Watermark Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.03]">
          <h1 className="text-[25vw] font-black uppercase text-white whitespace-nowrap -rotate-12 font-serif tracking-tighter">
            {verificationSection?.content?.watermarkText || "VERIFIED"}
          </h1>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           {/* The Main Verification Card - Crisp, official, white */}
           <Card className="rounded-3xl border-0 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-white/95 backdrop-blur-md relative">
              {/* Subtle top brand color accent line */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-500 to-primary"></div>

              {/* Internal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="w-96 h-96 border-[8px] border-slate-900 rounded-full flex items-center justify-center -rotate-12">
                  <span className="text-6xl font-black text-slate-900 uppercase tracking-widest font-serif">{verificationSection?.content?.watermarkText || "VERIFIED"}</span>
                </div>
              </div>
              
              <CardHeader className="text-center space-y-4 p-6 lg:p-10 pb-6 relative z-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 border border-blue-100 shadow-sm rotate-3 hover:rotate-0 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-900 font-serif">
                    {verificationSection?.title ? (
                      <span dangerouslySetInnerHTML={{ __html: verificationSection.title.replace('Verification', '<span class="text-blue-600 font-serif">Verification</span>') }} />
                    ) : (
                      <>Official <span className="text-blue-600 font-serif">Verification</span></>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 max-w-xl mx-auto">
                    {verificationSection?.subtitle || "Access the national registry. Enter the authorized center code to instantly validate franchise credentials and secure against fraudulent entities."}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <div className="px-10 lg:px-14">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              </div>

              <CardContent className="p-6 lg:p-10 pt-6">
                <form onSubmit={handleVerifyCenter} className="flex flex-col gap-5 max-w-2xl mx-auto">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Registration Code</Label>
                    <Input required value={verifySearch} onChange={(e) => setVerifySearch(e.target.value)} placeholder="e.g. WB-002" className="rounded-xl h-14 border-slate-200 bg-slate-50 text-slate-900 uppercase font-bold text-center sm:text-left text-lg shadow-inner placeholder:text-slate-400 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all w-full" />
                  </div>
                  
                  {/* Captcha Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-sm">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Security Check</p>
                        <p className="text-xs font-semibold text-slate-700">Solve to verify human identity</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 px-4 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-black text-lg tracking-wider text-slate-800 shadow-sm">
                        {captchaNum1} + {captchaNum2} =
                      </div>
                      <Input 
                        required 
                        value={captchaAnswer} 
                        onChange={(e) => setCaptchaAnswer(e.target.value)} 
                        placeholder="?" 
                        className="w-16 h-10 rounded-lg border-slate-200 bg-white text-slate-900 font-black text-center text-lg shadow-inner focus-visible:ring-blue-500/50" 
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isVerifyLoading} className="w-full rounded-xl h-14 font-extrabold text-lg shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all bg-blue-600 hover:bg-blue-700 text-white mt-1">
                    {isVerifyLoading ? (verificationSection?.content?.loadingButtonText || "Authenticating Record...") : (verificationSection?.content?.buttonText || "Run Official Verification")}
                  </Button>
                </form>

                {verifyResult && (
                  <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto">
                    <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white space-y-8 relative overflow-hidden shadow-2xl border border-slate-800">
                       {/* Subtle tech background inside result */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                       
                       <div className="absolute top-0 right-0 p-6 z-10">
                         {verifyResult.isActive ? <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active Record</span> : <span className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Inactive Record</span>}
                       </div>
                       
                       <div className="space-y-2 max-w-[80%] relative z-10">
                         <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Verified Credentials</p>
                         <h4 className="text-2xl font-black text-white">{verifyResult.centerName}</h4>
                         <div className="inline-flex items-center gap-2 mt-3 bg-white/5 border border-white/10 px-4 py-2 rounded-md">
                           <ShieldCheck className="w-4 h-4 text-slate-400" />
                           <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Registration Code:</span>
                           <span className="text-sm font-black text-white">{verifyResult.code}</span>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm pt-6 border-t border-white/10 relative z-10">
                         <div>
                           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Center Director</p>
                           <p className="font-bold text-base text-slate-200">{verifyResult.ownerName}</p>
                         </div>
                         <div>
                           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Authorized Since</p>
                           <p className="font-bold text-base text-slate-200">{new Date(verifyResult.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                         </div>
                         <div className="sm:col-span-2">
                           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Registered Location</p>
                           <p className="font-medium text-base leading-relaxed text-slate-300">{verifyResult.address}, {verifyResult.district}, {verifyResult.state}</p>
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
        <section className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/20 relative border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16 flex flex-col items-center">
              <div className="flex items-center gap-3 justify-center mb-2">
                <div className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/70">Step-by-Step Guide</span>
                </div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {guideSection.title || "Registration Process"}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {guideSection.subtitle || "Simple steps to become our verified partner"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left: Video */}
              {guideSection.content?.videoUrl ? (
                <div className="rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-blue-900/10 aspect-video relative bg-slate-900 transform lg:-rotate-2 transition-transform hover:rotate-0">
                  <iframe src={guideSection.content.videoUrl} title="Guidelines Video" className="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              ) : (
                <div className="rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-blue-900/10 aspect-video relative bg-slate-100 flex flex-col items-center justify-center transform lg:-rotate-2">
                   <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                     <span className="text-slate-400 font-black">?</span>
                   </div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Video Provided</p>
                </div>
              )}

              {/* Right: Steps */}
              <div className="space-y-10 relative before:absolute before:left-[1.35rem] before:top-4 before:bottom-4 before:w-1 before:bg-blue-100 before:rounded-full">
                {(guideSection.content?.steps || []).map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-8 relative items-start group">
                    <div className="w-12 h-12 rounded-full bg-white border-[3px] border-blue-100 flex items-center justify-center font-black shrink-0 relative z-10 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all shadow-md shadow-blue-900/5 text-lg text-slate-400">
                      {idx + 1}
                    </div>
                    <div className="space-y-3 pt-1">
                      <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-700 transition-colors">{step.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.description}</p>
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
        <ContactSection data={contactSection} settings={settings} />
      )}

    </div>
  );
}
