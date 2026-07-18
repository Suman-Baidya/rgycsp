"use client";

import React, { useState } from "react";
import { Search, Plus, Package, Edit, Trash2, CheckCircle2, XCircle, Clock, ShoppingBag, Loader2, IndianRupee, Settings, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/product";
import { createProductCategory, deleteProductCategory, updateProductCategory } from "@/app/actions/product-category";
import { updateOrderStatus } from "@/app/actions/product-order";
import { updateStoreConfig } from "@/app/actions/store-config";
import { cn } from "@/lib/utils";

import { ImageUpload } from "@/components/ui/ImageUpload";
export default function ProductsClient({ 
  initialProducts, 
  initialOrders,
  initialCategories,
  initialConfig
}: { 
  initialProducts: any[];
  initialOrders: any[];
  initialCategories: any[];
  initialConfig: any;
}) {
  const [activeTab, setActiveTab] = useState<"catalog" | "categories" | "orders" | "config">("catalog");
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
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
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
    variants: [{ name: "Standard", price: "0", stock: "0" }]
  });

  const [configForm, setConfigForm] = useState({ 
    shippingCost: initialConfig?.shippingCost || 0,
    paymentQrCode: initialConfig?.paymentQrCode || "",
    paymentDetails: initialConfig?.paymentDetails || ""
  });

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateStoreConfig(configForm.shippingCost, configForm.paymentQrCode, configForm.paymentDetails);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Store config updated!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const filteredProducts = initialProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = initialOrders.filter(o => 
    o.workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createProduct(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Product created successfully!");
      setOpen(false);
      setFormData({ title: "", description: "", category: initialCategories[0]?.name || "Uniforms", image: "", isActive: true, variants: [{ name: "Standard", price: "0", stock: "0" }] });
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
    
    showConfirm("Delete Product", "Are you sure you want to delete this product? This action cannot be undone.", async () => {
      setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
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
    });
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
      
      // Optimistically update categories
      if (editingCategoryId) {
        setCategories((prev: any[]) => prev.map(c => c.id === editingCategoryId ? { ...c, name: categoryForm.name } : c));
      } else if (result.data) {
        setCategories((prev: any[]) => [...prev, result.data]);
      }

      // Sync with product forms
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

  const handleCategoryDelete = async (id: string) => {
    showConfirm("Delete Category", "Are you sure? This will not delete products, but they will keep the text category.", async () => {
      setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
      setIsSubmitting(true);
      const result = await deleteProductCategory(id);
      setIsSubmitting(false);

      if (result.success) {
        toast.success("Category deleted");
        setCategories((prev: any[]) => prev.filter(c => c.id !== id));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  // Calculate Statistics
  const totalProducts = initialProducts.length;
  const activeOrders = initialOrders.filter(o => o.status === "PENDING" || o.status === "APPROVED").length;
  const totalRevenue = initialOrders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const renderShippingAddress = (addrString: string) => {
    if (!addrString) return "Not provided.";
    try {
      const parsed = JSON.parse(addrString);
      if (parsed.pin) {
        return (
          <div className="text-sm font-medium text-slate-700 space-y-1 mt-2">
            {parsed.phone && <div><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Phone:</span> {parsed.phone}</div>}
            <div>{parsed.vill}</div>
            {parsed.landmark && <div><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Landmark:</span> {parsed.landmark}</div>}
            <div>PO: {parsed.po}</div>
            <div>{parsed.district}, {parsed.state} - <span className="font-bold">{parsed.pin}</span></div>
          </div>
        );
      }
    } catch {}
    // Fallback to plain string
    return <span className="font-medium text-sm text-slate-700 whitespace-pre-wrap leading-tight block mt-1">{addrString}</span>;
  };

  const downloadPdf = async (htmlContent: string, filename: string) => {
    toast.loading("Generating PDF...", { id: "pdf-gen" });
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       10,
        filename:     filename,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
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
        phoneHtml = parsed.phone ? `<div style="font-size: 16px; margin-bottom: 8px;"><strong>Phone:</strong> ${parsed.phone}</div>` : '';
        addressHtml = `
          <div style="font-size: 18px; line-height: 1.6;">
            <div>${parsed.vill}</div>
            ${parsed.landmark ? `<div><strong>Landmark:</strong> ${parsed.landmark}</div>` : ''}
            <div><strong>PO:</strong> ${parsed.po}</div>
            <div>${parsed.district}, ${parsed.state}</div>
            <div style="font-size: 24px; font-weight: 800; margin-top: 8px;">PIN: ${parsed.pin}</div>
          </div>
        `;
      }
    } catch {}

    const html = `
      <div style="padding: 40px; background: white; font-family: 'Arial', sans-serif; color: #000;">
        <style>
          .label-container { 
            max-width: 500px; 
            margin: 0 auto; 
            border: 3px solid #000; 
            border-radius: 12px; 
            padding: 40px; 
            box-sizing: border-box;
          }
          .title { font-size: 24px; font-weight: 900; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; letter-spacing: 2px; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 12px; }
          .to-section { margin-bottom: 40px; }
          .recipient-name { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
          .meta { margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ccc; font-size: 14px; color: #555; display: flex; justify-content: space-between; }
        </style>
        <div class="label-container">
          <div class="title">DELIVERY ADDRESS</div>
          <div class="to-section">
            <div class="section-title">TO</div>
            <div class="recipient-name">${order.workspace.name}</div>
            ${order.workspace.centerCode ? `<div style="font-size: 16px; margin-bottom: 8px; color: #444;"><strong>Center Code:</strong> ${order.workspace.centerCode}</div>` : ''}
            ${phoneHtml}
            ${addressHtml}
          </div>
          
          <div class="meta">
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
        <style>
          .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; font-size: 32px; color: #0f172a; font-weight: 900; letter-spacing: -1px; }
          .header .meta { text-align: right; color: #64748b; font-size: 14px; }
          .header .meta p { margin: 4px 0; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 24px; border-radius: 8px; }
          .details .bill-to h3 { margin: 0 0 8px 0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .details .bill-to p { margin: 4px 0; color: #0f172a; font-weight: 600; font-size: 16px; }
          .details .status { text-align: right; }
          .details .status p { margin: 4px 0; font-size: 14px; color: #64748b; }
          .details .status span { font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { padding: 16px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
          .item-title { font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px; }
          .item-variant { color: #64748b; font-size: 13px; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; display: inline-block; }
          .totals { width: 350px; margin-left: auto; background: #f8fafc; padding: 24px; border-radius: 8px; }
          .totals .row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #64748b; font-size: 15px; }
          .totals .row:last-child { margin-bottom: 0; }
          .totals .row.bold { font-weight: 800; font-size: 20px; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 16px; }
        </style>
        <div class="invoice-container">
          <div class="header">
            <div>
              <h1>INVOICE</h1>
              <p style="color: #64748b; margin: 0;">Thank you for your order.</p>
            </div>
            <div class="meta">
              <p><strong>Invoice No:</strong> #${order.id.slice(-8).toUpperCase()}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div class="details">
            <div class="bill-to">
              <h3>Billed To</h3>
              <p>${order.workspace.name}</p>
              ${order.workspace.subdomain ? `<p style="font-size: 14px; font-weight: 400; color: #64748b;">Domain: ${order.workspace.subdomain}</p>` : ''}
            </div>
            <div class="status">
              <p>Payment Status: <span>${order.paymentStatus}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>
                    <span class="item-title">${item.productVariant.product.title}</span>
                    <span class="item-variant">Variant: ${item.productVariant.name}</span>
                  </td>
                  <td style="text-align: center; font-weight: 500;">${item.quantity}</td>
                  <td style="text-align: right;">Rs. ${item.priceAtTime.toFixed(2)}</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(item.quantity * item.priceAtTime).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="row">
              <span>Subtotal</span>
              <span>Rs. ${(order.totalAmount - (order.shippingCost || 0)).toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Shipping Cost</span>
              <span>Rs. ${(order.shippingCost || 0).toFixed(2)}</span>
            </div>
            <div class="row bold">
              <span>Total Amount</span>
              <span>Rs. ${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    downloadPdf(html, `Invoice-${order.id.slice(-8)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Products</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Active Orders</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{activeOrders}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => setActiveTab("catalog")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "catalog"
              ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Package className="w-4 h-4" />
          Catalog Management
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "orders"
              ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders
          {initialOrders.filter(o => o.status === "PENDING").length > 0 && (
            <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {initialOrders.filter(o => o.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
            activeTab === "config"
              ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Settings className="w-4 h-4" />
          Store Config
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={activeTab === "catalog" ? "Search products..." : "Search orders by franchise..."} 
            className="pl-9 h-11 rounded-xl bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === "catalog" && (
          <div className="flex items-center gap-3">
            <Dialog open={catOpen} onOpenChange={setCatOpen}>
              <DialogTrigger render={<Button variant="outline" className="h-11 rounded-xl px-5 font-bold gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300" />}>
                <Package className="h-4 w-4" /> Categories
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
                <DialogHeader className="p-6 pb-4 border-b bg-white dark:bg-slate-900">
                  <DialogTitle className="text-xl font-bold">Manage Categories</DialogTitle>
                </DialogHeader>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
                  {/* List of existing categories */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Existing Categories</Label>
                    {categories.length === 0 ? (
                      <div className="text-center py-6 text-sm text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        No categories found.
                      </div>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditCategory(cat)}
                              disabled={isSubmitting}
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 h-8 w-8 p-0 shrink-0 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCategoryDelete(cat.id)}
                              disabled={isSubmitting}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 w-8 p-0 shrink-0 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

                  {/* Add/Edit category form */}
                  <form onSubmit={handleCategorySubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{editingCategoryId ? "Edit Category" : "Create New"}</Label>
                      {editingCategoryId && (
                        <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: "" }); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Cancel Edit</button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="h-10 rounded-xl text-sm" placeholder="Category Name" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-xl font-bold">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editingCategoryId ? "Update Category" : "Save Category"}
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button className="h-11 rounded-xl px-6 font-bold gap-2 shadow-md shadow-primary/20" />}>
                <Plus className="h-4 w-4" /> Add Product
              </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden">
              <DialogHeader className="p-8 pb-4 border-b">
                <DialogTitle className="text-2xl font-bold">Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="p-8 pt-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Label className="text-xs font-bold text-slate-500">Product Image (Optional)</Label>
                  <div className="flex flex-col gap-4">
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      folder="RGYCSP/Products"
                      label="Upload Image or Provide URL"
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                      <span className="text-xs font-medium text-slate-400">OR</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    </div>
                    <Input 
                      placeholder="Paste image URL directly..." 
                      value={formData.image} 
                      onChange={e => setFormData({...formData, image: e.target.value})} 
                      className="h-11 rounded-xl" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Product Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold text-slate-500">Category</Label>
                      <button type="button" onClick={() => setCatOpen(true)} className="text-[10px] font-bold text-primary hover:underline">
                        + New Category
                      </button>
                    </div>
                    <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Uniforms">Uniforms (Default)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-500">Product Variants (Sizes/Types)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({...formData, variants: [...formData.variants, { name: "", price: "0", stock: "0" }]})}
                      className="h-8 rounded-lg text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Variant
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {formData.variants.length > 0 && (
                      <div className="flex items-center gap-2 px-2">
                        <div className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variant Name</div>
                        <div className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Price (₹)</div>
                        <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Stock</div>
                        {formData.variants.length > 1 && <div className="w-9 shrink-0"></div>}
                      </div>
                    )}
                    <div className="space-y-2">
                      {formData.variants.map((variant, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Input 
                          placeholder="Name (e.g. S Size)" 
                          required 
                          value={variant.name} 
                          onChange={e => {
                            const newVariants = [...formData.variants];
                            newVariants[idx].name = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} 
                          className="h-9 rounded-lg flex-1 min-w-0" 
                        />
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Price" 
                          required 
                          value={variant.price} 
                          onChange={e => {
                            const newVariants = [...formData.variants];
                            newVariants[idx].price = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} 
                          className="h-9 rounded-lg w-24 shrink-0" 
                        />
                        <Input 
                          type="number" 
                          placeholder="Stock" 
                          required 
                          value={variant.stock} 
                          onChange={e => {
                            const newVariants = [...formData.variants];
                            newVariants[idx].stock = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} 
                          className="h-9 rounded-lg w-20 shrink-0" 
                        />
                        {formData.variants.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newVariants = formData.variants.filter((_, i) => i !== idx);
                              setFormData({...formData, variants: newVariants});
                            }}
                            className="text-red-500 h-9 w-9 p-0 shrink-0 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl resize-none" rows={3} />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl font-bold mt-4">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      {activeTab === "catalog" && (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] hover:border-primary/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <Badge variant="secondary" className="rounded-xl px-3 py-1 text-xs shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0">{product.category}</Badge>
                </div>
                <div>
                  <div className="relative h-56 w-full mb-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:brightness-110" />
                    ) : (
                      <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 transition-transform duration-700 group-hover:brightness-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="px-6 flex justify-between items-center mb-3">
                    <div className={cn("flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-xl border-2", 
                      (product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0) > 10 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20" : 
                      (product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0) > 0 ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20" : 
                      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/20"
                    )}>
                      <Package className="h-3.5 w-3.5" />
                      {(product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0) > 0 ? `${product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0)} IN STOCK` : "OUT OF STOCK"}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 px-6 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 px-6">{product.description || "No description provided."}</p>
                </div>
                <div className="flex items-center justify-between mt-auto px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
                  <span className="font-black text-2xl flex items-center text-slate-900 dark:text-white">
                    <IndianRupee className="h-6 w-6" /> {product.variants && product.variants.length > 0 ? product.variants[0].price : "0"}
                  </span>
                  <Button 
                    onClick={() => { setSelectedProduct({...product}); setEditOpen(true); }}
                    variant="default" size="sm" className="rounded-xl h-10 font-bold px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                No products found. Create one!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/60 rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="p-5 pl-8 w-16">Sl.</th>
                    <th className="p-5">Order ID & Date</th>
                    <th className="p-5">Franchise Details</th>
                    <th className="p-5">Product Details</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 pr-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredOrders.slice((currentPageOrders - 1) * itemsPerPage, currentPageOrders * itemsPerPage).map((order, index) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-5 pl-8 font-bold text-slate-500 dark:text-slate-400">
                        {(currentPageOrders - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-5">
                        <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">#{order.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5 font-bold text-slate-800 dark:text-slate-200">
                        <div className="truncate max-w-[180px] cursor-help" title={order.workspace.name}>
                          {order.workspace.name}
                        </div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{order.items?.length || 0} Items</div>
                        {order.items?.length <= 1 ? (
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[220px]" title={order.items?.[0] ? `${order.items[0].productVariant?.product?.title} (${order.items[0].productVariant?.name})` : ''}>
                            {order.items?.[0] ? `${order.items[0].productVariant?.product?.title} (${order.items[0].productVariant?.name}) x${order.items[0].quantity}` : 'No items'}
                          </div>
                        ) : (
                          <details className="group">
                            <summary className="text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer list-none flex items-center">
                              <span className="truncate max-w-[180px] group-open:hidden">
                                {order.items?.map((item: any) => `${item.productVariant?.product?.title} (${item.productVariant?.name}) x${item.quantity}`).join(', ')}
                              </span>
                              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 hover:text-primary transition-colors group-open:hidden ml-2 shrink-0">View All</span>
                              <span className="text-[9px] font-bold text-primary hover:text-primary/80 transition-colors hidden group-open:inline mt-1">Hide List</span>
                            </summary>
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 space-y-1.5">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                                  <span className="truncate pr-2" title={`${item.productVariant?.product?.title} - ${item.productVariant?.name}`}>
                                    {item.productVariant?.product?.title} <span className="text-slate-400">({item.productVariant?.name})</span>
                                  </span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0 bg-white dark:bg-slate-900 px-1 rounded">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </td>
                      <td className="p-5 font-black text-slate-800 dark:text-slate-200 flex items-center mt-2.5">
                        <IndianRupee className="h-3 w-3 mr-0.5" />{order.totalAmount}
                      </td>
                      <td className="p-5">
                        <Badge className={cn(
                          "font-bold text-[10px] uppercase rounded-md px-2 py-0.5 shadow-none",
                          order.status === "PENDING" ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/10 dark:text-orange-500 dark:hover:bg-orange-500/20" :
                          order.status === "APPROVED" ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:hover:bg-blue-500/20" :
                          order.status === "SHIPPED" ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/10 dark:text-purple-500 dark:hover:bg-purple-500/20" :
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-500 dark:hover:bg-green-500/20" :
                          "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                              <Download className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl font-medium">
                              <DropdownMenuItem onClick={() => printInvoice(order)} className="cursor-pointer gap-2 py-2.5">
                                <Printer className="h-4 w-4" /> Download Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => printDeliveryLabel(order)} className="cursor-pointer gap-2 py-2.5">
                                <Package className="h-4 w-4" /> Download Label
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button 
                            onClick={() => { setSelectedOrder(order); setOrderModalOpen(true); }}
                            variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold"
                          >
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-16 text-center text-slate-500 dark:text-slate-400 font-medium">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPageOrders - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPageOrders * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredOrders.length}</span> orders
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPageOrders === 1}
                    onClick={() => setCurrentPageOrders((prev: any) => Math.max(1, prev - 1))}
                    className="rounded-lg font-bold"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPageOrders >= Math.ceil(filteredOrders.length / itemsPerPage)}
                    onClick={() => setCurrentPageOrders((prev: any) => prev + 1)}
                    className="rounded-lg font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Store Configuration</h2>
          <form onSubmit={handleConfigSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Global Shipping Cost (₹)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={configForm.shippingCost} 
                  onChange={e => setConfigForm({...configForm, shippingCost: parseFloat(e.target.value) || 0})} 
                  className="h-12 rounded-xl text-lg font-medium" 
                />
                <p className="text-xs text-slate-500">Applied to all franchise orders.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Payment Details (Bank/UPI)</Label>
                <Textarea 
                  value={configForm.paymentDetails} 
                  onChange={e => setConfigForm({...configForm, paymentDetails: e.target.value})} 
                  className="rounded-xl min-h-[100px] resize-none" 
                  placeholder="Enter bank account details, UPI ID, or other payment instructions for manual verification..."
                />
              </div>
            </div>
            <div className="space-y-2 pb-4">
              <Label className="text-sm font-bold text-slate-700">Payment QR Code (Optional)</Label>
              <div className="max-w-xs">
                <ImageUpload
                  value={configForm.paymentQrCode}
                  onChange={(url) => setConfigForm({ ...configForm, paymentQrCode: url })}
                  folder="RGYCSP/Store"
                  label="Upload QR Code"
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-base">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Settings"}
            </Button>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handleProductUpdate} className="p-8 pt-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-bold text-slate-500">Product Image (Optional)</Label>
                <div className="flex flex-col gap-4">
                  <ImageUpload
                    value={selectedProduct.image || ""}
                    onChange={(url) => setSelectedProduct({ ...selectedProduct, image: url })}
                    folder="RGYCSP/Products"
                    label="Upload Image or Provide URL"
                  />
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    <span className="text-xs font-medium text-slate-400">OR</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>
                  <Input 
                    placeholder="Paste image URL directly..." 
                    value={selectedProduct.image || ""} 
                    onChange={e => setSelectedProduct({...selectedProduct, image: e.target.value})} 
                    className="h-11 rounded-xl" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Product Title</Label>
                <Input required value={selectedProduct.title} onChange={e => setSelectedProduct({...selectedProduct, title: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-500">Category</Label>
                    <button type="button" onClick={() => setCatOpen(true)} className="text-[10px] font-bold text-primary hover:underline">
                      + New Category
                    </button>
                  </div>
                  <Select value={selectedProduct.category} onValueChange={val => setSelectedProduct({...selectedProduct, category: val})}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="Uniforms">Uniforms (Default)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-500">Product Variants (Sizes/Types)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProduct({...selectedProduct, variants: [...(selectedProduct.variants || []), { name: "", price: "0", stock: "0" }]})}
                      className="h-8 rounded-lg text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Variant
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {selectedProduct.variants?.length > 0 && (
                      <div className="flex items-center gap-2 px-2">
                        <div className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variant Name</div>
                        <div className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Price (₹)</div>
                        <div className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Stock</div>
                        {selectedProduct.variants.length > 1 && <div className="w-9 shrink-0"></div>}
                      </div>
                    )}
                    <div className="space-y-2">
                      {selectedProduct.variants?.map((variant: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Input 
                          placeholder="Name (e.g. S Size)" 
                          required 
                          value={variant.name} 
                          onChange={e => {
                            const newVariants = [...selectedProduct.variants];
                            newVariants[idx].name = e.target.value;
                            setSelectedProduct({...selectedProduct, variants: newVariants});
                          }} 
                          className="h-9 rounded-lg flex-1 min-w-0" 
                        />
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Price" 
                          required 
                          value={variant.price} 
                          onChange={e => {
                            const newVariants = [...selectedProduct.variants];
                            newVariants[idx].price = e.target.value;
                            setSelectedProduct({...selectedProduct, variants: newVariants});
                          }} 
                          className="h-9 rounded-lg w-24 shrink-0" 
                        />
                        <Input 
                          type="number" 
                          placeholder="Stock" 
                          required 
                          value={variant.stock} 
                          onChange={e => {
                            const newVariants = [...selectedProduct.variants];
                            newVariants[idx].stock = e.target.value;
                            setSelectedProduct({...selectedProduct, variants: newVariants});
                          }} 
                          className="h-9 rounded-lg w-20 shrink-0" 
                        />
                        {selectedProduct.variants.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newVariants = selectedProduct.variants.filter((_: any, i: number) => i !== idx);
                              setSelectedProduct({...selectedProduct, variants: newVariants});
                            }}
                            className="text-red-500 h-9 w-9 p-0 shrink-0 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Description</Label>
                <Textarea value={selectedProduct.description || ""} onChange={e => setSelectedProduct({...selectedProduct, description: e.target.value})} className="rounded-xl resize-none" rows={3} />
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={handleProductDelete} className="text-red-500 font-bold hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl font-bold px-8">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>




      {/* Order Management Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-5xl rounded-[2.5rem] p-0 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-200/60 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="p-8 pb-6 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 relative">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Manage Order</DialogTitle>
                <p className="text-sm font-bold text-slate-500">Review details and update fulfillment statuses.</p>
              </div>
              {selectedOrder && (
                <div className="text-right bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="font-mono text-sm font-black text-slate-900 dark:text-white tracking-wider">#{selectedOrder.id.slice(-8).toUpperCase()}</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
              )}
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-5 h-full max-h-[75vh] overflow-hidden">
              
              {/* Left Column - Order Info & Items */}
              <div className="lg:col-span-3 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/30"></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delivery Details</h3>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">Franchise Info</Label>
                        <p className="font-black text-xl text-slate-800 dark:text-slate-100 leading-tight">{selectedOrder.workspace.name}</p>
                        {selectedOrder.workspace.centerCode && <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Center Code: {selectedOrder.workspace.centerCode}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">Shipping Address</Label>
                        {renderShippingAddress(selectedOrder.shippingAddress)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/30"></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Items</h3>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center pb-4 border-b-2 border-slate-200/50 dark:border-slate-700/50 last:border-0 last:pb-0">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-base text-slate-800 dark:text-slate-200 leading-none">{item.productVariant?.product?.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                Variant: {item.productVariant?.name}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                &times; {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-slate-900 dark:text-slate-100 flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border-2 border-slate-100 dark:border-slate-700">
                            <IndianRupee className="h-4 w-4 mr-0.5 text-slate-400" />{item.quantity * item.priceAtTime}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Shipping Cost</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-slate-400" /> {selectedOrder.shippingCost}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border-2 border-primary/20">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Total Amount</span>
                        <span className="font-black text-2xl flex items-center text-primary">
                          <IndianRupee className="h-6 w-6 mr-1" /> {selectedOrder.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-1.5 rounded-full bg-slate-800 dark:bg-slate-200 shadow-sm shadow-slate-900/30"></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Print Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => printInvoice(selectedOrder)} variant="outline" className="w-full h-14 rounded-2xl font-bold border-2 border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all shadow-sm gap-2 text-base">
                      <Download className="h-5 w-5" /> Download Invoice
                    </Button>
                    <Button onClick={() => printDeliveryLabel(selectedOrder)} variant="outline" className="w-full h-14 rounded-2xl font-bold border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all shadow-md gap-2 text-base">
                      <Download className="h-5 w-5" /> Download Label
                    </Button>
                  </div>
                </div>

              </div>

              {/* Right Column - Status & Payment */}
              <div className="lg:col-span-2 bg-slate-50/50 dark:bg-slate-900/50 p-8 border-l-2 border-slate-200/80 dark:border-slate-800 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                <div className="space-y-10">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-6 w-1.5 rounded-full bg-slate-400"></div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">Order Status</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">Fulfillment</Label>
                        <Select value={selectedOrder.status} onValueChange={(val) => setSelectedOrder({...selectedOrder, status: val})}>
                          <SelectTrigger className={cn("h-14 rounded-2xl font-bold border-2 transition-all shadow-sm text-base",
                            selectedOrder.status === "PENDING" ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20" :
                            selectedOrder.status === "APPROVED" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20" :
                            selectedOrder.status === "SHIPPED" ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/20" :
                            selectedOrder.status === "DELIVERED" ? "border-green-300 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20" :
                            "border-slate-200 bg-white"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING" className="font-bold text-orange-600">Pending Approval</SelectItem>
                            <SelectItem value="APPROVED" className="font-bold text-blue-600">Approved (Deducts Stock)</SelectItem>
                            <SelectItem value="SHIPPED" className="font-bold text-purple-600">Shipped</SelectItem>
                            <SelectItem value="DELIVERED" className="font-bold text-green-600">Delivered</SelectItem>
                            <SelectItem value="CANCELLED" className="font-bold text-red-600">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2.5">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">Payment</Label>
                        <Select value={selectedOrder.paymentStatus} onValueChange={(val) => setSelectedOrder({...selectedOrder, paymentStatus: val})}>
                          <SelectTrigger className={cn("h-14 rounded-2xl font-bold border-2 transition-all shadow-sm text-base",
                            selectedOrder.paymentStatus === "PAID" ? "border-green-300 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20" :
                            "border-slate-200 bg-white"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING" className="font-bold">Unpaid / Pending</SelectItem>
                            <SelectItem value="PAID" className="font-bold text-green-600">Paid (Verified)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.paymentProof && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1.5 rounded-full bg-slate-400"></div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Payment Proof</h3>
                      </div>
                      <div 
                        className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 group bg-white" 
                        onClick={() => window.open(selectedOrder.paymentProof, '_blank')} 
                        title="Click to view full size"
                      >
                        <img src={selectedOrder.paymentProof} alt="Payment Proof" className="w-full max-h-56 object-contain bg-slate-100/50 p-2" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-white text-black font-black px-5 py-2.5 rounded-xl text-sm shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Full Size
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-8 mt-8 border-t-2 border-slate-200/80 dark:border-slate-800">
                  <Button 
                    onClick={() => handleOrderUpdate(selectedOrder.status, selectedOrder.paymentStatus)} 
                    disabled={isSubmitting} 
                    className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                  >
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <><CheckCircle2 className="h-6 w-6 mr-2" /> Confirm Updates</>}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Global Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog((prev: any) => ({ ...prev, isOpen }))}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6 overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 dark:text-white">
              {confirmDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-base font-medium text-slate-600 dark:text-slate-400">
            {confirmDialog.description}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold px-6 h-11" 
              onClick={() => setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }))}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl font-bold px-6 h-11" 
              onClick={confirmDialog.onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
