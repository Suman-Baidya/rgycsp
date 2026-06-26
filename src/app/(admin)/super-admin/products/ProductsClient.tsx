"use client";

import React, { useState } from "react";
import { Search, Plus, Package, Edit, Trash2, CheckCircle2, XCircle, Clock, ShoppingBag, Loader2, IndianRupee } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/product";
import { createProductCategory, deleteProductCategory, updateProductCategory } from "@/app/actions/product-category";
import { updateOrderStatus } from "@/app/actions/product-order";
import { cn } from "@/lib/utils";

import { ImageUpload } from "@/components/ui/ImageUpload";
export default function ProductsClient({ 
  initialProducts, 
  initialOrders,
  initialCategories
}: { 
  initialProducts: any[];
  initialOrders: any[];
  initialCategories: any[];
}) {
  const [activeTab, setActiveTab] = useState<"catalog" | "categories" | "orders">("catalog");
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
    price: "",
    stock: "",
    category: initialCategories[0]?.name || "Uniforms",
    image: "",
    isActive: true
  });

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
      setFormData({ title: "", description: "", price: "", stock: "", category: initialCategories[0]?.name || "Uniforms", image: "", isActive: true });
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
  const totalRevenue = initialOrders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.totalPrice, 0);

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
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">Stock Quantity</Label>
                    <Input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Price (₹)</Label>
                  <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-11 rounded-xl" />
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
                  <Badge variant="secondary" className="rounded-xl px-3 py-1 text-xs shadow-sm backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0">{product.category}</Badge>
                </div>
                <div>
                  <div className="relative h-56 w-full mb-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 transition-transform duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="px-6 flex justify-between items-center mb-3">
                    <div className={cn("flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-xl border-2", 
                      product.stock > 10 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20" : 
                      product.stock > 0 ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20" : 
                      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/20"
                    )}>
                      <Package className="h-3.5 w-3.5" />
                      {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 px-6 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 px-6">{product.description || "No description provided."}</p>
                </div>
                <div className="flex items-center justify-between mt-auto px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
                  <span className="font-black text-2xl flex items-center text-slate-900 dark:text-white">
                    <IndianRupee className="h-6 w-6" /> {product.price}
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
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-5 pl-8 w-16">Sl.</th>
                    <th className="p-5">Order ID & Date</th>
                    <th className="p-5">Franchise Details</th>
                    <th className="p-5">Product Details</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 pr-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.slice((currentPageOrders - 1) * itemsPerPage, currentPageOrders * itemsPerPage).map((order, index) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 pl-8 font-bold text-slate-500">
                        {(currentPageOrders - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-5">
                        <div className="font-mono text-xs font-bold text-slate-700">#{order.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5 font-bold text-slate-800">
                        {order.workspace.name}
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-800">{order.product.title}</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">Quantity: {order.quantity}</div>
                      </td>
                      <td className="p-5 font-black text-slate-800 flex items-center mt-2.5">
                        <IndianRupee className="h-3 w-3 mr-0.5" />{order.totalPrice}
                      </td>
                      <td className="p-5">
                        <Badge className={cn(
                          "font-bold text-[10px] uppercase rounded-md px-2 py-0.5 shadow-none",
                          order.status === "PENDING" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                          order.status === "APPROVED" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                          order.status === "SHIPPED" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" :
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                          "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <Button 
                          onClick={() => { setSelectedOrder(order); setOrderModalOpen(true); }}
                          variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-16 text-center text-slate-500 font-medium">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-800">{(currentPageOrders - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPageOrders * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-slate-800">{filteredOrders.length}</span> orders
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
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Stock Quantity</Label>
                  <Input type="number" required value={selectedProduct.stock} onChange={e => setSelectedProduct({...selectedProduct, stock: e.target.value})} className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Price (₹)</Label>
                <Input type="number" step="0.01" required value={selectedProduct.price} onChange={e => setSelectedProduct({...selectedProduct, price: e.target.value})} className="h-11 rounded-xl" />
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
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 border-b bg-slate-50">
            <DialogTitle className="text-2xl font-bold">Manage Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="p-8 pt-6 space-y-6">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400">Franchise</Label>
                <p className="font-bold text-lg">{selectedOrder.workspace.name}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-500">Product</span>
                  <span className="font-bold">{selectedOrder.product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-500">Quantity</span>
                  <span className="font-bold">{selectedOrder.quantity} units</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-medium text-slate-500">Total Amount</span>
                  <span className="font-black flex items-center text-primary"><IndianRupee className="h-4 w-4" /> {selectedOrder.totalPrice}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Update Order Status</Label>
                  <Select value={selectedOrder.status} onValueChange={(val) => setSelectedOrder({...selectedOrder, status: val})}>
                    <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending Approval</SelectItem>
                      <SelectItem value="APPROVED">Approved (Deducts Stock)</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Payment Status (Offline)</Label>
                  <Select value={selectedOrder.paymentStatus} onValueChange={(val) => setSelectedOrder({...selectedOrder, paymentStatus: val})}>
                    <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Unpaid / Pending</SelectItem>
                      <SelectItem value="PAID">Paid (Manually Verified)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => handleOrderUpdate(selectedOrder.status, selectedOrder.paymentStatus)} 
                disabled={isSubmitting} 
                className="w-full h-12 rounded-xl font-bold text-base mt-2"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Updates"}
              </Button>
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
