import { NextResponse } from 'next/server';
import { db as prisma } from "@/lib/prisma";

// This endpoint can be triggered by a cron job (e.g. Vercel Cron) 
// or manually by an admin to process pending commissions.
export async function GET(req: Request) {
  try {
    // Basic auth using a secret key if needed. For now, we'll just allow it or rely on cron headers.
    // In production, you'd check req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`

    const now = new Date();

    // Find all pending commission transactions that have passed their releaseAt date
    const pendingCommissions = await prisma.walletTransaction.findMany({
      where: {
        isCommission: true,
        status: 'PENDING',
        releaseAt: {
          lte: now
        }
      }
    });

    if (pendingCommissions.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No pending commissions to process." });
    }

    let processedCount = 0;

    for (const commission of pendingCommissions) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Update the transaction to APPROVED
          await tx.walletTransaction.update({
            where: { id: commission.id },
            data: { status: 'APPROVED' }
          });

          // 2. Add the amount to the State Manager's commission balance (not wallet balance directly)
          await tx.workspace.update({
            where: { id: commission.workspaceId },
            // @ts-ignore: Prisma client cache issue with new schema fields
            data: { commissionBalance: { increment: commission.amount } }
          });

          // 3. Notify the State Manager
          await tx.notification.create({
            data: {
              workspaceId: commission.workspaceId,
              title: "Commission Released",
              message: `Your pending commission of ₹${commission.amount} has been released to your Commission Balance.`,
              type: "SUCCESS",
              link: "/admin/state-manager"
            }
          });
        });
        processedCount++;
      } catch (error) {
        console.error(`Failed to process commission ${commission.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedCount,
      totalFound: pendingCommissions.length
    });

  } catch (error: any) {
    console.error("Cron Process Commissions Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
