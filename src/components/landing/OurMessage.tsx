import { Quote, MessageSquareQuote } from "lucide-react";

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
    <section className="relative py-32 px-6 overflow-hidden min-h-[700px] flex items-center bg-black">
      {/* Sticky Background Image (Parallax Effect) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Multi-layered dark overlays for depth and readability */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div> */}
        {/* <div className="absolute inset-0 bg-black/20"></div> */}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
        {/* Message Content */}
        <div className="flex-1 order-2 lg:order-1 text-white">
          <div className="inline-flex items-center gap-3 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] tracking-[0.2em] uppercase mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {subtitle}
          </div>

          <div className="relative">
            <Quote className="absolute -top-12 left-140 w-24 h-24 text-white/10 -z-10" />
            {title && (
              <h3 className="text-xl font-bold text-white mb-4 tracking-wide opacity-90">
                {title}
              </h3>
            )}
            <h2 className="text-4xl md:text-5xl font-extrabold italic leading-[1.1] mb-10 font-heading text-white tracking-tight">
              "{quote}"
            </h2>
          </div>

          <p className="text-xl text-zinc-300 leading-relaxed mb-10 max-w-2xl font-medium">
            {description}
          </p>

          <div className="flex items-center gap-6 pt-10 border-t border-white/80">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] shrink-0">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-3xl font-bold text-white mb-2">{authorName}</h4>
              <p className="text-white tracking-wide uppercase text-xs">{authorRole}</p>
            </div>
          </div>
        </div>

        {/* Cinematic Image Side */}
        <div className="flex-1 order-1 lg:order-2 w-full max-w-[550px] hidden lg:block">
          <div className="relative group">
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl z-10 border border-white/10 scale-95 group-hover:scale-100 transition-transform duration-700">
              <img
                src={sideImage}
                alt="Office and Strategy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
            </div>
            {/* Floating Decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-[60px] animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
