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
  CheckCircle2,
  QrCode,
  Copy
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveDocumentTemplate, getDocumentTemplates, deleteDocumentTemplate, checkActiveTemplateExists, toggleTemplateStatus, getExampleData, saveExampleData } from "@/app/actions/document-templates";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import { ExampleDataModal } from "./ExampleDataModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { DraggableElement } from "@/components/documents/DraggableElement";
import { DocVariable } from "@/types/document";
const DEFAULT_DEMO_DATA: Record<string, string> = {
  // Student Base
  studentName: "Suman Baidya",
  studentPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
  studentSign: "https://api.dicebear.com/7.x/bottts/svg?seed=sign",
  enrollmentNo: "ENR-2026-9876",
  registrationNo: "REG-123456",
  certificateNo: "CERT-789012",
  marksheetNo: "MK-345678",
  dob: "12-05-1998",
  gender: "Male",
  bloodGroup: "O+",
  phone: "9876543210",
  email: "suman@example.com",
  fatherName: "John Doe",
  motherName: "Jane Doe",
  address: "123 Coding Street, Tech City, NY 10001",
  
  // Course & Batch
  courseName: "Full Stack Web Development",
  courseCode: "FSWD-101",
  courseDuration: "12 Months",
  batchName: "Morning Batch A",
  batchTime: "10:00 AM - 12:00 PM",
  coursePeriod: "MAR.2024 TO FEB.2025",
  
  // Franchise / Center
  franchiseName: "Zenith Coding Academy",
  franchiseCode: "ZCA-001",
  franchiseAddress: "456 Academy Road, Learn City",
  franchisePhone: "1800-123-456",
  franchiseEmail: "zenith@example.com",
  centerHeadSign: "https://api.dicebear.com/7.x/bottts/svg?seed=headsign",
  franchiseOwnerName: "Dr. Richard Smith",
  franchiseOwnerPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=owner",
  franchiseOwnerSign: "https://api.dicebear.com/7.x/bottts/svg?seed=ownersign",
  
  // Marksheet
  semesterName: "Semester 1",
  unit1Marks: "85", unit1Name: "HTML & CSS",
  unit2Marks: "90", unit2Name: "JavaScript Basics",
  unit3Marks: "78", unit3Name: "React JS",
  unit4Marks: "92", unit4Name: "Node JS",
  unit5Marks: "88", unit5Name: "Database",
  unit6Marks: "95", unit6Name: "Project",
  marksheet_subjects: "HTML & CSS\nJavaScript Basics\nReact JS\nNode JS\nDatabase\nProject",
  marksheet_max_marks: "100\n100\n100\n100\n100\n100",
  marksheet_obtained_marks: "85\n90\n78\n92\n88\n95",
  totalMarksObtained: "528",
  totalMaxMarks: "600",
  percentage: "88.0%",
  grade: "A+",
  resultStatus: "PASS",
  totalSemesterMarks: "528/600",
  grandTotalMarks: "1056/1200",
  grandPercentage: "88.0%",
  grandGrade: "A+",
  division: "1st Division",

  // Staff
  staffName: "Alice Smith",
  staffPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
  staffSign: "https://api.dicebear.com/7.x/bottts/svg?seed=staffsign",
  staffId: "STF-2024-055",
  staffRole: "Senior Developer",
  staffPhone: "1234567890",

  // System & Notice
  issueDate: "15/05/2024",
  validUntil: "May 14, 2025",
  principalSign: "https://api.dicebear.com/7.x/bottts/svg?seed=principal",
  noticeTitle: "Urgent Meeting Notice",
  noticeBody: "All staff members are requested to attend the meeting at 4:00 PM.",
  noticeDate: "June 28, 2026",

  // Exam
  examName: "Final Semester Examination 2026",
  examDate: "December 15, 2026",
  examTime: "10:00 AM - 01:00 PM",
  examDuration: "180 Minutes",
  examSyllabus: "Unit 1 to 5, React, Node",
  examRollNo: "EX-98234-A",
};

