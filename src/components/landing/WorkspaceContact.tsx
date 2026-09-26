"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  User,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { submitContactForm } from "@/app/actions/enquiries";
import { SocialMediaLeadFunnel } from "@/components/enquiry/SocialMediaLeadFunnel";
import { cn } from "@/lib/utils";
import { 
  validateFullName, 
  validateMobileNumber, 
  validateEmailAddress 
} from "@/lib/contact-validation";

// Inline SVGs for social icons with consistent hover styling
const Facebook = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Twitter = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const Instagram = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const Linkedin = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const Youtube = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

export function WorkspaceContact({ 
  data, 
  settings,
  workspace,
  tenant
}: { 
  data?: any; 
  settings?: any;
  workspace?: any;
  tenant?: string;
}) {
  const content = data?.content || {};
  const title = data?.title || "Let's Start a Conversation";
  const subtitle = data?.subtitle || "Get in Touch";
  const description = content.description || "Have questions or want to visit? We'd love to hear from you. Fill out the form or use our contact details to reach out.";

  const contactPhone = settings?.contactPhone || "8944899747";
  const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
  const address = settings?.address || "Kolkata, West Bengal, India - 700001";
  const socialLinks = settings?.socialLinks || {};
  const officeHours = content.officeHours || "Mon - Sat: 9:00 AM - 6:00 PM";

  const showSocials = content.showSocials !== false;
  const workspaceId = workspace?.id || settings?.workspaceId || null;
  const workspaceName = workspace?.name || settings?.siteName || "Study Center";
  const workspaceSubdomain = workspace?.subdomain || tenant || "";

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, link: socialLinks.facebook, color: 'hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, link: socialLinks.instagram, color: 'hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/10' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, link: socialLinks.twitter, color: 'hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/10' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, link: socialLinks.linkedin, color: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, link: socialLinks.youtube, color: 'hover:text-[#CD201F] hover:border-[#CD201F]/40 hover:bg-[#CD201F]/10' },
  ];

  // Interactive Form State with Anti-Bot Protection
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formRenderTime, setFormRenderTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Quick 60s Admission Check Popup Modal State
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

  useEffect(() => {
    setFormRenderTime(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Name Validation
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const nameCheck = validateFullName(fullName);
    if (!nameCheck.isValid) {
      toast.error(nameCheck.error || "Please enter your genuine full name.");
      return;
    }

    // Strict Email Validation
    const emailCheck = validateEmailAddress(email);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error || "Please enter a valid email address.");
      return;
    }

    // Strict Phone Validation
    let formattedPhone = phone.trim();
    if (formattedPhone) {
      const phoneCheck = validateMobileNumber(formattedPhone);
      if (!phoneCheck.isValid) {
        toast.error(phoneCheck.error || "Please enter a valid 10-digit mobile number.");
        return;
      }
      formattedPhone = phoneCheck.cleanPhone;
    } else {
      toast.error("Please enter your 10-digit mobile or WhatsApp number.");
      return;
    }

    // Message validation
    if (!message.trim() || message.trim().length < 5) {
      toast.error("Please enter your inquiry question or message (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Sending your inquiry...", { id: "ws-contact-submit" });

    try {
      const res = await submitContactForm({
        name: nameCheck.cleanName,
        email: emailCheck.cleanEmail,
        phone: formattedPhone,
        subject: subject.trim() || "Admission & Center Inquiry",
        message: message.trim(),
        workspaceId: workspaceId,
        honeypot,
        formRenderTime,
      });

      if (res.success) {
        toast.success("Inquiry Submitted!", {
          id: "ws-contact-submit",
          description: res.message || "Our center counselors will contact you shortly."
        });
        setIsSubmitted(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
        setHoneypot("");
      } else {
        toast.error(res.error || "Failed to submit inquiry", { id: "ws-contact-submit" });
      }
    } catch (err: any) {
      toast.error("An error occurred. Please try again.", { id: "ws-contact-submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-primary/10 via-blue-500/5 to-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/5 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Subtle Pattern Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ws-contact-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ws-contact-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative z-10">
        
        {/* Left Column: Campus Hub & Contact Intelligence */}
        <div className="flex-1 w-full flex flex-col items-start text-left">
          
          {/* Subtitle Pill Badge */}
          <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/25 text-primary font-bold text-[11px] tracking-widest uppercase mb-4 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>{subtitle}</span>
          </div>

          {/* Section Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            {title}
          </h2>

          {/* Section Description */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            {description}
          </p>

          {/* Interactive Campus Contact Cards Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
            
            {/* Campus Address Card */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {content.addressLabel || "Campus Location"}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 mt-0.5 leading-snug line-clamp-2">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Phone / WhatsApp Desk Card */}
            <a 
              href={`tel:${contactPhone.replace(/\s+/g, '')}`} 
              className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {content.phoneLabel || "Admissions Phone"}
                    </h4>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      Call <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5 leading-snug truncate">
                    {contactPhone}
                  </p>
                </div>
              </div>
            </a>

            {/* Email Desk Card */}
            <a 
              href={`mailto:${contactEmail}`} 
              className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {content.emailLabel || "Email Desk"}
                    </h4>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      Write <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 mt-0.5 leading-snug truncate">
                    {contactEmail}
                  </p>
                </div>
              </div>
            </a>

            {/* Counseling Office Hours Card */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Office Hours
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Open
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 mt-0.5 leading-snug truncate">
                    {officeHours}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Social Channels Strip */}
          {showSocials && (
            <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800/70 w-full flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                {platforms.filter(p => p.link).map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <a
                      key={platform.id}
                      href={platform.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={platform.name}
                      className={cn(
                        "w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all border border-slate-200/60 dark:border-slate-700/60 hover:scale-110",
                        platform.color
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* High-Impact Quick 60s Admission Check CTA Banner */}
          {content.ctaBox?.show !== false && (
            <div className="mt-6 sm:mt-8 w-full">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800/90 shadow-xl relative overflow-hidden group">
                {/* Ambient Decorative Glows */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-primary/25 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/35 transition-all duration-500" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Side: Icon + Title & Description */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 bg-white/[0.08] text-primary rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-sm group-hover:scale-105 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      {/* One-Line Title */}
                      <h4 className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap block truncate">
                        {content.ctaBox?.title || "Quick 60s Admission Check"}
                      </h4>
                      {/* One-Line Short Description (3-4 words) */}
                      <p className="text-slate-300/80 text-xs font-medium leading-normal whitespace-nowrap overflow-hidden text-ellipsis block mt-0.5">
                        {content.ctaBox?.description || "Check course eligibility instantly"}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: CTA Button */}
                  <div className="shrink-0 self-start md:self-center">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsQuickModalOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{content.ctaBox?.buttonText || "Start Quick Check"}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Premium Admissions & Inquiry Form Card */}
        <div className="flex-1 w-full">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl shadow-slate-900/5 relative overflow-hidden">
            
            {/* Top Glowing Gradient Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-primary to-indigo-600" />

            {/* Form Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {content.formTitle || "Course Admission Inquiry"}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Counselor Online
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {content.formSubtitle || "Submit your inquiry below and our academic advisor will assist you with course details, fees, and batch schedules."}
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Inquiry Received Successfully!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Thank you for reaching out to {workspaceName}. Our admissions desk has received your request and will connect with you shortly.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsSubmitted(false)}
                    className="h-8 px-4 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Submit Another Inquiry
                  </Button>
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="h-8 px-4 text-xs font-semibold rounded-lg bg-primary text-primary-foreground flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <Phone className="w-3 h-3" /> Call Center Now
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Hidden Anti-Bot Trap */}
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                  <input 
                    type="text" 
                    name="_hp_ws_contact" 
                    value={honeypot} 
                    onChange={(e) => setHoneypot(e.target.value)} 
                    tabIndex={-1} 
                    autoComplete="off" 
                  />
                </div>

                {/* First Name & Last Name (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 30))}
                        placeholder="e.g. Rahul" 
                        className="h-9 sm:h-10 pl-9 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-primary text-xs sm:text-sm font-medium transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                      Last Name
                    </label>
                    <Input 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 30))}
                      placeholder="e.g. Sharma" 
                      className="h-9 sm:h-10 px-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-primary text-xs sm:text-sm font-medium transition-all" 
                    />
                  </div>
                </div>

                {/* Email & Phone / WhatsApp (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com" 
                        className="h-9 sm:h-10 pl-9 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-primary text-xs sm:text-sm font-medium transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, "").slice(0, 13))}
                        placeholder="+91 98765 43210" 
                        className="h-9 sm:h-10 pl-9 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-primary text-xs sm:text-sm font-medium transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Interested Course */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                    Interested Course / Program
                  </label>
                  <div className="relative group">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. ADCA, Tally Prime, Web Development, Python" 
                      className="h-9 sm:h-10 pl-9 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-primary text-xs sm:text-sm font-medium transition-all" 
                    />
                  </div>
                </div>

                {/* Message / Question */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      Your Message / Inquiry <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min 5 chars</span>
                  </div>
                  <div className="relative group">
                    <Textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about batch timings, syllabus, course duration, exam fees or eligibility..." 
                      className="min-h-[95px] bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:border-primary text-xs sm:text-sm font-medium transition-all p-3" 
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 border-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{content.formButtonText || "Submit Course Inquiry"}</span>
                    </>
                  )}
                </Button>

                {/* Anti-Spam & Trust Guarantees */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Free Academic Counseling
                  </span>
                  <span>•</span>
                  <span>100% Privacy Protected</span>
                  <span>•</span>
                  <span>No Spam Guarantee</span>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Quick 60-Second Admission Check Popup Modal */}
      {isQuickModalOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQuickModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg my-auto relative z-10" onClick={(e) => e.stopPropagation()}>
            <SocialMediaLeadFunnel
              initialType="STUDENT"
              socialSource="franchise_home_contact"
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              workspaceSubdomain={workspaceSubdomain}
              isModal={true}
              onClose={() => setIsQuickModalOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

