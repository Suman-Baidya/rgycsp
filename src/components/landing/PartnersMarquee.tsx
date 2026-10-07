import Image from "next/image";

export function PartnersMarquee({ data }: { data?: any }) {
   const content = data?.content || {};
   const logos = content.logos || [
      "https://cdn.pixabay.com/photo/2015/12/11/11/43/google-1088004_1280.png",
      "https://cdn.pixabay.com/photo/2022/08/24/23/12/apple-7408883_1280.png",
      "https://cdn.pixabay.com/photo/2017/06/27/04/57/linkedin-2446228_1280.png",
      "https://cdn.pixabay.com/photo/2021/02/03/11/57/microsoft-5977659_1280.png",
      "https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_1280.png",
      "https://cdn.pixabay.com/photo/2017/01/05/01/43/penguin-1953688_1280.png"
   ];

   return (
      <section className="py-10 sm:py-12 border-y border-border/60 overflow-hidden bg-transparent">
         <div className="relative flex max-w-full w-full">
            <div className="flex w-max animate-marquee">
               {/* Ensure at least a decent number of logos for a smooth loop */}
               {[...logos, ...logos, ...logos].map((logo, index) => (
                  <div key={index} className="flex-shrink-0 w-[200px] sm:w-[250px] flex justify-center items-center px-4 py-3 relative h-16 sm:h-20">
                     <Image
                        src={logo || ""}
                        alt={`Partner ${index}`}
                        fill
                        sizes="(max-width: 768px) 200px, 250px"
                        className="object-contain"
                     />
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
