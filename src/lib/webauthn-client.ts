import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import {
  getPasskeyRegistrationOptions,
  verifyAndSavePasskey,
  getPasskeyAuthOptions,
  verifyPasskeyAuth,
} from "@/app/actions/webauthn";
import { signIn } from "next-auth/react";

export async function registerPasskeyDevice(deviceName?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const optRes = await getPasskeyRegistrationOptions();
    if (!optRes.success || !optRes.options) {
      return { success: false, error: optRes.error || "Failed to initialize registration." };
    }

    // Trigger browser native biometric prompt (FaceID / Fingerprint / Windows Hello)
    const registrationResponse = await startRegistration(optRes.options as any);

    // Verify and save to database
    const saveRes = await verifyAndSavePasskey(registrationResponse, deviceName);
    if (!saveRes.success) {
      return { success: false, error: saveRes.error || "Failed to save passkey." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Passkey registration failed:", err);
    if (err.name === "NotAllowedError") {
      return { success: false, error: "Biometric registration was cancelled or timed out." };
    }
    return { success: false, error: err.message || "Failed to register biometric device." };
  }
}

export async function loginWithPasskey(identifier?: string, tenantSlug?: string): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> {
  try {
    const optRes = await getPasskeyAuthOptions(identifier, tenantSlug);
    if (!optRes.success || !optRes.options) {
      return { success: false, error: optRes.error || "Failed to initialize biometric login." };
    }

    // Trigger browser biometric authentication prompt
    const authResponse = await startAuthentication(optRes.options as any);

    // Verify response with server and get one-time session token
    const verifyRes = await verifyPasskeyAuth(authResponse, tenantSlug);
    if (!verifyRes.success || !verifyRes.user || !verifyRes.oneTimeToken) {
      return { success: false, error: verifyRes.error || "Biometric authentication failed." };
    }

    // Sign into NextAuth session
    const signInResult = await signIn("passkey", {
      userId: verifyRes.user.id,
      token: verifyRes.oneTimeToken,
      redirect: false,
    });

    if (signInResult?.error) {
      return { success: false, error: signInResult.error };
    }

    return { success: true, user: verifyRes.user };
  } catch (err: any) {
    console.error("Passkey login failed:", err);
    if (err.name === "NotAllowedError") {
      return { success: false, error: "Biometric sign-in was cancelled." };
    }
    return { success: false, error: err.message || "Biometric authentication failed." };
  }
}
