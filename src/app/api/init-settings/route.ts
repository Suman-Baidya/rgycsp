import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst({
      where: { workspaceId: null }
    });

    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          workspaceId: null,
          siteName: "ABCD Edu Hub",
          primaryColor: "#6366f1",
          accentColor: "#4f46e5",
          sections: {
            create: [
              { type: 'hero', title: 'Hero Section', order: 0 },
              { type: 'about', title: 'About Section', order: 1 }
            ]
          }
        }
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
