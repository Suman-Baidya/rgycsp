"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { uploadImage } from "@/app/actions/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  maxSizeK?: number; // In KB
  rawUpload?: boolean; // When true, bypasses canvas downscaling & compression to preserve 100% lossless print quality
  compact?: boolean;
  hideFootnote?: boolean;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  folder = "RGYCSP/Uncategorized", 
  label,
  maxSizeK = 10240, // Default 10MB
  rawUpload = false,
  compact = false,
  hideFootnote = false,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file: File, targetSizeK: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          
          // For smaller target sizes (like 100KB), we might want smaller dimensions
          let MAX_WIDTH = 1200;
          let MAX_HEIGHT = 1200;
          
          if (targetSizeK <= 200) {
            MAX_WIDTH = 800;
            MAX_HEIGHT = 800;
          }

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Adjust quality based on target size
          let quality = 0.8;
          if (targetSizeK <= 100) quality = 0.5; // More aggressive compression for small targets
          else if (targetSizeK <= 500) quality = 0.6;
          else if (targetSizeK <= 1024) quality = 0.7;

          const compressedBase64 = canvas.toDataURL("image/webp", quality);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxAllowedBytes = maxSizeK * 1024;
    if (file.size > maxAllowedBytes) {
      toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed: ${displaySize}`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("folder", folder);

      if (rawUpload) {
        // Stream raw binary File directly to preserve 100% original high-resolution print quality
        formData.append("preserveQuality", "true");
        formData.append("file", file);
      } else {
        const compressedBase64 = await compressImage(file, maxSizeK);
        
        // Calculate size of base64
        const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
        const sizeInK = sizeInBytes / 1024;

        if (sizeInK > maxSizeK) {
          toast.error(`Image is still too large (${Math.round(sizeInK)}KB). Max allowed: ${maxSizeK}KB. Please try a smaller image.`);
          setIsUploading(false);
          return;
        }

        formData.append("file", compressedBase64);
      }

      // Stream file upload via API endpoint (avoids Server Action serialization limits for large templates)
      let result: { success: boolean; url?: string; error?: string };
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        result = await res.json();
      } catch (fetchErr: any) {
        console.warn("API upload failed, attempting fallback:", fetchErr);
        const payload = rawUpload
          ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
          : (formData.get("file") as string);
        result = await uploadImage(payload, folder, { preserveQuality: rawUpload });
      }

      if (result.success && result.url) {
        onChange(result.url);
        toast.success(rawUpload ? "High-definition template uploaded successfully" : "Image uploaded and optimized");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Image upload/processing error:", error);
      toast.error(error?.message || "Error processing image");
    } finally {
      setIsUploading(false);
    }
  };

  const displaySize = maxSizeK >= 1024 ? `${(maxSizeK / 1024).toFixed(0)}MB` : `${maxSizeK}KB`;

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-4", "w-full", className)}>
      {label && (
        <p className={cn(compact ? "text-xs font-bold text-slate-700 dark:text-slate-300" : "text-sm font-semibold text-foreground/80")}>
          {label}
        </p>
      )}
      
      {!value ? (
        <div className="relative group w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={isUploading}
          />
          <div className={cn(
            compact 
              ? "h-24 w-full rounded-xl border-2 border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center gap-1.5 transition-all group-hover:border-primary/40 group-hover:bg-primary/5"
              : "h-32 w-full rounded-2xl border-2 border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center gap-2 transition-all group-hover:border-primary/40 group-hover:bg-primary/5",
            isUploading && "opacity-50 pointer-events-none"
          )}>
            {isUploading ? (
              <Loader2 className={cn(compact ? "h-5 w-5" : "h-8 w-8", "animate-spin text-primary")} />
            ) : (
              <>
                <div className={cn(compact ? "p-1.5 rounded-lg" : "p-3 rounded-full", "bg-white dark:bg-zinc-900 shadow-sm border")}>
                  <Upload className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-primary")} />
                </div>
                <div className="text-center px-2">
                  <p className={cn(compact ? "text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200" : "text-sm font-bold")}>
                    {compact ? "Click to upload" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {rawUpload ? `Lossless (Max ${displaySize})` : `Max ${displaySize}`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={cn(
          "relative w-full rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30 group shadow-md",
          compact ? "aspect-video max-h-24" : "max-w-sm aspect-video rounded-2xl shadow-xl"
        )}>
          <NextImage src={value} alt="Preview" fill className="object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <Button
              type="button"
              variant="destructive"
              size={compact ? "sm" : "default"}
              className={cn(compact ? "h-7 text-xs px-2.5 rounded-lg font-semibold" : "rounded-xl font-bold")}
              onClick={() => onRemove ? onRemove() : onChange("")}
            >
              <X className={cn(compact ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2")} /> Remove
            </Button>
          </div>
        </div>
      )}
      
      {!hideFootnote && (
        <p className="text-[10px] text-muted-foreground italic">
          {rawUpload
            ? `* 100% Original High-Definition Quality preserved without compression (Print-Ready, Max ${displaySize}).`
            : `* Image will be automatically optimized and compressed to under ${displaySize}.`
          }
        </p>
      )}
    </div>
  );
}
