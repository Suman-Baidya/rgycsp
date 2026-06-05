"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
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
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  folder = "RGYCSP/Uncategorized", 
  label,
  maxSizeK = 10240 // Default 10MB
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

    // Check raw file size before compression as a first pass
    // (Optional: we can allow larger raw files if we compress them)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File is too large (Max 20MB raw)");
      return;
    }

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file, maxSizeK);
      
      // Calculate size of base64
      const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
      const sizeInK = sizeInBytes / 1024;

      if (sizeInK > maxSizeK) {
        toast.error(`Image is still too large (${Math.round(sizeInK)}KB). Max allowed: ${maxSizeK}KB. Please try a smaller image.`);
        setIsUploading(false);
        return;
      }

      const result = await uploadImage(compressedBase64, folder);
      
      if (result.success && result.url) {
        onChange(result.url);
        toast.success("Image uploaded and optimized");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Error processing image");
    } finally {
      setIsUploading(false);
    }
  };

  const displaySize = maxSizeK >= 1024 ? `${(maxSizeK / 1024).toFixed(0)}MB` : `${maxSizeK}KB`;

  return (
    <div className="space-y-4 w-full">
      {label && <p className="text-sm font-semibold text-foreground/80">{label}</p>}
      
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
            "h-32 w-full rounded-2xl border-2 border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center gap-2 transition-all group-hover:border-primary/40 group-hover:bg-primary/5",
            isUploading && "opacity-50 pointer-events-none"
          )}>
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-full shadow-sm border">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-bold">Click to upload or drag and drop</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Images only (Max {displaySize})</p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted/30 group shadow-xl">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
             <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-bold"
              onClick={() => onRemove ? onRemove() : onChange("")}
            >
              <X className="h-4 w-4 mr-2" /> Remove Image
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-[10px] text-muted-foreground italic">
        * Image will be automatically optimized and compressed to under {displaySize}.
      </p>
    </div>
  );
}
