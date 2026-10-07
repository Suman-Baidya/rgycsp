import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  bgImage?: string;
  breadcrumb?: string;
  data?: any;
}

export function PageHeader({
  title: propTitle,
  subtitle: propSubtitle,
  bgImage: propBgImage,
  breadcrumb: propBreadcrumb,
  data
}: PageHeaderProps) {
  const content = data?.content || {};

  const rawDataTitle = data?.title;
  const isInternalTitle = typeof rawDataTitle === 'string' && (rawDataTitle.toLowerCase().startsWith("page-header") || rawDataTitle.toLowerCase().startsWith("page header"));
  const title = (rawDataTitle && !isInternalTitle) ? rawDataTitle : (propTitle || "Page Title");
  const subtitle = (data?.subtitle !== null && data?.subtitle !== undefined && data?.subtitle !== "") ? data.subtitle : (propSubtitle || "");
  const bgImage = content.bgImage || propBgImage || "https://images.unsplash.com/photo-1517245318773-b7b83696770c?q=80&w=2070";
  const breadcrumb = content.breadcrumb || propBreadcrumb || title;

  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  return (
    <div className="relative w-full flex flex-col justify-start items-center overflow-hidden pt-24 sm:pt-24 md:pt-50 pb-20 sm:pb-30">
      {/* Background Image with Cinematic Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/50 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Normal Unboxed Breadcrumbs (Not Box Type) */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/70 mb-3 sm:mb-4">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <span className="text-white font-semibold">
            {breadcrumb}
          </span>
        </nav>

        {/* Section Heading with Gradient Accent on One Line */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md truncate max-w-full px-4 text-center">
          {firstPart && <>{firstPart} </>}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-primary/80">
            {lastWord || title}
          </span>
        </h1>

        {/* Subtitle / Description - Exactly 2 lines */}
        {subtitle && (
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto font-normal drop-shadow-sm line-clamp-2 leading-relaxed w-full px-4 text-center">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom Curve/Decor fade into background */}
      <div className="absolute bottom-0 left-0 w-full h-8 sm:h-10 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
}
