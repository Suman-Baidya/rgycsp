"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Move, 
  Trash2, 
  Download, 
  Eye, 
  Settings2, 
  Type, 
  Image as ImageIcon, 
  Signature, 
  Save,
  Layout,
  ChevronLeft,
  Search,
  Loader2,
  Settings,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { saveDocumentTemplate, getDocumentTemplates, deleteDocumentTemplate } from "@/app/actions/document-templates";

interface DocVariable {
  id: string;
  name: string;
  type: "text" | "image" | "signature";
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  width?: number;
  height?: number;
}

const DEMO_DATA: Record<string, string> = {
  studentName: "Suman Baidya",
  registrationNo: "ABCD-2024-001",
  courseName: "Full Stack Web Development",
  batchName: "Morning Batch A",
  issueDate: "May 15, 2024",
  workspaceName: "Zenith Coding Academy",
  principalSign: "https://api.dicebear.com/7.x/bottts/svg?seed=sign",
  studentPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
};

export default function DocumentDesigner() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"list" | "editor">("list");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Current Template State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Document");
  const [templateType, setTemplateType] = useState("CERTIFICATE");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [variables, setVariables] = useState<DocVariable[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1131 });
  const [isSaving, setIsSaving] = useState(false);
  const [unit, setUnit] = useState<"px" | "in" | "mm">("px");
  const [pageSize, setPageSize] = useState<string>("CUSTOM");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchTemplates();
  }, []);

  const DPI = 96;
  const MM_PER_INCH = 25.4;

  const toPx = (val: number, fromUnit: "px" | "in" | "mm") => {
    if (fromUnit === "px") return val;
    if (fromUnit === "in") return val * DPI;
    if (fromUnit === "mm") return (val / MM_PER_INCH) * DPI;
    return val;
  };

  const fromPx = (val: number, toUnit: "px" | "in" | "mm") => {
    if (toUnit === "px") return val;
    if (toUnit === "in") return val / DPI;
    if (toUnit === "mm") return (val / DPI) * MM_PER_INCH;
    return val;
  };

  const PAGE_PRESETS: Record<string, { width: number; height: number; name: string }> = {
    A4: { width: toPx(210, "mm"), height: toPx(297, "mm"), name: "A4 (210x297mm)" },
    LETTER: { width: toPx(8.5, "in"), height: toPx(11, "in"), name: "Letter (8.5x11in)" },
    ID_CARD: { width: toPx(85.6, "mm"), height: toPx(53.98, "mm"), name: "ID Card (85.6x54mm)" },
    POSTCARD: { width: toPx(6, "in"), height: toPx(4, "in"), name: "Postcard (6x4in)" },
  };

  const handlePageSizeChange = (preset: string) => {
    setPageSize(preset);
    if (preset !== "CUSTOM") {
      const size = PAGE_PRESETS[preset];
      const newWidth = orientation === "portrait" ? size.width : size.height;
      const newHeight = orientation === "portrait" ? size.height : size.width;
      setCanvasSize({ width: Math.round(newWidth), height: Math.round(newHeight) });
    }
  };

  const toggleOrientation = () => {
    const newOrientation = orientation === "portrait" ? "landscape" : "portrait";
    setOrientation(newOrientation);
    setCanvasSize({ width: canvasSize.height, height: canvasSize.width });
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    const data = await getDocumentTemplates();
    setTemplates(data);
    setIsLoading(false);
  };

  if (!mounted) return null;

  const handleNewTemplate = () => {
    setCurrentId(null);
    setTemplateName("New Document");
    setTemplateType("CERTIFICATE");
    setBackgroundUrl(null);
    setVariables([]);
    setSelectedId(null);
    setCanvasSize({ width: 800, height: 1131 });
    setView("editor");
  };

  const handleEditTemplate = (template: any) => {
    setCurrentId(template.id);
    setTemplateName(template.name);
    setTemplateType(template.type);
    setBackgroundUrl(template.background);
    setCanvasSize({ width: template.width, height: template.height });
    setVariables(template.config as DocVariable[]);
    setSelectedId(null);
    setView("editor");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveDocumentTemplate({
      id: currentId || undefined,
      name: templateName,
      type: templateType,
      background: backgroundUrl,
      width: canvasSize.width,
      height: canvasSize.height,
      config: variables,
    });

    if (res.success) {
      toast.success("Document template saved successfully");
      if (!currentId) setCurrentId(res.id || null);
      fetchTemplates();
    } else {
      toast.error(res.error || "Failed to save template");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    const res = await deleteDocumentTemplate(id);
    if (res.success) {
      toast.success("Template deleted");
      fetchTemplates();
    }
  };

  const addVariable = (type: "text" | "image" | "signature") => {
    const newVar: DocVariable = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === "text" ? "studentName" : type === "image" ? "studentPhoto" : "principalSign",
      type,
      x: 50,
      y: 50,
      fontSize: 24,
      fontWeight: "bold",
      color: "#000000",
      width: type === "text" ? undefined : 100,
      height: type === "text" ? undefined : 100,
    };
    setVariables([...variables, newVar]);
    setSelectedId(newVar.id);
  };

  const updateVariable = (id: string, updates: Partial<DocVariable>) => {
    setVariables(variables.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
    setSelectedId(null);
  };

  const downloadPDF = async () => {
    if (!canvasRef.current) return;
    
    const toastId = toast.loading("Rendering High-Resolution Document...");
    
    try {
      // 1. Ensure all images are loaded
      const images = canvasRef.current.querySelectorAll("img");
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // 2. Capture canvas with high scale for printing (300 DPI target)
      // Standard 96 DPI * 3.125 = 300 DPI. Scale 4 is ~384 DPI.
      const canvas = await html2canvas(canvasRef.current, {
        scale: 4, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      // 3. Create PDF with precise unit dimensions
      const pdf = new jsPDF({
        orientation: canvasSize.width > canvasSize.height ? "l" : "p",
        unit: "mm",
        format: [fromPx(canvasSize.width, "mm"), fromPx(canvasSize.height, "mm")]
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, fromPx(canvasSize.width, "mm"), fromPx(canvasSize.height, "mm"), undefined, 'FAST');
      
      // Add metadata
      pdf.setProperties({
        title: templateName,
        subject: templateType,
        author: 'ABCD Edu Hub Design System',
        creator: 'ABCD Edu Hub'
      });

      pdf.save(`${templateName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast.success("Professional PDF generated successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("PDF engine failure. Check image CORS settings.", { id: toastId });
    }
  };

  // Drag logic
  const onMouseDown = (e: React.MouseEvent, id: string) => {
    if (isPreview) return;
    const v = variables.find(varItem => varItem.id === id);
    if (!v) return;
    
    setSelectedId(id);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: v.x,
      origY: v.y
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      
      updateVariable(dragRef.current.id, {
        x: Math.max(0, Math.min(canvasSize.width - 20, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(canvasSize.height - 20, dragRef.current.origY + dy))
      });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const selectedVar = variables.find(v => v.id === selectedId);

  if (view === "list") {
    return (
      <div className="space-y-10 pb-24 max-w-[1600px] mx-auto">
        <AdminPageHeader 
          title="Document Design System" 
          description="Manage and architect premium printable layouts for your educational ecosystem."
        >
          <Button 
            onClick={handleNewTemplate} 
            className="h-11 px-6 rounded-xl gap-2 bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </AdminPageHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Designs...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <FileText className="h-16 w-16 text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-slate-900">No Saved Designs</h3>
            <p className="text-slate-500 mb-8 max-w-xs text-center">Start by creating your first document template like a certificate or ID card.</p>
            <Button onClick={handleNewTemplate} variant="outline" className="rounded-2xl h-12 px-8 border-primary/20 text-primary">Get Started</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {templates.map(template => (
              <Card 
                key={template.id} 
                onClick={() => handleEditTemplate(template)}
                className="group border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 rounded-[2rem] cursor-pointer bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 active:scale-[0.98] flex flex-col"
              >
                <div className="aspect-[3/2] relative bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  {template.background ? (
                    <img 
                      src={template.background || ""} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                      alt={template.name} 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-zinc-600 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border border-slate-100 dark:border-zinc-800">
                        <Layout className="w-6 h-6 opacity-40" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">No Background</span>
                    </div>
                  )}
                  
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Actions */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="transition-all duration-300 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                       <Button 
                         variant="destructive" 
                         size="icon" 
                         onClick={(e) => handleDelete(template.id, e)}
                         className="h-9 w-9 rounded-xl shadow-xl backdrop-blur-md bg-red-500/90 hover:bg-red-600 border border-white/20 transition-all active:scale-90"
                       >
                         <Trash2 className="h-4 w-4 text-white" />
                       </Button>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="px-5 py-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings2 className="h-3 w-3" />
                        Modify Design
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{template.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500">
                       <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                       <span className="text-[9px] font-bold uppercase tracking-tight">{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {template.name}
                  </h4>
                  
                  <div className="mt-4 pt-4 flex items-center justify-between border-t border-slate-50 dark:border-zinc-800/50">
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><Type className="h-2.5 w-2.5 text-blue-500" /></div>
                      <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><ImageIcon className="h-2.5 w-2.5 text-purple-500" /></div>
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><Signature className="h-2.5 w-2.5 text-amber-500" /></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {template.config ? (template.config as any[]).length : 0} Elements
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto">
      <AdminPageHeader 
        title={templateName} 
        description={`Designing ${templateType.toLowerCase()} layout with pixel precision.`}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setView("list")} className="h-11 rounded-xl gap-2 font-bold hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Button>
          <div className="w-[1px] h-8 bg-slate-200 mx-2" />
          <Button 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)} 
            className={cn("h-11 rounded-xl gap-2 font-bold", isPreview && "bg-primary/5 border-primary text-primary")}
          >
            {isPreview ? <Settings2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreview ? "Edit Layout" : "Live Preview"}
          </Button>
          <Button 
            onClick={downloadPDF} 
            className="h-11 px-6 rounded-xl gap-2 bg-zinc-900 text-white font-bold hover:scale-[1.02] transition-all shadow-xl shadow-zinc-900/10"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-11 px-6 rounded-xl gap-2 bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Design"}
          </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Designer Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Template Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Design Name</Label>
                  <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="h-11 rounded-xl font-bold" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doc Type</Label>
                  <select 
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-xl font-bold px-3 focus:outline-none"
                  >
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="ID_CARD">ID Card</option>
                    <option value="MARKSHEET">Marksheet</option>
                    <option value="BUSINESS_CARD">Business Card</option>
                    <option value="LETTER_PAD">Letter Pad</option>
                  </select>
               </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Components
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button variant="outline" onClick={() => addVariable("text")} className="justify-start gap-3 h-12 rounded-2xl hover:bg-primary/5 group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20"><Type className="h-4 w-4 text-blue-600" /></div>
                <span className="font-bold">Text Variable</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("image")} className="justify-start gap-3 h-12 rounded-2xl hover:bg-primary/5 group">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20"><ImageIcon className="h-4 w-4 text-purple-600" /></div>
                <span className="font-bold">Image/Photo</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("signature")} className="justify-start gap-3 h-12 rounded-2xl hover:bg-primary/5 group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20"><Signature className="h-4 w-4 text-amber-600" /></div>
                <span className="font-bold">Signature</span>
              </Button>
            </CardContent>
          </Card>

          {selectedVar && (
            <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">Properties</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeVariable(selectedVar.id)} className="text-red-500 hover:bg-red-50 rounded-xl">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Binding Variable</Label>
                  <select 
                    value={selectedVar.name}
                    onChange={(e) => updateVariable(selectedVar.id, { name: e.target.value })}
                    className="w-full h-11 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold px-3 focus:outline-none"
                  >
                    {Object.keys(DEMO_DATA).map(key => (<option key={key} value={key}>{key}</option>))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pos X ({unit})</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={Number(fromPx(selectedVar.x, unit)).toFixed(unit === "px" ? 0 : 2)} 
                      onChange={(e) => updateVariable(selectedVar.id, { x: toPx(parseFloat(e.target.value) || 0, unit) })} 
                      className="h-11 rounded-xl font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pos Y ({unit})</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={Number(fromPx(selectedVar.y, unit)).toFixed(unit === "px" ? 0 : 2)} 
                      onChange={(e) => updateVariable(selectedVar.id, { y: toPx(parseFloat(e.target.value) || 0, unit) })} 
                      className="h-11 rounded-xl font-bold" 
                    />
                  </div>
                </div>

                {selectedVar.type === 'text' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size (PT)</Label>
                        <Input type="number" value={selectedVar.fontSize} onChange={(e) => updateVariable(selectedVar.id, { fontSize: parseInt(e.target.value) || 0 })} className="h-11 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight</Label>
                        <select value={selectedVar.fontWeight} onChange={(e) => updateVariable(selectedVar.id, { fontWeight: e.target.value })} className="w-full h-11 bg-slate-50 rounded-xl font-bold px-3 focus:outline-none">
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="bold">Bold</option>
                          <option value="black">Black</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Color</Label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border-2 border-slate-50">
                        <Input type="color" value={selectedVar.color} onChange={(e) => updateVariable(selectedVar.id, { color: e.target.value })} className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer" />
                        <span className="font-mono text-xs font-bold uppercase">{selectedVar.color}</span>
                      </div>
                    </div>
                  </>
                )}

                {(selectedVar.type === 'image' || selectedVar.type === 'signature') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Width ({unit})</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={Number(fromPx(selectedVar.width || 0, unit)).toFixed(unit === "px" ? 0 : 2)} 
                        onChange={(e) => updateVariable(selectedVar.id, { width: toPx(parseFloat(e.target.value) || 0, unit) })} 
                        className="h-11 rounded-xl font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Height ({unit})</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={Number(fromPx(selectedVar.height || 0, unit)).toFixed(unit === "px" ? 0 : 2)} 
                        onChange={(e) => updateVariable(selectedVar.id, { height: toPx(parseFloat(e.target.value) || 0, unit) })} 
                        className="h-11 rounded-xl font-bold" 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Layout className="h-5 w-5 text-primary" />Layout</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload value={backgroundUrl} onChange={setBackgroundUrl} label="Background" folder="ABCDEduHub/SuperAdmin/Documents" />
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Unit</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(["px", "in", "mm"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                        unit === u ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Size Preset</Label>
                <select 
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="w-full h-11 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold px-3 focus:outline-none"
                >
                  <option value="CUSTOM">Custom Size</option>
                  {Object.keys(PAGE_PRESETS).map(key => (
                    <option key={key} value={key}>{PAGE_PRESETS[key].name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Orientation</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={orientation === "portrait" ? "default" : "outline"} 
                    className="flex-1 rounded-xl font-bold h-10"
                    onClick={() => orientation !== "portrait" && toggleOrientation()}
                  >
                    Portrait
                  </Button>
                  <Button 
                    variant={orientation === "landscape" ? "default" : "outline"} 
                    className="flex-1 rounded-xl font-bold h-10"
                    onClick={() => orientation !== "landscape" && toggleOrientation()}
                  >
                    Landscape
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canvas Width ({unit})</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={Number(fromPx(canvasSize.width, unit)).toFixed(unit === "px" ? 0 : 2)} 
                    onChange={(e) => {
                      setCanvasSize({ ...canvasSize, width: toPx(parseFloat(e.target.value) || 0, unit) });
                      setPageSize("CUSTOM");
                    }} 
                    className="h-11 rounded-xl font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canvas Height ({unit})</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={Number(fromPx(canvasSize.height, unit)).toFixed(unit === "px" ? 0 : 2)} 
                    onChange={(e) => {
                      setCanvasSize({ ...canvasSize, height: toPx(parseFloat(e.target.value) || 0, unit) });
                      setPageSize("CUSTOM");
                    }} 
                    className="h-11 rounded-xl font-bold" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="xl:col-span-9 flex flex-col items-center">
          <div className="w-full overflow-auto p-10 bg-slate-100 dark:bg-zinc-950 rounded-[3rem] border-2 border-slate-200 dark:border-zinc-800 shadow-inner min-h-[800px] flex justify-start">
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-2xl overflow-hidden shrink-0 m-auto"
              style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
            >
              {backgroundUrl ? (
                <img src={backgroundUrl || ""} crossOrigin="anonymous" alt="BG" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 bg-slate-50/50">
                   <Layout className="w-32 h-32 opacity-20" />
                   <p className="font-black uppercase tracking-[0.2em] mt-4">Empty Canvas</p>
                </div>
              )}

              {/* Bleed/Safe Area Guide (Visual Only) */}
              {!isPreview && (
                <div 
                  className="absolute inset-[3mm] border border-dashed border-primary/20 pointer-events-none z-10"
                  title="3mm Bleed/Safe Area Guide"
                />
              )}

              {variables.map((v) => (
                <div
                  key={v.id}
                  onMouseDown={(e) => onMouseDown(e, v.id)}
                  className={cn(
                    "absolute cursor-move select-none",
                    !isPreview && selectedId === v.id ? "ring-2 ring-primary ring-offset-2 z-50" : "z-40"
                  )}
                  style={{ left: `${v.x}px`, top: `${v.y}px` }}
                >
                  {v.type === "text" ? (
                    <span style={{ fontSize: `${v.fontSize}px`, fontWeight: v.fontWeight, color: v.color, lineHeight: 1, whiteSpace: "nowrap" }}>
                      {isPreview ? (DEMO_DATA[v.name] || `{${v.name}}`) : `{${v.name}}`}
                    </span>
                  ) : (
                    <div style={{ width: `${v.width}px`, height: `${v.height}px` }} className="bg-slate-100/50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                      {isPreview ? (
                        <img src={DEMO_DATA[v.name] || ""} crossOrigin="anonymous" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-40">
                          {v.type === "image" ? <ImageIcon className="h-6 w-6" /> : <Signature className="h-6 w-6" />}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-8">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drag to Move</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select to Edit</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High-Res Print PDF</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
