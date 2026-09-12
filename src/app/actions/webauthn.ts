"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { headers, cookies } from "next/headers";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { randomBytes } from "crypto";

async function getRPHelpers() {
  const headersList = await headers();
  const reqOrigin = headersList.get("origin") || headersList.get("referer");
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  
  const computedOrigin = `${proto}://${host}`;
  const hostname = host.split(":")[0];
  
  // Determine rpID
  let rpID = hostname;
  const rootEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(":")[0]?.trim();

  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    rpID = "localhost";
  } else if (rootEnv && (hostname === rootEnv || hostname.endsWith(`.${rootEnv}`))) {
    // Production custom domain (e.g. rgycsp.com allows all subdomains like chandpara.rgycsp.com)
    rpID = rootEnv;
  } else if (hostname.endsWith(".vercel.app")) {
    // Vercel preview domains are on Public Suffix List, so rpID must be the specific hostname
    rpID = hostname;
  } else {
    // Standard domain fallback: if it has 2+ dots (e.g. sub.domain.com), use apex domain
    const parts = hostname.split(".");
    if (parts.length > 2 && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      rpID = parts.slice(-2).join(".");
    } else {
      rpID = hostname;
    }
  }

  // Clean origin list: provide all valid variants for reverse proxy tolerance
  const allowedOrigins: string[] = [];
  if (reqOrigin) {
    try {
      const u = new URL(reqOrigin);
      allowedOrigins.push(u.origin);
    } catch {
      allowedOrigins.push(reqOrigin);
    }
  }
  allowedOrigins.push(computedOrigin);
  allowedOrigins.push(`${proto}://${hostname}`);
  allowedOrigins.push(`https://${hostname}`);
  allowedOrigins.push(`http://${hostname}`);

  const uniqueOrigins = Array.from(new Set(allowedOrigins)).filter(Boolean);

  return {
    origin: uniqueOrigins,
    rpID,
    expectedRPID: Array.from(new Set([rpID, hostname])),
    rpName: "ABCD Edu Hub (RGYCSP)"
  };
}

/**
 * 1. Generate options for registering a new passkey (FaceID / Fingerprint)
 */
