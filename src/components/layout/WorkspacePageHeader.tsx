import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface WorkspacePageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: { name: string; href: string }[];
  bgImage?: string;
}

export function WorkspacePageHeader({
  title,
  description,
  breadcrumbs,
  bgImage = "https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg"
}: WorkspacePageHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden bg-slate-950 group">
      {/* Background with Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-[10s] ease-linear group-hover:scale-110"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }}
        />
        {/* Modern Grid Overlay */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Multi-layered Gradients - Top focused for navbar */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-36 pb-16 md:pt-48 md:pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-3xl">
            {/* Advanced Breadcrumbs */}
            <nav className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home className="w-3 h-3" />
                Home
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-white/20" />
                  <Link
                    href={crumb.href}
                    className={idx === breadcrumbs.length - 1 ? "text-primary font-black" : "hover:text-primary transition-colors"}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            <div className="space-y-6">
              <div className="flex items-center gap-3 animate-in slide-in-from-left duration-700">
                <div className="h-0.5 w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-sm">Official Page</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                {title.split(' ').map((word, i, arr) => (
                  <span key={i} className={i === arr.length - 1 ? "text-primary" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>
              {description && (
                <p className="text-base md:text-lg text-white/50 font-medium leading-relaxed max-w-xl py-2 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Decorative Stats or Element */}
          <div className="hidden lg:flex items-center gap-8 pb-4">
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">2026</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Academic Year</div>
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="space-y-1 text-primary">
              <div className="text-3xl font-black">LIVE</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Bottom Decor */}
      <div className="absolute bottom-0 left-0 w-full">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="h-24 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
      </div>
    </div>
  );
}
