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
        studentProfile: { include: { workspace: true } }
      }
    });

    if (!user) return "User not found";
    
    if (!user.passwordHash) return "User has no password";

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    return {
      userId: user.id,
      username: user.username,
      profiles: user.studentProfile.length,
      passwordMatch: isMatch,
      tenant: user.studentProfile[0]?.workspace?.subdomain
    };
  } catch(e: any) {
    return e.message;
  }
}
