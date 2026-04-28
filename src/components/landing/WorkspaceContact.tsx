"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

// Inline SVGs for social icons
const Facebook = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
const Twitter = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
const Instagram = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
const Linkedin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>

export function WorkspaceContact({ data, settings }: { data?: any, settings?: any }) {
   const content = data?.content || {};
   const title = data?.title || "Visit Our Campus";
   const subtitle = data?.subtitle || "Get in Touch";
   const description = content.description || "Have questions or want to visit? We'd love to hear from you. Fill out the form or use our contact details to reach out.";

   const contactPhone = settings?.contactPhone || "8944899747";
   const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
   const address = settings?.address || "Kolkata, West Bengal, India - 700001";

   const showSocials = content.showSocials !== false;

   return (
      <section id="contact" className="py-24 relative overflow-hidden">
         {/* Background Map Decor */}
         <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
               <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
               {/* Info Side */}
               <div className="space-y-12">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <div className="h-0.5 w-8 bg-primary" />
                        {subtitle}
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        Let's Start a <span className="text-primary">Conversation</span>
                     </h2>
                     <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                        {description}
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-border shadow-sm group hover:border-primary/20 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Our Campus</h4>
                        <p className="font-bold leading-relaxed">{address}</p>
                     </div>

                     <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-border shadow-sm group hover:border-primary/20 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <Phone className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Call Us</h4>
                        <p className="font-bold leading-relaxed">{contactPhone}</p>
                     </div>

                     <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-border shadow-sm group hover:border-primary/20 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <Mail className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Email Us</h4>
                        <p className="font-bold leading-relaxed break-all">{contactEmail}</p>
                     </div>

                     <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-border shadow-sm group hover:border-primary/20 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <Clock className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Office Hours</h4>
                        <p className="font-bold leading-relaxed">Mon - Sat: 9:00 AM - 6:00 PM</p>
                     </div>
                  </div>

                  {showSocials && (
                     <div className="flex items-center gap-4">
                        {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                           <div key={idx} className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
                              <Icon className="w-5 h-5" />
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Form Side */}
               <div className="relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-2 scale-105" />
                  <div className="relative bg-white dark:bg-zinc-900 border border-border p-10 md:p-14 rounded-[3rem] shadow-2xl">
                     <h3 className="text-3xl font-black mb-10 tracking-tight">Admissions Inquiry</h3>
                     <form className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                              <Input placeholder="John Doe" className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 focus:ring-2 focus:ring-primary/20" />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                              <Input type="email" placeholder="john@example.com" className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 focus:ring-2 focus:ring-primary/20" />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                           <Input placeholder="Admission related query" className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 focus:ring-2 focus:ring-primary/20" />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                           <Textarea placeholder="How can we help you?" className="min-h-[160px] bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-6 focus:ring-2 focus:ring-primary/20" />
                        </div>

                        <Button className="w-full h-16 rounded-2xl font-black text-xl gap-3 bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 border-none">
                           Send Message
                           <Send className="w-5 h-5" />
                        </Button>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
