import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, User, GraduationCap, Calendar, CheckCircle, XCircle, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ApplicationDetailsModalProps {
  app: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export function ApplicationDetailsModal({ app, isOpen, onClose, onUpdateStatus }: ApplicationDetailsModalProps) {
  if (!app) return null;

  const address = app.address || {};
  const qualification = app.qualification || {};
  const customData = app.customData || {};

  const capitalize = (str?: string) => {
    if (!str) return "-";
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getFullAddress = () => {
    const parts = [
      address.vill && `Vill: ${address.vill}`,
      address.po && `PO: ${address.po}`,
      address.ps && `PS: ${address.ps}`,
      address.dist && `Dist: ${address.dist}`,
      address.state && `State: ${address.state}`,
      address.pin && `PIN: ${address.pin}`,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-0 gap-0 border-slate-200 dark:border-slate-800">
        
        {/* Header (Fixed) */}
        <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Application Details
              <Badge variant="outline" className={cn(
                  "rounded-full px-3 py-0.5 text-xs font-bold border-none shadow-sm",
                  app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" : 
                  app.status === "REJECTED" ? "bg-red-500/10 text-red-600" : 
                  "bg-amber-500/10 text-amber-600"
                )}>
                  {app.status}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-4">
              <span>App No: <span className="font-bold text-slate-700 dark:text-slate-300">{app.applicationNo}</span></span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Applied on {formatDate(app.createdAt)}</span>
            </DialogDescription>
          </div>
          <div className="flex gap-3">
            {app.status !== "APPROVED" && (
              <Button 
                onClick={() => onUpdateStatus(app.id, "APPROVED")}
                className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </Button>
            )}
            {app.status !== "REJECTED" && (
              <Button 
                variant="destructive"
                onClick={() => onUpdateStatus(app.id, "REJECTED")}
                className="rounded-xl font-bold shadow-lg shadow-red-600/20"
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Top Section: Photo & Core Info */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-32 h-40 shrink-0 rounded-2xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              {app.photoUrl ? (
                <Image src={app.photoUrl} alt={app.fullName} fill className="object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-300" />
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem label="Full Name" value={capitalize(app.fullName)} icon={<User className="w-4 h-4" />} />
              <DetailItem label="Course Applied For" value={app.appliedCourse} highlight />
              <DetailItem label="Mobile Number" value={app.mobile} icon={<Phone className="w-4 h-4" />} />
              <DetailItem label="Email Address" value={app.email} icon={<Mail className="w-4 h-4" />} />
              <DetailItem label="Date of Birth" value={formatDate(app.dob)} />
              <DetailItem label="Gender" value={app.gender} />
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Personal & Family Details */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Family & Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Father's Name" value={capitalize(app.fatherName)} />
              <DetailItem label="Mother's Name" value={capitalize(app.motherName)} />
              <DetailItem label="Guardian's Name" value={capitalize(app.guardianName)} />
              <DetailItem label="Guardian Phone" value={app.guardianPhone} />
              <DetailItem label="Category (Caste)" value={app.caste} />
              <DetailItem label="Religion" value={app.religion} />
              <DetailItem label="Blood Group" value={app.bloodGroup} />
            </div>
          </div>

          {/* Contact & Address */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Contact & Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="WhatsApp Number" value={app.whatsapp} />
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <DetailItem label="Full Address" value={capitalize(getFullAddress())} />
              </div>
            </div>
          </div>

          {/* Academic Qualification */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Academic Qualification
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <DetailItem label="Examination" value={qualification.name} />
              <DetailItem label="Board/University" value={capitalize(qualification.board)} />
              <DetailItem label="Year of Passing" value={qualification.year} />
              <DetailItem label="Percentage" value={qualification.percentage ? `${qualification.percentage}%` : "-"} />
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Uploaded Documents
            </h3>
            <div className="flex flex-wrap gap-4">
              <DocumentThumbnail label="Student Photo" url={app.photoUrl} />
              <DocumentThumbnail label="Signature" url={app.signatureUrl} contain />
              {app.idProofUrl && <DocumentThumbnail label="ID Proof" url={app.idProofUrl} />}
              {Object.entries(customData)
                .filter(([key]) => key.startsWith('doc_'))
                .map(([key, url]) => (
                  <DocumentThumbnail 
                    key={key} 
                    label={key.replace('doc_', '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                    url={String(url)} 
                  />
                ))
              }
            </div>
          </div>

          {/* Custom Fields (If any) */}
          {Object.entries(customData).filter(([key]) => !key.startsWith('doc_')).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(customData)
                  .filter(([key]) => !key.startsWith('doc_'))
                  .map(([key, value]) => (
                    <DetailItem key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={String(value)} />
                ))}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value, icon, highlight }: { label: string, value: string | undefined | null, icon?: React.ReactNode, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className="opacity-70">{icon}</span>}
        {label}
      </span>
      <span className={cn(
        "text-sm font-semibold",
        highlight ? "text-primary text-base" : "text-slate-900 dark:text-slate-100",
        (!value || value === "-") && "text-slate-300 dark:text-slate-600"
      )}>
        {value || "-"}
      </span>
    </div>
  );
}

function DocumentThumbnail({ label, url, contain }: { label: string, url: string | undefined | null, contain?: boolean }) {
  if (!url) {
    return (
      <div className="flex flex-col gap-2 w-40">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <div className="w-full h-28 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <span className="text-[10px] font-bold text-slate-300">Not Provided</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-40 group cursor-pointer" onClick={() => window.open(url, '_blank')}>
      <span className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">{label}</span>
      <div className="w-full h-28 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group-hover:border-primary transition-colors shadow-sm hover:shadow-md">
        <Image src={url} alt={label} fill className={cn("transition-transform group-hover:scale-105", contain ? "object-contain p-2" : "object-cover")} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}