const VARIABLE_GROUPS = [
  {
    label: "Student Variables",
    items: [
      { id: "studentName", label: "Full Name" },
      { id: "studentPhoto", label: "Profile Picture" },
      { id: "studentSign", label: "Student Signature" },
      { id: "enrollmentNo", label: "Enrollment Number" },
      { id: "registrationNo", label: "Registration Number" },
      { id: "certificateNo", label: "Certificate Number" },
      { id: "marksheetNo", label: "Marksheet Number" },
      { id: "dob", label: "Date of Birth" },
      { id: "gender", label: "Gender" },
      { id: "bloodGroup", label: "Blood Group" },
      { id: "phone", label: "Phone Number" },
      { id: "email", label: "Email Address" },
      { id: "fatherName", label: "Father's Name" },
      { id: "motherName", label: "Mother's Name" },
      { id: "address", label: "Full Address" },
    ]
  },
  {
    label: "Course & Batch Variables",
    items: [
      { id: "courseName", label: "Course Title" },
      { id: "courseCode", label: "Course Code" },
      { id: "courseDuration", label: "Course Duration" },
      { id: "coursePeriod", label: "Course Period" },
      { id: "batchName", label: "Batch Name" },
      { id: "batchTime", label: "Batch Timing" },
    ]
  },
  {
    label: "Franchise / Center Variables",
    items: [
      { id: "franchiseName", label: "Center Name" },
      { id: "franchiseCode", label: "Center Code" },
      { id: "franchiseAddress", label: "Center Address" },
      { id: "franchisePhone", label: "Center Phone" },
      { id: "franchiseEmail", label: "Center Email" },
      { id: "centerHeadSign", label: "Center Head Sign" },
      { id: "franchiseOwnerName", label: "Owner Name" },
      { id: "franchiseOwnerPhoto", label: "Owner Photo" },
      { id: "franchiseOwnerSign", label: "Owner Signature" },
    ]
  },
  {
    label: "Marksheet Variables",
    items: [
      { id: "unit1Name", label: "Unit 1 Name" }, { id: "unit1Marks", label: "Unit 1 Marks" },
      { id: "unit2Name", label: "Unit 2 Name" }, { id: "unit2Marks", label: "Unit 2 Marks" },
      { id: "unit3Name", label: "Unit 3 Name" }, { id: "unit3Marks", label: "Unit 3 Marks" },
      { id: "unit4Name", label: "Unit 4 Name" }, { id: "unit4Marks", label: "Unit 4 Marks" },
      { id: "unit5Name", label: "Unit 5 Name" }, { id: "unit5Marks", label: "Unit 5 Marks" },
      { id: "unit6Name", label: "Unit 6 Name" }, { id: "unit6Marks", label: "Unit 6 Marks" },
      { id: "marksheet_subjects", label: "Multi-line: Subjects" },
      { id: "marksheet_max_marks", label: "Multi-line: Max Marks" },
      { id: "marksheet_obtained_marks", label: "Multi-line: Obtained Marks" },
      { id: "totalMarksObtained", label: "Total Obtained" },
      { id: "totalMaxMarks", label: "Total Max Marks" },
      { id: "percentage", label: "Percentage" },
      { id: "grade", label: "Grade" },
      { id: "resultStatus", label: "Result Status (Pass/Fail)" },
      { id: "semesterName", label: "Semester Name (e.g., SEMESTER - I)" },
      { id: "totalSemesterMarks", label: "Semester Total (e.g., 528/600)" },
      { id: "grandTotalMarks", label: "Grand Total (e.g., 1056/1200)" },
      { id: "grandPercentage", label: "Grand Percentage" },
      { id: "grandGrade", label: "Grand Grade (A+, A, etc.)" },
      { id: "division", label: "Division (1st, 2nd, etc.)" },
    ]
  },
  {
    label: "Staff Variables",
    items: [
      { id: "staffName", label: "Staff Name" },
      { id: "staffPhoto", label: "Staff Photo" },
      { id: "staffSign", label: "Staff Signature" },
      { id: "staffId", label: "Staff ID" },
      { id: "staffRole", label: "Staff Role" },
      { id: "staffPhone", label: "Staff Phone" },
    ]
  },
  {
    label: "System Variables",
    items: [
      { id: "issueDate", label: "Issue Date" },
      { id: "validUntil", label: "Valid Until" },
      { id: "principalSign", label: "Principal Signature" },
      { id: "noticeTitle", label: "Notice Title" },
      { id: "noticeBody", label: "Notice Body" },
      { id: "noticeDate", label: "Notice Date" },
    ]
  },
  {
    label: "Exam Variables",
    items: [
      { id: "examName", label: "Exam Title" },
      { id: "examDate", label: "Exam Date" },
      { id: "examTime", label: "Exam Shift Time" },
      { id: "examDuration", label: "Exam Duration" },
      { id: "examSyllabus", label: "Exam Syllabus" },
      { id: "examRollNo", label: "Exam Roll Number" },
    ]
  }
];

