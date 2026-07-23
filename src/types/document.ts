export interface DocVariable {
  id: string;
  name: string;
  type: "text" | "image" | "signature" | "qrcode";
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  lineHeight?: number;
  width?: number;
  height?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  qrContentTemplate?: string;
  textContent?: string;
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: number;
}
