"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, IndianRupee, Clock, Package, CheckCircle2, Loader2, Trash2, Plus, Minus, MapPin, QrCode, UploadCloud, Settings } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/product-order";
import { updateWorkspaceShippingAddress } from "@/app/actions/workspaces";
import { getPincodeDetails } from "@/app/actions/pincode";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";

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
  
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "payment">("cart");
  
  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalQuantities, setModalQuantities] = useState<Record<string, number>>({});

  const defaultAddressObj = { phone: "", vill: "", po: "", pin: "", district: "", state: "", landmark: "" };
  const getInitialAddressObj = () => {
    if (!initialShippingAddress) return defaultAddressObj;
    try {
      const parsed = JSON.parse(initialShippingAddress);
      if (parsed.pin) return parsed;
    } catch {}
    return { ...defaultAddressObj, landmark: initialShippingAddress }; 
  };

  // Checkout State
  const [orderAddressObj, setOrderAddressObj] = useState<any>(getInitialAddressObj());
  const [paymentProof, setPaymentProof] = useState("");
  
  // Config Tab State
  const [savedAddressObj, setSavedAddressObj] = useState<any>(getInitialAddressObj());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const activeProducts = initialProducts.filter(p => p.isActive && p.variants?.length > 0);
  const filteredProducts = activeProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = initialOrders.filter(o => o.items?.some((i: any) => i.productVariant?.product?.title.toLowerCase().includes(searchTerm.toLowerCase())));

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setModalQuantities({});
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    let addedCount = 0;
    let newCart = [...cart];
    
    selectedProduct.variants.filter((v:any) => v.isActive).forEach((variant: any) => {
      const qty = modalQuantities[variant.id] || 0;
      if (qty > 0) {
        if (qty > variant.stock) {
          toast.error(`Not enough stock for ${variant.name}`);
          return;
        }
        
        const existingIndex = newCart.findIndex(item => item.variantId === variant.id);
        if (existingIndex >= 0) {
          if (newCart[existingIndex].quantity + qty > variant.stock) {
            toast.error(`Cannot exceed stock for ${variant.name}`);
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
      toast.success("Added to cart");
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
        toast.success("Location auto-filled from PIN Code!", { id: "pin-fetch" });
      } else {
        toast.error("Invalid PIN Code or details not found.", { id: "pin-fetch" });
      }
    }
  };

  const renderAddressForm = (addressObj: any, setter: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
          <Input required value={addressObj.phone} onChange={e => handleAddressChange(setter, 'phone', e.target.value)} className="h-11 rounded-xl" placeholder="10-digit number" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">PIN Code <span className="text-red-500">*</span></Label>
          <Input required value={addressObj.pin} onChange={e => handleAddressChange(setter, 'pin', e.target.value.replace(/\D/g, '').slice(0, 6))} className="h-11 rounded-xl" placeholder="6-digit PIN" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">Village / Ward / Street <span className="text-red-500">*</span></Label>
        <Input required value={addressObj.vill} onChange={e => handleAddressChange(setter, 'vill', e.target.value)} className="h-11 rounded-xl" placeholder="Enter Village, Ward, or Street name" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">Post Office (PO) <span className="text-red-500">*</span></Label>
          <Input required value={addressObj.po} onChange={e => handleAddressChange(setter, 'po', e.target.value)} className="h-11 rounded-xl" placeholder="Post Office" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">Landmark</Label>
          <Input value={addressObj.landmark} onChange={e => handleAddressChange(setter, 'landmark', e.target.value)} className="h-11 rounded-xl" placeholder="Optional landmark" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">District <span className="text-red-500">*</span></Label>
          <Input required readOnly value={addressObj.district} className="h-11 rounded-xl bg-slate-50 text-slate-500" placeholder="Auto-filled via PIN" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">State <span className="text-red-500">*</span></Label>
          <Input required readOnly value={addressObj.state} className="h-11 rounded-xl bg-slate-50 text-slate-500" placeholder="Auto-filled via PIN" />
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
      return toast.error("Please upload the payment screenshot.");
    }

    setIsSubmitting(true);
    
    const cartItemsData = cart.map(item => ({ variantId: item.variantId, quantity: item.quantity }));
    const result = await placeOrder(workspaceId, cartItemsData, initialConfig?.shippingCost || 0, JSON.stringify(orderAddressObj), paymentProof);
    
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Order placed successfully! Head to the Orders tab to track it.");
      setCart([]);
      setCartOpen(false);
      setCheckoutStep("cart");
      setActiveTab("orders");
      router.refresh();
    } else {
      toast.error(result.error);
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
      toast.error(result.error);
    }
  };

  const totalAvailable = activeProducts.length;
  const activeOrders = initialOrders.filter(o => o.status === "PENDING" || o.status === "APPROVED" || o.status === "SHIPPED").length;
  const totalSpent = initialOrders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.variant.price, 0);
  const shippingCost = initialConfig?.shippingCost || 0;
  const finalTotal = cartTotal + (cart.length > 0 ? shippingCost : 0);

  return (
    <div className="space-y-6">
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Available Products</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalAvailable}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
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
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Spent</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("store")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
              activeTab === "store"
                ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Available Products
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
            <Package className="w-4 h-4" />
            My Orders
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
            Order Config
          </button>
        </div>
        
        {activeTab === "store" && (
          <Button onClick={() => { setCartOpen(true); setCheckoutStep("cart"); }} className="h-10 rounded-xl px-5 font-bold shadow-md shadow-primary/20">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart ({cart.length})
          </Button>
        )}
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder={activeTab === "store" ? "Search for uniforms, books, bags..." : "Search your orders..."} 
          className="pl-9 h-11 rounded-xl bg-white border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === "store" && (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const activeVariants = product.variants?.filter((v: any) => v.isActive) || [];
              if (activeVariants.length === 0) return null; // Don't show products with no active variants
              const totalStock = activeVariants.reduce((acc: number, v: any) => acc + v.stock, 0);

              return (
                <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative cursor-pointer" onClick={() => openProductModal(product)}>
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="rounded-lg px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm bg-black/60 text-white backdrop-blur-md border-0">{product.category}</Badge>
                  </div>
                  <div>
                    <div className="relative h-48 w-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <Package className="h-10 w-10 text-slate-300 dark:text-slate-600 transition-transform duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight line-clamp-2">{product.title}</h3>
                        <div className={cn("shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wide", 
                          totalStock > 10 ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" : 
                          totalStock > 0 ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" : 
                          "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20"
                        )}>
                          {totalStock > 0 ? "In Stock" : "Out of Stock"}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{product.description || "No description available for this item."}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0 mt-auto">
                    <Button className="w-full h-11 rounded-xl font-bold bg-black text-white hover:bg-black/80 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">Select Variant</Button>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                No products found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="p-5 pl-8 w-16">Sl.</th>
                    <th className="p-5">Order ID & Date</th>
                    <th className="p-5">Items</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Payment</th>
                    <th className="p-5 pr-8 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, index) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-5 pl-8 font-bold text-slate-500 dark:text-slate-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-5">
                        <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">#{order.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{order.items?.length || 0} Items</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {order.items?.map((item: any) => `${item.productVariant?.product?.title} (${item.productVariant?.name}) x${item.quantity}`).join(', ')}
                        </div>
                      </td>
                      <td className="p-5 font-black text-slate-800 dark:text-slate-200 flex items-center mt-2.5">
                        <IndianRupee className="h-3 w-3 mr-0.5" />{order.totalAmount}
                      </td>
                      <td className="p-5">
                        {order.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 dark:bg-green-500/10 dark:text-green-500 px-2 py-1 rounded-md uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-500 px-2 py-1 rounded-md uppercase">
                            <Clock className="h-3 w-3" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <Badge className={cn(
                          "font-bold text-[10px] uppercase rounded-md px-2 py-0.5 shadow-none",
                          order.status === "PENDING" ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500" :
                          order.status === "APPROVED" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500" :
                          order.status === "SHIPPED" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-500" :
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-slate-500 dark:text-slate-400 font-medium">You haven't placed any orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredOrders.length}</span> orders
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev: any) => Math.max(1, prev - 1))}
                    className="rounded-lg font-bold"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage >= Math.ceil(filteredOrders.length / itemsPerPage)}
                    onClick={() => setCurrentPage((prev: any) => prev + 1)}
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
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Order Configuration</h2>
          <form onSubmit={handleSaveAddress} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Default Shipping Address</Label>
              <p className="text-xs text-slate-500 mb-4">This address will be auto-filled when you place a new product order.</p>
              {renderAddressForm(savedAddressObj, setSavedAddressObj)}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-base shadow-md shadow-primary/20">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Default Address"}
            </Button>
          </form>
        </div>
      )}

      {/* Product Selection Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden">
          {selectedProduct && (
            <>
              <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-slate-300" />
                )}
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div>
                  <h3 className="font-bold text-2xl text-slate-900 leading-tight mb-2">{selectedProduct.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3">{selectedProduct.description || "No description available."}</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-100 max-h-[40vh] overflow-y-auto custom-scrollbar">
                  {selectedProduct.variants?.filter((v:any) => v.isActive).map((variant: any) => {
                    const currentQty = modalQuantities[variant.id] || 0;
                    return (
                      <div key={variant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{variant.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">₹{variant.price} • {variant.stock > 0 ? <span className="text-emerald-600 font-semibold">{variant.stock} in stock</span> : <span className="text-red-500 font-semibold">Out of Stock</span>}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" disabled={variant.stock <= 0 || currentQty <= 0} className="h-9 w-9 rounded-lg p-0 shrink-0" onClick={() => setModalQuantities(prev => ({...prev, [variant.id]: Math.max(0, currentQty - 1)}))}>
                            <Minus className="h-4 w-4" />
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
                              setModalQuantities(prev => ({...prev, [variant.id]: val}));
                            }}
                            className="h-9 w-14 text-center font-bold rounded-lg px-1 [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                          />
                          <Button type="button" variant="outline" disabled={variant.stock <= 0 || currentQty >= variant.stock} className="h-9 w-9 rounded-lg p-0 shrink-0" onClick={() => setModalQuantities(prev => ({...prev, [variant.id]: Math.min(variant.stock, currentQty + 1)}))}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button 
                  onClick={handleAddToCart}
                  disabled={Object.values(modalQuantities).every(qty => qty === 0)}
                  className="w-full h-12 rounded-xl font-bold text-base shadow-md shadow-primary/20 bg-black text-white hover:bg-black/80"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart & Checkout Modal */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <DialogTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              {checkoutStep === "cart" && <><ShoppingCart className="h-5 w-5 text-primary" /> Shopping Cart</>}
              {checkoutStep === "shipping" && <><MapPin className="h-5 w-5 text-primary" /> Shipping Address</>}
              {checkoutStep === "payment" && <><QrCode className="h-5 w-5 text-primary" /> Payment & Verification</>}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-white dark:bg-slate-950 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {checkoutStep === "cart" && (
              <>
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-medium">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    Your cart is empty.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex flex-col bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">{item.product.title}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">Variant: {item.variant.name}</span>
                          </div>
                          <span className="font-black text-sm text-slate-900 dark:text-white flex items-center shrink-0">
                            <IndianRupee className="h-3 w-3 mr-0.5" />{item.quantity * item.variant.price}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-700/60 pt-3 mt-1">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">₹{item.variant.price} x {item.quantity}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
                              <Button type="button" variant="ghost" className="h-7 w-7 rounded-md p-0 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleUpdateCartQuantity(item.variantId, item.quantity - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                              <Button type="button" variant="ghost" disabled={item.quantity >= item.variant.stock} className="h-7 w-7 rounded-md p-0 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleUpdateCartQuantity(item.variantId, item.quantity + 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item.variantId)} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg h-8 w-8 p-0 ml-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="sticky -bottom-6 -mx-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-800 z-10 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.5)]">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm font-medium text-slate-500">
                          <span>Subtotal</span>
                          <span className="flex items-center"><IndianRupee className="h-3 w-3 mr-0.5" />{cartTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-slate-500">
                          <span>Shipping</span>
                          <span className="flex items-center"><IndianRupee className="h-3 w-3 mr-0.5" />{shippingCost}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>Total Amount</span>
                          <span className="flex items-center text-primary"><IndianRupee className="h-4 w-4 mr-0.5" />{finalTotal}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCartOpen(false)} className="flex-1 h-11 rounded-xl font-bold text-sm border-slate-200 bg-white dark:bg-slate-900">
                          Add More Items
                        </Button>
                        <Button onClick={() => setCheckoutStep("shipping")} className="flex-1 h-11 rounded-xl font-bold text-sm shadow-md shadow-primary/20 bg-black text-white hover:bg-black/80 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {checkoutStep === "shipping" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Delivery Address</Label>
                  <p className="text-xs text-slate-500 mb-4">Please provide a complete address for smooth delivery.</p>
                  {renderAddressForm(orderAddressObj, setOrderAddressObj)}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="flex-1 h-11 rounded-xl font-bold text-sm">Back</Button>
                  <Button onClick={() => setCheckoutStep("payment")} disabled={!orderAddressObj.phone || !orderAddressObj.vill || !orderAddressObj.pin} className="flex-1 h-11 rounded-xl font-bold text-sm shadow-md shadow-primary/20">Continue to Payment</Button>
                </div>
              </div>
            )}

            {checkoutStep === "payment" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold text-blue-900 mb-1">Total Amount Payable</p>
                  <p className="text-3xl font-black text-blue-600 flex items-center justify-center"><IndianRupee className="h-6 w-6 mr-1" />{finalTotal}</p>
                </div>

                {initialConfig?.paymentQrCode ? (
                  <div className="flex flex-col items-center p-4 border border-slate-200 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Scan to Pay</p>
                    <img src={initialConfig.paymentQrCode} alt="Payment QR Code" className="w-48 h-48 rounded-xl object-contain bg-white p-2 shadow-sm" />
                  </div>
                ) : (
                  <div className="p-4 border border-amber-200 rounded-2xl bg-amber-50 text-amber-800 text-sm font-medium text-center">
                    No QR code available. Please use the bank details below.
                  </div>
                )}

                {initialConfig?.paymentDetails && (
                  <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank / UPI Details</Label>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{initialConfig.paymentDetails}</p>
                  </div>
                )}

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <Label className="text-sm font-bold text-slate-700">Upload Payment Screenshot <span className="text-red-500">*</span></Label>
                  <ImageUpload
                    value={paymentProof}
                    onChange={(url) => setPaymentProof(url)}
                    folder="RGYCSP/PaymentProofs"
                    label="Upload Screenshot"
                  />
                  <p className="text-xs text-slate-500">Your order will be marked as paid and processed once the admin manually verifies this screenshot.</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setCheckoutStep("shipping")} disabled={isSubmitting} className="flex-1 h-11 rounded-xl font-bold text-sm">Back</Button>
                  <Button onClick={handleCheckout} disabled={isSubmitting || !paymentProof} className="flex-1 h-11 rounded-xl font-bold text-sm shadow-md shadow-primary/20 bg-green-600 hover:bg-green-700 text-white">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
