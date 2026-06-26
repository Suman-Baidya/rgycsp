import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProducts } from "@/app/actions/product";
import { getAllOrders } from "@/app/actions/product-order";
import { getProductCategories } from "@/app/actions/product-category";
import ProductsClient from "./ProductsClient";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default async function SuperAdminProductsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const [productsRes, ordersRes, categoriesRes] = await Promise.all([
    getProducts(),
    getAllOrders(),
    getProductCategories()
  ]);

  return (
    <div className="w-full space-y-8">
      <AdminPageHeader 
        title="Products & Orders"
        description="Manage your product catalog, update stock, and fulfill franchise orders."
      />
      <ProductsClient 
        initialProducts={productsRes.success ? (productsRes.data || []) : []} 
        initialOrders={ordersRes.success ? (ordersRes.data || []) : []} 
        initialCategories={categoriesRes.success ? (categoriesRes.data || []) : []}
      />
    </div>
  );
}
