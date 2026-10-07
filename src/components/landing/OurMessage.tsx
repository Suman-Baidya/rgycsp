import Image from "next/image";
import { Quote } from "lucide-react";

export function OurMessage({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    bgImage: "https://cdn.pixabay.com/photo/2015/02/02/11/08/office-620817_1280.jpg",
    quote: "Technology is not just a tool, it is the catalyst that transforms a classroom into a boundless universe.",
    description: "At ABCD Edu Hub, we are committed to building more than just software. We are building a gateway for educators and students to connect in ways never before possible.",
    authorName: "Joy Debnath",
    authorRole: "Chief Executive Officer, ABCD Edu Hub",
    authorAvatar: "https://cdn.pixabay.com/photo/2015/02/02/11/08/office-620817_1280.jpg",
    sideImage: "https://cdn.pixabay.com/photo/2023/05/15/22/09/city-7996136_1280.jpg"
  };

  const final = { ...defaults, ...content };
  const title = data?.title || "";
  const subtitle = data?.subtitle || "Our Message";
  const bgImage = final.bgImage;
  const quote = final.quote;
  const description = final.description;
  const authorName = final.authorName;
  const authorRole = final.authorRole;
  const authorAvatar = final.authorAvatar;
  const sideImage = final.sideImage;

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden min-h-[600px] flex items-center bg-black">
      {/* Sticky Background Image (Parallax Depth) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10 w-full">
        {/* Message Content */}
        <div className="flex-1 order-2 lg:order-1 text-white">
          <div className="inline-flex items-center gap-2.5 text-emerald-400 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-6 drop-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
            <span>{subtitle}</span>
          </div>

          <div className="relative">
            <Quote className="absolute -top-10 -left-6 w-20 h-20 text-white/10 -z-10 pointer-events-none" />
            {title && (
              <h3 className="text-lg font-bold text-white/90 mb-3 tracking-wide">
                {title}
              </h3>
            )}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold italic leading-[1.2] mb-6 sm:mb-8 font-heading text-white tracking-tight">
              &ldquo;{quote}&rdquo;
            </h2>
          </div>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8 max-w-2xl font-normal">
            {description}
          </p>

          <div className="flex items-center gap-5 pt-8 border-t border-white/20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0">
              <Image 
                width={120} 
                height={120}
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-1">{authorName}</h4>
              <p className="text-zinc-300 tracking-wider uppercase text-[11px] sm:text-xs font-semibold">{authorRole}</p>
            </div>
          </div>
        </div>

        {/* Cinematic Image Side */}
        <div className="flex-1 order-1 lg:order-2 w-full max-w-[500px] hidden lg:block">
          <div className="relative group">
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl z-10 border border-white/20 group-hover:scale-[1.02] transition-transform duration-700">
              <Image 
                width={800} 
                height={800}
                src={sideImage}
                alt="Leadership Vision"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
