"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileSignature, 
  UserCheck, 
  Award, 
  FileText, 
  IdCard, 
  Download,
  ArrowRight,
  Search
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import {
  verifyApplicationStatus,
  verifyRegistration,
  verifyCertificate,
  verifyMarksheet,
  verifyStudentId,
  verifyAdmitCard
} from "@/app/actions/verifications";

const features = [
  {
    id: "application",
    title: "Application & Status",
    description: "Apply for new admissions or check your current application status.",
    icon: FileSignature,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    solidBg: "bg-blue-500",
    border: "group-hover:border-blue-500/50",
    actionType: "dual" // Has a link and a modal
  },
  {
    id: "registration",
    title: "Registration Verification",
    description: "Verify student registration details using Registration Number.",
    icon: UserCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    solidBg: "bg-emerald-500",
    border: "group-hover:border-emerald-500/50",
    actionType: "modal",
    placeholder: "Enter Registration Number"
  },
  {
    id: "certificate",
    title: "Certificate Verification",
    description: "Validate authenticity of issued course certificates.",
    icon: Award,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    solidBg: "bg-amber-500",
    border: "group-hover:border-amber-500/50",
    actionType: "modal",
    placeholder: "Enter Certificate or Registration Number"
  },
  {
    id: "marksheet",
    title: "Marksheet Verification",
    description: "Verify semester grades and academic transcripts securely.",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    solidBg: "bg-purple-500",
    border: "group-hover:border-purple-500/50",
    actionType: "modal",
    placeholder: "Enter Marksheet or Registration Number"
  },
  {
    id: "studentid",
    title: "Student ID Card",
    description: "Verify digital student identification records.",
    icon: IdCard,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    solidBg: "bg-rose-500",
    border: "group-hover:border-rose-500/50",
    actionType: "modal",
    placeholder: "Enter Registration Number"
  },
  {
    id: "admitcard",
    title: "Admit Card Download",
    description: "Download hall tickets for upcoming examinations.",
    icon: Download,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    solidBg: "bg-violet-500",
    border: "group-hover:border-violet-500/50",
    actionType: "modal",
    placeholder: "Enter Enrollment Number"
  }
];

