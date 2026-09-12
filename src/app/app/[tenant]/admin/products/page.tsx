import { db } from "@/lib/prisma";
import { getProducts } from "@/app/actions/product";
import { getWorkspaceOrders } from "@/app/actions/product-order";
import { getStoreConfig } from "@/app/actions/store-config";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import FranchiseProductsClient from "./FranchiseProductsClient";
import { notFound } from "next/navigation";

export default async function FranchiseProductsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant.toLowerCase() },
    select: { id: true, name: true, shippingAddress: true }
  });

  if (!workspace) notFound();

  const [productsRes, ordersRes, configRes] = await Promise.all([
    getProducts(),
    getWorkspaceOrders(workspace.id),
    getStoreConfig()
  ]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Products & Store"
        description="Order uniforms, books, bags, and ID cards directly from headquarters."
      />
      <FranchiseProductsClient 
        workspaceId={workspace.id}
        initialShippingAddress={workspace.shippingAddress || ""}
        initialProducts={productsRes.success ? (productsRes.data || []) : []} 
        initialOrders={ordersRes.success ? (ordersRes.data || []) : []} 
        initialConfig={configRes.success ? (configRes.data || null) : null}
      />
    </div>
  );
}
