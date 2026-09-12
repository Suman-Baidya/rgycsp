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
  Copy,
  Filter
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [listSearch, setListSearch] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("ALL");

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
    const filteredTemplates = templates.filter(t => {
      const term = listSearch.toLowerCase();
      const matchesSearch = t.name?.toLowerCase().includes(term) || t.type?.toLowerCase().includes(term);
      const matchesType = listTypeFilter === "ALL" || t.type === listTypeFilter;
      return matchesSearch && matchesType;
    });

    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const distinctDocTypes = Array.from(new Set(templates.map(t => t.type))).length;
    const totalElements = templates.reduce((acc, t) => {
      if (Array.isArray(t.config)) return acc + t.config.length;
      if (typeof t.config === "string") {
        try { return acc + (JSON.parse(t.config).length || 0); } catch { return acc; }
      }
      return acc;
    }, 0);

    return (
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;700;900&display=swap');` }} />
        <AdminPageHeader 
          title="Document Templates" 
          description="Manage and architect premium printable layouts for certificates, ID cards, and official reports."
        >
          <Button 
            onClick={handleNewTemplate} 
            className="h-8 sm:h-9 px-3.5 rounded-lg gap-1.5 bg-primary text-primary-foreground font-semibold text-xs shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Template
          </Button>
        </AdminPageHeader>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Templates</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalTemplates.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Layouts:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">All registered</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Active Templates</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{activeTemplates.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Issuance:
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">Live in system</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                  <Layout className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Doc Types</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{distinctDocTypes.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Scope:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">Certificates & IDs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <Type className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Configured Elements</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalElements.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="text-[10px] text-slate-400">Variables:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Dynamic bindings</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-[300px] group">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <Input 
              placeholder="Search templates by name..." 
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg h-8 sm:h-9 font-normal text-[11px] sm:text-xs transition-all focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Select value={listTypeFilter} onValueChange={(val: string) => setListTypeFilter(val)}>
              <SelectTrigger className="w-[170px] h-8 sm:h-9 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="h-3 w-3 text-slate-400 shrink-0" />
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 dark:border-slate-700 shadow-md">
                <SelectItem value="ALL" className="text-xs">All Types</SelectItem>
                <SelectItem value="CERTIFICATE" className="text-xs">Certificate</SelectItem>
                <SelectItem value="MARKSHEET" className="text-xs">Marksheet</SelectItem>
                <SelectItem value="ADMIT_CARD" className="text-xs">Admit Card</SelectItem>
                <SelectItem value="STUDENT_ID" className="text-xs">Student ID Card</SelectItem>
                <SelectItem value="STAFF_ID" className="text-xs">Staff ID Card</SelectItem>
                <SelectItem value="FRANCHISE_ID" className="text-xs">Franchise ID</SelectItem>
                <SelectItem value="NOTICE_PAD" className="text-xs">Notice Pad</SelectItem>
                <SelectItem value="FRANCHISE_CERTIFICATE" className="text-xs">Franchise Certificate</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 h-8 sm:h-9 shrink-0">
              <FileText className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Results: <span className="text-slate-900 dark:text-white">{filteredTemplates.length}</span>
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin opacity-40" />
            <p className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Loading Templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Document Templates Found</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-xs text-center">Create your first certificate, ID card, or marksheet layout.</p>
            <Button onClick={handleNewTemplate} variant="outline" className="rounded-lg h-8 sm:h-9 px-4 text-xs font-semibold border-primary/20 text-primary">Create Template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                onClick={() => handleEditTemplate(template)}
                className="group border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 transition-all rounded-xl cursor-pointer bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between relative"
              >
                <div>
                  <div className="aspect-[3/2] relative bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
                    {template.background ? (
                      <img 
                        src={template.background || ""} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        alt={template.name} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 space-y-1">
                        <Layout className="w-6 h-6 opacity-40" />
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Blank Canvas</span>
                      </div>
                    )}
                    
                    {/* Top Right Quick Actions */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 px-2.5 rounded-md bg-white/95 dark:bg-slate-900/95 shadow-xs hover:bg-white text-slate-700 dark:text-slate-200 text-xs font-semibold"
                        onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-md shrink-0 shadow-xs"
                        onClick={(e) => handleDeleteClick(template, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3 sm:p-3.5 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider">
                        {template.type}
                      </Badge>
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer z-20 relative"
                        onClick={(e) => handleToggleStatus(template, e)}
                      >
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider", template.isActive ? "text-green-600 dark:text-green-400" : "text-slate-400")}>
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                        <Switch checked={!!template.isActive} className="scale-75 pointer-events-none" />
                      </div>
                    </div>

                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1">
                      {template.name}
                    </h4>
                  </CardContent>
                </div>

                <div className="p-3 sm:p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center"><Type className="h-2 w-2 text-blue-500" /></div>
                    <div className="w-4 h-4 rounded-full bg-purple-500/10 flex items-center justify-center"><ImageIcon className="h-2 w-2 text-purple-500" /></div>
                    <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center"><QrCode className="h-2 w-2 text-green-500" /></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {Array.isArray(template.config) 
                      ? template.config.length 
                      : (typeof template.config === 'string' ? (
                          (() => { try { return JSON.parse(template.config).length || 0; } catch { return 0; } })()
                        ) : 0)
                    } Elements
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <ConfirmDialog 
          open={!!templateToDelete}
          onOpenChange={(open) => !open && setTemplateToDelete(null)}
          title="Delete Template"
          description={`Are you sure you want to permanently delete "${templateToDelete?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete Template"
          destructive={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;700;900&display=swap');` }} />
      <AdminPageHeader 
        title={templateName} 
        description={`Designing ${templateType.toLowerCase()} layout with pixel precision.`}
      >
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button variant="ghost" onClick={() => setView("list")} className="h-8 sm:h-9 px-3 rounded-lg gap-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowExampleData(true)} 
            className="h-8 sm:h-9 px-3 rounded-lg gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Example Data
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)} 
            className={cn("h-8 sm:h-9 px-3 rounded-lg gap-1.5 text-xs font-semibold", isPreview && "bg-primary/5 border-primary text-primary")}
          >
            {isPreview ? <Settings2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-slate-500" />}
            {isPreview ? "Edit Layout" : "Live Preview"}
          </Button>
          <Button 
            onClick={downloadPDF} 
            className="h-8 sm:h-9 px-3.5 rounded-lg gap-1.5 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-8 sm:h-9 px-3.5 rounded-lg gap-1.5 bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Designer Sidebar */}
        <div className="xl:col-span-3 space-y-4 sticky top-0 h-[100vh] overflow-y-auto custom-scrollbar pr-1 pb-4">
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-primary" />
                Template Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3">
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Design Name</Label>
                  <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="h-8 sm:h-9 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-xs rounded-lg font-medium" />
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Doc Type</Label>
                  <Select
                    value={templateType}
                    onValueChange={(value: any) => setTemplateType(value)}
                  >
                    <SelectTrigger className="w-full h-8 sm:h-9 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-xs rounded-lg font-medium px-2.5">
                      <SelectValue placeholder="Select document type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CERTIFICATE" className="text-xs">Students Certificate</SelectItem>
                      <SelectItem value="MARKSHEET" className="text-xs">Marksheet</SelectItem>
                      <SelectItem value="ADMIT_CARD" className="text-xs">Admit Card</SelectItem>
                      <SelectItem value="STUDENT_ID" className="text-xs">Student ID Card</SelectItem>
                      <SelectItem value="STAFF_ID" className="text-xs">Staff Id Card</SelectItem>
                      <SelectItem value="FRANCHISE_ID" className="text-xs">Franchise Owner ID</SelectItem>
                      <SelectItem value="NOTICE_PAD" className="text-xs">Notice Pad</SelectItem>
                      <SelectItem value="FRANCHISE_CERTIFICATE" className="text-xs">Franchises Certificate</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" />
                Add Components
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addVariable("text")} className="h-auto py-2.5 flex-col gap-1 rounded-lg hover:bg-primary/5 text-xs font-medium border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center"><Type className="h-3.5 w-3.5 text-blue-600" /></div>
                <span>Text</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("image")} className="h-auto py-2.5 flex-col gap-1 rounded-lg hover:bg-primary/5 text-xs font-medium border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center"><ImageIcon className="h-3.5 w-3.5 text-purple-600" /></div>
                <span>Image / Sign</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("qrcode")} className="h-auto py-2.5 flex-col gap-1 rounded-lg hover:bg-primary/5 text-xs font-medium border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center"><QrCode className="h-3.5 w-3.5 text-green-600" /></div>
                <span>QR Code</span>
              </Button>
              <Button variant="outline" onClick={() => addVariable("attendance_qr")} className="h-auto py-2.5 flex-col gap-1 rounded-lg hover:bg-indigo-50 border-indigo-200 dark:border-indigo-900 text-xs font-medium">
                <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center"><QrCode className="h-3.5 w-3.5 text-indigo-600" /></div>
                <span>Scanner QR</span>
              </Button>
            </CardContent>
          </Card>

          {selectedVar && (
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Properties</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => duplicateVariable(selectedVar.id)} className="h-7 w-7 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg" title="Duplicate Element">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeVariable(selectedVar.id)} className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete Element">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4">
                <Accordion key={selectedVar.id} multiple defaultValue={["data", "appearance", "layout"]} className="w-full space-y-2">
                  
                  {/* DATA SECTION */}
                  <AccordionItem value="data" className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Data Source</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-3 pt-1">
                      {selectedVar.type === 'qrcode' ? (
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">QR Code Content</Label>
                          <textarea 
                            value={selectedVar.qrContentTemplate || ""}
                            onChange={(e) => updateVariable(selectedVar.id, { qrContentTemplate: e.target.value })}
                            className="w-full h-20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs resize-none focus:outline-none focus:border-primary/50"
                            placeholder="e.g. Name: {studentName}&#10;Reg: {registrationNo}"
                          />
                          <p className="text-[10px] text-slate-400 font-medium">Use {'{variableName}'} to insert dynamic data.</p>
                        </div>
                      ) : selectedVar.type === 'text' ? (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Content Format</Label>
                            <textarea 
                              value={selectedVar.textContent !== undefined ? selectedVar.textContent : `{${selectedVar.name}}`}
                              onChange={(e) => updateVariable(selectedVar.id, { textContent: e.target.value })}
                              className="w-full h-20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs resize-none focus:outline-none focus:border-primary/50"
                              placeholder="e.g. <i>C/o</i> <b>{fatherName}</b>"
                            />
                            <p className="text-[10px] text-slate-400 font-medium">Use {'{variableName}'} for data. You can use HTML &lt;b&gt;, &lt;i&gt; tags.</p>
                          </div>
                          
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Insert Variable</Label>
                            <Select
                              key={quickInsertKey}
                              onValueChange={(value: any) => {
                                if (!value) return;
                                const current = selectedVar.textContent !== undefined ? selectedVar.textContent : `{${selectedVar.name}}`;
                                updateVariable(selectedVar.id, { textContent: current + `{${value}}` });
                                setQuickInsertKey(prev => prev + 1);
                              }}
                            >
                              <SelectTrigger className="w-full h-8 sm:h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2.5 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Select to insert..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {VARIABLE_GROUPS.map((group) => {
                                  const filteredItems = group.items.filter(item => !['studentPhoto', 'studentSign', 'centerHeadSign', 'franchiseOwnerPhoto', 'franchiseOwnerSign', 'staffPhoto', 'staffSign', 'principalSign'].includes(item.id));
                                  if (filteredItems.length === 0) return null;
                                  return (
                                    <div key={group.label} className="py-1">
                                      <div className="font-bold text-[11px] text-white uppercase tracking-wider bg-slate-900 dark:bg-black py-1.5 px-2 sticky top-0 z-10">{group.label}</div>
                                      {filteredItems.map((item) => (
                                        <SelectItem key={item.id} value={item.id} className="text-xs cursor-pointer py-1.5 pl-5">
                                          {item.label} <span className="text-[10px] text-slate-400 font-mono ml-1.5">({item.id})</span>
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
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Binding Variable</Label>
                          <Select
                            value={selectedVar.name}
                            onValueChange={(value: any) => updateVariable(selectedVar.id, { name: value })}
                          >
                            <SelectTrigger className="w-full h-8 sm:h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2.5 focus:ring-0 focus:ring-offset-0">
                              <SelectValue placeholder="Select variable..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {VARIABLE_GROUPS.map((group) => {
                                const imageKeys = ['studentPhoto', 'studentSign', 'centerHeadSign', 'franchiseOwnerPhoto', 'franchiseOwnerSign', 'staffPhoto', 'staffSign', 'principalSign'];
                                const filteredItems = group.items.filter(item => imageKeys.includes(item.id));
                                if (filteredItems.length === 0) return null;
                                return (
                                  <div key={group.label} className="py-1">
                                    <div className="font-bold text-[11px] text-white uppercase tracking-wider bg-slate-900 dark:bg-black py-1.5 px-2 sticky top-0 z-10">{group.label}</div>
                                    {filteredItems.map((item) => (
                                      <SelectItem key={item.id} value={item.id} className="text-xs cursor-pointer py-1.5 pl-5">
                                        {item.label} <span className="text-[10px] text-slate-400 font-mono ml-1.5">({item.id})</span>
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
                  <AccordionItem value="appearance" className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Appearance</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-3 pt-1">
                      {selectedVar.type === 'text' && (
                        <>
                          <div className="space-y-1 col-span-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Line Height</Label>
                              <span className="text-[10px] font-semibold text-slate-400">{selectedVar.lineHeight || 1}</span>
                            </div>
                            <input 
                              type="range"
                              min="0.5"
                              max="4"
                              step="0.1"
                              value={selectedVar.lineHeight || 1}
                              onChange={(e) => updateVariable(selectedVar.id, { lineHeight: parseFloat(e.target.value) })}
                              className="w-full accent-primary h-1.5"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Align</Label>
                              <Select
                                value={selectedVar.textAlign || "left"}
                                onValueChange={(value: any) => updateVariable(selectedVar.id, { textAlign: value })}
                              >
                                <SelectTrigger className="w-full h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left" className="text-xs">Left</SelectItem>
                                  <SelectItem value="center" className="text-xs">Center</SelectItem>
                                  <SelectItem value="right" className="text-xs">Right</SelectItem>
                                  <SelectItem value="justify" className="text-xs">Justify</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weight</Label>
                              <Select
                                value={selectedVar.fontWeight || "normal"}
                                onValueChange={(value: any) => updateVariable(selectedVar.id, { fontWeight: value })}
                              >
                                <SelectTrigger className="w-full h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal" className="text-xs">Normal</SelectItem>
                                  <SelectItem value="500" className="text-xs">Medium</SelectItem>
                                  <SelectItem value="600" className="text-xs">Semi Bold</SelectItem>
                                  <SelectItem value="bold" className="text-xs">Bold</SelectItem>
                                  <SelectItem value="900" className="text-xs">Black</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Font Family</Label>
                              <Select
                                value={selectedVar.fontFamily || "Inter"}
                                onValueChange={(value: any) => updateVariable(selectedVar.id, { fontFamily: value })}
                              >
                                <SelectTrigger className="w-full h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Inter" className="text-xs"><span style={{ fontFamily: 'Inter' }}>Inter (Default)</span></SelectItem>
                                  <SelectItem value="Roboto" className="text-xs"><span style={{ fontFamily: 'Roboto' }}>Roboto</span></SelectItem>
                                  <SelectItem value="Open Sans" className="text-xs"><span style={{ fontFamily: 'Open Sans' }}>Open Sans</span></SelectItem>
                                  <SelectItem value="Montserrat" className="text-xs"><span style={{ fontFamily: 'Montserrat' }}>Montserrat</span></SelectItem>
                                  <SelectItem value="Playfair Display" className="text-xs"><span style={{ fontFamily: 'Playfair Display' }}>Playfair Display</span></SelectItem>
                                  <SelectItem value="Charm" className="text-xs"><span style={{ fontFamily: 'Charm' }}>Charm</span></SelectItem>
                                  <SelectItem value="Pacifico" className="text-xs"><span style={{ fontFamily: 'Pacifico' }}>Pacifico</span></SelectItem>
                                  <SelectItem value="Oswald" className="text-xs"><span style={{ fontFamily: 'Oswald' }}>Oswald</span></SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Size ({unit})</Label>
                              <Input 
                                type="number" 
                                value={selectedVar.fontSize} 
                                onChange={(e) => updateVariable(selectedVar.id, { fontSize: Number(e.target.value) })}
                                className="h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium" 
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Color</Label>
                              <div className="flex gap-1.5">
                                <Input 
                                  type="color" 
                                  value={selectedVar.color || "#000000"} 
                                  onChange={(e) => updateVariable(selectedVar.id, { color: e.target.value })}
                                  className="h-8 w-8 p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shrink-0" 
                                />
                                <Input 
                                  type="text" 
                                  value={selectedVar.color || "#000000"} 
                                  onChange={(e) => updateVariable(selectedVar.id, { color: e.target.value })}
                                  className="h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono px-2 min-w-0" 
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {(selectedVar.type === 'image' || selectedVar.type === 'signature') && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Object Fit</Label>
                            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 rounded-lg">
                              {(["cover", "contain", "fill"] as const).map((fit) => (
                                <button
                                  key={fit}
                                  onClick={() => updateVariable(selectedVar.id, { objectFit: fit })}
                                  className={cn(
                                    "flex-1 py-1 text-xs font-medium rounded-md transition-all capitalize",
                                    (selectedVar.objectFit || "cover") === fit ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                  )}
                                >
                                  {fit}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Border Radius (px)</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={selectedVar.borderRadius || 0}
                                onChange={(e) => updateVariable(selectedVar.id, { borderRadius: Number(e.target.value) })}
                                className="flex-1 accent-primary h-1.5"
                              />
                              <Input 
                                type="number" 
                                value={selectedVar.borderRadius || 0} 
                                onChange={(e) => updateVariable(selectedVar.id, { borderRadius: Number(e.target.value) })}
                                className="h-8 w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-center p-0" 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* LAYOUT SECTION */}
                  <AccordionItem value="layout" className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Layout & Size</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2.5 pb-3 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pos X ({unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={Number(fromPx(selectedVar.x, unit)).toFixed(unit === "px" ? 0 : 2)} 
                          onChange={(e) => updateVariable(selectedVar.id, { x: toPx(parseFloat(e.target.value) || 0, unit) })} 
                          className="h-8 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2 text-right" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pos Y ({unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={Number(fromPx(selectedVar.y, unit)).toFixed(unit === "px" ? 0 : 2)} 
                          onChange={(e) => updateVariable(selectedVar.id, { y: toPx(parseFloat(e.target.value) || 0, unit) })} 
                          className="h-8 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2 text-right" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedVar.type === 'text' ? 'Max W' : 'Width'} ({unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={selectedVar.width ? Number(fromPx(selectedVar.width, unit)).toFixed(unit === "px" ? 0 : 2) : ""} 
                          placeholder="Auto"
                          onChange={(e) => updateVariable(selectedVar.id, { width: e.target.value ? toPx(parseFloat(e.target.value), unit) : undefined })} 
                          className="h-8 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2 text-right" 
                        />
                      </div>
                      {(selectedVar.type === 'image' || selectedVar.type === 'signature' || selectedVar.type === 'qrcode') && (
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Height ({unit})</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={Number(fromPx(selectedVar.height || 0, unit)).toFixed(unit === "px" ? 0 : 2)} 
                            onChange={(e) => updateVariable(selectedVar.id, { height: toPx(parseFloat(e.target.value) || 0, unit) })} 
                            className="h-8 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium px-2 text-right" 
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          )}

          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Layout className="h-4 w-4 text-primary" />Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3.5">
              <ImageUpload value={backgroundUrl} onChange={setBackgroundUrl} label="Background" folder="RGYCSP/SuperAdmin/Documents" />
              
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preferred Unit</Label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  {(["px", "in", "mm"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        "flex-1 py-1 text-xs font-semibold rounded-md transition-all",
                        unit === u ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Page Size Preset</Label>
                <select 
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="w-full h-8 sm:h-9 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-xs rounded-lg font-medium px-2.5 focus:outline-none"
                >
                  <option value="CUSTOM">Custom Size</option>
                  {Object.keys(PAGE_PRESETS).map(key => (
                    <option key={key} value={key}>{PAGE_PRESETS[key].name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orientation</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={orientation === "portrait" ? "default" : "outline"} 
                    className="flex-1 rounded-lg text-xs font-semibold h-8"
                    onClick={() => orientation !== "portrait" && toggleOrientation()}
                  >
                    Portrait
                  </Button>
                  <Button 
                    variant={orientation === "landscape" ? "default" : "outline"} 
                    className="flex-1 rounded-lg text-xs font-semibold h-8"
                    onClick={() => orientation !== "landscape" && toggleOrientation()}
                  >
                    Landscape
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Width ({unit})</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={Number(fromPx(canvasSize.width, unit)).toFixed(unit === "px" ? 0 : 2)} 
                    onChange={(e) => {
                      setCanvasSize({ ...canvasSize, width: toPx(parseFloat(e.target.value) || 0, unit) });
                      setPageSize("CUSTOM");
                    }} 
                    className="h-8 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg text-xs font-medium" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Height ({unit})</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={Number(fromPx(canvasSize.height, unit)).toFixed(unit === "px" ? 0 : 2)} 
                    onChange={(e) => {
                      setCanvasSize({ ...canvasSize, height: toPx(parseFloat(e.target.value) || 0, unit) });
                      setPageSize("CUSTOM");
                    }} 
                    className="h-8 bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg text-xs font-medium" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="xl:col-span-9 flex flex-col items-center sticky top-0 h-[100vh]">
          <div className="w-full h-full overflow-auto p-6 sm:p-8 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner flex justify-start relative">
            <div className="relative shadow-xl shrink-0 m-auto" style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}>
              <div 
                ref={canvasRef}
                className="relative bg-white overflow-hidden w-full h-full"
              >
                {backgroundUrl ? (
                  <img src={backgroundUrl || ""} crossOrigin="anonymous" alt="BG" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: "rgba(248, 250, 252, 0.5)", color: "#94a3b8" }}>
                     <Layout className="w-24 h-24" style={{ opacity: 0.2 }} />
                     <p className="font-bold uppercase tracking-widest mt-3 text-xs">Empty Canvas</p>
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
          <div className="mt-3 flex items-center gap-5 sm:gap-6">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Drag to Move</span></div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /><span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Select to Edit</span></div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">High-Res Print PDF</span></div>
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
