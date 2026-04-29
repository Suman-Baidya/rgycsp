"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(data: any) {
  try {
    const workspaceId = data.workspaceId || null;
    const settings = await db.siteSettings.findFirst({
      where: { workspaceId },
    });

    if (settings) {
      await db.siteSettings.update({
        where: { id: settings.id },
        data: {
          siteName: data.siteName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          whatsapp: data.whatsapp,
          address: data.address,
          googleMapLink: data.googleMapLink,
          brandDescription: data.brandDescription,
          socialLinks: data.socialLinks,
          navigation: data.navigation,
          navbarConfig: data.navbarConfig,
          fontFamily: data.fontFamily,
          pageHeaderBanner: data.pageHeaderBanner,
        },
      });
    } else {
      await db.siteSettings.create({
        data: {
          workspaceId,
          siteName: data.siteName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          whatsapp: data.whatsapp,
          address: data.address,
          googleMapLink: data.googleMapLink,
          brandDescription: data.brandDescription,
          socialLinks: data.socialLinks,
          navigation: data.navigation,
          navbarConfig: data.navbarConfig,
          fontFamily: data.fontFamily,
          pageHeaderBanner: data.pageHeaderBanner,
        },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/(admin)/super-admin/settings");
    revalidatePath("/app/[tenant]/admin/settings");
    revalidatePath("/app/[tenant]", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("CRITICAL: Failed to update site settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Database operation failed" 
    };
  }
}

export async function updateLandingSection(sectionId: string, data: any) {
  try {
    await db.landingSection.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        isActive: data.isActive,
        content: data.content,
        order: data.order,
      },
    });

    revalidatePath("/");
    revalidatePath("/(admin)/super-admin/settings");
    revalidatePath("/app/[tenant]/admin/settings");
    revalidatePath("/app/[tenant]", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update landing section:", error);
    return { success: false, error: "Failed to update landing section" };
  }
}

export async function syncAllSections(settingsId: string, sectionTypes: string[], skipRevalidate: boolean = false) {
  try {
    const existingSections = await db.landingSection.findMany({
      where: { siteSettingsId: settingsId }
    });
    
    const existingTypes = existingSections.map(s => s.type);
    const missingTypes = sectionTypes.filter(t => !existingTypes.includes(t));

    if (missingTypes.length === 0) return { success: true, created: 0 };

    await Promise.all(missingTypes.map((type, index) => {
      let defaultContent = {};
      let title = type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      if (type.startsWith('legal-')) {
        const pageName = title.replace('Legal ', '');
        let html = `<h1>${pageName}</h1><p>Welcome to our ${pageName}. We are committed to protecting your interests and providing transparent information.</p>`;
        
        if (type.includes('privacy')) {
          html = `<h1>Privacy Policy</h1><p>Last updated: ${new Date().toLocaleDateString()}</p><h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us.</p><h2>2. How We Use Information</h2><p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</p><h2>3. Information Sharing</h2><p>We do not share your personal information with third parties except as described in this policy.</p>`;
        } else if (type.includes('terms')) {
          html = `<h1>Terms & Conditions</h1><p>Last updated: ${new Date().toLocaleDateString()}</p><h2>1. Acceptance of Terms</h2><p>By accessing or using our services, you agree to be bound by these Terms and Conditions.</p><h2>2. Use of Services</h2><p>You agree to use our services only for lawful purposes and in accordance with these terms.</p><h2>3. Limitation of Liability</h2><p>In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages.</p>`;
        } else if (type.includes('cookie')) {
          html = `<h1>Cookie Policy</h1><p>Last updated: ${new Date().toLocaleDateString()}</p><h2>1. What Are Cookies</h2><p>Cookies are small text files that are placed on your device when you visit a website.</p><h2>2. How We Use Cookies</h2><p>We use cookies to understand how you use our website and to improve your experience.</p><h2>3. Your Choices</h2><p>You can choose to disable cookies through your browser settings.</p>`;
        } else if (type.includes('refund')) {
          html = `<h1>Refund Policy</h1><p>Last updated: ${new Date().toLocaleDateString()}</p><h2>1. Refund Eligibility</h2><p>Refunds are generally provided for services that have not yet been rendered or in case of technical failures on our part.</p><h2>2. Refund Process</h2><p>To request a refund, please contact our support team with your order details.</p><h2>3. Non-Refundable Items</h2><p>Certain services or products may be non-refundable once accessed or used.</p>`;
        } else if (type.includes('sitemap')) {
          html = `<h1>Site Map</h1><p>Explore all the pages available on our platform.</p><ul><li><a href="/">Home</a></li><li><a href="/about">About Us</a></li><li><a href="/services">Services</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/guide">User Guide</a></li><li><a href="/support">Support Center</a></li></ul>`;
        }

        defaultContent = {
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          html
        };
      } else if (type === 'events') {
        defaultContent = {
          description: "Stay updated with the latest happenings, academic seminars, and cultural celebrations at our institute.",
          events: [
            { title: "Academic Seminar 2026", date: "15 May, 2026", time: "10:00 AM", location: "Main Hall", image: "https://images.unsplash.com/photo-1540575861501-7ad05823c93e?q=80&w=2070" },
            { title: "Cultural Festival", date: "22 May, 2026", time: "11:30 AM", location: "Campus Ground", image: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070" }
          ]
        };
      }

      return db.landingSection.create({
        data: {
          siteSettingsId: settingsId,
          type,
          title,
          isActive: true, // Auto-enable legal pages
          order: existingSections.length + index,
          content: defaultContent
        }
      });
    }));

    if (!skipRevalidate) {
      revalidatePath("/");
      revalidatePath("/(admin)/super-admin/settings");
    }
    return { success: true, created: missingTypes.length };
  } catch (error) {
    console.error("Failed to sync sections:", error);
    return { success: false, error: "Sync failed" };
  }
}
