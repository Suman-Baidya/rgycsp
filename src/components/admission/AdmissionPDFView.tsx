"use client";

import React from "react";
import { Mail, Phone, MapPin, Globe, CheckSquare, GraduationCap, User, Home, BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdmissionPDFViewProps {
  application: any;
  workspace: any;
  settings: any;
  config?: any;
}

export function AdmissionPDFView({ application, workspace, settings, config }: AdmissionPDFViewProps) {
  const address = application.address || {};
  const qualification = application.qualification || {};
  const primaryColor = settings?.primaryColor || "#0f172a";

  const capitalize = (str: string) => {
    if (!str) return "-";
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const declarationText = config?.declarationText || "I hereby declare that the particulars furnished above are true, complete and correct to the best of my knowledge and belief. I also understand that in the event of any information being found false or incorrect, my admission is liable to be cancelled without any notice. I agree to abide by the rules and regulations of the institute.";

  const checklist = Array.isArray(config?.requiredDocs) ? config.requiredDocs : ["Passport Size Photo", "Identity Proof (Aadhaar/Voter)", "Last Qualification Marksheet"];
  const disabledFields = Array.isArray(config?.disabledFields) ? config.disabledFields : [];

  return (
    <div className="py-8 bg-slate-200 min-h-screen no-print flex flex-col items-center gap-8">

      {/* PAGE 1: Premium Header & Core Details */}
      <div id="admission-form-content" className="bg-white text-slate-900 font-sans w-[210mm] min-h-[297mm] relative overflow-hidden box-border shadow-2xl">

        {/* WATERMARK */}
        {settings?.logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.05 }}>
            <img src={settings.logoUrl} alt="Watermark" className="w-[120mm] h-[120mm] object-contain grayscale" />
          </div>
        )}

        {/* PREMIUM STYLISH HEADER */}
        <div className="relative h-64 flex items-center px-12 overflow-hidden z-10" style={{ backgroundColor: primaryColor }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 border-8 border-white rounded-full -ml-32 -mb-32"></div>
          </div>

          <div className="relative z-10 flex justify-between items-center w-full text-white">
            <div className="flex items-center gap-6">
              {settings?.logoUrl && (
                <div className="relative w-28 h-28 border-4 border-white/20 rounded-3xl overflow-hidden p-2 bg-white shadow-2xl shrink-0">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight uppercase leading-snug mb-1">{settings?.siteName || workspace.name}</h1>
                <h2 className="text-[13px] font-bold tracking-wider text-white/90 mb-3">Rajeev Gandhi Youth Computer Shiksha Parishad</h2>
                <div className="flex flex-col gap-2 opacity-90">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><MapPin className="w-3.5 h-3.5 opacity-60" /> {settings?.address || "Institute Campus Address"}</span>
                  <div className="flex gap-6 mt-1">
                    <span className="flex items-center gap-2 text-[10px] font-bold"><Phone className="w-3 h-3 opacity-60" /> {settings?.contactPhone}</span>
                    <span className="flex items-center gap-2 text-[10px] font-bold"><Mail className="w-3 h-3 opacity-60" /> {settings?.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl">
                <span className="text-[10px] font-bold uppercase block opacity-60 mb-1 tracking-widest">Application No</span>
                <span className="text-2xl font-bold tracking-tighter">{application.applicationNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admission Form Title Bar */}
        <div className="relative h-10 flex items-center justify-center -mt-5 z-20">
          <div className="bg-white px-8 py-2 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold uppercase tracking-[0.02em] text-slate-900">Admission Form</h2>
          </div>
        </div>

        {/* Content Area with P-10 */}
        <div className="p-10 pt-6 relative z-10">

          {/* SECTION 1: Personal Details */}
          <div className="mb-4 relative z-10">
            <SectionTitle title="Personal Information" icon={<User className="w-4 h-4" />} color={primaryColor} />
            <div className="flex justify-between items-start ml-14">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-[70%]">
                <InfoBox label="Full Name" value={capitalize(application.fullName)} />
                <InfoBox label="Date of Birth" value={application.dob ? new Date(application.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"} />
                <InfoBox label="Gender" value={application.gender} />
                {(!disabledFields.includes("fatherName") || application.fatherName) && (
                  <InfoBox label="Father's Name" value={capitalize(application.fatherName)} />
                )}
                {(!disabledFields.includes("motherName") || application.motherName) && (
                  <InfoBox label="Mother's Name" value={capitalize(application.motherName)} />
                )}
                {(!disabledFields.includes("guardianPhone") || application.guardianPhone) && (
                  <InfoBox label="Guardian Phone" value={application.guardianPhone} />
                )}
                {(!disabledFields.includes("caste") || application.caste) && (
                  <InfoBox label="Category (Caste)" value={application.caste} />
                )}
                {(!disabledFields.includes("religion") || application.religion) && (
                  <InfoBox label="Religion" value={application.religion} />
                )}
                {(!disabledFields.includes("bloodGroup") || application.bloodGroup) && (
                  <InfoBox label="Blood Group" value={application.bloodGroup} />
                )}

                <div className="col-span-2 mt-1">
                  <div className="p-3 rounded-2xl border-2 bg-white/80 backdrop-blur-sm" style={{ borderColor: `${primaryColor}20` }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 block">Course Applied For</span>
                    <span className="text-lg font-bold" style={{ color: primaryColor }}>{application.appliedCourse}</span>
                  </div>
                </div>
              </div>

              {/* Student Photo Section */}
              <div className="w-28 h-36 border-[4px] border-white rounded-2xl overflow-hidden bg-slate-50 shadow-xl shadow-black/10 flex flex-col items-center justify-center ring-1 ring-slate-900/5 -mt-10 mr-2 shrink-0">
                {application.photoUrl ? (
                  <img src={application.photoUrl} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-200 text-center p-4">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-10" />
                    <span className="text-[8px] font-bold uppercase opacity-30">Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Details */}
          <div className="mb-4 relative z-10">
            <SectionTitle title="Contact & Communication" icon={<Mail className="w-4 h-4" />} color={primaryColor} />
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 ml-14">
              <InfoBox label="Mobile Number" value={application.mobile} />
              {(!disabledFields.includes("whatsapp") || application.whatsapp) && (
                <InfoBox label="WhatsApp Number" value={application.whatsapp || application.mobile} />
              )}
              <InfoBox label="Email Address" value={application.email || "N/A"} />
              <InfoBox label="PIN Code" value={address.pin} />
              <div className="col-span-2">
                <InfoBox label="Permanent Address" value={capitalize(`${address.vill || ''}, ${address.po || ''}, ${address.ps || ''}, ${address.dist || ''}, ${address.state || ''}`)} />
              </div>
            </div>
          </div>

          {/* SECTION 3: Academic History */}
          {(!disabledFields.includes("qualification") || qualification.name) && (
            <div className="mb-4 relative z-10">
              <SectionTitle title="Academic Qualification" icon={<GraduationCap className="w-4 h-4" />} color={primaryColor} />
              <div className="ml-14 overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="text-white" style={{ backgroundColor: primaryColor }}>
                    <tr>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase">Examination</th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase">Board / University</th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase">Year</th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-right">Aggregate %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px]">
                    <tr>
                      <td className="px-5 py-4 font-bold text-slate-900">{qualification.name || "-"}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{capitalize(qualification.board)}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{qualification.year || "-"}</td>
                      <td className="px-5 py-4 font-bold text-right" style={{ color: primaryColor }}>{qualification.percentage ? `${qualification.percentage}%` : "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase border-t pt-6">
          <span>Page 1 of 2</span>
          <span>Official Admission Document • {new Date().getFullYear()} Session</span>
        </div>
      </div>

      {/* PAGE 2: Additional & Declaration */}
      <div id="admission-form-content-2" className="bg-white text-slate-900 font-sans w-[210mm] min-h-[297mm] relative overflow-hidden box-border shadow-2xl">

        {/* WATERMARK */}
        {settings?.logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.05 }}>
            <img src={settings.logoUrl} alt="Watermark" className="w-[120mm] h-[120mm] object-contain grayscale" />
          </div>
        )}

        {/* Minimalist Header for Page 2 */}
        <div className="h-2" style={{ backgroundColor: primaryColor }}></div>

        <div className="p-10 pt-8">
          {/* SECTION 4: Additional Information (Custom Fields) */}
          {config?.customFields && Array.isArray(config.customFields) && config.customFields.filter((f: any) => !f.id.startsWith('doc_')).length > 0 && (
            <div className="mb-6 relative z-10">
              <SectionTitle title="Additional Information" icon={<BookOpen className="w-4 h-4" />} color={primaryColor} />
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 ml-14">
                {config.customFields.filter((f: any) => !f.id.startsWith('doc_')).map((field: any) => (
                  <InfoBox
                    key={field.id}
                    label={field.label}
                    value={capitalize((application.customData as any)?.[field.id])}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: Declaration & Documents */}
          <div className="mt-6 relative z-10">
            <SectionTitle title="Declaration & Documents" icon={<CheckSquare className="w-4 h-4" />} color={primaryColor} />
            <div className="w-full">
              <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <h4 className="text-[10px] font-bold uppercase mb-3 text-slate-400">Student Declaration</h4>
                <p className="text-[12px] leading-relaxed text-slate-600 italic">
                  {declarationText}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mt-12">
              <div className="p-8 border rounded-3xl border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-bold uppercase mb-4 text-slate-400">Office Use Only</h4>
                <div className="space-y-6">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Admin Date</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">___/___/_____</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Verified By</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">________________</span>
                  </div>
                </div>
              </div>
              <div className="p-8 border rounded-3xl border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-bold uppercase mb-4 text-slate-400">Required Document Checklist</h4>
                <div className="space-y-3 text-[10px] font-bold text-slate-400 uppercase">
                  {checklist.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-slate-100 rounded-md"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-32 flex justify-between items-end px-10 relative z-10">
            <div className="text-center">
              <div className="w-64 h-24 flex items-center justify-center border-b-2 mb-4" style={{ borderColor: primaryColor }}>
                <span className="text-[9px] font-bold uppercase opacity-10 italic">Institute Seal</span>
              </div>
              <p className="text-[11px] font-bold uppercase" style={{ color: primaryColor }}>Authorized Signatory</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-64 h-24 flex items-center justify-center border-b-2 mb-4" style={{ borderColor: primaryColor }}>
                {application.signatureUrl ? (
                  <img src={application.signatureUrl} alt="Signature" className="max-h-20 object-contain" />
                ) : (
                  <span className="text-[9px] font-bold uppercase opacity-10">Sign Above</span>
                )}
              </div>
              <p className="text-[11px] font-bold uppercase" style={{ color: primaryColor }}>Applicant's Signature</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase border-t pt-6">
          <span>Page 2 of 2</span>
          <span>Digital ID: {application.id}</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ title, icon, color }: { title: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="flex items-center gap-4 mb-2">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="flex-1 border-b-2 pb-1.5 flex items-center justify-between" style={{ borderColor: `${color}20` }}>
        <h3 className="font-bold uppercase text-[14px] tracking-wide" style={{ color }}>{title}</h3>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, className }: { label: string, value: string, className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">{label}</span>
      <span className="text-[15px] font-bold text-slate-900 border-b border-slate-50 pb-1">{value || "-"}</span>
    </div>
  );
}
