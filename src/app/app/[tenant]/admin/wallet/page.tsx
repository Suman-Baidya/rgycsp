import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { getWorkspaceWallet, getWalletPaymentConfig } from "@/app/actions/wallet";
import { db as prisma } from "@/lib/prisma";
import WalletDashboardClient from "./WalletDashboardClient";

export default async function FranchiseWalletPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const workspace = await prisma.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() }
  });

  if (!workspace) {
    redirect(await getServerTenantLink("/", tenant));
  }

  const walletRes = await getWorkspaceWallet(workspace.id);
  const paymentConfigRes = await getWalletPaymentConfig();

  if (!walletRes.success) {
    return <div>Failed to load wallet dashboard: {walletRes.error}</div>;
  }
  if (!paymentConfigRes.success) {
    return <div>Failed to load payment config: {paymentConfigRes.error}</div>;
  }

  return (
    <WalletDashboardClient 
      workspaceId={workspace.id}
      tenant={tenant}
      balance={walletRes.balance as number}
      transactions={walletRes.transactions as any[]}
      paymentConfig={paymentConfigRes.data as any}
    />
  );
}
