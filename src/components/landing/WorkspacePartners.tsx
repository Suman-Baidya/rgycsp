"use client"

import Image from "next/image";
import { Handshake } from "lucide-react";

export function WorkspacePartners({ data }: { data?: any }) {
   const content = data?.content || {};
   const subtitle = data?.subtitle || "Our Affiliations & Partners";
   const title = data?.title || "Collaborating with the Best";
   const logos = (content.logos && content.logos.length > 0) ? content.logos : [
      "https://cdn.pixabay.com/photo/2015/12/11/11/43/google-1088004_1280.png",
      "https://cdn.pixabay.com/photo/2022/08/24/23/12/apple-7408883_1280.png",
      "https://cdn.pixabay.com/photo/2017/06/27/04/57/linkedin-2446228_1280.png",
      "https://cdn.pixabay.com/photo/2021/02/03/11/57/microsoft-5977659_1280.png",
      "https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_1280.png",
      "https://cdn.pixabay.com/photo/2017/01/05/01/43/penguin-1953688_1280.png"
   ];

   return (
      <section className="py-24 bg-zinc-950 text-white overflow-hidden relative">
         {/* Background Decor */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />
         
         <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase w-full mb-6">
               <div className="h-0.5 w-10 bg-primary" />
               {subtitle}
               <div className="h-0.5 w-10 bg-primary" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
               {title}
            </h2>
         </div>

         {/* Floating Staggered Marquee */}
         <div className="relative flex flex-col gap-12 z-10">
            {/* Row 1: Left to Right */}
            <div className="relative flex max-w-full overflow-hidden">
               <div className="flex w-max animate-marquee whitespace-nowrap">
                  {[...logos, ...logos].map((logo, index) => (
                     <div key={index} className="flex-shrink-0 w-[240px] mx-10 h-32 relative group">
                        <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors" />
                        <Image
                           src={logo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                           alt={`Partner ${index}`}
                           fill
                           className="object-contain p-6 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110"
                        />
                     </div>
                  ))}
               </div>
            </div>

            {/* Row 2: Right to Left (Delayed/Reverse) */}
            <div className="relative flex max-w-full overflow-hidden">
               <div className="flex w-max animate-marquee-reverse whitespace-nowrap">
                  {[...logos, ...logos].reverse().map((logo, index) => (
                     <div key={index} className="flex-shrink-0 w-[240px] mx-10 h-32 relative group">
                        <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors" />
                        <Image
                           src={logo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                           alt={`Partner ${index}`}
                           fill
                           className="object-contain p-6 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110"
                        />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}
