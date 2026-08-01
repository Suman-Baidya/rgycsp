import React from "react";
import { QrCode, Image as ImageIcon, Signature } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { DocVariable } from "@/types/document";

interface DraggableElementProps {
  v: DocVariable;
  isPreview: boolean;
  selectedId: string | null;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  parseTextContent: (v: DocVariable) => string;
  parseQrContent: (template?: string) => string;
  previewData: Record<string, string>;
}

export const DraggableElement = React.memo(({ 
  v, 
  isPreview, 
  selectedId, 
  onMouseDown, 
  parseTextContent, 
  parseQrContent, 
  previewData 
}: DraggableElementProps) => {
  return (
    <div
      id={`var-${v.id}`}
      onMouseDown={(e) => onMouseDown(e, v.id)}
      className={cn(
        "absolute cursor-move select-none",
        !isPreview && selectedId === v.id ? "ring-2 ring-primary ring-offset-2 z-50" : "z-40"
      )}
      style={{ 
        left: `${v.x}px`, 
        top: `${v.y}px`,
        transform: (!v.width && v.type === "text") 
          ? (v.textAlign === "center" ? "translateX(-50%)" : v.textAlign === "right" ? "translateX(-100%)" : "none")
          : "none"
      }}
    >
      {v.type === "text" ? (
        <span 
          style={{
            fontSize: `${v.fontSize}px`,
            fontWeight: v.fontWeight,
            fontFamily: v.fontFamily || "Inter",
            color: v.color,
            whiteSpace: v.width ? "pre-wrap" : "pre",
            width: v.width ? `${v.width}px` : "auto",
            display: "block",
            textAlign: v.textAlign || "left",
            lineHeight: v.lineHeight || 1,
            margin: 0,
            padding: 0
          }}
          dangerouslySetInnerHTML={{ __html: parseTextContent(v) }}
        />
      ) : (
        <div 
          style={{ 
            width: `${v.width}px`, 
            height: `${v.height}px`,
            backgroundColor: !isPreview ? "rgba(241, 245, 249, 0.5)" : "transparent",
            border: !isPreview ? "2px dashed #cbd5e1" : "none"
          }} 
          className="flex items-center justify-center overflow-hidden"
        >
          {isPreview ? (
            v.type === "qrcode" ? (
              <QRCodeSVG
                value={parseQrContent(v.qrContentTemplate)}
                size={Math.min(v.width || 100, v.height || 100)}
                level="H"
                includeMargin={false}
              />
            ) : (
              <img 
                src={previewData[v.name] || ""} 
                crossOrigin="anonymous" 
                className="w-full h-full" 
                style={{ 
                  objectFit: v.objectFit || "fill",
                  borderRadius: v.borderRadius !== undefined ? `${v.borderRadius}px` : "0"
                }}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-1" style={{ opacity: 0.4 }}>
              {v.type === "qrcode" ? <QrCode className="h-6 w-6" /> : v.type === "image" ? <ImageIcon className="h-6 w-6" /> : <Signature className="h-6 w-6" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the specific variable changed, or global preview states changed
  return (
    prevProps.v === nextProps.v &&
    prevProps.isPreview === nextProps.isPreview &&
    (prevProps.selectedId === prevProps.v.id) === (nextProps.selectedId === nextProps.v.id) &&
    prevProps.previewData === nextProps.previewData
  );
});

DraggableElement.displayName = "DraggableElement";
