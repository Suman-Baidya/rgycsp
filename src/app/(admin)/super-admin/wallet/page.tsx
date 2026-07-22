import { 
  getFranchiseWallets, 
  getPendingRechargeRequests, 
  getRegistrationFeeConfig, 
  getWalletPaymentConfig,
  getAllWalletTransactions,
  getPlatformFeeConfigs
} from "@/app/actions/wallet";
import WalletManagementClient from "./WalletManagementClient";
import { redirect } from "next/navigation";

export default async function SuperAdminWalletPage() {
  const walletsRes = await getFranchiseWallets();
  const requestsRes = await getPendingRechargeRequests();
  const feeConfigRes = await getRegistrationFeeConfig();
  const paymentConfigRes = await getWalletPaymentConfig();
  const allTransactionsRes = await getAllWalletTransactions();
  const platformFeeRes = await getPlatformFeeConfigs();

  if (!walletsRes.success || !requestsRes.success || !feeConfigRes.success || !paymentConfigRes.success || !allTransactionsRes.success) {
    return <div>Failed to load wallet data.</div>;
  }

  return (
    <WalletManagementClient 
      wallets={walletsRes.data as any} 
      requests={requestsRes.data as any} 
      feeConfig={feeConfigRes.data as any} 
      paymentConfig={paymentConfigRes.data as any} 
      allTransactions={allTransactionsRes.data as any}
      platformFees={platformFeeRes.data as any || []}
    />
  );
}
