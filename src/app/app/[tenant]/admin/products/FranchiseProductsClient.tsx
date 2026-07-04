"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, IndianRupee, Clock, Package, CheckCircle2, Loader2, Trash2, Plus, Minus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/product-order";
import { cn } from "@/lib/utils";

export default function FranchiseProductsClient({ 
  workspaceId,
  initialProducts, 
  initialOrders,
  initialConfig
}: { 
  workspaceId: string;
  initialProducts: any[];
  initialOrders: any[];
  initialConfig: any;
}) {
  const [activeTab, setActiveTab] = useState<"store" | "orders">("store");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // productId -> variantId
  const [quantities, setQuantities] = useState<Record<string, number>>({}); // variantId -> qty input
  
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

  const handleAddToCart = (product: any) => {
    const variantId = selectedVariants[product.id] || product.variants[0]?.id;
    const variant = product.variants.find((v:any) => v.id === variantId);
    if (!variant) return;
    
    const qty = quantities[variantId] || 1;
    if (qty > variant.stock) return toast.error("Not enough stock available");
    
    setCart(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
         if (existing.quantity + qty > variant.stock) {
            toast.error("Cannot exceed available stock");
            return prev;
         }
         return prev.map(item => item.variantId === variantId ? { ...item, quantity: item.quantity + qty } : item);
      }
      toast.success("Added to cart");
      return [...prev, { variantId, quantity: qty, variant, product }];
    });
  };

  const handleRemoveFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    const cartItemsData = cart.map(item => ({ variantId: item.variantId, quantity: item.quantity }));
    const result = await placeOrder(workspaceId, cartItemsData, initialConfig?.shippingCost || 0);
    
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Order placed successfully! Head to the Orders tab to track it.");
      setCart([]);
      setCartOpen(false);
      setActiveTab("orders");
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
        </div>
        
        {activeTab === "store" && (
          <Button onClick={() => setCartOpen(true)} className="h-10 rounded-xl px-5 font-bold shadow-md shadow-primary/20">
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
              const currentVariantId = selectedVariants[product.id] || product.variants[0]?.id;
              const currentVariant = product.variants.find((v:any) => v.id === currentVariantId);
              const qty = quantities[currentVariantId] || 1;
              const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.stock, 0);

              return (
                <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
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
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{product.description || "No description available for this item."}</p>
                      
                      <div className="space-y-3 mb-2">
                        <div>
                          <Label className="text-xs font-bold text-slate-500 mb-1 block">Variant (Size/Type)</Label>
                          <Select 
                            value={currentVariantId} 
                            onValueChange={val => setSelectedVariants({...selectedVariants, [product.id]: val})}
                          >
                            <SelectTrigger className="h-10 rounded-xl font-medium"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {product.variants.map((v:any) => (
                                <SelectItem key={v.id} value={v.id}>{v.name} - ₹{v.price} ({v.stock} in stock)</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0 mt-auto bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between gap-4 mt-2 pt-2">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" className="h-10 w-10 rounded-xl p-0" onClick={() => setQuantities({...quantities, [currentVariantId]: Math.max(1, qty - 1)})}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input 
                          type="number" 
                          min={1} 
                          max={currentVariant?.stock || 1} 
                          value={qty}
                          onChange={e => setQuantities({...quantities, [currentVariantId]: parseInt(e.target.value) || 1})}
                          className="h-10 w-16 text-center font-bold rounded-xl"
                        />
                        <Button type="button" variant="outline" className="h-10 w-10 rounded-xl p-0" onClick={() => setQuantities({...quantities, [currentVariantId]: Math.min(currentVariant?.stock || 1, qty + 1)})}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        disabled={!currentVariant || currentVariant.stock <= 0}
                        className="rounded-xl h-10 px-6 font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
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

      {/* Cart Modal */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <DialogTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" /> Checkout Cart
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6 bg-white dark:bg-slate-950 max-h-[70vh] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.product.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Variant: {item.variant.name}</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">₹{item.variant.price} x {item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-slate-900 dark:text-white flex items-center">
                        <IndianRupee className="h-3 w-3 mr-0.5" />{item.quantity * item.variant.price}
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item.variantId)} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
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

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-500 p-4 rounded-xl text-xs font-medium">
                  <strong>Note:</strong> Payment will be collected offline by the headquarters. Once the order is approved by HQ, stock will be secured for you.
                </div>

                <Button onClick={handleCheckout} disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-base mt-2 shadow-md shadow-primary/20">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                  {isSubmitting ? "Processing..." : "Confirm & Place Order"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
