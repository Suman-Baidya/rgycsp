"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/app/actions/upload";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, folder = "ABCDEdutHub/super-admin", label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await uploadImage(base64, folder);
      setIsUploading(false);

      if (result.success && result.url) {
        onChange(result.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Upload failed");
      }
    };
  };

  return (
    <div className="space-y-3 w-full">
      {label && <p className="text-sm font-semibold text-foreground/80">{label}</p>}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Input 
            value={value || ""} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="Paste image URL or upload"
            className="h-12 bg-background border-border/40 rounded-2xl flex-1"
          />
          <div className="relative group shrink-0">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="h-12 w-12 rounded-2xl border-dashed border-2 p-0 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all"
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
            </Button>
          </div>
        </div>

        {value && (
          <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-border/40 bg-muted/30 group shadow-sm">
            <img src={value} alt="Preview" className="w-full h-full object-contain p-2" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
