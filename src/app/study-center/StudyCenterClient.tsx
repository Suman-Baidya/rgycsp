"use client";

import React, { useState, useMemo } from "react";
import { Search, Building2, ChevronRight, ChevronLeft, MapPin, Globe, CheckCircle2, Clock, BookOpen } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudyCenterCourses } from "@/app/actions/study-center";
import { toast } from "sonner";

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
  isSubdomainEnabled?: boolean;
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

  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [selectedCenterName, setSelectedCenterName] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  const getSubdomainUrl = (subdomain: string) => {
    if (typeof window === "undefined") return `/app/${subdomain}`;
    const host = window.location.host;
    
    let rootDomain = host;
    if (host.includes("localhost")) {
      rootDomain = host.includes(":") ? `localhost:${host.split(":")[1]}` : "localhost";
    } else if (host.includes("vercel.app")) {
      const parts = host.split(".");
      rootDomain = parts.slice(-3).join(".");
    } else {
      const parts = host.split(".");
      rootDomain = parts.slice(-2).join(".");
    }

    return `${window.location.protocol}//${subdomain}.${rootDomain}`;
  };

  const handleFindCourse = async (center: Center) => {
    if (center.isSubdomainEnabled) {
      // Normal routing to their landing page
      window.location.href = getTenantLink("/courses", center.subdomain, pathname);
      return;
    }

    // Subdomain is disabled, fetch and show in modal
    setSelectedCenterId(center.id);
    setSelectedCenterName(center.name);
    setIsDialogOpen(true);
    setIsCoursesLoading(true);
    setCourseSearch("");

    const res = await getStudyCenterCourses(center.id);
    if (res.success) {
      setCourses(res.courses || []);
    } else {
      toast.error(res.error || "Failed to load courses");
    }
    setIsCoursesLoading(false);
  };

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
                          {center.isSubdomainEnabled ? (
                            <a 
                              href={getTenantLink("/", center.subdomain, pathname)} 
                              className="font-black text-lg md:text-xl text-foreground hover:text-primary transition-colors line-clamp-1 decoration-2 hover:underline underline-offset-4"
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {center.name}
                            </a>
                          ) : (
                            <span className="font-black text-lg md:text-xl text-foreground line-clamp-1">
                              {center.name}
                            </span>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {center.centerCode && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-white hover:bg-primary/20 font-black tracking-widest text-[10px] rounded-lg px-2.5 py-1">
                                ID: {center.centerCode}
                              </Badge>
                            )}
                            {center.isSubdomainEnabled ? (
                              <a 
                                href={getSubdomainUrl(center.subdomain)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <Badge variant="outline" className="text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors rounded-lg font-bold text-[10px] tracking-wider px-2.5 py-1 border-primary/30 cursor-pointer">
                                  <Globe className="w-3 h-3 mr-1.5 inline-block" />
                                  {center.subdomain}
                                </Badge>
                              </a>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground/60 rounded-lg font-bold text-[10px] tracking-wider px-2.5 py-1 border-border/30">
                                <Globe className="w-3 h-3 mr-1.5 inline-block opacity-50" />
                                Not Available
                              </Badge>
                            )}
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
                      <TableCell className="pr-4 py-5 text-right align-middle">
                        <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                          <Button 
                            onClick={() => handleFindCourse(center)}
                            variant="outline" 
                            className="w-full sm:w-auto rounded-xl font-bold border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all text-xs h-9 px-4"
                          >
                            Find Course
                          </Button>
                          <a href={getTenantLink("/admission?view=status", center.subdomain, pathname)} target="_blank" rel="noopener noreferrer" className="inline-block outline-none w-full sm:w-auto">
                            <Button variant="secondary" className="w-full sm:w-auto rounded-xl font-bold transition-all text-xs h-9 px-4 hover:bg-blue-50 hover:text-blue-600">
                              Track
                            </Button>
                          </a>
                          <a href={getTenantLink("/admission?view=form", center.subdomain, pathname)} target="_blank" rel="noopener noreferrer" className="inline-block outline-none w-full sm:w-auto">
                            <Button className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 font-black group/btn transition-all text-xs h-9 px-5">
                              Apply Now
                              <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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

      {/* Course Modal for centers without a landing page */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] h-full sm:h-auto p-0 overflow-hidden flex flex-col rounded-3xl bg-white dark:bg-zinc-950">
          
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shrink-0">
            <DialogTitle className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4">
              <span className="text-primary">{selectedCenterName}</span> - Available Courses
            </DialogTitle>
            
            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input 
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/30 shadow-inner"
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {isCoursesLoading ? (
              <div className="flex flex-col justify-center items-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading curriculum...</p>
              </div>
            ) : courses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()) || c.category.toLowerCase().includes(courseSearch.toLowerCase())).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()) || c.category.toLowerCase().includes(courseSearch.toLowerCase())).map(course => (
                  <div key={course.id} className="relative group overflow-hidden border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 bg-white dark:bg-slate-900/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 font-extrabold px-2.5 py-1 text-[10px] tracking-wide">
                        {course.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg shrink-0">
                        <Clock className="w-3 h-3 text-primary/70" />
                        {course.duration}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-6 leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h4>
                    
                    <div className="flex justify-between items-end mt-auto border-t border-slate-100 dark:border-slate-800/50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Course Fee</span>
                        <span className="font-black text-base text-slate-900 dark:text-white leading-none">
                          {course.showFee ? (course.priceDisplay || `₹${course.feeAmount}`) : "Contact Center"}
                        </span>
                      </div>
                      <a href={getTenantLink(`/admission?view=form&courseId=${course.id}`, initialCenters.find(c => c.id === selectedCenterId)?.subdomain || "", pathname)} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold px-4 h-9 text-xs">
                          Apply Now
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mt-2">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Courses Found</h3>
                <p className="text-muted-foreground text-sm font-medium mb-6 max-w-sm mx-auto">
                  {courseSearch ? "No courses match your search criteria." : "This institute hasn't listed any public courses yet. You can still apply for admission."}
                </p>
                <a href={getTenantLink("/admission?view=form", initialCenters.find(c => c.id === selectedCenterId)?.subdomain || "", pathname)}>
                  <Button className="rounded-xl h-12 font-bold shadow-lg shadow-primary/20 px-6">Proceed to Admission</Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
