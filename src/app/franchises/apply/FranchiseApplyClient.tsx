"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { submitFranchiseApplication } from "@/app/actions/franchise";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FranchiseApplyClient() {
  const router = useRouter();
  const [formStep, setFormStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [applyFormData, setApplyFormData] = useState({
    fullName: "", dob: "", mobile: "", whatsapp: "", email: "", password: "", confirmPassword: "",
    centerName: "", pinCode: "", state: "", district: "", addressDetail: "",
    computerCount: "", teacherCount: "", roomCount: "", spaceSqFt: "",
    photoUrl: "", signatureUrl: "", idProofUrl: ""
  });

  const handleApplyInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApplyFormData(prev => ({ ...prev, [name]: value }));

    if (name === "pinCode" && value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setApplyFormData(prev => ({
            ...prev,
            pinCode: value,
            state: postOffice.State,
            district: postOffice.District,
          }));
          toast.success("Location auto-filled based on PIN code!");
        } else {
          toast.error("Invalid PIN code.");
        }
      } catch (err) {
        console.error("Failed to fetch location data");
      }
    }
  };

  const handleApplyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (applyFormData.password !== applyFormData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!applyFormData.photoUrl || !applyFormData.signatureUrl || !applyFormData.idProofUrl) {
      toast.error("Please upload all required documents.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitFranchiseApplication(applyFormData);
      if (res.success) {
        toast.success("Franchise application submitted successfully!");
        router.push("/franchises/status");
      } else {
        toast.error(res.error || "Failed to submit application.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/franchises")} 
          className="mb-8 gap-2 font-bold hover:bg-transparent hover:text-primary transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Franchises
        </Button>

        <div className="bg-card border-2 border-border/40 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-8 mb-10 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-start">
                <div className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/70">Application Portal</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">Apply Online</h1>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Step {formStep} of 4</p>
            </div>
            <div className="flex gap-2 shrink-0 bg-muted/30 p-2 rounded-full border border-border/50">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className={`h-3 w-10 sm:w-14 rounded-full transition-all duration-500 ${formStep >= idx ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" : "bg-muted/50"}`} />
              ))}
            </div>
          </div>

          <form onSubmit={handleApplyFormSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {formStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-wide text-primary border-b pb-2">1. Franchise Owner Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Full Name</Label>
                      <Input required name="fullName" value={applyFormData.fullName} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Date of Birth (DD/MM/YYYY)</Label>
                      <Input type="text" placeholder="DD/MM/YYYY" pattern="\d{2}/\d{2}/\d{4}" title="Format: DD/MM/YYYY" required name="dob" value={applyFormData.dob} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Mobile Number</Label>
                      <Input required type="tel" name="mobile" value={applyFormData.mobile} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">WhatsApp Number</Label>
                      <Input name="whatsapp" value={applyFormData.whatsapp} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-bold text-xs">Email Address</Label>
                      <Input required type="email" name="email" value={applyFormData.email} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2 relative">
                      <Label className="font-bold text-xs">Password</Label>
                      <div className="relative">
                        <Input required minLength={6} type={showPassword ? "text" : "password"} name="password" value={applyFormData.password} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 relative">
                      <Label className="font-bold text-xs">Confirm Password</Label>
                      <div className="relative">
                        <Input required minLength={6} type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={applyFormData.confirmPassword} onChange={handleApplyInputChange} className={`rounded-xl h-12 bg-background shadow-sm transition-all pr-10 border-2 ${applyFormData.confirmPassword && applyFormData.password !== applyFormData.confirmPassword ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200" : "border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30"}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {applyFormData.confirmPassword && applyFormData.password !== applyFormData.confirmPassword && (
                        <p className="text-xs text-red-500 font-bold absolute -bottom-5 left-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {formStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-wide text-primary border-b pb-2">2. Institute Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-bold text-xs">Center/Institute Name</Label>
                      <Input required name="centerName" value={applyFormData.centerName} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Pin Code</Label>
                      <Input required name="pinCode" value={applyFormData.pinCode} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">State</Label>
                      <Input required name="state" value={applyFormData.state} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">District</Label>
                      <Input required name="district" value={applyFormData.district} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Village / Town / Ward</Label>
                      <Input required name="addressDetail" value={applyFormData.addressDetail} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                  </div>
                </motion.div>
              )}

              {formStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-wide text-primary border-b pb-2">3. Infrastructure & Capacity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Total Computers</Label>
                      <Input required type="number" name="computerCount" value={applyFormData.computerCount} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Total Teachers</Label>
                      <Input required type="number" name="teacherCount" value={applyFormData.teacherCount} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Number of Rooms</Label>
                      <Input type="number" name="roomCount" value={applyFormData.roomCount} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs">Space Area (Sq Ft)</Label>
                      <Input type="number" name="spaceSqFt" value={applyFormData.spaceSqFt} onChange={handleApplyInputChange} className="rounded-xl h-12 bg-background border-border/60 shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all" />
                    </div>
                  </div>
                </motion.div>
              )}

              {formStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-wide text-primary border-b pb-2">4. Document Uploads</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border p-6 rounded-2xl bg-muted/5 flex flex-col items-center">
                      <Label className="font-black text-xs text-slate-500 mb-4 text-center">PROFILE PHOTO</Label>
                      <ImageUpload value={applyFormData.photoUrl} onChange={(url) => setApplyFormData(prev => ({ ...prev, photoUrl: url }))} folder="RGYCSP/Franchise/Photos" />
                    </div>
                    <div className="border p-6 rounded-2xl bg-muted/5 flex flex-col items-center">
                      <Label className="font-black text-xs text-slate-500 mb-4 text-center">SIGNATURE PHOTO</Label>
                      <ImageUpload value={applyFormData.signatureUrl} onChange={(url) => setApplyFormData(prev => ({ ...prev, signatureUrl: url }))} folder="RGYCSP/Franchise/Signatures" />
                    </div>
                    <div className="border p-6 rounded-2xl bg-muted/5 flex flex-col items-center md:col-span-2">
                      <Label className="font-black text-xs text-slate-500 mb-4 text-center">ID PROOF (AADHAAR / VOTER CARD / PAN)</Label>
                      <ImageUpload value={applyFormData.idProofUrl} onChange={(url) => setApplyFormData(prev => ({ ...prev, idProofUrl: url }))} folder="RGYCSP/Franchise/Docs" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-8 border-t">
              {formStep > 1 ? (
                <Button type="button" variant="outline" onClick={() => setFormStep(prev => prev - 1)} className="rounded-xl font-bold h-12 gap-2 px-6">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
              ) : <div />}
              
              {formStep < 4 ? (
                <Button type="button" onClick={() => {
                  if (formStep === 1) {
                    if (!applyFormData.fullName || !applyFormData.email || !applyFormData.password || !applyFormData.dob) return toast.error("Please fill required fields.");
                    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(applyFormData.dob)) return toast.error("Please enter Date of Birth in DD/MM/YYYY format.");
                    if (applyFormData.password !== applyFormData.confirmPassword) return toast.error("Passwords do not match.");
                    if (applyFormData.password.length < 6) return toast.error("Password must be at least 6 characters.");
                  }
                  if (formStep === 2 && (!applyFormData.centerName || !applyFormData.pinCode)) return toast.error("Please fill required fields.");
                  if (formStep === 3 && (!applyFormData.computerCount || !applyFormData.teacherCount)) return toast.error("Please fill required fields.");
                  setFormStep(prev => prev + 1);
                }} className="rounded-xl font-bold h-12 gap-2 px-8 shadow-lg shadow-primary/20">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold h-12 px-10 shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700 text-white">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
