"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { webpush, publicKey } from "@/lib/vapid";

export async function getVapidPublicKey() {
  return publicKey;
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    let workspaceId: string | null = null;
    if (userId) {
      const studentProfile = await db.studentProfile.findFirst({
        where: { userId },
        select: { workspaceId: true },
      });
      if (studentProfile) {
        workspaceId = studentProfile.workspaceId;
      } else {
        const role = await db.workspaceRole.findFirst({
          where: { userId },
          select: { workspaceId: true },
        });
        if (role) workspaceId = role.workspaceId;
      }
    }

    await db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        workspaceId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: subscription.userAgent || null,
        updatedAt: new Date(),
      },
      create: {
        endpoint: subscription.endpoint,
        userId,
        workspaceId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: subscription.userAgent || null,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error saving push subscription:", error);
    return { success: false, error: error.message };
  }
}

export async function removePushSubscription(endpoint: string) {
  try {
    await db.pushSubscription.deleteMany({
      where: { endpoint },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error removing push subscription:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWebPushNotification({
  title,
  message,
  url = "/",
  icon,
  userIds,
  workspaceId,
}: {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  userIds?: string[];
  workspaceId?: string;
}) {
  try {
    const where: any = {};
    if (userIds && userIds.length > 0) {
      where.userId = { in: userIds };
    }
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const subscriptions = await db.pushSubscription.findMany({ where });
    if (subscriptions.length === 0) return { success: true, count: 0 };

    const payload = JSON.stringify({
      title,
      body: message,
      url,
      icon: icon || "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
        } catch (err: any) {
          // If status is 404 or 410 (Gone), subscription has expired or was revoked
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          throw err;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    return { success: true, count: successful };
  } catch (error: any) {
    console.error("Error dispatching web push notifications:", error);
    return { success: false, error: error.message };
  }
}
