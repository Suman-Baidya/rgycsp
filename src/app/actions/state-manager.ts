"use server";

import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// Super Admin Actions
// ============================================

export async function generateUniqueReferralId(): Promise<string> {
  while (true) {
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();
    const existing = await prisma.workspace.findUnique({
      where: { ownReferralId: randomId }
    });
    if (!existing) {
      return randomId;
    }
  }
}

export async function getStateManagers() {
  try {
    const managers = await prisma.workspace.findMany({
      where: { isStateManager: true },
      select: {
        id: true,
        name: true,
        subdomain: true,
        ownReferralId: true,
        // @ts-ignore: Prisma client cache issue with new schema fields
        commissionReleaseHours: true,
        _count: {
          select: { referredWorkspaces: true }
        },
        referredWorkspaces: {
          select: {
            referralCommissionRate: true,
            referralCommissionExpiry: true,
            isReferralCommissionEnabled: true
          }
        },
        walletTransactions: {
          where: { isCommission: true },
          select: { amount: true, status: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    // Calculate total earned and pending for each manager
    const enhancedManagers = managers.map((m: any) => {
      const totalEarned = m.walletTransactions.filter((tx: any) => tx.status === 'APPROVED').reduce((sum: number, tx: any) => sum + tx.amount, 0);
      const totalPending = m.walletTransactions.filter((tx: any) => tx.status === 'PENDING').reduce((sum: number, tx: any) => sum + tx.amount, 0);
      
      const rates = m.referredWorkspaces
        .filter((rw: any) => rw.isReferralCommissionEnabled)
        .map((rw: any) => rw.referralCommissionRate);
      
      const uniqueRates = [...new Set(rates)].sort((a: any, b: any) => a - b);
      let displayRate = "0%";
      if (uniqueRates.length === 1) displayRate = `${uniqueRates[0]}%`;
      else if (uniqueRates.length > 1) displayRate = `${uniqueRates[0]}% - ${uniqueRates[uniqueRates.length - 1]}%`;
      else displayRate = "0%";

      const expirations = m.referredWorkspaces
        .filter((rw: any) => rw.isReferralCommissionEnabled)
        .map((rw: any) => rw.referralCommissionExpiry);
      
      let displayValidity = "N/A";
      if (expirations.length > 0) {
        const hasPermanent = expirations.some((exp: any) => !exp);
        const hasExpiry = expirations.some((exp: any) => exp);
        if (hasPermanent && hasExpiry) displayValidity = "Mixed";
        else if (hasPermanent) displayValidity = "Permanent";
        else if (uniqueRates.length === 1 && expirations.length === 1) {
          displayValidity = new Date(expirations[0]).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
        } else {
          displayValidity = "Varies";
        }
      }

      return {
        id: m.id,
        name: m.name,
        subdomain: m.subdomain,
        ownReferralId: m.ownReferralId,
        commissionReleaseHours: m.commissionReleaseHours,
        _count: m._count,
        totalEarned,
        totalPending,
        displayRate,
        displayValidity
      };
    });
    
    return { success: true, data: enhancedManagers };
  } catch (error: any) {
    console.error("getStateManagers Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllFranchisesForAssignment() {
  try {
    const franchises = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        isStateManager: true,
        appliedReferralId: true,
        referralCommissionRate: true,
        referralCommissionExpiry: true,
        isReferralCommissionEnabled: true,
        referredBy: {
          select: { name: true, ownReferralId: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: franchises };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function promoteToStateManager(workspaceId: string, referralId: string) {
  try {
    const existing = await prisma.workspace.findUnique({
      where: { ownReferralId: referralId }
    });

    if (existing && existing.id !== workspaceId) {
      throw new Error("This Referral ID is already in use by another franchise.");
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isStateManager: true,
        ownReferralId: referralId
      }
    });

    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStateManagerConfig(workspaceId: string, data: { referralId?: string, commissionReleaseHours?: number }) {
  try {
    if (data.referralId) {
      const existing = await prisma.workspace.findUnique({
        where: { ownReferralId: data.referralId }
      });
      if (existing && existing.id !== workspaceId) {
        throw new Error("This Referral ID is already in use by another franchise.");
      }
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.referralId !== undefined && { ownReferralId: data.referralId }),
        ...(data.commissionReleaseHours !== undefined && { commissionReleaseHours: data.commissionReleaseHours }),
      }
    });

    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingWithdrawalRequests() {
  try {
    const requests = await prisma.walletTransaction.findMany({
      where: {
        type: 'DEBIT',
        status: 'PENDING',
        // @ts-ignore
        isCommissionWithdrawal: true
      },
      include: {
        workspace: {
          select: { name: true, subdomain: true, ownReferralId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllWithdrawalRequests() {
  try {
    const requests = await prisma.walletTransaction.findMany({
      where: {
        type: 'DEBIT',
        // @ts-ignore
        isCommissionWithdrawal: true
      },
      include: {
        workspace: {
          select: { name: true, subdomain: true, ownReferralId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignReferralToFranchise(workspaceId: string, appliedReferralId: string | null, config?: { rate: number, expiry: Date | null, enabled: boolean }) {
  try {
    if (!appliedReferralId) {
      // Remove referral
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { appliedReferralId: null, referredById: null }
      });
    } else {
      // Find State Manager by referral ID
      const stateManager = await prisma.workspace.findUnique({
        where: { ownReferralId: appliedReferralId }
      });

      if (!stateManager) {
        throw new Error("Invalid Referral ID. No State Manager found.");
      }

      if (stateManager.id === workspaceId) {
        throw new Error("A franchise cannot refer itself.");
      }

      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { 
          appliedReferralId,
          referredById: stateManager.id,
          ...(config && {
            referralCommissionRate: config.rate,
            referralCommissionExpiry: config.expiry,
            isReferralCommissionEnabled: config.enabled
          })
        }
      });
    }

    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFranchiseCommissionSettings(workspaceId: string, config: {
  isReferralCommissionEnabled: boolean;
  referralCommissionRate: number;
  referralCommissionExpiry: Date | null;
}) {
  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: config
    });
    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearPendingCommissions(workspaceId: string) {
  try {
    let totalAmount = 0;

    await prisma.$transaction(async (tx) => {
      const pendingTransactions = await tx.walletTransaction.findMany({
        where: {
          workspaceId,
          isCommission: true,
          status: 'PENDING'
        }
      });

      if (pendingTransactions.length === 0) return;

      totalAmount = pendingTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      const pendingIds = pendingTransactions.map(t => t.id);

      await tx.walletTransaction.updateMany({
        where: { id: { in: pendingIds } },
        data: { status: 'APPROVED' }
      });

      // Update workspace commission balance
      await tx.workspace.update({
        where: { id: workspaceId },
        // @ts-ignore: Prisma client cache issue with new schema fields
        data: { commissionBalance: { increment: totalAmount } }
      });
    });

    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true, amountCleared: totalAmount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function revokeStateManager(workspaceId: string) {
  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isStateManager: false,
        ownReferralId: null
      }
    });

    // Option: also unlink any franchises referred by them
    await prisma.workspace.updateMany({
      where: { referredById: workspaceId },
      data: { referredById: null, appliedReferralId: null }
    });

    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Franchise Admin (State Manager) Actions
// ============================================

export async function getStateManagerDashboardData(workspaceId: string) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        isStateManager: true,
        ownReferralId: true,
        walletBalance: true,
        // @ts-ignore: Prisma cache issue
        commissionBalance: true,
        referredWorkspaces: {
          select: { 
            id: true, 
            name: true, 
            createdAt: true,
            roles: {
              where: { role: 'ADMIN' },
              select: { user: { select: { name: true } } },
              take: 1
            }
          }
        }
      }
    });

    if (!workspace || !workspace.isStateManager) {
      throw new Error("Workspace is not a State Manager.");
    }

    // Get commissions generated, withdrawals, and transfers
    const commissions = await prisma.walletTransaction.findMany({
      where: {
        workspaceId,
        OR: [
          { isCommission: true },
          // @ts-ignore
          { isCommissionWithdrawal: true },
          // @ts-ignore
          { isCommissionTransfer: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total pending and approved (earnings only)
    const totalEarned = commissions.filter(c => c.status === 'APPROVED' && c.type === 'CREDIT').reduce((sum, c) => sum + c.amount, 0);
    const totalPending = commissions.filter(c => c.status === 'PENDING' && c.type === 'CREDIT').reduce((sum, c) => sum + c.amount, 0);

    return { 
      success: true, 
      data: {
        config: {
          commission: "Varies",
          referralId: workspace.ownReferralId,
          isActive: true,
          validUntil: "Varies",
          walletBalance: workspace.walletBalance,
          commissionBalance: (workspace as any).commissionBalance || 0
        },
        referredWorkspaces: (workspace as any).referredWorkspaces.map((rw: any) => {
          const earnedFromFranchise = commissions
            .filter(c => c.status === 'APPROVED' && c.type === 'CREDIT' && c.sourceWorkspaceId === rw.id)
            .reduce((sum, c) => sum + c.amount, 0);
          return {
            id: rw.id,
            name: rw.name,
            createdAt: rw.createdAt,
            ownerName: rw.roles[0]?.user?.name || "Unknown",
            totalEarned: earnedFromFranchise
          };
        }),
        commissions,
        stats: { totalEarned, totalPending }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Withdrawal & Transfer Actions
// ============================================

export async function requestCommissionWithdrawal(workspaceId: string, amount: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Safely decrement commission balance atomically
      const updatedWorkspace = await tx.workspace.updateMany({
        where: { 
          id: workspaceId,
          // @ts-ignore
          commissionBalance: { gte: amount }
        },
        // @ts-ignore
        data: { commissionBalance: { decrement: amount } }
      });

      if (updatedWorkspace.count === 0) {
        throw new Error("Insufficient commission balance or workspace not found.");
      }

      // Create withdrawal request
      await tx.walletTransaction.create({
        data: {
          workspaceId,
          amount,
          type: 'DEBIT',
          status: 'PENDING',
          description: 'Offline Commission Withdrawal Request',
          // @ts-ignore
          isCommissionWithdrawal: true
        }
      });
    });

    revalidatePath("/(workspace)/app/[tenant]/admin/state-manager", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function transferCommissionToWallet(workspaceId: string, amount: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Safely deduct commission balance atomically
      const updatedWorkspace = await tx.workspace.updateMany({
        where: { 
          id: workspaceId,
          // @ts-ignore
          commissionBalance: { gte: amount }
        },
        data: { 
          // @ts-ignore
          commissionBalance: { decrement: amount },
          walletBalance: { increment: amount }
        }
      });

      if (updatedWorkspace.count === 0) {
        throw new Error("Insufficient commission balance.");
      }

      // Log the transfer
      await tx.walletTransaction.create({
        data: {
          workspaceId,
          amount,
          type: 'DEBIT',
          status: 'APPROVED',
          description: 'Transfer Commission to Wallet Balance',
          // @ts-ignore
          isCommissionTransfer: true
        }
      });
    });

    revalidatePath("/(workspace)/app/[tenant]/admin/state-manager", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveCommissionWithdrawal(transactionId: string) {
  try {
    const res = await prisma.walletTransaction.updateMany({
      where: { id: transactionId, status: 'PENDING' },
      data: { status: 'APPROVED' }
    });
    
    if (res.count === 0) {
      throw new Error("Transaction not found or already processed.");
    }
    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectCommissionWithdrawal(transactionId: string, reason: string) {
  try {
    await prisma.$transaction(async (prismaTx) => {
      // Reject the transaction safely
      const updateResult = await prismaTx.walletTransaction.updateMany({
        where: { id: transactionId, status: 'PENDING' },
        data: { status: 'REJECTED', rejectionReason: reason }
      });
      
      if (updateResult.count === 0) {
        throw new Error("Transaction not found or already processed.");
      }
      
      // Need to fetch transaction to know how much to refund
      const tx = await prismaTx.walletTransaction.findUnique({ where: { id: transactionId } });
      if (!tx) throw new Error("Transaction not found.");

      // Refund the commission balance
      await prismaTx.workspace.update({
        where: { id: tx.workspaceId },
        // @ts-ignore
        data: { commissionBalance: { increment: tx.amount } }
      });
    });

    revalidatePath("/(admin)/super-admin/state-managers", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReferredFranchiseRecharges(stateManagerId: string, franchiseId: string) {
  try {
    // Verify the franchise was referred by this state manager
    const sm = await prisma.workspace.findUnique({
      where: { id: stateManagerId },
      select: { isStateManager: true }
    });

    const franchise = await prisma.workspace.findUnique({
      where: { id: franchiseId },
      select: { referredById: true, createdAt: true, name: true, referralCommissionExpiry: true }
    });

    if (!sm || !sm.isStateManager || !franchise || franchise.referredById !== stateManagerId) {
      throw new Error("Invalid request or unauthorized");
    }

    // To find the actual date the referral ID was applied (especially if assigned by Super Admin later),
    // we look for the first commission generated for this State Manager by this Franchise.
    const firstCommission = await prisma.walletTransaction.findFirst({
      where: {
        workspaceId: stateManagerId,
        sourceWorkspaceId: franchiseId,
        isCommission: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // If a commission exists, use a date slightly before it to catch the triggering recharge.
    // Otherwise, fallback to the franchise creation date.
    const startDate = firstCommission 
      ? new Date(firstCommission.createdAt.getTime() - 5000) 
      : franchise.createdAt;
      
    const endDate = franchise.referralCommissionExpiry || undefined; // If null, don't restrict the upper bound

    // Fetch credits that are not commissions or transfers (actual recharges/payments)
    const recharges = await prisma.walletTransaction.findMany({
      where: {
        workspaceId: franchiseId,
        type: 'CREDIT',
        isCommission: false,
        // @ts-ignore
        isCommissionTransfer: false,
        // @ts-ignore
        isCommissionWithdrawal: false,
        createdAt: {
          gte: startDate,
          ...(endDate ? { lte: endDate } : {})
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { 
      success: true, 
      data: {
        franchiseName: franchise.name,
        startDate,
        endDate,
        recharges
      } 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
