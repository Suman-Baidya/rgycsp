"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Package,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Loader2,
  IndianRupee,
  Settings,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Tags,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/product";
import {
  createProductCategory,
  deleteProductCategory,
  updateProductCategory,
} from "@/app/actions/product-category";
import { updateOrderStatus } from "@/app/actions/product-order";
import { updateStoreConfig } from "@/app/actions/store-config";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ProductsClient({
  initialProducts,
  initialOrders,
  initialCategories,
  initialConfig,
}: {
  initialProducts: any[];
  initialOrders: any[];
  initialCategories: any[];
  initialConfig: any;
}) {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "config">("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const [categories, setCategories] = React.useState(initialCategories);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const showConfirm = (title: string, description: React.ReactNode, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, description, onConfirm });
  };

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  React.useEffect(() => {
    setCurrentPageOrders(1);
  }, [searchTerm, activeTab]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: initialCategories[0]?.name || "Uniforms",
    image: "",
    isActive: true,
    variants: [{ name: "Standard", price: "0", stock: "0" }],
  });

  const [configForm, setConfigForm] = useState({
    shippingCost: initialConfig?.shippingCost || 0,
    paymentQrCode: initialConfig?.paymentQrCode || "",
    paymentDetails: initialConfig?.paymentDetails || "",
  });

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateStoreConfig(
      configForm.shippingCost,
      configForm.paymentQrCode,
      configForm.paymentDetails
    );
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Store configuration updated!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const filteredProducts = initialProducts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrders = initialOrders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const franchiseName = o.workspace?.name?.toLowerCase() || "";
    const orderId = o.id?.toLowerCase() || "";
    const itemsMatch = o.items?.some((item: any) =>
      item.productVariant?.product?.title?.toLowerCase().includes(term)
    );
    return franchiseName.includes(term) || orderId.includes(term) || itemsMatch;
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createProduct(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Product created successfully!");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        category: initialCategories[0]?.name || "Uniforms",
        image: "",
        isActive: true,
        variants: [{ name: "Standard", price: "0", stock: "0" }],
      });
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleProductUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    const result = await updateProduct(selectedProduct.id, selectedProduct);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Product updated successfully!");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleProductDelete = async () => {
    if (!selectedProduct) return;
    showConfirm(
      "Delete Product",
      <>
        Are you sure you want to delete{" "}
        <strong className="text-slate-900 dark:text-white">{selectedProduct.title}</strong>?
        This action cannot be undone.
      </>,
      async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setIsSubmitting(true);
        const result = await deleteProduct(selectedProduct.id);
        setIsSubmitting(false);

        if (result.success) {
          toast.success("Product deleted");
          setEditOpen(false);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    );
  };

  const handleOrderUpdate = async (status: string, paymentStatus: string) => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    const result = await updateOrderStatus(selectedOrder.id, status, paymentStatus);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Order status updated!");
      setOrderModalOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let result;
    if (editingCategoryId) {
      result = await updateProductCategory(editingCategoryId, categoryForm);
    } else {
      result = await createProductCategory(categoryForm);
    }
    setIsSubmitting(false);

    if (result.success) {
      toast.success(editingCategoryId ? "Category updated!" : "Category created!");

      if (editingCategoryId) {
        setCategories((prev: any[]) =>
          prev.map((c) =>
            c.id === editingCategoryId ? { ...c, name: categoryForm.name } : c
          )
        );
      } else if (result.data) {
        setCategories((prev: any[]) => [...prev, result.data]);
      }

      setFormData((prev: any) => ({ ...prev, category: categoryForm.name }));
      if (selectedProduct) {
        setSelectedProduct((prev: any) => ({ ...prev, category: categoryForm.name }));
      }

      setCategoryForm({ name: "" });
      setEditingCategoryId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name });
  };

  const handleCategoryDelete = async (id: string, name: string) => {
    showConfirm(
      "Delete Category",
      <>
        Are you sure you want to delete category{" "}
        <strong className="text-slate-900 dark:text-white">{name}</strong>? Existing products
        will retain their category name.
      </>,
      async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setIsSubmitting(true);
        const result = await deleteProductCategory(id);
        setIsSubmitting(false);

        if (result.success) {
          toast.success("Category deleted");
          setCategories((prev: any[]) => prev.filter((c) => c.id !== id));
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    );
  };

  // Calculate Statistics
  const totalProducts = initialProducts.length;
  const activeOrders = initialOrders.filter(
    (o) => o.status === "PENDING" || o.status === "APPROVED"
  ).length;
  const totalRevenue = initialOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const downloadPdf = async (htmlContent: string, filename: string) => {
    toast.loading("Generating PDF...", { id: "pdf-gen" });
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(htmlContent).save();
      toast.success("Downloaded successfully!", { id: "pdf-gen" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.", { id: "pdf-gen" });
    }
  };

  const printDeliveryLabel = (order: any) => {
    let addressHtml = order.shippingAddress || "Not provided.";
    let phoneHtml = "";
    try {
      const parsed = JSON.parse(order.shippingAddress);
      if (parsed.pin) {
        phoneHtml = parsed.phone
          ? `<div style="font-size: 16px; margin-bottom: 8px;"><strong>Phone:</strong> ${parsed.phone}</div>`
          : "";
        addressHtml = `
          <div style="font-size: 18px; line-height: 1.6;">
            <div>${parsed.vill}</div>
            ${parsed.landmark ? `<div><strong>Landmark:</strong> ${parsed.landmark}</div>` : ""}
            <div><strong>PO:</strong> ${parsed.po}</div>
            <div>${parsed.district}, ${parsed.state}</div>
            <div style="font-size: 24px; font-weight: 800; margin-top: 8px;">PIN: ${parsed.pin}</div>
          </div>
        `;
      }
    } catch {}

    const html = `
      <div style="padding: 40px; background: white; font-family: 'Arial', sans-serif; color: #000;">
        <div style="max-width: 500px; margin: 0 auto; border: 3px solid #000; border-radius: 12px; padding: 40px; box-sizing: border-box;">
          <div style="font-size: 24px; font-weight: 900; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; letter-spacing: 2px;">DELIVERY ADDRESS</div>
          <div style="margin-bottom: 40px;">
            <div style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 12px;">TO</div>
            <div style="font-size: 28px; font-weight: 800; margin-bottom: 12px;">${order.workspace.name}</div>
            ${order.workspace.centerCode ? `<div style="font-size: 16px; margin-bottom: 8px; color: #444;"><strong>Center Code:</strong> ${order.workspace.centerCode}</div>` : ""}
            ${phoneHtml}
            ${addressHtml}
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ccc; font-size: 14px; color: #555; display: flex; justify-content: space-between;">
            <div>Order No: #${order.id.slice(-8).toUpperCase()}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    `;

    downloadPdf(html, `Delivery-Label-${order.id.slice(-8)}.pdf`);
  };

  const printInvoice = (order: any) => {
    const html = `
      <div style="padding: 40px; font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; background: #fff;">
        <div style="max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
            <div>
              <h1 style="margin: 0 0 10px 0; font-size: 32px; color: #0f172a; font-weight: 900; letter-spacing: -1px;">TAX INVOICE</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Original for Recipient</p>
            </div>
            <div style="text-align: right; color: #64748b; font-size: 14px;">
              <p style="margin: 4px 0;"><strong>Invoice No:</strong> #${order.id.slice(-8).toUpperCase()}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 24px; border-radius: 8px;">
            <div>
              <h3 style="margin: 0 0 8px 0; color: #475569; font-size: 12px; text-transform: uppercase;">Billed To:</h3>
              <p style="margin: 4px 0; color: #0f172a; font-weight: 600; font-size: 16px;">${order.workspace.name}</p>
              ${order.workspace.centerCode ? `<p style="margin: 4px 0; color: #64748b; font-size: 14px;">Center Code: ${order.workspace.centerCode}</p>` : ""}
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase;">Item</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; text-align: center;">Qty</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; text-align: right;">Unit Price</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item: any) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 8px;">
                    <div><strong>${item.productVariant?.product?.title || "Item"}</strong></div>
                    <div style="font-size: 12px; color: #64748b;">Variant: ${item.productVariant?.name || "Standard"}</div>
                  </td>
                  <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px 8px; text-align: right;">₹${item.priceAtTime?.toFixed(2)}</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: 600;">₹${(item.quantity * item.priceAtTime)?.toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="margin-left: auto; width: 300px; padding-top: 16px; border-top: 2px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
              <span>Subtotal:</span>
              <span>₹${(order.totalAmount - (order.shippingCost || 0)).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
              <span>Shipping Cost:</span>
              <span>₹${(order.shippingCost || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: 800; border-top: 1px solid #cbd5e1; margin-top: 8px;">
              <span>Total Amount:</span>
              <span>₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    downloadPdf(html, `Invoice-${order.id.slice(-8)}.pdf`);
  };

  const totalPagesOrders = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader
        title="Products & Orders"
        description="Manage product catalog, inventory variants, and fulfill franchise stock orders."
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCatOpen(true)}
            variant="outline"
            className="h-8 sm:h-9 px-3 rounded-lg gap-1.5 font-semibold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Tags className="h-3.5 w-3.5" />
            Categories
          </Button>
          <Button
            onClick={() => setOpen(true)}
            className="h-8 sm:h-9 px-3.5 rounded-lg gap-1.5 shadow-sm shadow-primary/20 bg-primary font-semibold text-xs text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Total Products
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {totalProducts.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-[10px] text-slate-400">Inventory:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Catalog items</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Active Orders
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {activeOrders.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Pending Action:
              </span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {initialOrders.filter((o) => o.status === "PENDING").length} orders
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₹{Math.round(totalRevenue).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-[10px] text-slate-400">Settled:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">Verified Paid</span>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card
          onClick={() => setCatOpen(true)}
          className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-500/30 transition-all"
        >
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <Tags className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Categories
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {categories.length.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-[10px] text-slate-400">Action:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Manage Categories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => setActiveTab("catalog")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "catalog"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Package className="w-3.5 h-3.5" />
          Product Catalog
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "orders"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Franchise Orders
          {initialOrders.filter((o) => o.status === "PENDING").length > 0 && (
            <span className="h-4 min-w-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {initialOrders.filter((o) => o.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "config"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          Store Settings
        </button>
      </div>

      {/* Filter / Search Bar for Catalog and Orders */}
      {activeTab !== "config" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-[300px] group">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <Input
              placeholder={
                activeTab === "catalog"
                  ? "Search products by name or category..."
                  : "Search orders by franchise..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg h-8 sm:h-9 font-normal text-[11px] sm:text-xs transition-all focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 h-8 sm:h-9 shrink-0">
              <Package className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {activeTab === "catalog"
                  ? `Products: ${filteredProducts.length}`
                  : `Orders: ${filteredOrders.length}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const totalStock =
              product.variants?.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0) || 0;
            const minPrice =
              product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v: any) => Number(v.price || 0)))
                : 0;

            return (
              <Card
                key={product.id}
                className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 hover:border-primary/40 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="relative h-40 w-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    )}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-xs border border-slate-200/60 dark:border-slate-800 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                        {product.category || "General"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        className={cn(
                          "border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider",
                          totalStock > 10
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : totalStock > 0
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        )}
                      >
                        {totalStock > 0 ? `${totalStock} In Stock` : "Out of Stock"}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center">
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                    {minPrice.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => {
                        setSelectedProduct({ ...product });
                        setEditOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 rounded-md text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Products Found</h4>
              <p className="text-xs text-slate-500 mt-0.5">Try searching with a different term.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS TAB */}
      {activeTab === "orders" && (
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-12">
                      Sl.
                    </TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Order ID & Date
                    </TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Franchise
                    </TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Items Ordered
                    </TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Amount
                    </TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </TableHead>
                    <TableHead className="py-2.5 px-3.5 sm:px-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredOrders
                    .slice(
                      (currentPageOrders - 1) * itemsPerPage,
                      currentPageOrders * itemsPerPage
                    )
                    .map((order, index) => {
                      const borderColor =
                        order.status === "PENDING"
                          ? "#f97316"
                          : order.status === "APPROVED"
                          ? "#3b82f6"
                          : order.status === "SHIPPED"
                          ? "#a855f7"
                          : order.status === "DELIVERED"
                          ? "#22c55e"
                          : "#94a3b8";

                      return (
                        <TableRow
                          key={order.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group relative border-l-[3px]"
                          style={{ borderLeftColor: borderColor }}
                        >
                          <TableCell className="p-3 sm:p-3.5 text-xs font-semibold text-slate-400">
                            {(currentPageOrders - 1) * itemsPerPage + index + 1}
                          </TableCell>

                          <TableCell className="p-3 sm:p-3.5">
                            <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                              #{order.id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>

                          <TableCell className="p-3 sm:p-3.5">
                            <div
                              className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[150px]"
                              title={order.workspace.name}
                            >
                              {order.workspace.name}
                            </div>
                            {order.workspace.centerCode && (
                              <span className="text-[10px] font-medium text-slate-400">
                                Code: {order.workspace.centerCode}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="p-3 sm:p-3.5">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {order.items?.length || 0} Items
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              {order.items
                                ?.map(
                                  (item: any) =>
                                    `${item.productVariant?.product?.title || "Item"} x${item.quantity}`
                                )
                                .join(", ")}
                            </div>
                          </TableCell>

                          <TableCell className="p-3 sm:p-3.5 font-bold text-xs text-slate-900 dark:text-white">
                            <span className="flex items-center">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {order.totalAmount}
                            </span>
                          </TableCell>

                          <TableCell className="p-3 sm:p-3.5">
                            <Badge
                              className={cn(
                                "border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider",
                                order.status === "PENDING"
                                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                  : order.status === "APPROVED"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : order.status === "SHIPPED"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  : order.status === "DELIVERED"
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              )}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="p-3 sm:p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20">
                                  <Download className="h-3.5 w-3.5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl font-medium p-1 text-xs">
                                  <DropdownMenuItem
                                    onClick={() => printInvoice(order)}
                                    className="cursor-pointer gap-2 py-1.5 px-2 text-xs"
                                  >
                                    <Printer className="h-3.5 w-3.5 text-slate-400" /> Invoice PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => printDeliveryLabel(order)}
                                    className="cursor-pointer gap-2 py-1.5 px-2 text-xs"
                                  >
                                    <Package className="h-3.5 w-3.5 text-slate-400" /> Delivery Label
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <Button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOrderModalOpen(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 rounded-md text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                              >
                                Manage
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-500">
                        No orders found matching criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Standardized Pagination Controls */}
            {totalPagesOrders > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="text-xs font-medium text-slate-500">
                  Showing {(currentPageOrders - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPageOrders * itemsPerPage, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPageOrders === 1}
                    onClick={() => setCurrentPageOrders((p) => Math.max(1, p - 1))}
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const getPageNumbers = () => {
                        if (totalPagesOrders <= 7)
                          return Array.from({ length: totalPagesOrders }, (_, i) => i + 1);
                        if (currentPageOrders <= 4) return [1, 2, 3, 4, 5, "...", totalPagesOrders];
                        if (currentPageOrders >= totalPagesOrders - 3)
                          return [
                            1,
                            "...",
                            totalPagesOrders - 4,
                            totalPagesOrders - 3,
                            totalPagesOrders - 2,
                            totalPagesOrders - 1,
                            totalPagesOrders,
                          ];
                        return [
                          1,
                          "...",
                          currentPageOrders - 1,
                          currentPageOrders,
                          currentPageOrders + 1,
                          "...",
                          totalPagesOrders,
                        ];
                      };
                      return getPageNumbers().map((pNum, idx) => {
                        if (pNum === "...") {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">
                              ...
                            </span>
                          );
                        }
                        const num = pNum as number;
                        return (
                          <Button
                            key={`order-page-${num}`}
                            variant={currentPageOrders === num ? "default" : "ghost"}
                            onClick={() => setCurrentPageOrders(num)}
                            className={cn(
                              "h-7 w-7 rounded-md font-semibold text-xs",
                              currentPageOrders === num ? "shadow-sm shadow-primary/20" : "text-slate-500"
                            )}
                          >
                            {num}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPageOrders >= totalPagesOrders}
                    onClick={() => setCurrentPageOrders((p) => p + 1)}
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: STORE CONFIGURATION */}
      {activeTab === "config" && (
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 max-w-2xl">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Global Store Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Update delivery fees, payment collection details, and official UPI QR code.
            </p>
          </CardHeader>
          <form onSubmit={handleConfigSubmit} className="p-4 sm:p-5 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Global Shipping Fee (₹)
              </Label>
              <Input
                type="number"
                step="0.01"
                required
                value={configForm.shippingCost}
                onChange={(e) =>
                  setConfigForm({ ...configForm, shippingCost: parseFloat(e.target.value) || 0 })
                }
                className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Payment Details / Bank Instructions
              </Label>
              <Textarea
                placeholder="Bank Name, Account No, IFSC, UPI ID..."
                value={configForm.paymentDetails}
                onChange={(e) =>
                  setConfigForm({ ...configForm, paymentDetails: e.target.value })
                }
                className="rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2 p-3 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 rounded-lg">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Payment QR Code Image
              </Label>
              <ImageUpload
                value={configForm.paymentQrCode}
                onChange={(url) => setConfigForm({ ...configForm, paymentQrCode: url })}
                folder="RGYCSP/Store"
                label="Upload Official QR Code"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* MANAGE CATEGORIES DIALOG */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Product Categories
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Organize your uniforms, books, and promotional items.
            </p>
          </DialogHeader>

          <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Form */}
            <form
              onSubmit={handleCategorySubmit}
              className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {editingCategoryId ? "Edit Category" : "Add New Category"}
                </Label>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm({ name: "" });
                    }}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="h-8 sm:h-9 rounded-lg text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1"
                  placeholder="e.g. Uniforms, Kits, Books..."
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold shrink-0"
                >
                  {isSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  {editingCategoryId ? "Update" : "Add"}
                </Button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Existing Categories ({categories.length})
              </Label>
              {categories.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-lg">
                  No categories found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 px-3 bg-white dark:bg-slate-900 text-xs"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(cat)}
                          className="h-6 w-6 text-blue-500 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCategoryDelete(cat.id, cat.name)}
                          className="h-6 w-6 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD PRODUCT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Add New Product
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Create product profile, upload image, and add size/stock variants.
            </p>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="flex flex-col min-h-0">
            <div className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <Label className="text-xs font-bold text-slate-900 dark:text-white">
                  Product Image
                </Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  folder="RGYCSP/Products"
                  label="Upload Product Image"
                />
                {!formData.image && (
                  <Input
                    placeholder="Or paste direct image URL..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Product Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    placeholder="e.g. Center Uniform T-Shirt"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Product Variants (Sizes / Types)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        variants: [...formData.variants, { name: "", price: "0", stock: "0" }],
                      })
                    }
                    className="h-6 text-[10px] font-semibold text-primary"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Variant
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800"
                    >
                      <Input
                        placeholder="Variant (e.g. M Size)"
                        required
                        value={v.name}
                        onChange={(e) => {
                          const list = [...formData.variants];
                          list[idx].name = e.target.value;
                          setFormData({ ...formData, variants: list });
                        }}
                        className="h-7 text-xs flex-1 min-w-0"
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        required
                        value={v.price}
                        onChange={(e) => {
                          const list = [...formData.variants];
                          list[idx].price = e.target.value;
                          setFormData({ ...formData, variants: list });
                        }}
                        className="h-7 text-xs w-20 shrink-0"
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        required
                        value={v.stock}
                        onChange={(e) => {
                          const list = [...formData.variants];
                          list[idx].stock = e.target.value;
                          setFormData({ ...formData, variants: list });
                        }}
                        className="h-7 text-xs w-16 shrink-0"
                      />
                      {formData.variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              variants: formData.variants.filter((_, i) => i !== idx),
                            });
                          }}
                          className="h-7 w-7 text-red-500 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[60px] resize-none"
                  placeholder="Details regarding quality, fabrics, specifications..."
                />
              </div>
            </div>

            <div className="p-3 px-4 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0 bg-white dark:bg-slate-950">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Save Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT PRODUCT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Edit Product
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Update inventory, pricing, variant specifications, or remove product.
            </p>
          </DialogHeader>

          {selectedProduct && (
            <form onSubmit={handleProductUpdate} className="flex flex-col min-h-0">
              <div className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">
                    Product Image
                  </Label>
                  <ImageUpload
                    value={selectedProduct.image || ""}
                    onChange={(url) =>
                      setSelectedProduct({ ...selectedProduct, image: url })
                    }
                    folder="RGYCSP/Products"
                    label="Change Product Image"
                  />
                  {!selectedProduct.image && (
                    <Input
                      placeholder="Or paste direct image URL..."
                      value={selectedProduct.image || ""}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, image: e.target.value })
                      }
                      className="h-8 sm:h-9 rounded-lg text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Product Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      required
                      value={selectedProduct.title}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, title: e.target.value })
                      }
                      className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </Label>
                    <Select
                      value={selectedProduct.category}
                      onValueChange={(val) =>
                        setSelectedProduct({ ...selectedProduct, category: val })
                      }
                    >
                      <SelectTrigger className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.name} className="text-xs">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Variants */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Product Variants (Sizes / Types)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedProduct({
                          ...selectedProduct,
                          variants: [
                            ...(selectedProduct.variants || []),
                            { name: "", price: "0", stock: "0" },
                          ],
                        })
                      }
                      className="h-6 text-[10px] font-semibold text-primary"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Variant
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {selectedProduct.variants?.map((v: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800"
                      >
                        <Input
                          placeholder="Variant (e.g. M Size)"
                          required
                          value={v.name}
                          onChange={(e) => {
                            const list = [...selectedProduct.variants];
                            list[idx].name = e.target.value;
                            setSelectedProduct({ ...selectedProduct, variants: list });
                          }}
                          className="h-7 text-xs flex-1 min-w-0"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          required
                          value={v.price}
                          onChange={(e) => {
                            const list = [...selectedProduct.variants];
                            list[idx].price = e.target.value;
                            setSelectedProduct({ ...selectedProduct, variants: list });
                          }}
                          className="h-7 text-xs w-20 shrink-0"
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          required
                          value={v.stock}
                          onChange={(e) => {
                            const list = [...selectedProduct.variants];
                            list[idx].stock = e.target.value;
                            setSelectedProduct({ ...selectedProduct, variants: list });
                          }}
                          className="h-7 text-xs w-16 shrink-0"
                        />
                        {selectedProduct.variants.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct({
                                ...selectedProduct,
                                variants: selectedProduct.variants.filter((_: any, i: number) => i !== idx),
                              });
                            }}
                            className="h-7 w-7 text-red-500 shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Description
                  </Label>
                  <Textarea
                    value={selectedProduct.description || ""}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, description: e.target.value })
                    }
                    className="rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[60px] resize-none"
                  />
                </div>
              </div>

              <div className="p-3 px-4 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-950">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleProductDelete}
                  className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditOpen(false)}
                    className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MANAGE ORDER DIALOG */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-3xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Order #{selectedOrder?.id?.slice(-8).toUpperCase()}
                </DialogTitle>
                <p className="text-xs text-slate-500 font-medium">
                  Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString()} by{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {selectedOrder?.workspace?.name}
                  </strong>
                </p>
              </div>
              {selectedOrder && (
                <Badge
                  className={cn(
                    "border-none rounded uppercase text-[9px] font-bold px-2 py-0.5 tracking-wider",
                    selectedOrder.status === "PENDING"
                      ? "bg-orange-500/10 text-orange-600"
                      : selectedOrder.status === "APPROVED"
                      ? "bg-blue-500/10 text-blue-600"
                      : selectedOrder.status === "SHIPPED"
                      ? "bg-purple-500/10 text-purple-600"
                      : "bg-green-500/10 text-green-600"
                  )}
                >
                  {selectedOrder.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Items & Delivery Info */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ordered Products
                    </Label>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
                      {selectedOrder.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {item.productVariant?.product?.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Variant: {item.productVariant?.name} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            ₹{item.quantity * item.priceAtTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping Fee:</span>
                      <span>₹{selectedOrder.shippingCost || 0}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
                      <span>Total Amount:</span>
                      <span className="text-primary font-black">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Controls & Payment */}
                <div className="space-y-3">
                  <div className="space-y-2 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Fulfillment Status
                    </Label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val) =>
                        setSelectedOrder({ ...selectedOrder, status: val })
                      }
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-950 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING" className="text-xs font-semibold text-orange-600">
                          Pending Approval
                        </SelectItem>
                        <SelectItem value="APPROVED" className="text-xs font-semibold text-blue-600">
                          Approved
                        </SelectItem>
                        <SelectItem value="SHIPPED" className="text-xs font-semibold text-purple-600">
                          Shipped
                        </SelectItem>
                        <SelectItem value="DELIVERED" className="text-xs font-semibold text-green-600">
                          Delivered
                        </SelectItem>
                        <SelectItem value="CANCELLED" className="text-xs font-semibold text-red-600">
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pt-1 block">
                      Payment Status
                    </Label>
                    <Select
                      value={selectedOrder.paymentStatus}
                      onValueChange={(val) =>
                        setSelectedOrder({ ...selectedOrder, paymentStatus: val })
                      }
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-950 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING" className="text-xs font-semibold">
                          Unpaid / Pending
                        </SelectItem>
                        <SelectItem value="PAID" className="text-xs font-semibold text-green-600">
                          Paid (Verified)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => printInvoice(selectedOrder)}
                      variant="outline"
                      className="flex-1 h-8 sm:h-9 rounded-lg text-xs font-semibold gap-1.5"
                    >
                      <Printer className="h-3.5 w-3.5" /> Invoice
                    </Button>
                    <Button
                      onClick={() => printDeliveryLabel(selectedOrder)}
                      variant="outline"
                      className="flex-1 h-8 sm:h-9 rounded-lg text-xs font-semibold gap-1.5"
                    >
                      <Package className="h-3.5 w-3.5" /> Label
                    </Button>
                  </div>

                  {selectedOrder.paymentProof && (
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Payment Proof
                      </Label>
                      <a
                        href={selectedOrder.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={selectedOrder.paymentProof}
                          alt="Proof"
                          className="w-full max-h-32 object-contain p-1"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="ghost"
                  onClick={() => setOrderModalOpen(false)}
                  className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold"
                >
                  Close
                </Button>
                <Button
                  onClick={() =>
                    handleOrderUpdate(selectedOrder.status, selectedOrder.paymentStatus)
                  }
                  disabled={isSubmitting}
                  className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Confirm Updates
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REUSABLE CONFIRM DIALOG */}
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Confirm"
        destructive={true}
      />
    </div>
  );
}
