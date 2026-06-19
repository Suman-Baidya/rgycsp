"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { getPincodeDetails } from "@/app/actions/pincode";
import { submitAdmissionApplication, sendAdmissionOTP, verifyAdmissionOTP } from "@/app/actions/admission";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, CheckCircle2, Download, Copy, Loader2, Mail, ShieldCheck, Calculator, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Form Schema
const formSchema = z.object({
  courseId: z.string().optional(),
  appliedCourse: z.string().min(1, "Course is required"),
  fullName: z.string().min(2, "Full name is required"),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianPhone: z.string().optional(),
  dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/YYYY format"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  
  vill: z.string().min(1, "Village/Street is required"),
  po: z.string().min(1, "Post Office is required"),
  ps: z.string().min(1, "Police Station is required"),
  dist: z.string().min(1, "District is required"),
  pin: z.string().length(6, "PIN code must be 6 digits"),
  state: z.string().min(1, "State is required"),
  
  mobile: z.string().min(10, "Mobile number is required"),
  whatsapp: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  
  qualName: z.string().optional(),
  qualYear: z.string().optional(),
  qualPercent: z.string().optional(),
  qualBoard: z.string().optional(),

  photoUrl: z.string().min(1, "Photo is required"),
  signatureUrl: z.string().min(1, "Signature is required"),
  idProofUrl: z.string().optional(),
  customData: z.record(z.string(), z.any()).optional(),
});

