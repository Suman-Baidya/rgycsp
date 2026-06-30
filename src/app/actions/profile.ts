"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  name?: string;
  email?: string;
  username?: string;
  image?: string;
  targetUserId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Determine which user to update
  const userIdToUpdate = (session.user.role === "SUPER_ADMIN" && data.targetUserId) 
    ? data.targetUserId 
    : session.user.id;

  try {
    // Check if email is already taken by another user
    if (data.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userIdToUpdate }
        }
      });
      if (existingUser) {
        return { success: false, error: "Email is already in use" };
      }
    }

    // Check if username is already taken
    if (data.username) {
      const existingUser = await db.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userIdToUpdate }
        }
      });
      if (existingUser) {
        return { success: false, error: "Username is already in use" };
      }
    }

    await db.user.update({
      where: { id: userIdToUpdate },
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        image: data.image,
      }
    });

    revalidatePath("/super-admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updatePassword(data: {
  currentPassword?: string;
  newPassword?: string;
  targetUserId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userIdToUpdate = (session.user.role === "SUPER_ADMIN" && data.targetUserId) 
    ? data.targetUserId 
    : session.user.id;

  if (!data.currentPassword || !data.newPassword) {
    return { success: false, error: "Missing password data" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userIdToUpdate }
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "User not found or password not set" };
    }

    const isCorrect = await compare(data.currentPassword, user.passwordHash);
    if (!isCorrect) {
      return { success: false, error: "Incorrect current password" };
    }

    const hashed = await hash(data.newPassword, 12);
    await db.user.update({
      where: { id: userIdToUpdate },
      data: { passwordHash: hashed }
    });

    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, error: "Failed to update password" };
  }
}
