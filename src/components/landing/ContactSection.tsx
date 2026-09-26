"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin, Phone, Mail, Rocket, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { submitContactForm } from "@/app/actions/enquiries";
import { 
  validateFullName, 
  validateMobileNumber, 
  validateEmailAddress 
} from "@/lib/contact-validation";

export function ContactSection({ data, settings }: { data?: any, settings?: any }) {
   const content = data?.content || {};
   const title = data?.title || "Ready to Upgrade your Institute?";
   const subtitle = data?.subtitle || "Get in Touch";
   const description = content.description || "Submit your interest and our onboarding specialists will be in touch immediately to schedule a customized demo of your new platform.";

   const contactPhone = settings?.contactPhone || "8944899747";
   const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
   const address = settings?.address || "Kolkata, West Bengal, India - 700001";

   const showPhone = content.showPhone !== false;
   const showAddress = content.showAddress !== false;
   const buttonText = content.buttonText || "Submit Request";

   // Interactive Form State with Anti-Bot Protection
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [instituteName, setInstituteName] = useState("");
   const [message, setMessage] = useState("");
   // Anti-Bot Honeypot field (hidden from humans, bots will fill this)
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const nameCheck = validateFullName(fullName);
      if (!nameCheck.isValid) {
         toast.error(nameCheck.error || "Please provide your genuine full name.");
         return;
      }

      // Strict Email Validation
      const emailCheck = validateEmailAddress(email);
      if (!emailCheck.isValid) {
         toast.error(emailCheck.error || "Please provide a valid email address.");
         return;
      }

      // Strict Phone Validation (if provided)
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
      toast.loading("Sending your message...", { id: "contact-submit" });

      try {
         const res = await submitContactForm({
            name: nameCheck.cleanName,
            email: emailCheck.cleanEmail,
            phone: formattedPhone || undefined,
            organization: instituteName.trim() || undefined,
            subject: "Platform Demo & Institute Inquiry",
            message: message.trim(),
            workspaceId: null, // Global
            honeypot,
            formRenderTime,
         });

         if (res.success) {
            toast.success("Message Delivered!", {
               id: "contact-submit",
               description: res.message || "Our onboarding specialist will get back to you shortly."
            });
            setIsSubmitted(true);
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setInstituteName("");
            setMessage("");
            setHoneypot("");
         } else {
            toast.error(res.error || "Failed to deliver message", { id: "contact-submit" });
         }
      } catch (err: any) {
         toast.error("An error occurred. Please try again later.", { id: "contact-submit" });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <section id="support" className="py-24 px-6 bg-transparent">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
            {/* Details Side */}
            <div className="flex-1 flex flex-col items-start text-left">
               <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] mb-4 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                  {subtitle}
               </div>
               <h2 className="text-4xl font-extrabold mt-3 tracking-tight leading-tight">
                  {title}
               </h2>
               <p className="mt-6 text-lg text-muted-foreground leading-relaxed mb-10">
                  {description}
               </p>

               <div className="space-y-8">
                  {showAddress && (
                     <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:brightness-110">
                           <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-foreground tracking-wider text-[10px]">Headquarters</h4>
                           <p className="text-muted-foreground mt-1 font-bold leading-relaxed">{address}</p>
                        </div>
                     </div>
                  )}

                  {showPhone && (
                     <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:brightness-110">
                           <Phone className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-foreground tracking-wider text-[10px]">Phone Support</h4>
                           <p className="text-muted-foreground mt-1 font-bold">{contactPhone}</p>
                        </div>
                     </div>
                  )}

                  <div className="flex items-start gap-4 group">
                     <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:brightness-110">
                        <Mail className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-foreground tracking-wider text-[10px]">Email Inquiries</h4>
                        <p className="text-muted-foreground mt-1 font-bold">{contactEmail}</p>
                     </div>
                  </div>
               </div>

               {/* CTA Box - Below Email */}
               {content.ctaBox?.show !== false && (
                  <div className="mt-auto pt-12">
                     <div className="p-8 rounded-[2.5rem] bg-foreground text-background border border-border shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-colors"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-background/10 text-background rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-background/10">
                                 <Rocket className="w-7 h-7" />
                              </div>
                              <div className="text-left">
                                 <h4 className="text-xl font-black tracking-tight text-background-foreground mb-1">
                                    {content.ctaBox?.title || "Ready to Start?"}
                                 </h4>
                                 <p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium leading-relaxed max-w-[320px]">
                                    {content.ctaBox?.description || "Join 100+ institutes scaling with our platform."}
                                 </p>
                              </div>
                           </div>
                           <Link
                              href={content.ctaBox?.buttonLink || "/pricing"}
                              className={cn(
                                 buttonVariants({ size: "lg" }),
                                 "bg-primary text-primary-foreground rounded-xl h-14 px-10 font-black shadow-xl hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center shrink-0 border-none"
                              )}
                           >
                              {content.ctaBox?.buttonText || "Get Started"}
                           </Link>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Form Side */}
            <div className="flex-1">
               <div className="bg-background border rounded-[2rem] p-10 shadow-2xl shadow-primary/5">
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Send a Message</h3>
                  <p className="text-xs text-muted-foreground mb-8">Fill in your details below and our team will connect with you.</p>

                  {isSubmitted ? (
                     <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                           <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h4>
                        <p className="text-xs text-slate-500 max-w-sm">
                           Thank you for contacting us. We have received your inquiry and will reach out via email or phone shortly.
                        </p>
                        <Button 
                           variant="outline" 
                           onClick={() => setIsSubmitted(false)}
                           className="h-9 px-4 text-xs font-semibold rounded-lg mt-2"
                        >
                           Send Another Message
                        </Button>
                     </div>
                  ) : (
                     <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Hidden Honeypot Field (Anti-Bot Trap) */}
                        <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                           <input 
                              type="text" 
                              name="_hp_company_check" 
                              value={honeypot} 
                              onChange={(e) => setHoneypot(e.target.value)} 
                              tabIndex={-1} 
                              autoComplete="off" 
                           />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-1">First Name *</label>
                              <Input 
                                 required
                                 value={firstName}
                                 onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 30))}
                                 placeholder="John" 
                                 className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 text-xs sm:text-sm transition-all" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-1">Last Name</label>
                              <Input 
                                 value={lastName}
                                 onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 30))}
                                 placeholder="Doe" 
                                 className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 text-xs sm:text-sm transition-all" 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-1">Email Address *</label>
                              <Input 
                                 required
                                 type="email" 
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 placeholder="john@institute.edu" 
                                 className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 text-xs sm:text-sm transition-all" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-1">Phone / WhatsApp</label>
                              <Input 
                                 type="tel"
                                 value={phone}
                                 onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, "").slice(0, 13))}
                                 placeholder="+91 98765 43210" 
                                 className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 text-xs sm:text-sm transition-all" 
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-1">Institute / Organization Name</label>
                           <Input 
                              value={instituteName}
                              onChange={(e) => setInstituteName(e.target.value)}
                              placeholder="e.g. National Computer Academy" 
                              className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 text-xs sm:text-sm transition-all" 
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-1">Your Requirements / Message *</label>
                           <Textarea 
                              required
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="How can we help scale your institution or franchise network?" 
                              className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 text-xs sm:text-sm transition-all" 
                           />
                        </div>

                        <Button 
                           type="submit"
                           disabled={isSubmitting}
                           size="lg" 
                           className="w-full h-14 text-sm font-bold bg-primary text-primary-foreground mt-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all gap-2"
                        >
                           <Send className="w-4 h-4" />
                           {isSubmitting ? "Sending Request..." : buttonText}
                        </Button>
                     </form>
                  )}
               </div>
            </div>
         </div>
      </section>
   );
}
