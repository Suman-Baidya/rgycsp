"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, User, Phone, Mail, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import { submitContactForm } from "@/app/actions/enquiries";
import { 
  validateFullName, 
  validateMobileNumber, 
  validateEmailAddress 
} from "@/lib/contact-validation";

interface FranchiseEnquiryFormProps {
  workspaceId: string;
}

export function FranchiseEnquiryForm({ workspaceId }: FranchiseEnquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formRenderTime, setFormRenderTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setFormRenderTime(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Name Validation
    const nameCheck = validateFullName(name);
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
    }

    setIsSubmitting(true);
    toast.loading("Submitting your enquiry...", { id: "enquiry-form-submit" });

    try {
      const res = await submitContactForm({
        name: nameCheck.cleanName,
        email: emailCheck.cleanEmail,
        phone: formattedPhone || undefined,
        subject: subject.trim() || "Admission & Course Enquiry",
        message: message.trim(),
        workspaceId,
        honeypot,
        formRenderTime,
      });

      if (res.success) {
        toast.success("Enquiry Received!", {
          id: "enquiry-form-submit",
          description: res.message || "Our counselor will contact you shortly."
        });
        setIsSubmitted(true);
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
        setHoneypot("");
      } else {
        toast.error(res.error || "Submission failed", { id: "enquiry-form-submit" });
      }
    } catch (err: any) {
      toast.error("Failed to submit enquiry. Please try again.", { id: "enquiry-form-submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 dark:text-white">Enquiry Submitted!</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Thank you for reaching out to our campus admission desk. We have received your query and will contact you shortly.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSubmitted(false)}
          className="h-9 px-4 text-xs font-semibold rounded-lg mt-2"
        >
          Submit Another Enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hidden Anti-Bot Honeypot */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <input 
          type="text" 
          name="_hp_enquiry_trap" 
          value={honeypot} 
          onChange={(e) => setHoneypot(e.target.value)} 
          tabIndex={-1} 
          autoComplete="off" 
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" 
            className="h-12 pl-10 bg-slate-50 dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com" 
              className="h-12 pl-10 bg-slate-50 dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Phone / WhatsApp
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210" 
              className="h-12 pl-10 bg-slate-50 dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
          Subject / Course of Interest
        </label>
        <div className="relative">
          <FileQuestion className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. ADCA Course Fees & Batches" 
            className="h-12 pl-10 bg-slate-50 dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
          Your Question / Message *
        </label>
        <Textarea 
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please let us know your queries or requirements..." 
          className="min-h-[120px] bg-slate-50 dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
        />
      </div>

      <Button 
        type="submit"
        disabled={isSubmitting}
        className="w-full h-13 rounded-xl font-bold text-sm bg-primary text-primary-foreground shadow-lg hover:scale-[1.01] active:scale-95 transition-all gap-2"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? "Submitting..." : "Send Online Enquiry"}
      </Button>
    </form>
  );
}
