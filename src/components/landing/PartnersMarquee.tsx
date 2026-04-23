const PARTNERS = [
   "https://cdn.pixabay.com/photo/2015/12/11/11/43/google-1088004_1280.png",
   "https://cdn.pixabay.com/photo/2022/08/24/23/12/apple-7408883_1280.png",
   "https://cdn.pixabay.com/photo/2017/06/27/04/57/linkedin-2446228_1280.png",
   "https://cdn.pixabay.com/photo/2021/02/03/11/57/microsoft-5977659_1280.png",
   "https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_1280.png",
   "https://cdn.pixabay.com/photo/2017/01/05/01/43/penguin-1953688_1280.png"
];

export function PartnersMarquee() {
   return (
      <section className="py-16 bg-white dark:bg-zinc-950 border-y border-border overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
               Trusted Innovators
            </div>
         </div>

         <div className="relative flex max-w-full overflow-hidden w-full">
            <div className="flex w-max animate-marquee">
               {/* Array doubled inline, with fixed widths ensuring a mathematically perfect -50% translation loop */}
               {[...PARTNERS, ...PARTNERS].map((logo, index) => (
                  <div key={index} className="flex-shrink-0 w-[250px] md:w-[250px] flex justify-center items-center px-4 py-4">
                     <img
                        src={logo}
                        alt={`Partner ${index}`}
                        className="h-28 md:h-36 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 drop-shadow-sm hover:drop-shadow-xl hover:scale-110"
                     />
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
