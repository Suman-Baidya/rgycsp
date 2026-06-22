"use server";

import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// Super Admin Actions
// ============================================

export async function getRegistrationFeeConfig() {
  try {
    const config = await prisma.registrationFeeConfig.findMany({
      orderBy: { duration: 'asc' }
    });
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRegistrationFeeConfig(data: { id?: string, duration: string, amount: number }[]) {
  try {
    // Basic sync: delete those not in list, update existing, create new
    // For simplicity, let's just clear and recreate if not many, or use upsert.
    const currentConfigs = await prisma.registrationFeeConfig.findMany();
    const currentIds = currentConfigs.map(c => c.id);
    
    const inputIds = data.filter(d => d.id).map(d => d.id as string);
    const toDelete = currentIds.filter(id => !inputIds.includes(id));

    if (toDelete.length > 0) {
      await prisma.registrationFeeConfig.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    for (const item of data) {
      if (item.id) {
        await prisma.registrationFeeConfig.update({
          where: { id: item.id },
          data: { duration: item.duration, amount: item.amount }
        });
      } else {
        await prisma.registrationFeeConfig.create({
          data: { duration: item.duration, amount: item.amount }
        });
      }
    }

    revalidatePath("/(admin)/super-admin/wallet", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWalletPaymentConfig() {
  try {
    let config = await prisma.walletPaymentConfig.findFirst();
    if (!config) {
      config = await prisma.walletPaymentConfig.create({
        data: {}
      });
    }
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWalletPaymentConfig(id: string, data: {
  upiId?: string;
  qrCodeUrl?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  instructions?: string;
  agreementTerms?: string;
  guideTitle?: string;
  guideDescription?: string;
  guideYoutubeLink?: string;
}) {
  try {
    // There should only be one config record. If it doesn't exist, create it.
    const existing = await prisma.walletPaymentConfig.findFirst();
    if (existing) {
      const updated = await prisma.walletPaymentConfig.update({
        where: { id: existing.id },
        data
      });
      revalidatePath('/super-admin/wallet');
      return { success: true, data: updated };
    } else {
      const created = await prisma.walletPaymentConfig.create({
        data
      });
      revalidatePath('/super-admin/wallet');
      return { success: true, data: created };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingRechargeRequests() {
  try {
    const requests = await prisma.walletTransaction.findMany({
      where: {
        type: 'CREDIT',
        status: 'PENDING'
      },
      include: {
        workspace: {
          select: { name: true, subdomain: true, id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveRechargeRequest(transactionId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'CREDIT') {
        throw new Error("Invalid transaction or already processed.");
      }

      // Update transaction status
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { status: 'APPROVED' }
      });

      // Update workspace wallet balance
      const workspace = await tx.workspace.update({
        where: { id: transaction.workspaceId },
        data: { walletBalance: { increment: transaction.amount } },
        select: { id: true, name: true, referredById: true, isReferralCommissionEnabled: true, referralCommissionRate: true, referralCommissionExpiry: true }
      });
      
      // Process State Manager Commission
      if (workspace.referredById && workspace.isReferralCommissionEnabled) {
        const referrer = await tx.workspace.findUnique({
          where: { id: workspace.referredById },
          select: { id: true, isStateManager: true, commissionReleaseHours: true }
        });

        if (referrer && referrer.isStateManager) {
          const expiryDate = workspace.referralCommissionExpiry;
          const isValid = !expiryDate || expiryDate > new Date();
          const commissionRate = workspace.referralCommissionRate || 0;

          if (isValid && commissionRate > 0) {
            const commissionAmount = transaction.amount * (commissionRate / 100);
            
            // Queue pending commission based on configuration
            const releaseAt = new Date();
            // @ts-ignore: Prisma client cache issue
            releaseAt.setHours(releaseAt.getHours() + (referrer.commissionReleaseHours || 24));

            await tx.walletTransaction.create({
              data: {
                workspaceId: referrer.id,
                amount: commissionAmount,
                type: 'CREDIT',
                status: 'PENDING',
                description: `Commission from ${workspace.name} wallet recharge`,
                referenceId: `COMM-${Date.now()}`,
                sourceWorkspaceId: workspace.id,
                isCommission: true,
                releaseAt
              }
            });
          }
        }
      }
      
      // Create a notification for the franchise
      await tx.notification.create({
        data: {
          workspaceId: transaction.workspaceId,
          title: "Wallet Recharged",
          message: `Your wallet has been recharged with ${transaction.amount}. Reference: ${transaction.referenceId || 'N/A'}`,
          type: "SUCCESS",
          link: "/admin/wallet"
        }
      });
    });

    revalidatePath("/(admin)/super-admin/wallet", "page");
    // Also revalidate the tenant wallet page, but we don't have the tenant in path directly here.
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function directRecharge(workspaceId: string, amount: number, reason: string, isPromotional: boolean = false) {
  try {
    await prisma.$transaction(async (tx) => {
      const referenceId = 'DIRECT-' + Date.now();
      
      await tx.walletTransaction.create({
        data: {
          workspaceId,
          amount,
          type: 'CREDIT',
          status: 'APPROVED',
          description: reason,
          referenceId,
          isPromotional,
        }
      });

      const workspace = await tx.workspace.update({
        where: { id: workspaceId },
        data: { walletBalance: { increment: amount } },
        select: { id: true, name: true, referredById: true, isReferralCommissionEnabled: true, referralCommissionRate: true, referralCommissionExpiry: true }
      });
      
      // Process State Manager Commission (Only if NOT promotional)
      if (!isPromotional && workspace.referredById && workspace.isReferralCommissionEnabled) {
        const referrer = await tx.workspace.findUnique({
          where: { id: workspace.referredById },
          select: { id: true, isStateManager: true, commissionReleaseHours: true }
        });

        if (referrer && referrer.isStateManager) {
          const expiryDate = workspace.referralCommissionExpiry;
          const isValid = !expiryDate || expiryDate > new Date();
          const commissionRate = workspace.referralCommissionRate || 0;

          if (isValid && commissionRate > 0) {
            const commissionAmount = amount * (commissionRate / 100);
            
            // Queue pending commission based on configuration
            const releaseAt = new Date();
            // @ts-ignore: Prisma client cache issue
            releaseAt.setHours(releaseAt.getHours() + (referrer.commissionReleaseHours || 24));

            await tx.walletTransaction.create({
              data: {
                workspaceId: referrer.id,
                amount: commissionAmount,
                type: 'CREDIT',
                status: 'PENDING',
                description: `Commission from ${workspace.name} direct recharge`,
                referenceId: `COMM-${Date.now()}`,
                sourceWorkspaceId: workspace.id,
                isCommission: true,
                releaseAt
              }
            });
          }
        }
      }
      
      await tx.notification.create({
        data: {
          workspaceId,
          title: "Direct Wallet Recharge",
          message: `Your wallet has been recharged with ${amount} by the admin. Reason: ${reason}`,
          type: "SUCCESS",
          link: "/admin/wallet"
        }
      });
    });

    revalidatePath("/(admin)/super-admin/wallet", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectRechargeRequest(transactionId: string, reason?: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction || transaction.status !== 'PENDING' || transaction.type !== 'CREDIT') {
        throw new Error("Invalid transaction or already processed.");
      }

      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { 
          status: 'REJECTED',
          rejectionReason: reason || null
        }
      });
      
      await tx.notification.create({
        data: {
          workspaceId: transaction.workspaceId,
          title: "Wallet Recharge Rejected",
          message: `Your wallet recharge request for ${transaction.amount} was rejected. ${reason ? 'Reason: ' + reason : ''}`,
          type: "ERROR",
          link: "/admin/wallet"
        }
      });
    });

    revalidatePath("/(admin)/super-admin/wallet", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFranchiseWallets() {
  try {
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        walletBalance: true,
      },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: workspaces };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllWalletTransactions() {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      include: {
        workspace: {
          select: { name: true, subdomain: true, id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: transactions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRejectedTransaction(transactionId: string) {
  try {
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || transaction.status !== 'REJECTED') {
      throw new Error("Can only delete rejected transactions.");
    }

    await prisma.walletTransaction.delete({
      where: { id: transactionId }
    });

    revalidatePath("/(admin)/super-admin/wallet", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Franchise Admin Actions
// ============================================

export async function submitRechargeRequest(
  workspaceId: string, 
  amount: number, 
  referenceId: string, 
  receiptUrl: string,
  tenant: string
) {
  try {
    await prisma.walletTransaction.create({
      data: {
        workspaceId,
        amount,
        type: 'CREDIT',
        status: 'PENDING',
        referenceId,
        receiptUrl,
        description: `Wallet recharge request (Ref: ${referenceId})`
      }
    });

    revalidatePath(`/app/${tenant}/admin/wallet`, "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWorkspaceWallet(workspaceId: string) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { walletBalance: true }
    });
    
    const transactions = await prisma.walletTransaction.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
    
    return { success: true, balance: workspace?.walletBalance || 0, transactions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
