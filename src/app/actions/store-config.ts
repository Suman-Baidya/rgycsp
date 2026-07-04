"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getStoreConfig() {
  try {
    const config = await db.storeConfig.findFirst();
    if (!config) {
      // Create a default if it doesn't exist
      const newConfig = await db.storeConfig.create({
        data: { shippingCost: 0 }
      });
      return { success: true, data: newConfig };
    }
    return { success: true, data: config };
  } catch (error: any) {
    console.error("Failed to fetch store config:", error);
    return { success: false, error: "Failed to fetch store config." };
  }
}

export async function updateStoreConfig(shippingCost: number, paymentQrCode?: string, paymentDetails?: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const config = await db.storeConfig.findFirst();
    if (config) {
      const updated = await db.storeConfig.update({
        where: { id: config.id },
        data: { shippingCost, paymentQrCode, paymentDetails }
      });
      return { success: true, data: updated };
    } else {
      const created = await db.storeConfig.create({
        data: { shippingCost, paymentQrCode, paymentDetails }
      });
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error("Failed to update store config:", error);
    return { success: false, error: "Failed to update store config." };
  }
}