export default function AdmissionFormClient({ workspaceId, workspaceName, config, courses, initialCourseId, fromGlobal }: any) {
  const showVerification = config?.enableEmailVerification !== false;
  const [step, setStep] = useState(showVerification ? 0 : 1); // Respect config
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ q: "", a: 0 });
  const [userCaptcha, setUserCaptcha] = useState("");

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ q: `${n1} + ${n2}`, a: n1 + n2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const pathname = usePathname();
  const params = useParams();
  const tenant = params.tenant as string;

  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = (isSubdirectoryMode && tenant) ? `/app/${tenant}` : '';

  const disabledFields = Array.isArray(config?.disabledFields) ? config.disabledFields : [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "", fatherName: "", motherName: "", guardianPhone: "", dob: "", gender: "", bloodGroup: "", religion: "", caste: "",
      vill: "", po: "", ps: "", dist: "", pin: "", state: "",
      mobile: "", whatsapp: "", email: "",
      qualName: "", qualYear: "", qualPercent: "", qualBoard: "",
      photoUrl: "", signatureUrl: "", idProofUrl: "", courseId: "", appliedCourse: "",
      customData: {}
    }
  });

  // Automatically select course if initialCourseId is provided
  useState(() => {
    if (initialCourseId && courses?.length > 0) {
      const selectedCourse = courses.find((c: any) => c.id === initialCourseId);
      if (selectedCourse) {
        form.setValue("courseId", selectedCourse.id);
        form.setValue("appliedCourse", selectedCourse.title);
      }
    }
  });

  const { watch, setValue, trigger, formState: { errors } } = form;
  const pin = watch("pin");
  const mobile = watch("mobile");
  const email = watch("email");

  // Handle PIN auto-fill
  const handlePinBlur = async () => {
    if (pin && pin.length === 6) {
      toast.info("Fetching location details...");
      const res = await getPincodeDetails(pin);
      if (res.success) {
        setValue("dist", res.district || "");
        setValue("state", res.state || "");
        toast.success("Location details fetched successfully");
      } else {
        toast.error("Invalid PIN code or no details found");
      }
    }
  };

  const handleWhatsappCheck = (checked: boolean) => {
    if (checked) setValue("whatsapp", mobile);
    else setValue("whatsapp", "");
  };

  const handleSendOtp = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    if (parseInt(userCaptcha) !== captcha.a) {
      toast.error("Incorrect captcha answer");
      generateCaptcha();
      return;
    }

    setOtpLoading(true);
    const res = await sendAdmissionOTP(email);
    if (res.success) {
      setIsOtpSent(true);
      toast.success("OTP sent to your email");
    } else {
      toast.error(res.error || "An error occurred");
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    const res = await verifyAdmissionOTP(email, otp);
    if (res.success) {
      setIsEmailVerified(true);
      setValue("email", email);
      toast.success("Email verified successfully");
      setStep(1);
    } else {
      toast.error(res.error || "An error occurred");
    }
    setOtpLoading(false);
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["fullName", "dob", "gender", "appliedCourse"];
      if (!disabledFields.includes("fatherName")) fieldsToValidate.push("fatherName");
      if (!disabledFields.includes("motherName")) fieldsToValidate.push("motherName");
      if (!disabledFields.includes("guardianPhone")) fieldsToValidate.push("guardianPhone");
      if (!disabledFields.includes("bloodGroup")) fieldsToValidate.push("bloodGroup");
      if (!disabledFields.includes("religion")) fieldsToValidate.push("religion");
      if (!disabledFields.includes("caste")) fieldsToValidate.push("caste");
    } else if (step === 2) {
      fieldsToValidate = ["email", "vill", "po", "ps", "dist", "pin", "state", "mobile"];
      if (!disabledFields.includes("whatsapp")) fieldsToValidate.push("whatsapp");
    } else if (step === 3) {
      fieldsToValidate = ["qualName", "qualYear", "qualPercent", "qualBoard"];
    } else if (step === 4) {
      // Validate required custom fields
      const customFields = config?.customFields || [];
      const values = watch("customData") || {};
      let isValid = true;
      customFields.forEach((f: any) => {
        if (f.required && !values[f.id]) {
          toast.error(`${f.label} is required`);
          isValid = false;
        }
      });
      if (!isValid) return;
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      let next = step + 1;
      if (next === 3 && !showQualification) next++;
      if (next === 4 && !hasCustomFields) next++;
      setStep(next);
    }
  };

  const prevStep = () => {
    if (step === 1 && !showVerification) return;
    let prev = step - 1;
    if (prev === 4 && !hasCustomFields) prev--;
    if (prev === 3 && !showQualification) prev--;
    setStep(prev);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate dynamic documents
    let hasError = false;
    const requiredDocsList = Array.isArray(config?.requiredDocs) ? config.requiredDocs : ["Passport Size Photo", "ID Proof", "Marksheet"];
    const customData = values.customData || {};
    
    for (const doc of requiredDocsList) {
      const docLower = doc.toLowerCase();
      // Photo and signature are validated by Zod schema implicitly
      if (docLower.includes("photo") || docLower.includes("passport") || docLower.includes("signature")) continue;
      
      if (docLower === "id proof" || docLower === "aadhaar" || docLower.includes("id proof")) {
        if (!values.idProofUrl) {
          toast.error(`${doc} is required`);
          hasError = true;
        }
        continue;
      }
      
      if (!customData[`doc_${doc}`]) {
        toast.error(`${doc} is required`);
        hasError = true;
      }
    }
    
    if (hasError) return;

    setIsSubmitting(true);
    const address = { vill: values.vill, po: values.po, ps: values.ps, dist: values.dist, pin: values.pin, state: values.state };
    const qualification = { name: values.qualName, year: values.qualYear, percentage: values.qualPercent, board: values.qualBoard };

    const payload = { ...values, address, qualification };

    const res = await submitAdmissionApplication(workspaceId, payload, fromGlobal);
    if (res.success) {
      setSuccessData(res.data);
      setStep(6);
    } else {
      toast.error(res.error || "An error occurred");
    }
    setIsSubmitting(false);
  };

  if (step === 6 && successData) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950 rounded-[2.5rem]">
          <div className="h-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-600" />
          <CardContent className="p-8 md:p-12 text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Application Submitted!</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {config?.successMessage || "Your admission application has been received. Please save your login credentials below to track your status."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl text-left relative overflow-hidden group transition-all hover:border-primary/20">
                <Label className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-3 block">Application ID (Username)</Label>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{successData.applicationNo}</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-950 border shadow-sm" onClick={() => {navigator.clipboard.writeText(successData.applicationNo); toast.success("ID Copied!");}}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl text-left relative overflow-hidden group transition-all hover:border-primary/20">
                <Label className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-3 block">Temporary Password</Label>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-zinc-900 px-2 py-1 rounded border overflow-hidden truncate max-w-[150px]">{successData.tempPassword}</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-950 border shadow-sm" onClick={() => {navigator.clipboard.writeText(successData.tempPassword); toast.success("Password Copied!");}}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={`${workspaceBase}/admission/print/${successData.id}`} target="_blank" className="flex-[2]">
                <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-2xl text-lg font-bold group">
                  <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" /> Download PDF
                </Button>
              </Link>
              <Link href={`${workspaceBase}/admission/status`} className="flex-1">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-200 font-bold tracking-widest text-[10px] hover:bg-slate-50">
                  Track Status <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-zinc-900/80 border-t p-6 flex justify-center items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest">Powered by {workspaceName} Admission Portal</span>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const hasCustomFields = Array.isArray(config?.customFields) && config.customFields.length > 0;
  const showQualification = !disabledFields.includes("qualification");

  const visibleSteps = [0, 1, 2, 3, 4, 5].filter(i => {
    if (i === 0 && !showVerification) return false;
    if (i === 3 && !showQualification) return false;
    if (i === 4 && !hasCustomFields) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center mb-8">
        {visibleSteps.map((i, idx, arr) => (
          <div key={i} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i === 0 ? <ShieldCheck className="w-4 h-4" /> : idx + 1}
            </div>
            {idx < arr.length - 1 && <div className={`w-8 md:w-16 h-1 mx-2 rounded-full transition-colors ${step > i ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card className="shadow-xl border-primary/10 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 border-b p-8">
          <CardTitle className="text-2xl font-bold">
            {step === 0 && "Verification"}
            {step === 1 && "Personal Information"}
            {step === 2 && "Contact & Address"}
            {step === 3 && "Educational Details"}
            {step === 4 && "Additional Details"}
            {step === 5 && "Document Uploads"}
          </CardTitle>
          <CardDescription>
            Step {visibleSteps.indexOf(step) + (visibleSteps.includes(0) ? 0 : 1)} of {visibleSteps.filter(s => s !== 0).length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form className="space-y-6">
            
            {/* STEP 0: VERIFICATION */}
            {step === 0 && showVerification && (
              <div className="max-w-md mx-auto space-y-8 py-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Email Verification</h3>
                  <p className="text-sm text-slate-500">Solve the captcha and verify your email to continue.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold tracking-widest text-slate-400">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input {...form.register("email")} placeholder="yourname@example.com" disabled={isOtpSent} className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-bold" />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message}</p>}
                  </div>
                  {!isOtpSent && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold tracking-widest text-slate-400">Solve: <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded text-lg">{captcha.q}</span></Label>
                        <Button type="button" variant="ghost" size="icon" onClick={generateCaptcha} className="h-8 w-8"><RefreshCw className="w-4 h-4" /></Button>
                      </div>
                      <Input placeholder="Enter result" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-bold text-center text-xl" />
                      <Button type="button" onClick={handleSendOtp} disabled={otpLoading || !watch("email") || !userCaptcha} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold tracking-widest text-xs hover:bg-slate-800 shadow-xl">
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Verification Code"}
                      </Button>
                    </div>
                  )}
                  {isOtpSent && !isEmailVerified && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <p className="text-xs font-bold text-center text-primary">A code has been sent to {watch("email") as string}</p>
                      <Input maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-mono font-bold text-center text-3xl tracking-[0.5em]" />
                      <Button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otp.length < 6} className="w-full h-14 rounded-2xl bg-primary text-white font-bold tracking-widest text-xs shadow-xl">
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => {setIsOtpSent(false); setOtp("");}} className="w-full text-xs font-bold text-slate-400">Change Email</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 1: PERSONAL */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>Select Course *</Label>
                  <Select onValueChange={(v) => {
                    const selectedCourse = courses?.find((c: any) => c.title === v);
                    setValue("courseId", (selectedCourse as any)?.id || "");
                    setValue("appliedCourse", v as string);
                    trigger("appliedCourse");
                  }} value={watch("appliedCourse") as string}>
                    <SelectTrigger className={cn("h-14 rounded-2xl bg-slate-50 border-transparent", errors.appliedCourse && "border-red-500")}>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((c: any) => <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input {...form.register("fullName")} className="h-12 rounded-xl" />
                  {errors.fullName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input {...form.register("dob")} placeholder="DD/MM/YYYY" className="h-12 rounded-xl" />
                  {errors.dob && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.dob.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select onValueChange={(v) => setValue("gender", v as any)} value={(watch("gender") as string) || ""}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.gender.message}</p>}
                </div>
                {!disabledFields.includes("fatherName") && (
                  <div className="space-y-2">
                    <Label>Father's Name</Label>
                    <Input {...form.register("fatherName")} className="h-12 rounded-xl" />
                    {errors.fatherName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.fatherName.message}</p>}
                  </div>
                )}
                {!disabledFields.includes("motherName") && (
                  <div className="space-y-2">
                    <Label>Mother's Name</Label>
                    <Input {...form.register("motherName")} className="h-12 rounded-xl" />
                    {errors.motherName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.motherName.message}</p>}
                  </div>
                )}
                {!disabledFields.includes("guardianPhone") && (
                  <div className="space-y-2">
                    <Label>Guardian Phone Number</Label>
                    <Input {...form.register("guardianPhone")} className="h-12 rounded-xl" />
                    {errors.guardianPhone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.guardianPhone.message}</p>}
                  </div>
                )}
                {!disabledFields.includes("bloodGroup") && (
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Select onValueChange={(v) => setValue("bloodGroup", v as any)} value={(watch("bloodGroup") as string) || ""}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!disabledFields.includes("religion") && (
                  <div className="space-y-2">
                    <Label>Religion</Label>
                    <Select onValueChange={(v) => setValue("religion", v as any)} value={(watch("religion") as string) || ""}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hindu">Hindu</SelectItem>
                        <SelectItem value="Muslim">Muslim</SelectItem>
                        <SelectItem value="Christian">Christian</SelectItem>
                        <SelectItem value="Sikh">Sikh</SelectItem>
                        <SelectItem value="Buddhist">Buddhist</SelectItem>
                        <SelectItem value="Jain">Jain</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!disabledFields.includes("caste") && (
                  <div className="space-y-2">
                    <Label>Caste Category</Label>
                    <Select onValueChange={(v) => setValue("caste", v as any)} value={(watch("caste") as string) || ""}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GEN">GEN</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="ST">ST</SelectItem>
                        <SelectItem value="OBC">OBC</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ADDRESS */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input 
                    {...form.register("email")} 
                    readOnly={showVerification && isEmailVerified} 
                    className={`h-12 rounded-xl ${showVerification && isEmailVerified ? 'bg-slate-50 opacity-70' : ''}`} 
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Mobile *</Label>
                  <Input {...form.register("mobile")} className="h-12 rounded-xl" />
                  {errors.mobile && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.mobile.message}</p>}
                </div>
                {!disabledFields.includes("whatsapp") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>WhatsApp Number</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="same-wp" onCheckedChange={handleWhatsappCheck} />
                        <label htmlFor="same-wp" className="text-[10px] font-bold text-slate-500 cursor-pointer">Same as Mobile</label>
                      </div>
                    </div>
                    <Input {...form.register("whatsapp")} className="h-12 rounded-xl" />
                    {errors.whatsapp && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.whatsapp.message}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>PIN Code *</Label>
                  <Input {...form.register("pin")} onBlur={handlePinBlur} maxLength={6} className="h-12 rounded-xl" />
                  {errors.pin && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.pin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Village / Street *</Label>
                  <Input {...form.register("vill")} className="h-12 rounded-xl" />
                  {errors.vill && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.vill.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Post Office *</Label>
                  <Input {...form.register("po")} className="h-12 rounded-xl" />
                  {errors.po && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.po.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Police Station *</Label>
                  <Input {...form.register("ps")} className="h-12 rounded-xl" />
                  {errors.ps && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.ps.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Input {...form.register("dist")} className="h-12 rounded-xl" />
                  {errors.dist && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.dist.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input {...form.register("state")} className="h-12 rounded-xl" />
                  {errors.state && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.state.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input value="India" readOnly className="h-12 rounded-xl bg-slate-50 text-slate-500 focus-visible:ring-0" />
                </div>
              </div>
            )}

            {/* STEP 3: EDUCATION */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Qualification Name *</Label>
                  <Input {...form.register("qualName")} placeholder="e.g. 10th / 12th / Graduation" className="h-12 rounded-xl" />
                  {errors.qualName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.qualName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Board / University *</Label>
                  <Input {...form.register("qualBoard")} className="h-12 rounded-xl" />
                  {errors.qualBoard && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.qualBoard.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Year of Passing *</Label>
                  <Input {...form.register("qualYear")} maxLength={4} className="h-12 rounded-xl" />
                  {errors.qualYear && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.qualYear.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Percentage / Grade *</Label>
                  <Input {...form.register("qualPercent")} className="h-12 rounded-xl" />
                  {errors.qualPercent && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.qualPercent.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: CUSTOM FIELDS */}
            {step === 4 && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {(config?.customFields || []).length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-bold">No additional details required for this workspace.</p>
                    <p className="text-xs text-slate-400 mt-1">Please click Next Step to continue.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {(config.customFields).map((field: any) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        
                        {field.type === "select" ? (
                          <Select 
                            onValueChange={(v) => {
                              const current = watch("customData") || {};
                              setValue("customData", { ...current, [field.id]: v });
                            }} 
                            value={(watch("customData") || {})[field.id]}
                          >
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-bold">
                              <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {(field.options || "").split(",").map((opt: string) => (
                                <SelectItem key={opt.trim()} value={opt.trim()} className="rounded-xl font-bold py-3">{opt.trim()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            type={field.type} 
                            placeholder={`Enter ${field.label}`}
                            className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-bold"
                            value={(watch("customData") || {})[field.id] || ""}
                            onChange={(e) => {
                              const current = watch("customData") || {};
                              setValue("customData", { ...current, [field.id]: e.target.value });
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: DOCUMENTS */}
            {step === 5 && (() => {
              const requiredDocs = Array.isArray(config?.requiredDocs) ? config.requiredDocs : ["Passport Size Photo", "ID Proof", "Marksheet"];
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Photo *</Label>
                    <ImageUpload value={watch("photoUrl")} onChange={(url) => setValue("photoUrl", url)} maxSizeK={100} folder={`RGYCSP/Workspaces/${tenant || 'global'}/admissions`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Signature *</Label>
                    <ImageUpload value={watch("signatureUrl")} onChange={(url) => setValue("signatureUrl", url)} maxSizeK={100} folder={`RGYCSP/Workspaces/${tenant || 'global'}/admissions`} />
                  </div>
                  
                  {requiredDocs.map((doc: string, idx: number) => {
                    const docLower = doc.toLowerCase();
                    if (docLower.includes("photo") || docLower.includes("passport") || docLower.includes("signature")) return null;
                    
                    if (docLower === "id proof" || docLower === "aadhaar" || docLower.includes("id proof")) {
                      return (
                        <div key={idx} className="space-y-2">
                          <Label>{doc} *</Label>
                          <ImageUpload value={watch("idProofUrl") || null} onChange={(url) => setValue("idProofUrl", url)} maxSizeK={1024} folder={`RGYCSP/Workspaces/${tenant || 'global'}/admissions`} />
                        </div>
                      );
                    }
                    
                    return (
                      <div key={idx} className="space-y-2">
                        <Label>{doc} *</Label>
                        <ImageUpload 
                          value={(watch("customData") || {})[`doc_${doc}`]} 
                          onChange={(url) => {
                            const current = watch("customData") || {};
                            setValue("customData", { ...current, [`doc_${doc}`]: url });
                          }} 
                          maxSizeK={1024} 
                          folder={`RGYCSP/Workspaces/${tenant || 'global'}/admissions`} 
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/30 p-6 sm:p-8">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={(step === 0 && showVerification) || (step === 1 && !showVerification) || isSubmitting} 
            className="h-14 px-6 sm:px-8 rounded-2xl font-bold text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          {step > 0 && (
            <Button onClick={step < 5 ? nextStep : form.handleSubmit(onSubmit)} disabled={isSubmitting} className="h-14 px-8 sm:px-10 rounded-2xl font-bold tracking-widest text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground shadow-xl shadow-slate-900/20 dark:shadow-primary/20 transition-all">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (step < 5 ? "Next Step" : "Submit")}
              {step < 5 && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
