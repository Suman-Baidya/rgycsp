"use server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function testLogin(username: string, password: string) {
  try {
    const user = await db.user.findFirst({
      where: { 
        username: { equals: username, mode: 'insensitive' }
      },
      include: {
        studentProfiles: { include: { workspace: true } }
      }
    });

    if (!user) return "User not found";
    
    if (!user.passwordHash) return "User has no password";

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    const activeProfile = user.studentProfiles?.[0];
    
    return {
      userId: user.id,
      username: user.username,
      hasProfile: (user.studentProfiles?.length || 0) > 0,
      passwordMatch: isMatch,
      tenant: activeProfile?.workspace?.subdomain
    };
  } catch(e: any) {
    return e.message;
  }
}
