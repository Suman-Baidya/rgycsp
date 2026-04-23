"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail } from "lucide-react"

export function ContactSection() {
  return (
    <section id="support" className="py-24 px-6 bg-zinc-50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
         {/* Details Side */}
         <div className="flex-1">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Get in Touch
            </div>
            <h2 className="text-4xl font-extrabold mt-3 tracking-tight leading-tight">
              Ready to Upgrade your Institute?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed mb-10">
              Submit your interest and our onboarding specialists will be in touch immediately to schedule a customized demo of your new platform.
            </p>

            <div className="space-y-8">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                     <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-bold text-foreground">Headquarters</h4>
                     <p className="text-muted-foreground mt-1">Kolkata, West Bengal<br/>India - 700001</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                     <Phone className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-bold text-foreground">Phone Support</h4>
                     <p className="text-muted-foreground mt-1">+91 89448 99747</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-600/10 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                     <Mail className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-bold text-foreground">Email Inquiries</h4>
                     <p className="text-muted-foreground mt-1">sb.abcd321@gmail.com</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Form Side */}
         <div className="flex-1">
            <div className="bg-background border rounded-2xl p-8 shadow-xl">
               <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
               <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold">First Name</label>
                        <Input placeholder="John" className="h-12 bg-zinc-50 dark:bg-zinc-900" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold">Last Name</label>
                        <Input placeholder="Doe" className="h-12 bg-zinc-50 dark:bg-zinc-900" />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-semibold">Email Address</label>
                     <Input type="email" placeholder="john@institute.edu" className="h-12 bg-zinc-50 dark:bg-zinc-900" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-semibold">Institute Name</label>
                     <Input placeholder="ABCD High School" className="h-12 bg-zinc-50 dark:bg-zinc-900" />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-semibold">Your Needs</label>
                     <Textarea placeholder="How can we help scale your workflow?" className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900" />
                  </div>

                  <Button size="lg" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 mt-4">
                     Submit Request
                  </Button>
               </form>
            </div>
         </div>
      </div>
    </section>
  );
}
