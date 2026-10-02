import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const users = await db.user.findMany({
    where: {
      studentProfiles: { some: {} }
    },
    include: {
      studentProfiles: true,
      workspaceRoles: true,
    }
  });

  return NextResponse.json({ users });
}
