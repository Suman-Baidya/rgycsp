import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const managers = await prisma.workspace.findMany({
      where: { isStateManager: true },
      select: {
        id: true,
        name: true,
        subdomain: true,
        stateManagerCommission: true,
        ownReferralId: true,
        isReferralActive: true,
        referralActiveUntil: true,
        commissionReleaseHours: true,
        _count: {
          select: { referredWorkspaces: true }
        },
        walletTransactions: {
          where: { isCommission: true },
          select: { amount: true, status: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    console.log("Managers:", managers);
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main()
