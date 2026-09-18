"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, ShoppingCart, IndianRupee, Clock, Package, 
  CheckCircle2, Loader2, Trash2, Plus, Minus, MapPin, 
  QrCode, Settings, Eye, Truck, ArrowRight, ExternalLink, 
  Layers, Tag, Check, AlertCircle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/product-order";
import { updateWorkspaceShippingAddress } from "@/app/actions/workspaces";
import { getPincodeDetails } from "@/app/actions/pincode";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";

export default function FranchiseProductsClient({ 
  workspaceId,
  initialShippingAddress,
  initialProducts, 
  initialOrders,
  initialConfig
}: { 
  workspaceId: string;
  initialShippingAddress: string;
  initialProducts: any[];
  initialOrders: any[];
  initialConfig: any;
}) {
  const [activeTab, setActiveTab] = useState<"store" | "orders" | "config">("store");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 250);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Cart & Checkout State
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "payment">("cart");
  
  // Product Selection Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalQuantities, setModalQuantities] = useState<Record<string, number>>({});

  // View Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  // Address Parsing
  const defaultAddressObj = { phone: "", vill: "", po: "", pin: "", district: "", state: "", landmark: "" };
  const getInitialAddressObj = () => {
    if (!initialShippingAddress) return defaultAddressObj;
    try {
      const parsed = JSON.parse(initialShippingAddress);
      if (parsed.pin) return parsed;
    } catch {}
    return { ...defaultAddressObj, landmark: initialShippingAddress }; 
  };

  const [orderAddressObj, setOrderAddressObj] = useState<any>(getInitialAddressObj());
  const [paymentProof, setPaymentProof] = useState("");
  const [savedAddressObj, setSavedAddressObj] = useState<any>(getInitialAddressObj());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeTab, selectedCategory]);

  const activeProducts = useMemo(() => {
    return initialProducts.filter(p => p.isActive && p.variants?.length > 0);
  }, [initialProducts]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ["All", ...Array.from(cats)];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearchTerm.toLowerCase().trim();
    return activeProducts.filter(p => {
      const matchesSearch = !query || p.title.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query));
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [activeProducts, debouncedSearchTerm, selectedCategory]);

  const filteredOrders = useMemo(() => {
    const query = debouncedSearchTerm.toLowerCase().trim();
    return initialOrders.filter(o => {
      return (
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.items?.some((i: any) => i.productVariant?.product?.title.toLowerCase().includes(query))
      );
    });
  }, [initialOrders, debouncedSearchTerm]);

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setModalQuantities({});
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    let addedCount = 0;
    const newCart = [...cart];
    
    selectedProduct.variants.filter((v: any) => v.isActive).forEach((variant: any) => {
      const qty = modalQuantities[variant.id] || 0;
      if (qty > 0) {
        if (qty > variant.stock) {
          toast.error(`Not enough stock for ${variant.name}`);
          return;
        }
        
        const existingIndex = newCart.findIndex(item => item.variantId === variant.id);
        if (existingIndex >= 0) {
          if (newCart[existingIndex].quantity + qty > variant.stock) {
            toast.error(`Cannot exceed available stock for ${variant.name}`);
          } else {
            newCart[existingIndex] = { ...newCart[existingIndex], quantity: newCart[existingIndex].quantity + qty };
            addedCount++;
          }
        } else {
          newCart.push({ variantId: variant.id, quantity: qty, variant, product: selectedProduct });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      setCart(newCart);
      toast.success("Added items to your cart");
    }
    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const handleUpdateCartQuantity = (variantId: string, newQty: number) => {
    if (newQty <= 0) return handleRemoveFromCart(variantId);
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        if (newQty > item.variant.stock) {
          toast.error("Cannot exceed available stock");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleAddressChange = async (setter: any, field: string, value: string) => {
    setter((prev: any) => ({ ...prev, [field]: value }));
    
    if (field === 'pin' && value.length === 6) {
      toast.loading("Fetching location details...", { id: "pin-fetch" });
      const res = await getPincodeDetails(value);
      if (res.success) {
        setter((prev: any) => ({ ...prev, district: res.district, state: res.state }));
        toast.success("Location auto-filled from PIN code!", { id: "pin-fetch" });
      } else {
        toast.error("Invalid PIN code or details not found.", { id: "pin-fetch" });
      }
    }
  };

  const renderAddressForm = (addressObj: any, setter: any) => (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Contact Phone <span className="text-red-500">*</span>
          </Label>
          <Input 
            required 
            value={addressObj.phone} 
            onChange={e => handleAddressChange(setter, 'phone', e.target.value)} 
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
            placeholder="10-digit mobile number" 
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            PIN Code <span className="text-red-500">*</span>
          </Label>
          <Input 
            required 
            value={addressObj.pin} 
            onChange={e => handleAddressChange(setter, 'pin', e.target.value.replace(/\D/g, '').slice(0, 6))} 
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-mono" 
            placeholder="6-digit PIN" 
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Street / Village / Building <span className="text-red-500">*</span>
        </Label>
        <Input 
          required 
          value={addressObj.vill} 
          onChange={e => handleAddressChange(setter, 'vill', e.target.value)} 
          className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
          placeholder="Premises, Street, or Village" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Post Office (PO) <span className="text-red-500">*</span>
          </Label>
          <Input 
            required 
            value={addressObj.po} 
            onChange={e => handleAddressChange(setter, 'po', e.target.value)} 
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
            placeholder="Post Office name" 
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Landmark</Label>
          <Input 
            value={addressObj.landmark} 
            onChange={e => handleAddressChange(setter, 'landmark', e.target.value)} 
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
            placeholder="Nearby landmark (optional)" 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">District</Label>
          <Input 
            required 
            readOnly 
            value={addressObj.district} 
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700" 
            placeholder="Auto-filled via PIN" 
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">State</Label>
          <Input 
            required 
            readOnly 
            value={addressObj.state} 
            className="h-8 sm:h-9 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700" 
            placeholder="Auto-filled via PIN" 
          />
        </div>
      </div>
    </div>
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!orderAddressObj.phone || !orderAddressObj.vill || !orderAddressObj.po || !orderAddressObj.pin || !orderAddressObj.district || !orderAddressObj.state) {
      return toast.error("Please provide a complete shipping address.");
    }
    if (!paymentProof) {
      return toast.error("Please upload the payment screenshot proof.");
    }

    setIsSubmitting(true);
    const cartItemsData = cart.map(item => ({ variantId: item.variantId, quantity: item.quantity }));
    const result = await placeOrder(workspaceId, cartItemsData, initialConfig?.shippingCost || 0, JSON.stringify(orderAddressObj), paymentProof);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Order placed successfully! You can track it under 'My Orders'.");
      setCart([]);
      setCartOpen(false);
      setCheckoutStep("cart");
      setActiveTab("orders");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to place order.");
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedAddressObj.phone || !savedAddressObj.vill || !savedAddressObj.po || !savedAddressObj.pin || !savedAddressObj.district || !savedAddressObj.state) {
      return toast.error("Please fill all required address fields.");
    }
    setIsSubmitting(true);
    const result = await updateWorkspaceShippingAddress(workspaceId, JSON.stringify(savedAddressObj));
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Default shipping address saved!");
      setOrderAddressObj(savedAddressObj);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save address.");
    }
  };

  // Metrics
  const totalAvailable = activeProducts.length;
  const activeOrders = initialOrders.filter(o => o.status === "PENDING" || o.status === "APPROVED" || o.status === "SHIPPED").length;
  const deliveredOrders = initialOrders.filter(o => o.status === "DELIVERED").length;
  const totalSpent = initialOrders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.variant.price, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = initialConfig?.shippingCost || 0;
  const finalTotal = cartTotal + (cart.length > 0 ? shippingCost : 0);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Catalog Items</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalAvailable}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Active Orders</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{activeOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Delivered</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{deliveredOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Store Spent</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">₹{totalSpent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Horizontal Navigation Tabs (Rule 7.3) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5">
          <button
            onClick={() => setActiveTab("store")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === "store"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Store Products</span>
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
            <Package className="w-3.5 h-3.5" />
            <span>My Orders</span>
            {initialOrders.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 font-bold">
                {initialOrders.length}
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
            <span>Default Shipping Address</span>
          </button>
        </div>

        {/* Quick Cart Action Button */}
        <Button 
          onClick={() => { setCartOpen(true); setCheckoutStep("cart"); }} 
          className="h-8 sm:h-9 rounded-lg px-3 sm:px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-2"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Cart</span>
          {cartItemsCount > 0 && (
            <span className="bg-white text-primary dark:bg-slate-900 dark:text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              {cartItemsCount}
            </span>
          )}
          {cartTotal > 0 && (
            <span className="text-[11px] font-semibold border-l border-white/20 pl-1.5 hidden sm:inline">
              ₹{cartTotal.toLocaleString()}
            </span>
          )}
        </Button>
      </div>

      {/* 3. Filter Toolbar (Rule 7.4) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input 
              placeholder={activeTab === "store" ? "Search uniforms, books, bags..." : "Search orders..."} 
              className="h-8 sm:h-9 pl-8 pr-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-xs placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "store" && categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 sm:h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          )}
        </div>

        {activeTab === "store" && (
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-700 dark:text-slate-300">{filteredProducts.length}</span> items
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* STORE PRODUCTS TAB                                        */}
      {/* ========================================================= */}
      {activeTab === "store" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map(product => {
              const activeVariants = product.variants?.filter((v: any) => v.isActive) || [];
              if (activeVariants.length === 0) return null;
              
              const totalStock = activeVariants.reduce((acc: number, v: any) => acc + v.stock, 0);
              const prices = activeVariants.map((v: any) => v.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);

              return (
                <div 
                  key={product.id} 
                  onClick={() => openProductModal(product)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative cursor-pointer"
                >
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
                    {product.category ? (
                      <span className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                        {product.category}
                      </span>
                    ) : <span />}

                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md",
                      totalStock > 10 
                        ? "bg-emerald-500/90 text-white" 
                        : totalStock > 0 
                        ? "bg-amber-500/90 text-white" 
                        : "bg-rose-500/90 text-white"
                    )}>
                      {totalStock > 0 ? `${totalStock} In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  <div>
                    {/* Image Area */}
                    <div className="relative h-44 w-full bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <Image 
                          src={product.image} 
                          alt={product.title} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <Package className="h-10 w-10 text-slate-300 dark:text-slate-600 transition-transform duration-500 group-hover:scale-110" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3.5 space-y-2">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {product.description || "Official study materials, uniforms, or accessories."}
                        </p>
                      </div>

                      {/* Price & Variant Pill */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {activeVariants.length} {activeVariants.length === 1 ? "Option" : "Options"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Button */}
                  <div className="p-3.5 pt-0">
                    <Button 
                      className="w-full h-8 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-primary hover:text-white transition-all"
                    >
                      <span>Select & Add</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Package className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No products found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try searching with different keywords or reset the category filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MY ORDERS TAB                                             */}
      {/* ========================================================= */}
      {activeTab === "orders" && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 h-9">
                  <th className="px-3.5 py-2 w-12 text-slate-400">#</th>
                  <th className="px-3.5 py-2">Order ID & Date</th>
                  <th className="px-3.5 py-2">Items Summary</th>
                  <th className="px-3.5 py-2">Amount</th>
                  <th className="px-3.5 py-2">Payment</th>
                  <th className="px-3.5 py-2">Status</th>
                  <th className="px-3.5 py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, index) => {
                  const itemsCount = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-3.5 py-2.5 text-xs text-slate-400 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
                        </div>
                        <div className="text-[11px] font-normal text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                          {order.items?.map((item: any) => `${item.productVariant?.product?.title} (${item.productVariant?.name}) ×${item.quantity}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center">
                          ₹{Number(order.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {order.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                            <Clock className="h-2.5 w-2.5" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <Badge className={cn(
                          "font-bold text-[9px] uppercase rounded px-1.5 py-0.5 shadow-none border-none",
                          order.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                          order.status === "APPROVED" ? "bg-blue-500/10 text-blue-600" :
                          order.status === "SHIPPED" ? "bg-purple-500/10 text-purple-600" :
                          order.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-3.5 py-2.5 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Order Details"
                          onClick={() => openOrderDetails(order)}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-500 font-medium">
                      You haven't placed any orders yet. Browse the store catalog to place your first order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls (Rule 7.6) */}
          {filteredOrders.length > itemsPerPage && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs font-medium text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
              </div>
              <div className="flex gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev: any) => Math.max(1, prev - 1))}
                  className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-medium"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage >= Math.ceil(filteredOrders.length / itemsPerPage)}
                  onClick={() => setCurrentPage((prev: any) => prev + 1)}
                  className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-medium"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* DEFAULT SHIPPING CONFIG TAB                               */}
      {/* ========================================================= */}
      {activeTab === "config" && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-xs max-w-2xl space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Default Shipping Address
            </h3>
            <p className="text-xs text-slate-500">
              Save your franchise delivery address so it automatically pre-fills during store checkout.
            </p>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-4 pt-1">
            {renderAddressForm(savedAddressObj, setSavedAddressObj)}
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="h-8 sm:h-9 px-4 rounded-lg font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                <span>Save Default Shipping Address</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PRODUCT VARIANT SELECTION (Rule 7.7)             */}
      {/* ========================================================= */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          {selectedProduct && (
            <>
              {/* Product Top Header */}
              <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {selectedProduct.image ? (
                  <Image 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover" 
                  />
                ) : (
                  <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                )}
                {selectedProduct.category && (
                  <span className="absolute top-2.5 left-2.5 z-10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-md">
                    {selectedProduct.category}
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {selectedProduct.description || "Select options and quantity to add to your order."}
                  </p>
                </div>

                {/* Variant List */}
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Available Variants / Sizes
                  </span>
                  {selectedProduct.variants?.filter((v: any) => v.isActive).map((variant: any) => {
                    const currentQty = modalQuantities[variant.id] || 0;
                    return (
                      <div 
                        key={variant.id} 
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60"
                      >
                        <div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">{variant.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            ₹{variant.price} • {variant.stock > 0 ? (
                              <span className="text-emerald-600 font-semibold">{variant.stock} in stock</span>
                            ) : (
                              <span className="text-red-500 font-semibold">Out of Stock</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button 
                            type="button" 
                            variant="outline" 
                            disabled={variant.stock <= 0 || currentQty <= 0} 
                            className="h-7 w-7 rounded-md p-0 shrink-0" 
                            onClick={() => setModalQuantities(prev => ({ ...prev, [variant.id]: Math.max(0, currentQty - 1) }))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input 
                            type="number" 
                            min={0} 
                            max={variant.stock} 
                            value={currentQty === 0 ? "" : currentQty}
                            placeholder="0"
                            onChange={(e) => {
                              let val = parseInt(e.target.value) || 0;
                              if (val > variant.stock) val = variant.stock;
                              if (val < 0) val = 0;
                              setModalQuantities(prev => ({ ...prev, [variant.id]: val }));
                            }}
                            className="h-7 w-12 text-center text-xs font-semibold rounded-md px-1 [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            disabled={variant.stock <= 0 || currentQty >= variant.stock} 
                            className="h-7 w-7 rounded-md p-0 shrink-0" 
                            onClick={() => setModalQuantities(prev => ({ ...prev, [variant.id]: Math.min(variant.stock, currentQty + 1) }))}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button 
                  onClick={handleAddToCart}
                  disabled={Object.values(modalQuantities).every(qty => qty === 0)}
                  className="w-full h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add Selected Items to Cart</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2: CART & CHECKOUT (Rule 7.7)                       */}
      {/* ========================================================= */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <DialogHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {checkoutStep === "cart" && <><ShoppingCart className="h-4 w-4 text-primary" /> Review Shopping Cart</>}
                {checkoutStep === "shipping" && <><MapPin className="h-4 w-4 text-primary" /> Delivery Address</>}
                {checkoutStep === "payment" && <><QrCode className="h-4 w-4 text-primary" /> Payment & Verification</>}
              </DialogTitle>
              {/* Step indicator */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <span className={cn(checkoutStep === "cart" && "text-primary font-black")}>1. Cart</span>
                <span>→</span>
                <span className={cn(checkoutStep === "shipping" && "text-primary font-black")}>2. Shipping</span>
                <span>→</span>
                <span className={cn(checkoutStep === "payment" && "text-primary font-black")}>3. Pay</span>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
            {checkoutStep === "cart" && (
              <>
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500 font-medium space-y-2">
                    <Package className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Your cart is empty</p>
                    <p className="text-[11px] text-slate-400">Add products from the catalog to start an order.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex flex-col bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 gap-2">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{item.product.title}</span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">Option: {item.variant.name}</span>
                          </div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center shrink-0">
                            ₹{(item.quantity * item.variant.price).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800 pt-2">
                          <span className="text-[11px] font-medium text-slate-500">₹{item.variant.price} × {item.quantity}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-xs">
                              <Button type="button" variant="ghost" className="h-6 w-6 rounded p-0 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleUpdateCartQuantity(item.variantId, item.quantity - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                              <Button type="button" variant="ghost" disabled={item.quantity >= item.variant.stock} className="h-6 w-6 rounded p-0 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleUpdateCartQuantity(item.variantId, item.quantity + 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item.variantId)} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg h-7 w-7 p-0 ml-0.5">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Price Summary */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal</span>
                        <span>₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Standard Shipping</span>
                        <span>₹{shippingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <span>Total Payable</span>
                        <span className="text-primary font-black">₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={() => setCartOpen(false)} className="flex-1 h-8 sm:h-9 rounded-lg text-xs font-semibold">
                        Add More Items
                      </Button>
                      <Button onClick={() => setCheckoutStep("shipping")} className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                        Proceed to Shipping
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {checkoutStep === "shipping" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 mb-2">Confirm the delivery address for this shipment.</p>
                  {renderAddressForm(orderAddressObj, setOrderAddressObj)}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="flex-1 h-8 sm:h-9 rounded-lg text-xs font-semibold">
                    Back to Cart
                  </Button>
                  <Button 
                    onClick={() => setCheckoutStep("payment")} 
                    disabled={!orderAddressObj.phone || !orderAddressObj.vill || !orderAddressObj.pin} 
                    className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === "payment" && (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">Total Amount Payable</p>
                  <p className="text-xl font-bold text-primary flex items-center justify-center">
                    ₹{finalTotal.toLocaleString()}
                  </p>
                </div>

                {initialConfig?.paymentQrCode ? (
                  <div className="flex flex-col items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <Image 
                      src={initialConfig.paymentQrCode} 
                      alt="Payment QR Code" 
                      width={144}
                      height={144}
                      className="w-36 h-36 rounded-lg object-contain bg-white p-1.5 shadow-xs border border-slate-200" 
                    />
                  </div>
                ) : (
                  <div className="p-3 border border-amber-500/20 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-medium text-center">
                    Scan code not configured. Please use direct bank transfer details below.
                  </div>
                )}

                {initialConfig?.paymentDetails && (
                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank & Transfer Details</Label>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{initialConfig.paymentDetails}</p>
                  </div>
                )}

                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <Label className="text-xs font-semibold">Upload Payment Receipt Proof <span className="text-red-500">*</span></Label>
                  <ImageUpload
                    value={paymentProof}
                    onChange={(url) => setPaymentProof(url)}
                    folder="RGYCSP/PaymentProofs"
                    label="Upload Screenshot"
                  />
                  <p className="text-[10px] text-slate-400">Headquarters will verify payment before dispatching items.</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCheckoutStep("shipping")} disabled={isSubmitting} className="flex-1 h-8 sm:h-9 rounded-lg text-xs font-semibold">
                    Back
                  </Button>
                  <Button 
                    onClick={handleCheckout} 
                    disabled={isSubmitting || !paymentProof} 
                    className="flex-1 h-8 sm:h-9 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                    Confirm & Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 3: ORDER DETAILS MODAL (Rule 7.7)                   */}
      {/* ========================================================= */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <DialogHeader className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Order #{selectedOrder?.id.slice(-6).toUpperCase()}</span>
                <Badge className={cn(
                  "font-bold text-[9px] uppercase rounded px-1.5 py-0.5 border-none",
                  selectedOrder?.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                  selectedOrder?.status === "APPROVED" ? "bg-blue-500/10 text-blue-600" :
                  selectedOrder?.status === "SHIPPED" ? "bg-purple-500/10 text-purple-600" :
                  selectedOrder?.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-600" :
                  "bg-slate-100 text-slate-700"
                )}>
                  {selectedOrder?.status}
                </Badge>
              </DialogTitle>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString()}
              </span>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Shipping / Tracking Info */}
              {selectedOrder.trackingNumber && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold mb-1">
                    <Truck className="w-3.5 h-3.5" /> Shipment Tracking Number
                  </div>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {/* Itemized Products */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordered Items</span>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {item.productVariant?.product?.image ? (
                            <Image 
                              src={item.productVariant.product.image} 
                              alt="" 
                              fill
                              sizes="32px"
                              className="object-cover" 
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{item.productVariant?.product?.title}</p>
                          <p className="text-[10px] text-slate-400">{item.productVariant?.name} × {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span>₹{Number(selectedOrder.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Total Order Amount</span>
                  <span className="text-primary font-black">₹{Number(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Address Details */}
              {selectedOrder.shippingAddress && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Address</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedOrder.shippingAddress);
                        return (
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {parsed.phone}
                            </p>
                            <p className="mt-0.5">{parsed.vill}, PO: {parsed.po}{parsed.landmark ? `, Near: ${parsed.landmark}` : ""}</p>
                            <p className="text-[11px] text-slate-500">{parsed.district}, {parsed.state} - {parsed.pin}</p>
                          </div>
                        );
                      } catch {
                        return <p>{selectedOrder.shippingAddress}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Payment Proof Preview */}
              {selectedOrder.paymentProof && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Proof</span>
                  <a 
                    href={selectedOrder.paymentProof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Full Receipt Screenshot</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="outline" 
              onClick={() => setOrderDetailsOpen(false)}
              className="h-8 px-3.5 rounded-lg text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
