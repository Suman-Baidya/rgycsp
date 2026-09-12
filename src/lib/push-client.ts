import { getVapidPublicKey, savePushSubscription } from "@/app/actions/web-push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorkerAndSubscribe(): Promise<{
  success: boolean;
  permission?: NotificationPermission;
  error?: string;
}> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, error: "Web Push is not supported in this browser." };
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, permission, error: "Notification permission denied." };
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;

    // 3. Get VAPID Public Key
    const vapidPublicKey = await getVapidPublicKey();
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    // 4. Subscribe to PushManager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // 5. Send subscription to server
    const rawSub = subscription.toJSON();
    if (!rawSub.endpoint || !rawSub.keys?.p256dh || !rawSub.keys?.auth) {
      throw new Error("Invalid push subscription keys generated.");
    }

    const res = await savePushSubscription({
      endpoint: rawSub.endpoint,
      keys: {
        p256dh: rawSub.keys.p256dh,
        auth: rawSub.keys.auth,
      },
      userAgent: navigator.userAgent,
    });

    if (!res.success) {
      throw new Error(res.error || "Failed to persist subscription on server.");
    }

    return { success: true, permission: "granted" };
  } catch (error: any) {
    console.error("Failed to register Web Push subscription:", error);
    return { success: false, error: error.message };
  }
}

export async function isPushSubscribed(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
