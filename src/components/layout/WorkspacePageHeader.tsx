import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface WorkspacePageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: { name: string; href: string }[];
  bgImage?: string;
  statusTitle?: string;
  statusSub?: string;
  academicYear?: string | number;
}

export function WorkspacePageHeader({
  title,
  description,
  breadcrumbs = [],
  bgImage = "https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg",
  statusTitle = "LIVE",
  statusSub = "Updates",
  academicYear
}: WorkspacePageHeaderProps) {
  const currentYear = academicYear || new Date().getFullYear();

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 group">
      {/* Background with Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-[10s] ease-linear group-hover:brightness-110"
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
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16 md:pt-48 md:pb-20 w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-10 w-full">
          <div className="space-y-4 sm:space-y-5 flex-1 min-w-0 max-w-4xl">
            {/* Clean Unboxed Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />
                  <Link
                    href={crumb.href}
                    className={idx === breadcrumbs.length - 1 ? "text-primary font-bold" : "hover:text-primary transition-colors"}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            <div className="space-y-3 sm:space-y-4 min-w-0">
              <div className="flex items-center gap-3 animate-in slide-in-from-left duration-700">
                <div className="h-0.5 w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-sm">Official Page</span>
              </div>
              <h1 
                title={title}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-2xl truncate block whitespace-nowrap"
              >
                {title.split(' ').map((word, i, arr) => (
                  <span key={i} className={i === arr.length - 1 ? "text-primary" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>
              {description && (
                <p 
                  title={description}
                  className="text-xs sm:text-sm md:text-base text-white/60 font-medium leading-normal max-w-2xl truncate block mt-1 sm:mt-2"
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Decorative Stats or Element */}
          <div className="hidden lg:flex items-center gap-8 pb-4 shrink-0">
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">{currentYear}</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Academic Year</div>
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="space-y-1 text-primary">
              <div className="text-3xl font-black">{statusTitle}</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{statusSub}</div>
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
