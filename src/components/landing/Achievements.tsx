export function Achievements() {
   return (
      <section id="guide" className="py-24 px-6 bg-zinc-950 text-white relative flex flex-col items-center overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="text-center max-w-3xl mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/20 border border-white/30 text-white font-bold text-[10px] tracking-[0.2em] uppercase mb-6 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
               Milestones
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mt-3 tracking-tight leading-tight">
               Recognized for Excellence
            </h2>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
               Award-winning implementations across hundreds of franchises. We pride ourselves on the tangible growth and success our partner Institutes achieve.
            </p>
         </div>

         <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Masonry/Grid Items */}
            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/4]">
               <img
                  src="https://cdn.pixabay.com/photo/2024/10/08/02/15/ai-generated-9104183_1280.jpg"
                  alt="AI Achievement"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Most Dynamic AI EdTech</h3>
                  <p className="text-sm text-zinc-300">Awarded for the best automation integration in the franchise scaling category.</p>
               </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/4] md:translate-y-8">
               <img
                  src="https://cdn.pixabay.com/photo/2024/04/05/05/16/trophy-8676528_1280.jpg"
                  alt="Trophy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">National Scale Award</h3>
                  <p className="text-sm text-zinc-300">100+ new verified coaching institutes onboarded.</p>
               </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/4]">
               <img
                  src="https://cdn.pixabay.com/photo/2015/10/28/16/47/cup-1010918_1280.jpg"
                  alt="Cup Recognition"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pioneers of ERP</h3>
                  <p className="text-sm text-zinc-300">Winner of the Best Internal Accounting Module for Institutes 2025.</p>
               </div>
            </div>
         </div>
      </section>
   );
}