export default function DocumentDesigner() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"list" | "editor">("list");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);
  const [templateToSave, setTemplateToSave] = useState<{ id?: string, forceActive?: boolean } | null>(null);
  const [conflictWarning, setConflictWarning] = useState<{ exists: boolean, name?: string } | null>(null);
  
  // Current Template State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Document");
  const [templateType, setTemplateType] = useState("CERTIFICATE");
  const [quickInsertKey, setQuickInsertKey] = useState(0);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [variables, setVariables] = useState<DocVariable[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>(DEFAULT_DEMO_DATA);
  const [showExampleData, setShowExampleData] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1131 });
  const [isSaving, setIsSaving] = useState(false);
  const [unit, setUnit] = useState<"px" | "in" | "mm">("px");
  const [pageSize, setPageSize] = useState<string>("CUSTOM");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number; el?: HTMLElement | null } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchTemplates();
    fetchExampleData();
  }, []);

  const fetchExampleData = async () => {
    const data = await getExampleData();
    if (data && Object.keys(data).length > 0) {
      setPreviewData({ ...DEFAULT_DEMO_DATA, ...data });
    } else {
      setPreviewData(DEFAULT_DEMO_DATA);
    }
  };

  // Keyboard Shortcuts for Nudging and Deleting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId || isPreview) return;

      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setVariables(vars => vars.filter(v => v.id !== selectedId));
        setSelectedId(null);
        return;
      }

      const nudgeAmount = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowUp") dy = -nudgeAmount;
      else if (e.key === "ArrowDown") dy = nudgeAmount;
      else if (e.key === "ArrowLeft") dx = -nudgeAmount;
      else if (e.key === "ArrowRight") dx = nudgeAmount;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setVariables(prev => prev.map(v => {
          if (v.id === selectedId) {
            const el = document.getElementById(`var-${selectedId}`);
            const elWidth = el?.offsetWidth || 20;
            const elHeight = el?.offsetHeight || 20;
            return {
              ...v,
              x: Math.max(0, Math.min(canvasSize.width - elWidth, v.x + dx)),
              y: Math.max(0, Math.min(canvasSize.height - elHeight, v.y + dy))
            };
          }
          return v;
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, isPreview, canvasSize]);

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

  const parseQrContent = (template: string = "") => {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      return previewData[key] || `{${key}}`;
    });
  };

  const parseTextContent = (v: DocVariable) => {
    const templateStr = v.textContent !== undefined ? v.textContent : `{${v.name}}`;
    if (!isPreview) return templateStr;
    return templateStr.replace(/\{(\w+)\}/g, (_, key) => {
      return previewData[key] || `{${key}}`;
    });
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
    
    let parsedConfig = [];
    if (template.config) {
      try {
        parsedConfig = typeof template.config === "string" ? JSON.parse(template.config) : template.config;
      } catch(e) {
        console.error("Failed to parse config", e);
      }
    }
    setVariables(Array.isArray(parsedConfig) ? parsedConfig : []);

    setSelectedId(null);
    setView("editor");
  };

  const performSave = async (forceActive: boolean = true) => {
    setIsSaving(true);
    const res = await saveDocumentTemplate({
      id: currentId || undefined,
      name: templateName,
      type: templateType,
      background: backgroundUrl,
      width: canvasSize.width,
      height: canvasSize.height,
      config: variables,
      isActive: forceActive,
    });

    if (res.success) {
      toast.success("Document template saved successfully");
      if (!currentId) setCurrentId(res.id || null);
      fetchTemplates();
      setTemplateToSave(null);
      setConflictWarning(null);
    } else {
      toast.error(res.error || "Failed to save template");
    }
    setIsSaving(false);
  };

  const handleSave = async () => {
    if (!currentId) {
      // It's a new template, check for conflict
      const conflict = await checkActiveTemplateExists(templateType);
      if (conflict.exists) {
        setConflictWarning(conflict);
        setTemplateToSave({ forceActive: true });
        return;
      }
    }
    performSave(true);
  };
  
  const handleToggleStatus = async (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !template.isActive;
    
    toast.promise(
      new Promise(async (resolve, reject) => {
        const res = await toggleTemplateStatus(template.id, newStatus, template.type);
        if (res.success) {
          fetchTemplates();
          resolve(res);
        } else {
          reject(new Error(res.error));
        }
      }),
      {
        loading: "Updating status...",
        success: () => `Template marked as ${newStatus ? 'Active' : 'Inactive'}`,
        error: (err) => `Failed: ${err.message}`
      }
    );
  };

  const handleDeleteClick = (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToDelete(template);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    
    const res = await deleteDocumentTemplate(templateToDelete.id);
    if (res.success) {
      toast.success("Template deleted");
      fetchTemplates();
    }
    setTemplateToDelete(null);
  };

  const addVariable = (type: "text" | "image" | "signature" | "qrcode" | "attendance_qr") => {
    const isAttendance = type === "attendance_qr";
    const actualType = isAttendance ? "qrcode" : type;
    
    const newVar: DocVariable = {
      id: crypto.randomUUID(),
      name: actualType === "text" ? "studentName" : actualType === "qrcode" ? (isAttendance ? "attendanceQr" : "qrCode") : "studentPhoto",
      type: actualType,
      x: 50,
      y: 50,
      ...(actualType === "text" && { fontSize: 16, fontWeight: "normal", fontFamily: "Inter", color: "#000000", lineHeight: 1 }),
      ...(actualType === "image" && { width: 100, height: 100 }),
      ...(actualType === "signature" && { width: 120, height: 40 }),
      ...(actualType === "qrcode" && { 
        width: 100, 
        height: 100, 
        qrContentTemplate: isAttendance ? "{enrollmentNo}" : "{studentName} - {enrollmentNo}" 
      }),
    };
    setVariables(prev => [...prev, newVar]);
    setSelectedId(newVar.id);
  };

  const updateVariable = (id: string, updates: Partial<DocVariable>) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const removeVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
    setSelectedId(null);
  };

  const duplicateVariable = (id: string) => {
    // Generate new ID and state synchronously
    const newId = crypto.randomUUID();
    
    setVariables(prev => {
      const v = prev.find(item => item.id === id);
      if (!v) return prev;
      const newVar = {
        ...v,
        id: newId,
        x: v.x + 20,
        y: v.y + 20
      };
      return [...prev, newVar];
    });
    
    setSelectedId(newId);
  };

  const downloadPDF = async () => {
    if (!canvasRef.current) return;
    
    const wasPreview = isPreview;
    // Force preview mode for clean PDF capture (removes guides and UI rings)
    setIsPreview(true);
    
    const toastId = toast.loading("Rendering High-Resolution Document...");
    
    try {
      // Wait for React to render the preview state
      await new Promise(resolve => setTimeout(resolve, 500));

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
      const { toPng } = await import("html-to-image");
      const imgData = await toPng(canvasRef.current, {
        pixelRatio: 4,
        backgroundColor: '#ffffff'
      });
      
      // 3. Create PDF with precise unit dimensions
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: canvasSize.width > canvasSize.height ? "l" : "p",
        unit: "mm",
        format: [fromPx(canvasSize.width, "mm"), fromPx(canvasSize.height, "mm")]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, fromPx(canvasSize.width, "mm"), fromPx(canvasSize.height, "mm"), undefined, 'FAST');
      
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
    } finally {
      setIsPreview(wasPreview);
    }
  };

  // Drag logic
  const onMouseDown = (e: React.MouseEvent, id: string) => {
    if (isPreview) return;
    const v = variables.find(varItem => varItem.id === id);
    if (!v) return;
    
    setSelectedId(id);
    
    const el = document.getElementById(`var-${id}`);
    
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: v.x,
      origY: v.y,
      el
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      
      const elWidth = dragRef.current.el?.offsetWidth || 20;
      const elHeight = dragRef.current.el?.offsetHeight || 20;

      const newX = Math.max(0, Math.min(canvasSize.width - elWidth, dragRef.current.origX + dx));
      const newY = Math.max(0, Math.min(canvasSize.height - elHeight, dragRef.current.origY + dy));
      
      // Update DOM directly for lag-free dragging
      if (dragRef.current.el) {
        dragRef.current.el.style.left = `${newX}px`;
        dragRef.current.el.style.top = `${newY}px`;
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = upEvent.clientX - dragRef.current.startX;
      const dy = upEvent.clientY - dragRef.current.startY;
      
      const elWidth = dragRef.current.el?.offsetWidth || 20;
      const elHeight = dragRef.current.el?.offsetHeight || 20;

      const finalX = Math.max(0, Math.min(canvasSize.width - elWidth, dragRef.current.origX + dx));
      const finalY = Math.max(0, Math.min(canvasSize.height - elHeight, dragRef.current.origY + dy));
      
      // Only trigger heavy React re-render when drag completes
      if (finalX !== dragRef.current.origX || finalY !== dragRef.current.origY) {
        updateVariable(dragRef.current.id, {
          x: finalX,
          y: finalY
        });
      }
      
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
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;700;900&display=swap');` }} />
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
                      className="w-full h-full object-cover group- transition-transform duration-1000 ease-out" 
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
                  <div className="absolute top-3 right-3 z-20 flex gap-2">
                     <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-8 px-3 rounded-lg bg-white/90 shadow-sm hover:bg-white text-slate-700 text-xs font-bold"
                      onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                    >
                       Edit
                     </Button>
                     <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-lg shrink-0 shadow-sm"
                      onClick={(e) => handleDeleteClick(template, e)}
                    >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="px-5 py-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-white/20 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
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
                    <div 
                      className="flex items-center gap-2 cursor-pointer z-20 relative"
                      onClick={(e) => handleToggleStatus(template, e)}
                    >
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", template.isActive ? "text-green-500" : "text-slate-400")}>
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                      <Switch checked={!!template.isActive} className="scale-75 pointer-events-none" />
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight group-hover:text-primary transition-colors line-clamp-1 mt-1">
                    {template.name}
                  </h4>
                  
                  <div className="mt-4 pt-4 flex items-center justify-between border-t border-slate-50 dark:border-zinc-800/50">
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><Type className="h-2.5 w-2.5 text-blue-500" /></div>
                      <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><ImageIcon className="h-2.5 w-2.5 text-purple-500" /></div>
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><Signature className="h-2.5 w-2.5 text-amber-500" /></div>
                      <div className="w-5 h-5 rounded-full bg-green-500/10 border border-white dark:border-zinc-900 flex items-center justify-center"><QrCode className="h-2.5 w-2.5 text-green-500" /></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {Array.isArray(template.config) 
                        ? template.config.length 
                        : (typeof template.config === 'string' ? (
                            (() => { try { return JSON.parse(template.config).length || 0; } catch { return 0; } })()
                          ) : 0)
                      } Elements
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <ConfirmDialog 
          open={!!templateToDelete}
          onOpenChange={(open) => !open && setTemplateToDelete(null)}
          title="Delete Template?"
          description={`Are you sure you want to permanently delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Yes, Delete"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;700;900&display=swap');` }} />
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
            variant="secondary" 
            onClick={() => setShowExampleData(true)} 
            className="h-11 rounded-xl gap-2 font-bold bg-amber-100 text-amber-700 hover:bg-amber-200"
          >
            <Settings2 className="h-4 w-4" />
            Example Data
          </Button>
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

      <ConfirmDialog 
        open={!!conflictWarning}
        onOpenChange={(open) => !open && setConflictWarning(null)}
        title="Active Template Exists"
        description={`An active template already exists for this document type${conflictWarning?.name ? ` ("${conflictWarning.name}")` : ''}. Saving this new design will deactivate the previous one. Do you want to proceed and set this as the active template?`}
        onConfirm={() => {
          performSave(true);
        }}
        confirmText="Save and Set Active"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Designer Sidebar */}
        <div className="xl:col-span-3 space-y-6 sticky top-0 h-[100vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
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
                  <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="h-11 bg-slate-50 border-2 border-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-white focus-visible:ring-0 rounded-xl font-bold" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doc Type</Label>
                  <Select
                    value={templateType}
                    onValueChange={(value: any) => setTemplateType(value)}
                  >
                    <SelectTrigger className="w-full h-11 bg-slate-50 border-2 border-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-white rounded-xl font-bold px-3 focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select document type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CERTIFICATE">Students Certificate</SelectItem>
                      <SelectItem value="MARKSHEET">Marksheet</SelectItem>
                      <SelectItem value="ADMIT_CARD">Admit Card</SelectItem>
                      <SelectItem value="STUDENT_ID">Student ID Card</SelectItem>
                      <SelectItem value="STAFF_ID">Staff Id Card</SelectItem>
                      <SelectItem value="FRANCHISE_ID">Franchise Owner ID</SelectItem>
                      <SelectItem value="NOTICE_PAD">Notice Pad</SelectItem>
                      <SelectItem value="FRANCHISE_CERTIFICATE">Franchises Certificate</SelectItem>
                    </SelectContent>
                  </Select>
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
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => addVariable("text")} className="h-auto py-4 flex-col gap-2 rounded-2xl hover:bg-primary/5 dark:hover:bg-primary/10 dark:border-slate-800 group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20"><Type className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                <span className="font-bold text-xs dark:text-slate-300">Text</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("image")} className="h-auto py-4 flex-col gap-2 rounded-2xl hover:bg-primary/5 dark:hover:bg-primary/10 dark:border-slate-800 group">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20"><ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                <span className="font-bold text-xs dark:text-slate-300 text-center">Image /<br/>Signature</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("qrcode")} className="h-auto py-4 flex-col gap-2 rounded-2xl hover:bg-primary/5 dark:hover:bg-primary/10 dark:border-slate-800 group">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20"><QrCode className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
                <span className="font-bold text-xs dark:text-slate-300 text-center">Custom<br/>QR Code</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("attendance_qr")} className="h-auto py-4 flex-col gap-2 rounded-2xl border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-900/20 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20"><QrCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>
                <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 text-center">Attendance<br/>Scanner QR</span>
              </Button>
            </CardContent>
          </Card>

          {selectedVar && (
            <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">Properties</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => duplicateVariable(selectedVar.id)} className="text-blue-500 hover:bg-blue-50 rounded-xl" title="Duplicate Element">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeVariable(selectedVar.id)} className="text-red-500 hover:bg-red-50 rounded-xl" title="Delete Element">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Accordion key={selectedVar.id} multiple defaultValue={["data", "appearance", "layout"]} className="w-full space-y-3">
                  
                  {/* DATA SECTION */}
                  <AccordionItem value="data" className="border-none bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Data Source</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4 pt-1">
                      {selectedVar.type === 'qrcode' ? (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">QR Code Content</Label>
                          <textarea 
                            value={selectedVar.qrContentTemplate || ""}
                            onChange={(e) => updateVariable(selectedVar.id, { qrContentTemplate: e.target.value })}
                            className="w-full h-24 p-3 rounded-xl border-2 border-input bg-background font-mono text-sm resize-none focus:outline-none focus:border-primary/50"
                            placeholder="e.g. Name: {studentName}&#10;Reg: {registrationNo}"
                          />
                          <p className="text-[10px] text-slate-400 font-bold">Use {'{variableName}'} to insert dynamic data.</p>
                        </div>
                      ) : selectedVar.type === 'text' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Format</Label>
                            <textarea 
                              value={selectedVar.textContent !== undefined ? selectedVar.textContent : `{${selectedVar.name}}`}
                              onChange={(e) => updateVariable(selectedVar.id, { textContent: e.target.value })}
                              className="w-full h-24 p-3 rounded-xl border-2 border-input bg-background font-mono text-sm resize-none focus:outline-none focus:border-primary/50"
                              placeholder="e.g. <i>C/o</i> <b>{fatherName}</b>"
                            />
                            <p className="text-[10px] text-slate-400 font-bold">Use {'{variableName}'} for data. You can use HTML like &lt;b&gt;, &lt;i&gt;, &lt;span style=&quot;color:red&quot;&gt; for rich styling!</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Insert Variable</Label>
                            <Select
                              key={quickInsertKey}
                              onValueChange={(value: any) => {
                                if (!value) return;
                                const current = selectedVar.textContent !== undefined ? selectedVar.textContent : `{${selectedVar.name}}`;
                                updateVariable(selectedVar.id, { textContent: current + `{${value}}` });
                                setQuickInsertKey(prev => prev + 1);
                              }}
                            >
                              <SelectTrigger className="w-full h-11 bg-background border-2 border-input rounded-xl font-bold px-3 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Select to insert..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {VARIABLE_GROUPS.map((group) => {
                                  const filteredItems = group.items.filter(item => !['studentPhoto', 'studentSign', 'centerHeadSign', 'franchiseOwnerPhoto', 'franchiseOwnerSign', 'staffPhoto', 'staffSign', 'principalSign'].includes(item.id));
                                  if (filteredItems.length === 0) return null;
                                  return (
                                    <div key={group.label} className="py-1">
                                      <div className="font-black text-xs text-white uppercase tracking-wider bg-slate-900 dark:bg-black py-2 px-2 sticky top-0 z-10">{group.label}</div>
                                      {filteredItems.map((item) => (
                                        <SelectItem key={item.id} value={item.id} className="font-semibold cursor-pointer py-2 pl-6">
                                          {item.label} <span className="text-[10px] text-slate-400 font-mono ml-2">({item.id})</span>
                                        </SelectItem>
                                      ))}
                                    </div>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Binding Variable</Label>
                          <Select
                            value={selectedVar.name}
                            onValueChange={(value: any) => updateVariable(selectedVar.id, { name: value })}
                          >
                            <SelectTrigger className="w-full h-11 bg-background border-2 border-input rounded-xl font-bold px-3 focus:ring-0 focus:ring-offset-0">
                              <SelectValue placeholder="Select variable..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {VARIABLE_GROUPS.map((group) => {
                                const imageKeys = ['studentPhoto', 'studentSign', 'centerHeadSign', 'franchiseOwnerPhoto', 'franchiseOwnerSign', 'staffPhoto', 'staffSign', 'principalSign'];
                                const filteredItems = group.items.filter(item => imageKeys.includes(item.id));
                                if (filteredItems.length === 0) return null;
                                return (
                                  <div key={group.label} className="py-1">
                                    <div className="font-black text-xs text-white uppercase tracking-wider bg-slate-900 dark:bg-black py-2 px-2 sticky top-0 z-10">{group.label}</div>
                                    {filteredItems.map((item) => (
                                      <SelectItem key={item.id} value={item.id} className="font-semibold cursor-pointer py-2 pl-6">
                                        {item.label} <span className="text-[10px] text-slate-400 font-mono ml-2">({item.id})</span>
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* APPEARANCE SECTION */}
                  <AccordionItem value="appearance" className="border-none bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Appearance</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4 pt-1">
                      {selectedVar.type === 'text' && (
                        <>
                          <div className="space-y-2 col-span-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Line Height</Label>
                              <span className="text-[10px] font-bold text-slate-400">{selectedVar.lineHeight || 1}</span>
                            </div>
                            <input 
                              type="range"
                              min="0.5"
                              max="4"
                              step="0.1"
                              value={selectedVar.lineHeight || 1}
                              onChange={(e) => updateVariable(selectedVar.id, { lineHeight: parseFloat(e.target.value) })}
                              className="w-full accent-primary"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Align</Label>
                              <Select
                                value={selectedVar.textAlign || "left"}
                                onValueChange={(value: any) => updateVariable(selectedVar.id, { textAlign: value })}
                              >
                                <SelectTrigger className="w-full h-10 bg-background border-2 border-input rounded-xl font-bold px-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                  <SelectItem value="justify">Justify</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Font Family</Label>
                              <Select
                                value={selectedVar.fontFamily || "Inter"}
                                onValueChange={(value: any) => updateVariable(selectedVar.id, { fontFamily: value })}
                              >
                                <SelectTrigger className="w-full h-10 bg-background border-2 border-input rounded-xl font-bold px-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Inter"><span style={{ fontFamily: 'Inter' }}>Inter (Default)</span></SelectItem>
                                  <SelectItem value="Roboto"><span style={{ fontFamily: 'Roboto' }}>Roboto</span></SelectItem>
                                  <SelectItem value="Open Sans"><span style={{ fontFamily: 'Open Sans' }}>Open Sans</span></SelectItem>
                                  <SelectItem value="Montserrat"><span style={{ fontFamily: 'Montserrat' }}>Montserrat</span></SelectItem>
                                  <SelectItem value="Playfair Display"><span style={{ fontFamily: 'Playfair Display' }}>Playfair Display</span></SelectItem>
                                  <SelectItem value="Charm"><span style={{ fontFamily: 'Charm' }}>Charm</span></SelectItem>
                                  <SelectItem value="Pacifico"><span style={{ fontFamily: 'Pacifico' }}>Pacifico</span></SelectItem>
                                  <SelectItem value="Oswald"><span style={{ fontFamily: 'Oswald' }}>Oswald</span></SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight</Label>
                              <Select
                                value={selectedVar.fontWeight || "normal"}
                                onValueChange={(value: any) => updateVariable(selectedVar.id, { fontWeight: value })}
                              >
                                <SelectTrigger className="w-full h-10 bg-background border-2 border-input rounded-xl font-bold px-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="500">Medium</SelectItem>
                                  <SelectItem value="600">Semi Bold</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="900">Black</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size ({unit})</Label>
                              <Input 
                                type="number" 
                                value={selectedVar.fontSize} 
                                onChange={(e) => updateVariable(selectedVar.id, { fontSize: Number(e.target.value) })}
                                className="h-10 bg-background border-2 border-input rounded-xl font-bold" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Color</Label>
                              <div className="flex gap-2">
                                <Input 
                                  type="color" 
                                  value={selectedVar.color || "#000000"} 
                                  onChange={(e) => updateVariable(selectedVar.id, { color: e.target.value })}
                                  className="h-10 w-10 p-1 bg-background border-2 border-input rounded-xl cursor-pointer shrink-0" 
                                />
                                <Input 
                                  type="text" 
                                  value={selectedVar.color || "#000000"} 
                                  onChange={(e) => updateVariable(selectedVar.id, { color: e.target.value })}
                                  className="h-10 bg-background border-2 border-input rounded-xl font-bold font-mono px-2" 
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {(selectedVar.type === 'image' || selectedVar.type === 'signature') && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Object Fit</Label>
                            <div className="flex bg-background border-2 border-input p-1 rounded-xl">
                              {(["cover", "contain", "fill"] as const).map((fit) => (
                                <button
                                  key={fit}
                                  onClick={() => updateVariable(selectedVar.id, { objectFit: fit })}
                                  className={cn(
                                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                                    (selectedVar.objectFit || "cover") === fit ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-500 hover:text-slate-800"
                                  )}
                                >
                                  {fit}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Border Radius (px)</Label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={selectedVar.borderRadius || 0}
                                onChange={(e) => updateVariable(selectedVar.id, { borderRadius: Number(e.target.value) })}
                                className="flex-1 accent-primary"
                              />
                              <Input 
                                type="number" 
                                value={selectedVar.borderRadius || 0} 
                                onChange={(e) => updateVariable(selectedVar.id, { borderRadius: Number(e.target.value) })}
                                className="h-9 w-16 bg-background border-2 border-input rounded-lg font-bold text-center p-0" 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* LAYOUT SECTION */}
                  <AccordionItem value="layout" className="border-none bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Layout & Size</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pos X ({unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={Number(fromPx(selectedVar.x, unit)).toFixed(unit === "px" ? 0 : 2)} 
                          onChange={(e) => updateVariable(selectedVar.id, { x: toPx(parseFloat(e.target.value) || 0, unit) })} 
                          className="h-9 w-24 bg-background border-2 border-input rounded-lg font-bold px-3 text-right" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pos Y ({unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={Number(fromPx(selectedVar.y, unit)).toFixed(unit === "px" ? 0 : 2)} 
                          onChange={(e) => updateVariable(selectedVar.id, { y: toPx(parseFloat(e.target.value) || 0, unit) })} 
                          className="h-9 w-24 bg-background border-2 border-input rounded-lg font-bold px-3 text-right" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{selectedVar.type === 'text' ? 'Max W' : 'Width'} ({unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={selectedVar.width ? Number(fromPx(selectedVar.width, unit)).toFixed(unit === "px" ? 0 : 2) : ""} 
                          placeholder="Auto"
                          onChange={(e) => updateVariable(selectedVar.id, { width: e.target.value ? toPx(parseFloat(e.target.value), unit) : undefined })} 
                          className="h-9 w-24 bg-background border-2 border-input rounded-lg font-bold px-3 text-right" 
                        />
                      </div>
                      {(selectedVar.type === 'image' || selectedVar.type === 'signature' || selectedVar.type === 'qrcode') && (
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Height ({unit})</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={Number(fromPx(selectedVar.height || 0, unit)).toFixed(unit === "px" ? 0 : 2)} 
                            onChange={(e) => updateVariable(selectedVar.id, { height: toPx(parseFloat(e.target.value) || 0, unit) })} 
                            className="h-9 w-24 bg-background border-2 border-input rounded-lg font-bold px-3 text-right" 
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Layout className="h-5 w-5 text-primary" />Layout</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload value={backgroundUrl} onChange={setBackgroundUrl} label="Background" folder="RGYCSP/SuperAdmin/Documents" />
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Unit</Label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(["px", "in", "mm"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                        unit === u ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
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
                  className="w-full h-11 bg-slate-50 border-2 border-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-white rounded-xl font-bold px-3 focus:outline-none"
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
                    className="flex-1 rounded-xl font-bold h-10 dark:border-slate-800"
                    onClick={() => orientation !== "portrait" && toggleOrientation()}
                  >
                    Portrait
                  </Button>
                  <Button 
                    variant={orientation === "landscape" ? "default" : "outline"} 
                    className="flex-1 rounded-xl font-bold h-10 dark:border-slate-800"
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
                    className="h-11 bg-slate-50 border-2 border-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-white focus-visible:ring-0 rounded-xl font-bold" 
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
                    className="h-11 bg-slate-50 border-2 border-slate-50 dark:bg-slate-800 dark:border-slate-800 dark:text-white focus-visible:ring-0 rounded-xl font-bold" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="xl:col-span-9 flex flex-col items-center sticky top-0 h-[100vh]">
          <div className="w-full h-full overflow-auto p-10 bg-slate-100 dark:bg-zinc-950 rounded-[3rem] border-2 border-slate-200 dark:border-zinc-800 shadow-inner flex justify-start relative">
            <div className="relative shadow-2xl shrink-0 m-auto" style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}>
              <div 
                ref={canvasRef}
                className="relative bg-white overflow-hidden w-full h-full"
              >
                {backgroundUrl ? (
                  <img src={backgroundUrl || ""} crossOrigin="anonymous" alt="BG" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: "rgba(248, 250, 252, 0.5)", color: "#94a3b8" }}>
                     <Layout className="w-32 h-32" style={{ opacity: 0.2 }} />
                     <p className="font-black uppercase tracking-[0.2em] mt-4">Empty Canvas</p>
                  </div>
                )}

              {/* Bleed/Safe Area Guide (Visual Only) */}
              {!isPreview && (
                <>
                  <div 
                    className="absolute inset-[3mm] border border-dashed border-primary/20 pointer-events-none z-10"
                    title="3mm Bleed/Safe Area Guide"
                  />
                  {/* Center Crosshair Guide */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-dashed border-primary/30 pointer-events-none z-10" />
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-dashed border-primary/30 pointer-events-none z-10" />
                </>
              )}

              {variables.map((v) => (
                <DraggableElement 
                  key={v.id}
                  v={v}
                  isPreview={isPreview}
                  selectedId={selectedId}
                  onMouseDown={onMouseDown}
                  parseTextContent={parseTextContent}
                  parseQrContent={parseQrContent}
                  previewData={previewData}
                />
              ))}
            </div>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-8">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drag to Move</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select to Edit</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High-Res Print PDF</span></div>
          </div>
        </div>
      </div>
      <ExampleDataModal
        open={showExampleData}
        onOpenChange={setShowExampleData}
        previewData={previewData}
        setPreviewData={async (data) => {
          setPreviewData(data);
          await saveExampleData(data);
        }}
      />

      <ConfirmDialog 
        open={!!templateToDelete} 
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete Template"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{templateToDelete?.name}</strong>? This action cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive={true}
      />
    </div>
  );
}
