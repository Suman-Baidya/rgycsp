"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAdmissionConfig } from "@/app/actions/admission-config";
import { 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Settings, 
  ShieldCheck, 
  Layers, 
  Loader2,
  FileCheck
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AdmissionConfigClient({ workspaceId, config }: { workspaceId: string, config: any }) {
  const [isActive, setIsActive] = useState(config?.isActive ?? true);
  const [enableEmailVerification, setEnableEmailVerification] = useState(config?.enableEmailVerification ?? true);
  const [instructions, setInstructions] = useState(config?.instructions || "");
  const [successMessage, setSuccessMessage] = useState(config?.successMessage || "");
  const [declarationText, setDeclarationText] = useState(config?.declarationText || "");
  const [requiredDocs, setRequiredDocs] = useState<string[]>(
    Array.isArray(config?.requiredDocs) ? config.requiredDocs : ["Passport Size Photo", "ID Proof", "Marksheet"]
  );
  const [newDoc, setNewDoc] = useState("");

  const [disabledFields, setDisabledFields] = useState<string[]>(
    Array.isArray(config?.disabledFields) ? config.disabledFields : []
  );
  const [customFields, setCustomFields] = useState<any[]>(
    Array.isArray(config?.customFields) ? config.customFields : []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addDoc = () => {
    if (!newDoc.trim()) return;
    setRequiredDocs([...requiredDocs, newDoc.trim()]);
    setNewDoc("");
  };

  const removeDoc = (index: number) => {
    setRequiredDocs(requiredDocs.filter((_, i) => i !== index));
  };

  const toggleField = (field: string) => {
    if (disabledFields.includes(field)) {
      setDisabledFields(disabledFields.filter(f => f !== field));
    } else {
      setDisabledFields([...disabledFields, field]);
    }
  };

  const addCustomField = () => {
    const id = `custom_${Math.random().toString(36).substring(2, 9)}`;
    setCustomFields([...customFields, { id, label: "New Field", type: "text", required: false, options: "" }]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const updateCustomField = (id: string, updates: any) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateAdmissionConfig(workspaceId, {
      isActive,
      enableEmailVerification,
      instructions,
      successMessage,
      declarationText,
      requiredDocs,
      disabledFields,
      customFields
    });
    
    if (result.success) {
      toast.success("Admission configuration saved successfully.");
    } else {
      toast.error(result.error || "Failed to save configuration.");
    }
    setIsSaving(false);
  };

  const optionalFields = [
    { id: "dob", label: "Date of Birth" },
    { id: "gender", label: "Gender" },
    { id: "bloodGroup", label: "Blood Group" },
    { id: "religion", label: "Religion" },
    { id: "caste", label: "Caste" },
    { id: "whatsapp", label: "WhatsApp Number" },
    { id: "fatherName", label: "Father's Name" },
    { id: "motherName", label: "Mother's Name" },
    { id: "guardianPhone", label: "Guardian Phone" },
    { id: "qualification", label: "Last Qualification" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300 w-full">
      {/* Top Header Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Admission Form Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure portal behavior, form fields, documents, and admission PDF declarations.
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 shrink-0"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Configuration
          </Button>
        </CardHeader>
      </Card>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column: Portal Behavior & Instructions & Custom Fields */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          {/* Portal Behavior Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Portal Behavior & Text
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Control admission portal accessibility and student messaging.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3">
              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-semibold text-slate-900 dark:text-white cursor-pointer">Public Portal</Label>
                    <p className="text-[10px] text-slate-500">Allow prospective students to apply online.</p>
                  </div>
                  <Switch 
                    checked={isActive} 
                    onCheckedChange={setIsActive} 
                    className="data-[state=checked]:bg-primary shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-semibold text-slate-900 dark:text-white cursor-pointer">Email OTP</Label>
                    <p className="text-[10px] text-slate-500">Require email verification before submit.</p>
                  </div>
                  <Switch 
                    checked={enableEmailVerification} 
                    onCheckedChange={setEnableEmailVerification} 
                    className="data-[state=checked]:bg-primary shrink-0"
                  />
                </div>
              </div>

              {/* Welcome Instructions */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Welcome Instructions</Label>
                <Textarea 
                  value={instructions} 
                  onChange={e => setInstructions(e.target.value)} 
                  placeholder="e.g. Please read all instructions carefully before filling out the form..." 
                  className="min-h-[60px] text-xs p-2.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Success Acknowledgment */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Success Message</Label>
                <Textarea 
                  value={successMessage} 
                  onChange={e => setSuccessMessage(e.target.value)} 
                  placeholder="e.g. Your application has been submitted successfully..." 
                  className="min-h-[60px] text-xs p-2.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Admission PDF Declaration */}
              <div className="space-y-1 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Admission PDF Declaration
                </Label>
                <Textarea 
                  value={declarationText} 
                  onChange={e => setDeclarationText(e.target.value)} 
                  placeholder="e.g. I hereby declare that all information provided is true and correct..." 
                  className="min-h-[60px] text-xs p-2.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <p className="text-[10px] text-slate-400 italic mt-1">This text appears at the bottom of the generated application PDF.</p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Application Fields Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Custom Application Fields
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Add custom fields specific to your franchise admission requirements.
                </CardDescription>
              </div>
              <Button 
                onClick={addCustomField} 
                variant="outline" 
                size="sm"
                className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field
              </Button>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-4">
              {customFields.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400">No custom fields added. Click 'Add Field' to add custom inputs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customFields.map((field: any) => (
                    <div key={field.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 relative group">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeCustomField(field.id)} 
                        className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      
                      <div className="space-y-1 pr-6">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Label</Label>
                        <Input 
                          value={field.label} 
                          onChange={(e) => updateCustomField(field.id, { label: e.target.value })} 
                          className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(v) => updateCustomField(field.id, { type: v })}
                          >
                            <SelectTrigger className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg text-xs">
                              <SelectItem value="text" className="text-xs">Text</SelectItem>
                              <SelectItem value="number" className="text-xs">Number</SelectItem>
                              <SelectItem value="select" className="text-xs">Dropdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end pb-0.5">
                          <div className="flex items-center justify-between w-full h-8 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <Label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Required</Label>
                            <Switch 
                              checked={field.required} 
                              onCheckedChange={(v) => updateCustomField(field.id, { required: v })}
                              className="data-[state=checked]:bg-primary scale-75 origin-right"
                            />
                          </div>
                        </div>
                      </div>

                      {field.type === "select" && (
                        <div className="space-y-1 pt-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Options (Comma separated)</Label>
                          <Input 
                            placeholder="Option 1, Option 2, Option 3" 
                            value={field.options} 
                            onChange={(e) => updateCustomField(field.id, { options: e.target.value })} 
                            className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Document Checklist & Field Visibility */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          {/* Document Checklist Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-primary" /> Document Checklist
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Documents students are prompted to upload upon admission.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3">
              <div className="flex gap-1.5">
                <Input 
                  value={newDoc} 
                  onChange={e => setNewDoc(e.target.value)} 
                  placeholder="e.g. Aadhaar Card, 10th Marksheet..." 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
                  onKeyDown={e => e.key === 'Enter' && addDoc()}
                />
                <Button 
                  onClick={addDoc} 
                  size="sm" 
                  className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                {requiredDocs.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {doc}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDoc(index)} 
                      className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Visibility Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-primary" /> Optional Field Visibility
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Toggle optional fields on or off for public applicant forms.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-1.5">
              {optionalFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <Label htmlFor={`field-${field.id}`} className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    {field.label}
                  </Label>
                  <Switch 
                    id={`field-${field.id}`}
                    checked={!disabledFields.includes(field.id)} 
                    onCheckedChange={() => toggleField(field.id)} 
                    className="data-[state=checked]:bg-primary scale-75 origin-right"
                  />
                </div>
              ))}
              
              <div className="pt-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save All Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
