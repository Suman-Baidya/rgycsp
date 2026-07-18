"use client";

import React, { useState, useMemo } from "react";
import { Search, Building2, ChevronRight, ChevronLeft, MapPin, Globe, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { getTenantLink } from "@/lib/routing";
import { usePathname } from "next/navigation";

interface Center {
  id: string;
  name: string;
  subdomain: string;
  centerCode: string | null;
  logoUrl: string | null;
  pinCode: string | null;
  state: string | null;
  district: string | null;
  siteSettings?: {
    address: string | null;
    googleMapLink: string | null;
  } | null;
}

interface StudyCenterClientProps {
  initialCenters: Center[];
  contentSection?: any;
}

export function StudyCenterClient({ initialCenters, contentSection }: StudyCenterClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pathname = usePathname();

  const filteredCenters = useMemo(() => {
    if (!searchQuery) return initialCenters;
    
    const query = searchQuery.toLowerCase().trim();
    return initialCenters.filter(center => 
      (center.name && center.name.toLowerCase().includes(query)) ||
      (center.centerCode && center.centerCode.toLowerCase().includes(query)) ||
      (center.pinCode && center.pinCode.includes(query)) ||
      (center.district && center.district.toLowerCase().includes(query)) ||
      (center.state && center.state.toLowerCase().includes(query)) ||
      (center.siteSettings?.address && center.siteSettings.address.toLowerCase().includes(query))
    );
  }, [initialCenters, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCenters.length / itemsPerPage));
  const paginatedCenters = filteredCenters.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
      {/* Search Header Area */}
      <div className="relative mb-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl rounded-[23px] p-8 lg:p-12 shadow-sm border border-white/20 dark:border-zinc-800/50 flex flex-col items-center text-center">
          <div className="max-w-2xl w-full mx-auto">
            {contentSection?.subtitle && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {contentSection.subtitle}
              </div>
            )}
            <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">
              {contentSection?.title || "Find an Institute"}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {contentSection?.content?.description || "Search by institute name, code, state, or pin code to find the nearest study center."}
            </p>
            
            <div className="relative group mx-auto w-full max-w-xl">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input 
                type="text"
                placeholder="Search by institute name, code, state, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-6 rounded-full text-lg shadow-xl shadow-primary/5 border-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary bg-white dark:bg-zinc-900 transition-all"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/10"
            >
              <CheckCircle2 className="w-4 h-4" />
              {filteredCenters.length} {filteredCenters.length === 1 ? 'Institute' : 'Institutes'} Available
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium Table Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] py-6 pl-8 font-black text-zinc-500 uppercase tracking-widest text-[10px]">Institute</TableHead>
                <TableHead className="min-w-[300px] py-6 font-black text-zinc-500 uppercase tracking-widest text-[10px]">Details</TableHead>
                <TableHead className="min-w-[200px] py-6 font-black text-zinc-500 uppercase tracking-widest text-[10px]">Location</TableHead>
                <TableHead className="min-w-[250px] py-6 pr-8 text-right font-black text-zinc-500 uppercase tracking-widest text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {paginatedCenters.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                          <Search className="w-10 h-10 opacity-40" />
                        </div>
                        <p className="text-xl font-black text-foreground">No institutes found</p>
                        <p className="text-sm font-medium mt-1">Try adjusting your search criteria or explore other areas.</p>
                      </div>
                    </TableCell>
                  </motion.tr>
                ) : (
                  paginatedCenters.map((center, index) => (
                    <motion.tr 
                      key={center.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all duration-300"
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-500">
                          {center.logoUrl ? (
                            <img src={center.logoUrl} alt={center.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-7 h-7 text-primary/50 dark:text-zinc-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col gap-2 items-start">
                          <a 
                            href={getTenantLink("/", center.subdomain, pathname)} 
                            className="font-black text-lg md:text-xl text-foreground hover:text-primary transition-colors line-clamp-1 decoration-2 hover:underline underline-offset-4"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {center.name}
                          </a>
                          <div className="flex items-center gap-2 flex-wrap">
                            {center.centerCode && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-white hover:bg-primary/20 font-black tracking-widest text-[10px] rounded-lg px-2.5 py-1">
                                ID: {center.centerCode}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-muted-foreground rounded-lg font-bold text-[10px] tracking-wider px-2.5 py-1 border-border/50">
                              <Globe className="w-3 h-3 mr-1.5 inline-block" />
                              {center.subdomain}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col gap-2 items-start">
                          {(center.siteSettings?.address || center.district || center.state) && (
                            <a 
                              href={center.siteSettings?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([center.district, center.state, center.pinCode].filter(Boolean).join(", "))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 text-foreground/80 font-bold hover:text-primary transition-colors group/location"
                            >
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover/location:bg-primary group-hover/location:text-white transition-colors">
                                <MapPin className="w-3.5 h-3.5 text-primary group-hover/location:text-white" />
                              </div>
                              <div className="flex flex-col mt-0.5 max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                                <span className="line-clamp-2 leading-snug text-sm break-words whitespace-normal">
                                  {center.siteSettings?.address || [center.district, center.state].filter(Boolean).join(", ")}
                                </span>
                                {center.pinCode && (
                                  <span className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1 font-black shrink-0">
                                    PIN: {center.pinCode}
                                  </span>
                                )}
                              </div>
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 py-5 text-right align-middle">
                        <div className="flex items-center justify-end gap-3 flex-wrap sm:flex-nowrap">
                          <a href={getTenantLink("/courses", center.subdomain, pathname)} className="inline-block outline-none w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all text-xs h-10 px-5">
                              Find Course
                            </Button>
                          </a>
                          <a href={getTenantLink("/admission", center.subdomain, pathname)} className="inline-block outline-none w-full sm:w-auto">
                            <Button className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 font-black group/btn transition-all text-xs h-10 px-6">
                              Apply Now
                              <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-sm font-medium text-muted-foreground bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
            Page <span className="text-foreground font-bold">{currentPage}</span> of <span className="text-foreground font-bold">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-full px-4 font-semibold hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full px-4 font-semibold hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
