"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, IndianRupee, Clock, Package, CheckCircle2, Loader2 } from "lucide-react";
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
import { createOrder } from "@/app/actions/product-order";
import { cn } from "@/lib/utils";

export default function FranchiseProductsClient({ 
  workspaceId,
  initialProducts, 
  initialOrders 
}: { 
  workspaceId: string;
  initialProducts: any[];
  initialOrders: any[];
}) {
  const [activeTab, setActiveTab] = useState<"store" | "orders">("store");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Only show active products to franchises
  const activeProducts = initialProducts.filter(p => p.isActive);
  const filteredProducts = activeProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredOrders = initialOrders.filter(o => o.product.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity < 1) return;
    
    setIsSubmitting(true);
    const result = await createOrder(workspaceId, selectedProduct.id, quantity);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Order placed successfully! Head to the Orders tab to track it.");
      setOrderModalOpen(false);
      setQuantity(1);
      setActiveTab("orders");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  // Calculate Statistics
  const totalAvailable = activeProducts.length;
  const activeOrders = initialOrders.filter(o => o.status === "PENDING" || o.status === "APPROVED" || o.status === "SHIPPED").length;
  const totalSpent = initialOrders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.totalPrice, 0);

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
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
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
                        product.stock > 10 ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" : 
                        product.stock > 0 ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" : 
                        "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20"
                      )}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{product.description || "No description available for this item."}</p>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <Package className="h-3.5 w-3.5" />
                      {product.stock} items available
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 mt-auto">
                  <div className="flex items-center justify-between gap-4 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                      <span className="font-black text-xl text-primary flex items-center">
                        <IndianRupee className="h-4 w-4 mr-0.5" /> {product.price}
                      </span>
                    </div>
                    <Button 
                      onClick={() => { setSelectedProduct(product); setQuantity(1); setOrderModalOpen(true); }}
                      disabled={product.stock <= 0}
                      className="rounded-xl h-10 px-6 font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> Order
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-5 pl-8 w-16">Sl.</th>
                    <th className="p-5">Order ID & Date</th>
                    <th className="p-5">Product Details</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Payment</th>
                    <th className="p-5 pr-8 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, index) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 pl-8 font-bold text-slate-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-5">
                        <div className="font-mono text-xs font-bold text-slate-700">#{order.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-800">{order.product.title}</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">Quantity: {order.quantity}</div>
                      </td>
                      <td className="p-5 font-black text-slate-800 flex items-center mt-2.5">
                        <IndianRupee className="h-3 w-3 mr-0.5" />{order.totalPrice}
                      </td>
                      <td className="p-5">
                        {order.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md uppercase">
                            <Clock className="h-3 w-3" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <Badge className={cn(
                          "font-bold text-[10px] uppercase rounded-md px-2 py-0.5 shadow-none",
                          order.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                          order.status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                          order.status === "SHIPPED" ? "bg-purple-100 text-purple-700" :
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-slate-500 font-medium">You haven't placed any orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-slate-800">{filteredOrders.length}</span> orders
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

      {/* Order Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 border-b bg-slate-50">
            <DialogTitle className="text-2xl font-bold">Place Order</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handleOrderSubmit} className="p-8 pt-6 space-y-6">
              
              <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedProduct.title}</h4>
                  <div className="text-sm font-medium text-slate-500 mt-1 flex items-center">
                    Price: <IndianRupee className="h-3 w-3 ml-1 mr-0.5" />{selectedProduct.price} / unit
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Select Quantity</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" className="h-12 w-12 rounded-xl text-lg font-bold" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <Input 
                    type="number" 
                    min={1} 
                    max={selectedProduct.stock} // Though technically they could order more if backend allowed, we restrict to stock
                    value={quantity} 
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-12 text-center text-lg font-bold rounded-xl"
                  />
                  <Button type="button" variant="outline" className="h-12 w-12 rounded-xl text-lg font-bold" onClick={() => setQuantity(quantity + 1)}>+</Button>
                </div>
                <p className="text-[10px] font-medium text-slate-500 text-right">Available stock: {selectedProduct.stock}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-slate-900 flex items-center">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {(selectedProduct.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-medium">
                <strong>Note:</strong> Payment will be collected offline by the headquarters. Once the order is approved by HQ, stock will be secured for you.
              </div>

              <Button type="submit" disabled={isSubmitting || quantity > selectedProduct.stock} className="w-full h-12 rounded-xl font-bold text-base mt-2">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShoppingCart className="h-5 w-5 mr-2" />}
                {isSubmitting ? "Processing..." : "Confirm Order"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
