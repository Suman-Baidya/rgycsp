import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/prisma";

// Ensure this is treated as a dynamic endpoint for cron triggers
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Authorization: In production, verify auth headers (e.g., Vercel Cron header)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    // 2. Determine today's date and month
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31

    // 3. Find platform fees that should be executed today
    const feesToExecute = await prisma.platformFeeConfig.findMany({
      where: {
        isActive: true,
        cronMonth: currentMonth,
        cronDay: currentDay,
      }
    });

    if (feesToExecute.length === 0) {
      return NextResponse.json({ success: true, message: "No fees scheduled for today." });
    }

    // 4. Fetch all ACTIVE franchises
    const activeFranchises = await prisma.workspace.findMany({
      where: {
        isActive: true
      },
      select: { id: true, name: true, walletBalance: true }
    });

    if (activeFranchises.length === 0) {
      return NextResponse.json({ success: true, message: "No active franchises found." });
    }

    const results = [];

    // 5. Execute deductions
    for (const fee of feesToExecute) {
      // Prevent double execution on the same day
      const lastExecutedStr = fee.lastExecutedAt ? fee.lastExecutedAt.toISOString().split('T')[0] : null;
      const todayStr = today.toISOString().split('T')[0];
      
      if (lastExecutedStr === todayStr) {
        results.push({ feeName: fee.name, status: "Skipped (Already executed today)" });
        continue;
      }

      let deductedCount = 0;

      for (const franchise of activeFranchises) {
        // Execute inside transaction for each franchise
        await prisma.$transaction(async (tx) => {
          // Log debit transaction
          await tx.walletTransaction.create({
            data: {
              workspaceId: franchise.id,
              amount: fee.amount,
              type: 'DEBIT',
              status: 'APPROVED',
              description: `Automated Deduction: ${fee.name}`,
              referenceId: `FEE-${fee.id}-${todayStr}`,
            }
          });

          // Decrement wallet (allow negative)
          await tx.workspace.update({
            where: { id: franchise.id },
            data: {
              walletBalance: { decrement: fee.amount }
            }
          });

          // Send notification
          await tx.notification.create({
            data: {
              workspaceId: franchise.id,
              title: fee.name + " Deducted",
              message: `₹${fee.amount} was automatically deducted for ${fee.name}.`,
              type: "INFO",
              link: "/admin/wallet"
            }
          });
        });
        
        deductedCount++;
      }

      // Update the fee's last execution time
      await prisma.platformFeeConfig.update({
        where: { id: fee.id },
        data: { lastExecutedAt: today }
      });

      results.push({ feeName: fee.name, status: "Success", franchisesCharged: deductedCount });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Platform fee processing complete.",
      results 
    });

  } catch (error: any) {
    console.error("Error processing platform fees:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
