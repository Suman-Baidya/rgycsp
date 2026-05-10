"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export async function updateUserHeartbeat() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await (db.user as any).update({
      where: { id: session.user.id },
      data: { lastSeen: new Date() }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
