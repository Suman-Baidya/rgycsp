import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await db.siteSettings.findFirst({
      where: { workspaceId: null }
    });

    if (!settings) {
      return NextResponse.json({ error: "No site settings found" }, { status: 404 });
    }

    const requiredSections = [
      { type: 'hero', title: 'Hero Section' },
      { type: 'about', title: 'About Section' },
      { type: 'why-choose-us', title: 'Why Choose Us' },
      { type: 'achievements', title: 'Achievements' },
      { type: 'partners', title: 'Partners' },
      { type: 'testimonials', title: 'Testimonials' },
      { type: 'pricing', title: 'Pricing' },
      { type: 'faq', title: 'FAQ' },
      { type: 'contact', title: 'Contact' },
      { type: 'our-message', title: 'Our Message' },
      { type: 'mission', title: 'Our Mission' },
      { type: 'vision', title: 'Our Vision' },
      { type: 'services', title: 'Services' },
      { type: 'ready-to-modernize', title: 'Ready to Modernize' },
      { type: 'guide-steps', title: 'Guide Steps' },
      { type: 'guide-resources', title: 'Guide Resources' },
      { type: 'custom-solution', title: 'Custom Solution' }
    ];

    const results = [];
    for (const sec of requiredSections) {
      const exists = await db.landingSection.findFirst({
        where: { siteSettingsId: settings.id, type: sec.type }
      });

      if (!exists) {
        await db.landingSection.create({
          data: {
            siteSettingsId: settings.id,
            type: sec.type,
            title: sec.title,
            content: {},
            order: requiredSections.indexOf(sec),
            isActive: true
          }
        });
        results.push(`Created ${sec.type}`);
      } else {
        results.push(`Exists ${sec.type}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
