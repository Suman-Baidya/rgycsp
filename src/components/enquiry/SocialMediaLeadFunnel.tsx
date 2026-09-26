"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Loader2,
  ExternalLink,
  Home,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  submitCampaignLead, 
  getFunnelConfig
} from "@/app/actions/enquiries";
import { 
  type FunnelConfig, 
  DEFAULT_FUNNEL_CONFIG 
} from "@/types/funnel";
import { 
  validateFullName, 
  validateMobileNumber, 
  validateEmailAddress, 
  validatePinCode 
} from "@/lib/contact-validation";
import { useRouter } from "next/navigation";

interface SocialMediaLeadFunnelProps {
  initialType?: "FRANCHISE" | "STUDENT";
  socialSource?: string;
  workspaceId?: string | null;
  workspaceName?: string;
  workspaceSubdomain?: string;
  config?: FunnelConfig;
  isModal?: boolean;
  onClose?: () => void;
}

export function SocialMediaLeadFunnel({
  initialType = "STUDENT",
  socialSource = "social_media",
  workspaceId,
  workspaceName,
  workspaceSubdomain,
  config: initialConfig,
  isModal = false,
  onClose,
}: SocialMediaLeadFunnelProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [campaignType, setCampaignType] = useState<"FRANCHISE" | "STUDENT">(initialType);
  const [activeConfig, setActiveConfig] = useState<FunnelConfig>(initialConfig || DEFAULT_FUNNEL_CONFIG);

  // Step 1: Contact Info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  // Anti-bot honeypot
  const [honeypot, setHoneypot] = useState("");
  const [formRenderTime, setFormRenderTime] = useState<number>(0);

  // Step 2: MCQ Answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Submission & Redirection State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string>("");
  const [matchedCenter, setMatchedCenter] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(4);
  const redirectTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const cancelRedirectAndGo = (targetUrl: string) => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    if (onClose) onClose();
    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
      window.location.href = targetUrl;
    } else {
      router.push(targetUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFormRenderTime(Date.now());
    if (!initialConfig) {
      getFunnelConfig(workspaceId).then((res) => {
        if (res) setActiveConfig(res);
      }).catch(console.error);
    }
  }, [initialConfig, workspaceId]);

  const currentQuestions = useMemo(() => {
    if (campaignType === "FRANCHISE") {
      return activeConfig.franchiseQuestions && activeConfig.franchiseQuestions.length > 0 
        ? activeConfig.franchiseQuestions 
        : DEFAULT_FUNNEL_CONFIG.franchiseQuestions;
    }
    return activeConfig.studentQuestions && activeConfig.studentQuestions.length > 0 
      ? activeConfig.studentQuestions 
      : DEFAULT_FUNNEL_CONFIG.studentQuestions;
  }, [campaignType, activeConfig]);

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLabel
    }));
  };

  const handleNextToMCQ = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Full Name Validation
    const nameVal = validateFullName(name);
    if (!nameVal.isValid) {
      toast.error(nameVal.error || "Please enter your genuine full name.");
      return;
    }

    // Strict Mobile Number Validation
    const phoneVal = validateMobileNumber(phone);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.error || "Please enter a valid 10-digit mobile number.");
      return;
    }

    // Email Validation (if provided or required)
    if (email.trim() || (activeConfig.fields.showEmail && activeConfig.fields.requireEmail)) {
      const emailVal = validateEmailAddress(email);
      if (!emailVal.isValid) {
        toast.error(emailVal.error || "Please enter a valid email address.");
        return;
      }
    }

    // PIN Code Validation (if provided or required)
    if (pinCode.trim() || (activeConfig.fields.showPinCode && activeConfig.fields.requirePinCode)) {
      const pinVal = validatePinCode(pinCode);
      if (!pinVal.isValid) {
        toast.error(pinVal.error || "Please enter a valid 6-digit PIN code.");
        return;
      }
    }

    if (activeConfig.fields.showCity && activeConfig.fields.requireCity && !city.trim()) {
      toast.error("City is required.");
      return;
    }

    // Set sanitized/clean values
    setName(nameVal.cleanName);
    setPhone(phoneVal.cleanPhone);

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    toast.loading("Analyzing profile & finding best match...", { id: "campaign-submit" });

    try {
      const res = await submitCampaignLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        pinCode: pinCode.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        campaignType,
        socialSource,
        answers,
        workspaceId: workspaceId || null,
        honeypot,
        formRenderTime,
      });

      if (res.success && res.redirectUrl) {
        const dest = res.redirectUrl;
        setRedirectTarget(dest);
        if (res.matchedCenterName) {
          setMatchedCenter(res.matchedCenterName);
        }
        setStep(3);
        setCountdown(4);
        toast.success("Profile Verified!", {
          id: "campaign-submit",
          description: "Verification complete! Redirecting shortly..."
        });

        // Countdown timer for smooth visitor control
        let currentCount = 4;
        redirectTimerRef.current = setInterval(() => {
          currentCount -= 1;
          setCountdown(currentCount);
          if (currentCount <= 0) {
            if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
            if (onClose) onClose();
            if (dest.startsWith("http://") || dest.startsWith("https://")) {
              window.location.href = dest;
            } else {
              router.push(dest);
            }
          }
        }, 1000);
      } else {
        toast.error(res.error || "Submission failed. Please try again.", { id: "campaign-submit" });
      }
    } catch (err: any) {
      toast.error("An error occurred during submission.", { id: "campaign-submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single-line titles and short descriptions
  const singleLineTitle = campaignType === "FRANCHISE" 
    ? (activeConfig.visitorTitle && activeConfig.visitorTitle !== DEFAULT_FUNNEL_CONFIG.visitorTitle ? activeConfig.visitorTitle : "Franchise Center Eligibility")
    : (workspaceId 
        ? (activeConfig.visitorTitle && activeConfig.visitorTitle !== DEFAULT_FUNNEL_CONFIG.visitorTitle 
            ? activeConfig.visitorTitle 
            : `Admissions Open - ${workspaceName || "Student Enrollment"}`)
        : (activeConfig.visitorTitle || "Instant Admission Check"));

  const singleLineSubtitle = activeConfig.visitorSubtitle && activeConfig.visitorSubtitle !== DEFAULT_FUNNEL_CONFIG.visitorSubtitle
    ? activeConfig.visitorSubtitle
    : (campaignType === "FRANCHISE" 
        ? "Check affiliation fees, syllabus & verification in 30 seconds."
        : (workspaceId 
            ? "Take a 60-second eligibility check to find the best career course for you."
            : "Get instant eligibility, fee details & nearest center info in 30 seconds."));

  return (
    <div className={cn("w-full mx-auto relative", isModal ? "max-w-lg" : "max-w-2xl")}>
      <Card className={cn(
        "border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 transition-all",
        isModal 
          ? "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-slate-900/5 dark:ring-white/10" 
          : "shadow-xl"
      )}>
        {/* TOP ACCENT PROGRESS BAR */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-indigo-600 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>

        {/* MODAL HEADER BAR */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {workspaceName || "Official Verification Portal"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
              Step {step} of 3
            </Badge>

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-7 w-7 rounded-full bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: CONTACT INFORMATION */}
        {step === 1 && (
          <div className="p-5 sm:p-7 space-y-4">
            <div className="space-y-1.5 text-center">
              {/* Single Line Title */}
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-full">
                {singleLineTitle}
              </h2>
              {/* Short Single Line Description */}
              <p className="text-xs text-slate-500 max-w-sm mx-auto truncate">
                {singleLineSubtitle}
              </p>

              {/* Segmented Switcher for Global Portal */}
              {!workspaceId && (
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-1 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCampaignType("STUDENT")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      campaignType === "STUDENT" 
                        ? "bg-white dark:bg-slate-900 text-primary shadow-xs ring-1 ring-black/5" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Student Admission</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignType("FRANCHISE")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                      campaignType === "FRANCHISE" 
                        ? "bg-white dark:bg-slate-900 text-primary shadow-xs ring-1 ring-black/5" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Franchise Center</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleNextToMCQ} className="space-y-3 pt-1">
              {/* Hidden Anti-Bot Honeypot */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                <input 
                  type="text" 
                  name="_hp_funnel_check" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  tabIndex={-1} 
                  autoComplete="off" 
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 ml-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-10 pl-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 ml-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-10 pl-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Email Address */}
                {activeConfig.fields.showEmail && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 ml-1">
                      Email Address {activeConfig.fields.requireEmail && "*"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        type="email"
                        required={activeConfig.fields.requireEmail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="h-10 pl-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PIN Code & City */}
              {(activeConfig.fields.showPinCode || activeConfig.fields.showCity) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeConfig.fields.showPinCode && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 ml-1">
                        PIN Code {activeConfig.fields.requirePinCode && "*"}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          maxLength={6}
                          required={activeConfig.fields.requirePinCode}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 700001"
                          className="h-10 pl-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {activeConfig.fields.showCity && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 ml-1">
                        City / Town {activeConfig.fields.requireCity && "*"}
                      </label>
                      <Input
                        required={activeConfig.fields.requireCity}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kolkata, Patna, Delhi"
                        className="h-10 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* State */}
              {activeConfig.fields.showState && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 ml-1">
                    State / Region
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. West Bengal, Bihar, UP"
                    className="h-10 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-xs sm:text-sm font-bold bg-primary text-primary-foreground mt-2 rounded-xl shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
              >
                <span>Continue: Answer 2 Quick Questions</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: INSTITUTE HIGHLIGHTS & DYNAMIC MCQ QUESTIONNAIRE */}
        {step === 2 && (
          <div className="p-5 sm:p-7 space-y-4">
            {/* Institute Trust Highlights */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-emerald-500/10 border border-primary/20 space-y-2">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Why Students & Centers Trust ABCD Platform
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>Govt. Registered</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                  <span>ISO 9001:2015</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-purple-600 shrink-0" />
                  <span>QR Verified Certs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-amber-600 shrink-0" />
                  <span>100+ Centers</span>
                </div>
              </div>
            </div>

            {/* Dynamic MCQ Questions */}
            <div className="space-y-3.5 max-h-[48vh] overflow-y-auto pr-1">
              {currentQuestions.map((q, qIndex) => (
                <div key={q.id || `q-${qIndex}`} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] flex items-center justify-center font-bold shrink-0">
                      {qIndex + 1}
                    </span>
                    <span>{q.question}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = answers[q.id] === opt.label;
                      return (
                        <div
                          key={`opt-${optIndex}`}
                          onClick={() => handleSelectOption(q.id, opt.label)}
                          className={cn(
                            "cursor-pointer p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all select-none",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs font-bold"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Sparkles className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary" : "text-slate-400")} />
                            <span className="truncate">{opt.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="h-9 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Back to Details
              </Button>

              <Button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="h-10 px-5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Match Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: REDIRECTION & CONFIRMATION */}
        {step === 3 && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Profile Verified Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you, <strong>{name}</strong>. Redirecting you in <span className="font-bold text-primary text-sm">{countdown > 0 ? countdown : 0}s</span>...
              </p>
            </div>

            {matchedCenter && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left flex items-center gap-3 max-w-md mx-auto shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Matched Authorized Study Center
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {matchedCenter}
                  </h4>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 max-w-md mx-auto truncate shadow-xs">
              {redirectTarget}
            </div>

            {/* Action buttons for Social Media Visitors: Visit Home OR Continue to Portal */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => cancelRedirectAndGo("/")}
                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 gap-1.5 shadow-xs"
              >
                <Home className="w-3.5 h-3.5 text-primary" />
                <span>Visit Homepage</span>
              </Button>

              <Button
                type="button"
                onClick={() => cancelRedirectAndGo(redirectTarget)}
                className="w-full sm:w-auto h-9 px-5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xs gap-1.5"
              >
                <span>Continue to Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
