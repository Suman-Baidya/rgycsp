"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAdmissionConfig } from "@/app/actions/admission-config";
import { Save, Check, Plus, Trash2, Type, Hash, ListTodo, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdmissionConfigClient({ workspaceId, config }: { workspaceId: string, config: any }) {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params?.tenant;
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';

  const [isActive, setIsActive] = useState(config.isActive ?? true);
  const [enableEmailVerification, setEnableEmailVerification] = useState(config.enableEmailVerification ?? true);
  const [instructions, setInstructions] = useState(config.instructions || "");
  const [successMessage, setSuccessMessage] = useState(config.successMessage || "");
  const [declarationText, setDeclarationText] = useState(config.declarationText || "");
  const [requiredDocs, setRequiredDocs] = useState<string[]>(
    Array.isArray(config.requiredDocs) ? config.requiredDocs : ["Passport Size Photo", "ID Proof", "Marksheet"]
  );
  const [newDoc, setNewDoc] = useState("");

  const [disabledFields, setDisabledFields] = useState<string[]>(
    Array.isArray(config.disabledFields) ? config.disabledFields : []
  );
  const [customFields, setCustomFields] = useState<any[]>(
    Array.isArray(config.customFields) ? config.customFields : []
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
      toast.success("Admission configuration saved.");
    } else {
      toast.error(result.error || "Failed to save configuration.");
    }
    setIsSaving(false);
  };

  const optionalFields = [
    { id: "guardianName", label: "Guardian Name" },
    { id: "religion", label: "Religion" },
    { id: "caste", label: "Caste" },
    { id: "whatsapp", label: "WhatsApp Number" },
    { id: "qualification", label: "Last Qualification Details" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Portal Behavior</CardTitle>
              <CardDescription className="font-medium text-slate-400">Control the main admission portal behavior and accessibility.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-md">
                <div className="space-y-1">
                  <Label className="text-base font-bold text-slate-900 dark:text-white">Public Admission Portal</Label>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Allow prospective students to apply online.</p>
                </div>
                <Switch 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Welcome Instructions</Label>
                <Textarea 
                  value={instructions} 
                  onChange={e => setInstructions(e.target.value)} 
                  placeholder="e.g. Please read all instructions carefully before filling out the form..." 
                  className="min-h-[100px] rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Success Acknowledgment</Label>
                <Textarea 
                  value={successMessage} 
                  onChange={e => setSuccessMessage(e.target.value)} 
                  placeholder="e.g. Your application has been submitted successfully..." 
                  className="min-h-[100px] rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-3 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" /> Admission PDF Declaration
                </Label>
                <Textarea 
                  value={declarationText} 
                  onChange={e => setDeclarationText(e.target.value)} 
                  placeholder="e.g. I hereby declare that all information is correct..." 
                  className="min-h-[100px] rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all font-medium bg-white dark:bg-zinc-950"
                />
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase italic">This text appears at the bottom of the generated application PDF.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Field Toggles & Checklist */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Document Checklist</CardTitle>
              <CardDescription className="font-medium text-slate-400">List of documents required for submission.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-2">
                <Input 
                  value={newDoc} 
                  onChange={e => setNewDoc(e.target.value)} 
                  placeholder="e.g. Aadhaar Card" 
                  className="rounded-xl font-medium"
                  onKeyDown={e => e.key === 'Enter' && addDoc()}
                />
                <Button onClick={addDoc} size="icon" className="rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {requiredDocs.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group animate-in fade-in slide-in-from-right-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary" /> {doc}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDoc(index)} 
                      className="h-6 w-6 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Field Visibility</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {optionalFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <Label htmlFor={`field-${field.id}`} className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">{field.label}</Label>
                  <Switch 
                    id={`field-${field.id}`}
                    checked={!disabledFields.includes(field.id)} 
                    onCheckedChange={() => toggleField(field.id)} 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="w-full h-14 rounded-2xl font-bold text-base gap-3 shadow-xl shadow-primary/20 mt-6"
              >
                {isSaving ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Custom Application Fields</CardTitle>
            <CardDescription className="font-medium text-slate-400">Add unique fields specific to your workspace requirements.</CardDescription>
          </div>
          <Button onClick={addCustomField} variant="outline" className="rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Field
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          {customFields.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-400">No custom fields added yet. Click 'Add Field' to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customFields.map((field: any) => (
                <div key={field.id} className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 space-y-4 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCustomField(field.id)} 
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Field Label</Label>
                    <Input 
                      value={field.label} 
                      onChange={(e) => updateCustomField(field.id, { label: e.target.value })} 
                      className="rounded-xl font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</Label>
                      <Select 
                        value={field.type} 
                        onValueChange={(v) => updateCustomField(field.id, { type: v })}
                      >
                        <SelectTrigger className="rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Input</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="select">Dropdown Menu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end pb-1.5">
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border w-full justify-between px-3">
                        <Label className="text-xs font-bold text-slate-600">Required</Label>
                        <Switch 
                          checked={field.required} 
                          onCheckedChange={(v) => updateCustomField(field.id, { required: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options (Comma separated)</Label>
                      <Input 
                        placeholder="Option 1, Option 2, Option 3" 
                        value={field.options} 
                        onChange={(e) => updateCustomField(field.id, { options: e.target.value })} 
                        className="rounded-xl font-medium text-sm"
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
  );
}