export async function getPasskeyRegistrationOptions() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to register biometric credentials." };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { passkeyCredentials: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const { rpName, rpID } = await getRPHelpers();

    // Prevent re-registering existing credentials on this device
    const excludeCredentials = user.passkeyCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialId, "base64url"),
      type: "public-key" as const,
      transports: cred.transports ? JSON.parse(cred.transports) : undefined,
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email || user.username || `user-${user.id}`,
      userDisplayName: user.name || user.username || "User",
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Save challenge in a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("webauthn_reg_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return { success: true, options };
  } catch (error: any) {
    console.error("Error generating registration options:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Verify registration response and store passkey
 */
export async function verifyAndSavePasskey(response: any, deviceName?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("webauthn_reg_challenge")?.value;
    if (!expectedChallenge) {
      return { success: false, error: "Registration challenge expired or missing. Please try again." };
    }

    const { origin, rpID, expectedRPID } = await getRPHelpers();

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: expectedRPID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return { success: false, error: "Verification failed. Could not validate authenticator." };
    }

    const {
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = verification.registrationInfo;

    // Clear challenge cookie
    cookieStore.delete("webauthn_reg_challenge");

    // Format credentialId as base64url string
    const credIdString = response.id || Buffer.from(credentialID).toString("base64url");
    const transports = response.response?.transports;

    // Save in DB
    await db.passkeyCredential.create({
      data: {
        userId: session.user.id,
        credentialId: credIdString,
        publicKey: Buffer.from(credentialPublicKey),
        counter: BigInt(counter),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: transports ? JSON.stringify(transports) : null,
        name: deviceName || (credentialDeviceType === "singleDevice" ? "This Device (Biometrics)" : "Passkey Device"),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error verifying passkey registration:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Generate options for passkey authentication (Login)
 */
export async function getPasskeyAuthOptions(identifier?: string, tenantSlug?: string) {
  try {
    const { rpID } = await getRPHelpers();
    let allowCredentials: any[] = [];

    if (identifier && identifier.trim() !== "") {
      const clean = identifier.trim();
      const upper = clean.toUpperCase();
      const lower = clean.toLowerCase();

      // Find user
      let user = await db.user.findFirst({
        where: {
          OR: [
            { username: clean },
            { username: upper },
            { email: clean },
            { email: lower },
          ],
        },
        include: { passkeyCredentials: true },
      });

      if (!user) {
        // Try center code
        const workspace = await db.workspace.findFirst({
          where: { OR: [{ centerCode: clean }, { centerCode: upper }] },
          include: { roles: { where: { role: "ADMIN" }, include: { user: { include: { passkeyCredentials: true } } } } },
        });
        if (workspace?.roles?.[0]?.user) {
          user = workspace.roles[0].user as any;
        }
      }

      if (user && user.passkeyCredentials.length > 0) {
        allowCredentials = user.passkeyCredentials.map((c) => ({
          id: Buffer.from(c.credentialId, "base64url"),
          type: "public-key" as const,
          transports: c.transports ? JSON.parse(c.transports) : undefined,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    });

    // Save auth challenge in secure cookie
    const cookieStore = await cookies();
    cookieStore.set("webauthn_auth_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    return { success: true, options };
  } catch (error: any) {
    console.error("Error generating auth options:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Verify passkey authentication response and return verified user for session signin
 */
export async function verifyPasskeyAuth(response: any, tenantSlug?: string) {
  try {
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("webauthn_auth_challenge")?.value;
    if (!expectedChallenge) {
      return { success: false, error: "Authentication challenge expired. Please retry." };
    }

    const credential = await db.passkeyCredential.findUnique({
      where: { credentialId: response.id },
      include: { user: true },
    });

    if (!credential) {
      return { success: false, error: "No matching biometric credential found for this device." };
    }

    const { origin, rpID, expectedRPID } = await getRPHelpers();

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: expectedRPID,
      authenticator: {
        credentialID: Buffer.from(credential.credentialId, "base64url"),
        credentialPublicKey: new Uint8Array(credential.publicKey),
        counter: Number(credential.counter),
        transports: credential.transports ? JSON.parse(credential.transports) : undefined,
      },
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return { success: false, error: "Biometric signature verification failed." };
    }

    // Update counter and last used
    await db.passkeyCredential.update({
      where: { id: credential.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    // Clear challenge cookie
    cookieStore.delete("webauthn_auth_challenge");

    // Strict tenant check
    if (tenantSlug && tenantSlug !== "super-admin" && tenantSlug !== "undefined") {
      const workspace = await db.workspace.findUnique({
        where: { subdomain: tenantSlug.toLowerCase() },
      });
      if (!workspace) {
        return { success: false, error: "Invalid franchise workspace." };
      }

      const hasRole = await db.workspaceRole.findFirst({
        where: { userId: credential.userId, workspaceId: workspace.id },
      });
      const hasProfile = await db.studentProfile.findFirst({
        where: { userId: credential.userId, workspaceId: workspace.id },
      });

      if (!hasRole && !hasProfile && credential.user.role !== "SUPER_ADMIN") {
        return { success: false, error: "You do not belong to this franchise portal." };
      }
    }

    // Generate a secure one-time token for NextAuth session creation
    const oneTimeToken = randomBytes(32).toString("hex");
    cookieStore.set("webauthn_verified_token", `${credential.userId}:${oneTimeToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60, // 1 minute to complete NextAuth signIn
      path: "/",
    });

    return {
      success: true,
      user: {
        id: credential.user.id,
        email: credential.user.email,
        username: credential.user.username,
        name: credential.user.name,
      },
      oneTimeToken,
    };
  } catch (error: any) {
    console.error("Error verifying passkey auth:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Get list of user's registered passkeys
 */
export async function getUserPasskeys() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, passkeys: [] };

    const passkeys = await db.passkeyCredential.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        deviceType: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, passkeys };
  } catch (e: any) {
    return { success: false, error: e.message, passkeys: [] };
  }
}

/**
 * 6. Revoke a registered passkey
 */
export async function deletePasskey(passkeyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await db.passkeyCredential.deleteMany({
      where: {
        id: passkeyId,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
