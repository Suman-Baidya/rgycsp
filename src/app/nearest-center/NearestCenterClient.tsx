"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, ArrowRight, Building2, Phone, ExternalLink, Loader2 } from "lucide-react";
import { findNearestCenters } from "@/app/actions/nearest-center";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function NearestCenterClient() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  
  const [pinCode, setPinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [centers, setCenters] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    setIsLoading(true);
    setSearched(true);
    const res = await findNearestCenters(pinCode);
    if (res.success) {
      setCenters(res.centers || []);
      if (res.centers?.length === 0) {
        toast.error("No centers found near this PIN code.");
      }
    } else {
      toast.error(res.error || "An error occurred");
      setCenters([]);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Find Your Nearest Center
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Enter your PIN code to discover authorized study centers near you and begin your enrollment process.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 relative">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit PIN Code (e.g. 700001)"
                className="h-16 md:h-20 pl-16 rounded-[1.5rem] bg-slate-50 dark:bg-zinc-800/50 border-transparent focus:border-primary/50 text-xl font-bold tracking-widest placeholder:tracking-normal transition-all"
                maxLength={6}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || pinCode.length !== 6}
              className="h-16 md:h-20 px-10 rounded-[1.5rem] bg-slate-900 hover:bg-primary text-white font-black tracking-widest uppercase shadow-xl shadow-primary/10 transition-all text-sm sm:text-base shrink-0"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Search Centers"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Search Results</h2>
              <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
            </div>

            {centers.length > 0 ? (
              <div className="grid gap-6">
                {centers.map((center, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={center.id}
                  >
                    <Card className="overflow-hidden border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-primary/30 transition-colors bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:shadow-primary/5 group">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 md:w-64 bg-slate-50 dark:bg-zinc-800/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border p-2 flex items-center justify-center">
                            {center.logoUrl ? (
                              <img src={center.logoUrl} alt={center.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                              <Building2 className="w-8 h-8 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full inline-block">
                              {center.subdomain.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            {center.name}
                          </h3>
                          <div className="space-y-2 mb-6">
                            {center.address && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                {center.address}
                              </p>
                            )}
                            {center.contactPhone && (
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                {center.contactPhone}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                              {center.district}, {center.state} - {center.pinCode}
                            </p>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 flex gap-3">
                            <Link href={`/app/${center.subdomain}`} className="flex-1">
                              <Button variant="outline" className="w-full rounded-xl h-12 font-bold group-hover:bg-slate-50">
                                Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                            <Link 
                              href={`/app/${center.subdomain}/admission${courseId ? `?courseId=${courseId}&fromGlobal=true` : '?fromGlobal=true'}`} 
                              className="flex-1"
                            >
                              <Button className="w-full rounded-xl h-12 bg-primary text-white font-bold shadow-lg shadow-primary/20">
                                Proceed to Enroll <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-zinc-800">
                <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Centers Found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  We couldn't find any authorized study centers near {pinCode}. Please try a nearby PIN code or contact our support team.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
