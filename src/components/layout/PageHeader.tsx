"use client"

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  bgImage?: string;
  breadcrumb?: string;
  data?: any;
}

export function PageHeader({ title: propTitle, subtitle: propSubtitle, bgImage: propBgImage, breadcrumb: propBreadcrumb, data }: PageHeaderProps) {
  const content = data?.content || {};

  const title = (data?.title !== null && data?.title !== undefined) ? data.title : (propTitle || "Page Title");
  const subtitle = (data?.subtitle !== null && data?.subtitle !== undefined) ? data.subtitle : (propSubtitle || "");
  const bgImage = content.bgImage || propBgImage || "https://images.unsplash.com/photo-1517245318773-b7b83696770c?q=80&w=2070";
  const breadcrumb = content.breadcrumb || propBreadcrumb || title;
  return (
    <div className="relative h-[350px] md:h-[580px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Pagination/Breadcrumb Tracker */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Home</Link>
          <ChevronRight className="w-4 h-4 text-white/40" />
          <span className="text-white text-sm font-bold uppercase tracking-wider">{breadcrumb}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight font-heading mb-6 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
          {subtitle}
        </p>
      </div>

      {/* Bottom Curve/Decor */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent z-10"></div>
    </div>
  );
}
