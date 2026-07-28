import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const users = await db.user.findMany({
    where: {
      studentProfile: { isNot: null }
    },
    include: {
      studentProfile: true,
      workspaceRoles: true,
    }
  });

  return NextResponse.json({ users });
}
