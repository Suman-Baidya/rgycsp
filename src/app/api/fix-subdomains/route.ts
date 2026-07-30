import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const workspaces = await db.workspace.findMany();
    let updated = 0;
    
    for (const w of workspaces) {
      const lower = w.subdomain.toLowerCase();
      if (w.subdomain !== lower) {
        // Need to check if a lowercase version already exists to avoid unique constraint violations
        const existing = await db.workspace.findFirst({
          where: { subdomain: lower, id: { not: w.id } }
        });
        
        if (!existing) {
          await db.workspace.update({
            where: { id: w.id },
            data: { subdomain: lower }
          });
          updated++;
        }
      }
    }
    
    return NextResponse.json({ success: true, message: `Updated ${updated} workspaces to lowercase subdomains.`, subdomains: workspaces.map(w => w.subdomain) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
