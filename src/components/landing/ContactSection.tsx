"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MapPin, Phone, Mail, Rocket } from "lucide-react"
import Link from "next/link"

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
            <div className="flex-1 flex flex-col items-start text-left">
               <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
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
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:scale-110">
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
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:scale-110">
                           <Phone className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-foreground uppercase tracking-wider text-[10px]">Phone Support</h4>
                           <p className="text-muted-foreground mt-1 font-bold">{contactPhone}</p>
                        </div>
                     </div>
                  )}

                  <div className="flex items-start gap-4 group">
                     <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-all group-hover:scale-110">
                        <Mail className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-foreground uppercase tracking-wider text-[10px]">Email Inquiries</h4>
                        <p className="text-muted-foreground mt-1 font-bold">{contactEmail}</p>
                     </div>
                  </div>
               </div>

               {/* CTA Box - Below Email */}
               {content.ctaBox?.show !== false && (
                  <div className="mt-auto pt-12">
                     <div className="p-8 rounded-[2.5rem] bg-zinc-900 dark:bg-zinc-100 border border-border/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-white/10 dark:bg-black/10 text-white dark:text-black rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10 dark:border-black/10">
                                 <Rocket className="w-7 h-7" />
                              </div>
                              <div className="text-left">
                                 <h4 className="text-xl font-black tracking-tight text-white dark:text-black mb-1">
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
                                 "bg-white dark:bg-black text-black dark:text-white rounded-xl h-14 px-10 font-black shadow-xl hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center shrink-0 border-none hover:text-white dark:hover:text-black"
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

                     <Button size="lg" className="w-full h-16 text-lg font-black bg-black dark:bg-white dark:text-black mt-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {buttonText}
                     </Button>
                  </form>
               </div>
            </div>
         </div>
      </section>
   );
}
