import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProducts } from "@/app/actions/product";
import { getAllOrders } from "@/app/actions/product-order";
import { getProductCategories } from "@/app/actions/product-category";
import { getStoreConfig } from "@/app/actions/store-config";
import ProductsClient from "./ProductsClient";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default async function SuperAdminProductsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const [productsRes, ordersRes, categoriesRes, configRes] = await Promise.all([
    getProducts(),
    getAllOrders(),
    getProductCategories(),
    getStoreConfig()
  ]);

  return (
    <div className="w-full">
      <ProductsClient 
        initialProducts={productsRes.success ? (productsRes.data || []) : []} 
        initialOrders={ordersRes.success ? (ordersRes.data || []) : []} 
        initialCategories={categoriesRes.success ? (categoriesRes.data || []) : []}
        initialConfig={configRes.success ? (configRes.data || null) : null}
      />
    </div>
  );
}