export function StudentFeaturesGrid() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [dobValue, setDobValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  
  // Captcha State
  const [captchaText, setCaptchaText] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaText(`${num1} + ${num2} = ?`);
    setCaptchaAnswer(num1 + num2);
    setCaptchaInput("");
  };

  const handleOpenModal = (id: string) => {
    setActiveModal(id);
    setInputValue("");
    setDobValue("");
    setVerificationResult(null);
    if (id === 'admitcard') {
      generateCaptcha();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      toast.error("Please enter a valid number");
      return;
    }

    if (activeModal === 'admitcard') {
      if (parseInt(captchaInput) !== captchaAnswer) {
        toast.error("Incorrect security captcha!");
        generateCaptcha();
        return;
      }
    }
    
    setIsLoading(true);
    let res: any = { success: false, message: "Unknown feature" };

    const searchId = inputValue.trim();

    try {
      switch (activeModal) {
        case "application": res = await verifyApplicationStatus(searchId); break;
        case "registration": res = await verifyRegistration(searchId); break;
        case "certificate": res = await verifyCertificate(searchId); break;
        case "marksheet": res = await verifyMarksheet(searchId); break;
        case "studentid": res = await verifyStudentId(searchId); break;
        case "admitcard": res = await verifyAdmitCard(searchId, dobValue); break;
      }

      if (res.success) {
        toast.success("Verification Successful!");
        setVerificationResult(res.data);
      } else {
        toast.error(res.message || "Verification failed");
      }
    } catch (error) {
      toast.error("An error occurred during verification.");
    } finally {
      setIsLoading(false);
      if (activeModal === 'admitcard') {
        generateCaptcha();
      }
    }
  };

  const getActiveFeature = () => features.find(f => f.id === activeModal);

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-sm">
            Student Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Digital <span className="text-primary">Verification Hub</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Instantly verify academic records, download important documents, and track your application status through our secure portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div 
                className={cn(
                  "group relative h-full flex flex-col justify-between p-8 rounded-3xl transition-all duration-500 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:border-transparent",
                  "bg-white dark:bg-slate-900",
                  feature.actionType === "modal" ? "cursor-pointer" : ""
                )}
                onClick={() => feature.actionType === "modal" && handleOpenModal(feature.id)}
              >
                {/* Advanced Gradient Border Effect on Hover */}
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl p-[2px] -z-10", "bg-gradient-to-br from-primary via-transparent to-transparent")} />
                
                {/* Intense Background Glow */}
                <div className={cn("absolute -right-20 -top-20 w-64 h-64 blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none rounded-full", feature.solidBg)} />

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500", feature.bg)}>
                      <feature.icon className={cn("h-8 w-8", feature.color)} />
                    </div>
                    {feature.actionType !== "dual" && (
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-500 font-medium leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  <div className="pt-8 mt-auto">
                    {feature.actionType === "dual" ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        <Link 
                          href="/admission" 
                          className={cn(
                            "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                            "w-full sm:flex-1 h-12 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                          )}
                        >
                          Apply Now
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full sm:flex-1 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 font-bold transition-all hover:-translate-y-0.5"
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(feature.id); }}
                        >
                          Check Status
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className={cn(
                          "w-full h-12 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5",
                          "bg-slate-100 text-slate-700 hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary dark:hover:text-white",
                          "group-hover:bg-primary group-hover:text-white shadow-none group-hover:shadow-lg group-hover:shadow-primary/25"
                        )}
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(feature.id); }}
                      >
                        Launch Verification
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Verification Modal */}
      <Dialog open={!!activeModal} onOpenChange={(open) => {
        if (!open) {
          setActiveModal(null);
          setInputValue("");
          setDobValue("");
          setVerificationResult(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] bg-transparent">
          {getActiveFeature() && (
            <div className="relative bg-white dark:bg-slate-950 flex flex-col">
              
              {/* Animated Abstract Header */}
              <div className={cn("relative pt-12 pb-24 px-10 overflow-hidden", getActiveFeature()?.solidBg)}>
                {/* Advanced Grid Overlay */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                {/* Floating Glows */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center text-center text-white">
                  <div className="p-3 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-xl shadow-black/5 mb-4">
                    {React.createElement(getActiveFeature()!.icon, { className: "h-10 w-10 text-white" })}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{getActiveFeature()?.title}</h2>
                  <p className="text-white/80 font-medium text-sm mt-2 max-w-[280px]">
                    Enter your secure credentials below to access the digital portal.
                  </p>
                </div>
              </div>
              
              
              {!verificationResult ? (
                <form onSubmit={handleVerify} className="relative px-8 pb-6 pt-0">
                  {/* Form Card that floats over the header */}
                  <div className="relative -mt-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-2">
                        {getActiveFeature()?.id === 'application' ? 'Application Number' : getActiveFeature()?.placeholder}
                      </label>
                      <div className="relative group/input">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                        <Input 
                          required
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={getActiveFeature()?.id === 'application' ? 'APP-XXXXXXXX' : 'Enter ID here...'}
                          className="pl-14 h-16 rounded-[1.25rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-lg focus-visible:ring-0 focus-visible:border-primary transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {getActiveFeature()?.id === 'admitcard' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-2">Date of Birth</label>
                          <Input 
                            type="text"
                            placeholder="DD/MM/YYYY"
                            pattern="\d{2}/\d{2}/\d{4}"
                            maxLength={10}
                            required
                            value={dobValue}
                            className="h-16 rounded-[1.25rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-lg focus-visible:ring-0 focus-visible:border-primary transition-all shadow-inner px-5 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 3 && val.length <= 4) {
                                val = val.slice(0, 2) + '/' + val.slice(2);
                              } else if (val.length >= 5) {
                                val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
                              }
                              setDobValue(val);
                            }}
                          />
                        </div>

                        <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-[1.25rem] border border-slate-100 dark:border-slate-800">
                          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between w-full">
                            <span>Security Challenge</span>
                            <button type="button" onClick={generateCaptcha} className="text-primary hover:opacity-70 transition-opacity">
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          </label>
                          <div className="flex gap-2">
                            <div className="h-12 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-xl tracking-wider text-slate-600 dark:text-slate-300">
                              {captchaText}
                            </div>
                            <Input 
                              type="number"
                              required
                              value={captchaInput}
                              onChange={(e) => setCaptchaInput(e.target.value)}
                              placeholder="Answer"
                              className="h-12 w-24 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-center font-bold text-lg focus-visible:ring-0"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className={cn(
                        "w-full h-14 rounded-2xl shadow-lg font-black text-white text-lg transition-all hover:-translate-y-0.5", 
                        getActiveFeature()?.solidBg, "hover:brightness-110 shadow-black/10"
                      )}
                    >
                      {isLoading ? "Securely Verifying..." : "Authenticate Now"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="relative px-10 pb-10 pt-0">
                  <div className="relative -mt-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-3 text-emerald-500 mb-6 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl">
                      <ShieldCheck className="h-8 w-8" />
                      <h3 className="text-xl font-black">Verification Successful</h3>
                    </div>

                    {getActiveFeature()?.id === 'registration' ? (
                      <div className="space-y-4 mb-8 text-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                          This official registration is linked to <br />
                          <span className="text-2xl font-black text-primary mt-2 block">{verificationResult.name}</span>
                        </p>
                        {verificationResult.courseName && (
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-4">
                            {verificationResult.courseName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {verificationResult.name && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Name</p>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{verificationResult.name}</p>
                          </div>
                        )}
                        
                        {verificationResult.courseName && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course</p>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{verificationResult.courseName}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {verificationResult.enrollmentNo && !['studentid', 'registration', 'marksheet', 'certificate'].includes(getActiveFeature()?.id || '') && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment No</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{verificationResult.enrollmentNo}</p>
                          </div>
                        )}
                        {verificationResult.certificateNo && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certificate No</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{verificationResult.certificateNo}</p>
                          </div>
                        )}
                        {verificationResult.marksheetNo && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marksheet No</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{verificationResult.marksheetNo}</p>
                          </div>
                        )}
                        {verificationResult.registrationNo && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration No</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{verificationResult.registrationNo}</p>
                          </div>
                        )}
                        {verificationResult.grade && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{verificationResult.grade}</p>
                          </div>
                        )}
                        {verificationResult.percentage !== undefined && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{verificationResult.percentage}%</p>
                          </div>
                        )}
                        {verificationResult.status && getActiveFeature()?.id !== 'marksheet' && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{verificationResult.status}</p>
                          </div>
                        )}
                        {verificationResult.date && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getActiveFeature()?.id === 'marksheet' ? 'Year of Passing' : 'Issue Date'}</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{getActiveFeature()?.id === 'marksheet' ? new Date(verificationResult.date).getFullYear() : new Date(verificationResult.date).toLocaleDateString()}</p>
                          </div>
                        )}
                        </div>
                      </div>
                    )}

                    {getActiveFeature()?.id === 'admitcard' ? (
                      <Link 
                        href={`/student/verify/admit-card/${verificationResult.id}`}
                        className="flex items-center justify-center w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-lg gap-2 shadow-lg shadow-indigo-500/20"
                      >
                        <Download className="h-5 w-5" /> Download Admit Card
                      </Link>
                    ) : !['registration', 'studentid', 'marksheet', 'certificate'].includes(getActiveFeature()?.id || '') && (
                      <Link 
                        href={`/student/verify/${getActiveFeature()?.id}/${inputValue.trim()}`}
                        className="flex items-center justify-center w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2"
                      >
                        View Full Document <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
              
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
