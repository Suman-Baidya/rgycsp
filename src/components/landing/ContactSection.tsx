"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail } from "lucide-react"

export function ContactSection({ data, settings }: { data?: any, settings?: any }) {
  const content = data?.content || {};
  const title = data?.title || "Ready to Upgrade your Institute?";
  const subtitle = data?.subtitle || "Get in Touch";
  const description = content.description || "Submit your interest and our onboarding specialists will be in touch immediately to schedule a customized demo of your new platform.";

  const contactPhone = settings?.contactPhone || "8944899747";
  const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
  const address = settings?.address || "Kolkata, West Bengal, India - 700001";

  const showPhone = content.showPhone !== false;
  const showEmail = true; // Email always shown as primary
  const showAddress = content.showAddress !== false;
  const buttonText = content.buttonText || "Submit Request";

  return (
    <section id="support" className="py-24 px-6 bg-zinc-50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
         {/* Details Side */}
         <div className="flex-1">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
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
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                       <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-foreground uppercase tracking-wider text-[10px]">Headquarters</h4>
                       <p className="text-muted-foreground mt-1 font-bold leading-relaxed">{address}</p>
                    </div>
                 </div>
               )}
               
               {showPhone && (
                 <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                       <Phone className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-foreground uppercase tracking-wider text-[10px]">Phone Support</h4>
                       <p className="text-muted-foreground mt-1 font-bold">{contactPhone}</p>
                    </div>
                 </div>
               )}

               <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                     <Mail className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-black text-foreground uppercase tracking-wider text-[10px]">Email Inquiries</h4>
                     <p className="text-muted-foreground mt-1 font-bold">{contactEmail}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Form Side */}
         <div className="flex-1">
            <div className="bg-background border rounded-[2rem] p-10 shadow-2xl shadow-primary/5">
               <h3 className="text-2xl font-black mb-8 tracking-tight">Send a Message</h3>
               <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                        <Input placeholder="John" className="h-14 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                        <Input placeholder="Doe" className="h-14 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 transition-all" />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                     <Input type="email" placeholder="john@institute.edu" className="h-14 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 transition-all" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institute Name</label>
                     <Input placeholder="ABCD High School" className="h-14 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Needs</label>
                     <Textarea placeholder="How can we help scale your workflow?" className="min-h-[140px] bg-zinc-50 dark:bg-zinc-900 rounded-xl border-border/40 focus:border-primary/50 transition-all" />
                  </div>

                  <Button size="lg" className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 mt-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                     {buttonText}
                  </Button>
               </form>
            </div>
         </div>
      </div>
    </section>
  );
}
