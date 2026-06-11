"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkFranchiseStatus } from "@/app/actions/franchise";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FranchiseStatusClient() {
  const router = useRouter();
  const [trackSearch, setTrackSearch] = useState<string>("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isTrackLoading, setIsTrackLoading] = useState<boolean>(false);

  const handleTrackStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackSearch.trim()) return;
    setIsTrackLoading(true);
    setTrackingResult(null);
    try {
      const res = await checkFranchiseStatus(trackSearch);
      if (res.success) {
        setTrackingResult(res.data);
        toast.success("Application details found.");
      } else {
        toast.error(res.error || "No application found.");
      }
    } catch (err) {
      toast.error("Failed to query application status.");
    } finally {
      setIsTrackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/franchises")} 
          className="mb-8 gap-2 font-bold hover:bg-transparent hover:text-primary transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Franchises
        </Button>

        <div className="bg-card border-2 border-border/40 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-8 mb-10 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-start">
                <div className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/70">Tracking Portal</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">Track Application</h1>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Application Status Check</p>
            </div>
          </div>

          <form onSubmit={handleTrackStatus} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto w-full mb-10">
            <Input required value={trackSearch} onChange={(e) => setTrackSearch(e.target.value)} placeholder="Email ID or Mobile No" className="rounded-xl h-14 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all font-medium text-lg" />
            <Button type="submit" disabled={isTrackLoading} className="rounded-xl h-14 font-bold px-10 shadow-lg shadow-primary/20 shrink-0 text-base">
              {isTrackLoading ? "Searching..." : "Track Status"}
            </Button>
          </form>

          <AnimatePresence>
            {trackingResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="rounded-3xl border-2 overflow-hidden bg-background">
                  <CardHeader className="bg-muted/30 border-b p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="font-black text-xl sm:text-2xl">{trackingResult.centerName}</CardTitle>
                      <CardDescription className="text-sm font-bold uppercase tracking-widest">{trackingResult.fullName}</CardDescription>
                    </div>
                    <div className="shrink-0">
                      {trackingResult.status === "PENDING" && <span className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 text-sm font-black uppercase tracking-wider rounded-xl border border-amber-500/20"><Clock className="w-4 h-4" /> Pending</span>}
                      {trackingResult.status === "APPROVED" && <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 text-sm font-black uppercase tracking-wider rounded-xl border border-emerald-500/20"><CheckCircle2 className="w-4 h-4" /> Approved</span>}
                      {trackingResult.status === "REJECTED" && <span className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 text-sm font-black uppercase tracking-wider rounded-xl border border-red-500/20"><AlertTriangle className="w-4 h-4" /> Rejected</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    {trackingResult.status === "PENDING" && <p className="text-base font-medium text-muted-foreground text-center">Your application is currently under review by our team. Please check back later.</p>}
                    {trackingResult.status === "REJECTED" && <p className="text-base font-medium text-red-600 text-center">{trackingResult.rejectionReason || "Application rejected. Please contact support."}</p>}
                    {trackingResult.status === "APPROVED" && (
                      <div className="space-y-6">
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                          <p className="font-bold text-primary uppercase tracking-widest text-xs mb-2">Login Credentials Generated</p>
                          <p className="font-black text-3xl mb-2">{trackingResult.username}</p>
                          <p className="text-sm text-muted-foreground">Use this code and your registered password to log into your portal.</p>
                        </div>
                        <a href={`http://${trackingResult.username?.toLowerCase().replace(/[^a-z0-9]/g, "")}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}/login`} target="_blank" className="block w-full">
                          <Button className="w-full rounded-xl font-bold h-14 shadow-lg shadow-primary/20 text-lg">Go to Portal Dashboard <ArrowRight className="w-5 h-5 ml-2" /></Button>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
