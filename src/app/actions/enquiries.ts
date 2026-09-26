"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createLog } from "./logs";
import { findNearestCenters } from "./nearest-center";

import type { 
  ContactFormInput, 
  CampaignLeadInput, 
  FunnelConfig 
} from "@/types/funnel";
import {
  DEFAULT_FRANCHISE_QUESTIONS,
  DEFAULT_STUDENT_QUESTIONS,
  DEFAULT_FUNNEL_CONFIG
} from "@/types/funnel";


import { 
  validateFullName, 
  validateMobileNumber, 
  validateEmailAddress, 
  validatePinCode, 
  detectSpamContent 
} from "@/lib/contact-validation";

/**
 * Handle Contact Form Submissions with Anti-Bot Protection & Strict Validation
 */
export async function submitContactForm(data: ContactFormInput) {
  try {
    // 1. Anti-Bot Honeypot check: If the hidden trap field is filled, it's an automated bot
    if (data.honeypot && data.honeypot.trim().length > 0) {
      await createLog(
        "CRITICAL",
        "BOT_DETECT",
        `Bot honeypot triggered on Contact Form: value='${data.honeypot.slice(0, 30)}', email='${data.email}'`,
        "SECURITY_HONEYPOT"
      );
      // Return a generic success to bots so they do not learn to bypass
      return { success: true, message: "Thank you for reaching out!" };
    }

    // 2. Timing check: If submitted in less than 1.5 seconds, likely an automated bot
    if (data.formRenderTime && Date.now() - data.formRenderTime < 1500) {
      await createLog(
        "WARNING",
        "BOT_DETECT",
        `Suspicious sub-second form submission on Contact Form: email='${data.email}'`,
        "SECURITY_TIMING"
      );
      return { success: false, error: "Please take a moment to review your details before submitting." };
    }

    // 3. Strict Input Validation
    const nameVal = validateFullName(data.name || "");
    if (!nameVal.isValid) {
      return { success: false, error: nameVal.error || "Please enter a valid full name." };
    }

    const emailVal = validateEmailAddress(data.email || "");
    if (!emailVal.isValid) {
      return { success: false, error: emailVal.error || "Please enter a valid email address." };
    }

    let cleanPhone: string | null = null;
    if (data.phone && data.phone.trim()) {
      const phoneVal = validateMobileNumber(data.phone);
      if (!phoneVal.isValid) {
        return { success: false, error: phoneVal.error || "Please enter a valid 10-digit mobile number." };
      }
      cleanPhone = phoneVal.cleanPhone;
    }

    // Check spam content in message
    if (data.message) {
      const spamCheck = detectSpamContent(data.message);
      if (spamCheck.isSpam) {
        return { success: false, error: "Submission blocked: message contains suspicious or prohibited content." };
      }
    }

    // 4. Rate-Limiting / Duplicate Submission Throttling (within last 45 seconds)
    const recentDuplicate = await db.visitorLead.findFirst({
      where: {
        email: emailVal.cleanEmail,
        createdAt: { gte: new Date(Date.now() - 45 * 1000) }
      }
    });

    if (recentDuplicate) {
      return { 
        success: true, 
        leadId: recentDuplicate.id, 
        message: "Thank you! We have already received your message recently. Our team will contact you shortly." 
      };
    }

    // 5. Save to VisitorLead
    const lead = await db.visitorLead.create({
      data: {
        name: nameVal.cleanName,
        email: emailVal.cleanEmail,
        phone: cleanPhone,
        source: data.workspaceId ? "FRANCHISE_CONTACT" : "CONTACT_FORM",
        intent: data.subject?.trim() || "General Contact Inquiry",
        workspaceId: data.workspaceId || null,
        status: "NEW",
        metadata: {
          message: data.message?.trim(),
          organization: data.organization?.trim(),
          submittedAt: new Date().toISOString(),
        }
      }
    });

    if (data.workspaceId) {
      revalidatePath(`/app/[tenant]/admin/enquiries`);
    } else {
      revalidatePath(`/super-admin/enquiries`);
    }

    return { 
      success: true, 
      leadId: lead.id, 
      message: "Thank you! Your message has been received. Our team will contact you shortly." 
    };
  } catch (error: any) {
    console.error("Failed to submit contact form:", error);
    return { success: false, error: error.message || "Failed to submit message." };
  }
}

/**
 * Handle Newsletter / Email Subscription with Anti-Bot Protection
 */
export async function submitNewsletterSubscription(email: string, workspaceId?: string | null, honeypot?: string) {
  try {
    if (honeypot && honeypot.trim().length > 0) {
      await createLog(
        "CRITICAL",
        "BOT_DETECT",
        `Bot honeypot triggered on Newsletter Subscription: email='${email}'`,
        "SECURITY_HONEYPOT"
      );
      return { success: true, message: "Thank you for subscribing!" };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed for this workspace
    const existing = await db.visitorLead.findFirst({
      where: {
        email: cleanEmail,
        source: "NEWSLETTER_SUBSCRIBE",
        workspaceId: workspaceId || null
      }
    });

    if (existing) {
      return { success: true, message: "You are already subscribed to updates!" };
    }

    await db.visitorLead.create({
      data: {
        email: cleanEmail,
        source: "NEWSLETTER_SUBSCRIBE",
        intent: "Footer Newsletter Subscription",
        workspaceId: workspaceId || null,
        status: "NEW",
        metadata: {
          subscribedAt: new Date().toISOString()
        }
      }
    });

    if (workspaceId) {
      revalidatePath(`/app/[tenant]/admin/enquiries`);
    } else {
      revalidatePath(`/super-admin/enquiries`);
    }

    return { success: true, message: "Thank you for subscribing to updates!" };
  } catch (error: any) {
    console.error("Failed to subscribe newsletter:", error);
    return { success: false, error: "Failed to process subscription." };
  }
}

/**
 * Get Dynamic Funnel Configuration
 */
export async function getFunnelConfig(workspaceId?: string | null): Promise<FunnelConfig> {
  try {
    const settings = await db.siteSettings.findFirst({
      where: { workspaceId: workspaceId || null },
      include: {
        sections: {
          where: { type: "marketing-funnel" }
        }
      }
    });

    const section = settings?.sections?.[0];
    if (section && section.content) {
      const saved = section.content as any;
      return {
        visitorTitle: saved.visitorTitle || DEFAULT_FUNNEL_CONFIG.visitorTitle,
        visitorSubtitle: saved.visitorSubtitle || DEFAULT_FUNNEL_CONFIG.visitorSubtitle,
        fields: { ...DEFAULT_FUNNEL_CONFIG.fields, ...(saved.fields || {}) },
        franchiseQuestions: Array.isArray(saved.franchiseQuestions) && saved.franchiseQuestions.length > 0 
          ? saved.franchiseQuestions 
          : DEFAULT_FRANCHISE_QUESTIONS,
        studentQuestions: Array.isArray(saved.studentQuestions) && saved.studentQuestions.length > 0 
          ? saved.studentQuestions 
          : DEFAULT_STUDENT_QUESTIONS,
        redirection: { ...DEFAULT_FUNNEL_CONFIG.redirection, ...(saved.redirection || {}) },
        popupEnabled: saved.popupEnabled ?? true,
      };
    }
  } catch (err) {
    console.error("Failed to load funnel config:", err);
  }
  return DEFAULT_FUNNEL_CONFIG;
}

/**
 * Save Dynamic Funnel Configuration
 */
export async function saveFunnelConfig(config: Partial<FunnelConfig>, workspaceId?: string | null) {
  try {
    let settings = await db.siteSettings.findFirst({
      where: { workspaceId: workspaceId || null }
    });

    if (!settings) {
      settings = await db.siteSettings.create({
        data: { workspaceId: workspaceId || null }
      });
    }

    const currentConfig = await getFunnelConfig(workspaceId);
    const mergedConfig: FunnelConfig = {
      visitorTitle: config.visitorTitle !== undefined ? config.visitorTitle : currentConfig.visitorTitle,
      visitorSubtitle: config.visitorSubtitle !== undefined ? config.visitorSubtitle : currentConfig.visitorSubtitle,
      fields: { ...currentConfig.fields, ...(config.fields || {}) },
      franchiseQuestions: config.franchiseQuestions ?? currentConfig.franchiseQuestions,
      studentQuestions: config.studentQuestions ?? currentConfig.studentQuestions,
      redirection: { ...currentConfig.redirection, ...(config.redirection || {}) },
      popupEnabled: config.popupEnabled !== undefined ? config.popupEnabled : currentConfig.popupEnabled,
    };

    await db.landingSection.upsert({
      where: {
        siteSettingsId_type: {
          siteSettingsId: settings.id,
          type: "marketing-funnel"
        }
      },
      create: {
        siteSettingsId: settings.id,
        type: "marketing-funnel",
        title: mergedConfig.visitorTitle,
        subtitle: mergedConfig.visitorSubtitle,
        content: mergedConfig as any,
        isActive: mergedConfig.popupEnabled,
        order: 99,
      },
      update: {
        title: mergedConfig.visitorTitle,
        subtitle: mergedConfig.visitorSubtitle,
        content: mergedConfig as any,
        isActive: mergedConfig.popupEnabled,
      }
    });

    revalidatePath("/enquiry/lead");
    revalidatePath("/super-admin/enquiries");
    revalidatePath("/");
    if (workspaceId) {
      revalidatePath("/app/[tenant]/admin/enquiries");
      revalidatePath("/app/[tenant]/enquiry/lead");
    }

    return { success: true, config: mergedConfig };
  } catch (error: any) {
    console.error("Failed to save funnel config:", error);
    return { success: false, error: error.message || "Failed to save configuration." };
  }
}

/**
 * Handle Social Media Marketing Campaign Funnel Lead Submissions
 */
export async function submitCampaignLead(data: CampaignLeadInput) {
  try {
    // 1. Anti-bot honeypot check
    if (data.honeypot && data.honeypot.trim().length > 0) {
      await createLog(
        "CRITICAL",
        "BOT_DETECT",
        `Bot honeypot triggered on Social Campaign Funnel: phone='${data.phone}'`,
        "SECURITY_HONEYPOT"
      );
      return { success: true, redirectUrl: "/" };
    }

    // 2. Timing check: If submitted in less than 1.5 seconds, likely an automated bot
    if (data.formRenderTime && Date.now() - data.formRenderTime < 1500) {
      await createLog(
        "WARNING",
        "BOT_DETECT",
        `Suspicious sub-second submission on Campaign Funnel: phone='${data.phone}'`,
        "SECURITY_TIMING"
      );
      return { success: false, error: "Please take a moment to review your selections before proceeding." };
    }

    // 3. Strict Input Validation
    const nameVal = validateFullName(data.name || "");
    if (!nameVal.isValid) {
      return { success: false, error: nameVal.error || "Please enter a valid full name." };
    }

    const phoneVal = validateMobileNumber(data.phone || "");
    if (!phoneVal.isValid) {
      return { success: false, error: phoneVal.error || "Please enter a valid 10-digit mobile number." };
    }

    let cleanEmail: string | null = null;
    if (data.email && data.email.trim()) {
      const emailVal = validateEmailAddress(data.email);
      if (!emailVal.isValid) {
        return { success: false, error: emailVal.error || "Please enter a valid email address." };
      }
      cleanEmail = emailVal.cleanEmail;
    }

    let cleanPin: string | null = null;
    if (data.pinCode && data.pinCode.trim()) {
      const pinVal = validatePinCode(data.pinCode);
      if (!pinVal.isValid) {
        return { success: false, error: pinVal.error || "Please enter a valid 6-digit PIN code." };
      }
      cleanPin = pinVal.cleanPin;
    }

    // 4. Rate-Limiting / Duplicate submission throttling (within last 45 seconds)
    const recentDuplicate = await db.visitorLead.findFirst({
      where: {
        phone: phoneVal.cleanPhone,
        createdAt: { gte: new Date(Date.now() - 45 * 1000) }
      }
    });

    const isFranchise = data.campaignType === "FRANCHISE";
    const sourceTag = isFranchise ? "SOCIAL_CAMPAIGN_FRANCHISE" : "SOCIAL_CAMPAIGN_STUDENT";

    // 5. Load dynamic funnel config for redirection
    const config = await getFunnelConfig(data.workspaceId);
    let targetRedirectUrl = "/";
    let matchedWorkspaceId = data.workspaceId || null;
    let matchedCenterName: string | null = null;

    if (isFranchise) {
      const baseUrl = config.redirection.franchiseUrl?.trim() || "/franchises/apply";
      const sep = baseUrl.includes("?") ? "&" : "?";
      targetRedirectUrl = `${baseUrl}${sep}name=${encodeURIComponent(nameVal.cleanName)}&phone=${encodeURIComponent(phoneVal.cleanPhone)}&email=${encodeURIComponent(cleanEmail || "")}`;
    } else {
      // Student lead:
      if (data.workspaceId) {
        // Specific franchise campaign link
        const ws = await db.workspace.findUnique({
          where: { id: data.workspaceId },
          select: { subdomain: true, name: true }
        });
        const emailParam = cleanEmail ? `&email=${encodeURIComponent(cleanEmail)}` : "";
        if (ws?.subdomain) {
          matchedCenterName = ws.name;
          targetRedirectUrl = `/app/${ws.subdomain}/admission?view=form&name=${encodeURIComponent(nameVal.cleanName)}&phone=${encodeURIComponent(phoneVal.cleanPhone)}${emailParam}`;
        } else {
          const baseUrl = config.redirection.studentUrl?.trim() || "/nearest-center";
          const sep = baseUrl.includes("?") ? "&" : "?";
          targetRedirectUrl = `${baseUrl}${sep}name=${encodeURIComponent(nameVal.cleanName)}&phone=${encodeURIComponent(phoneVal.cleanPhone)}${emailParam}`;
        }
      } else if (config.redirection.autoNearestCenter && cleanPin && cleanPin.length === 6) {
        // Auto-match nearest franchise center by PIN code if enabled
        const emailParam = cleanEmail ? `&email=${encodeURIComponent(cleanEmail)}` : "";
        const nearestRes = await findNearestCenters(cleanPin);
        if (nearestRes.success && nearestRes.centers && nearestRes.centers.length > 0) {
          const nearest = nearestRes.centers[0];
          matchedWorkspaceId = nearest.id;
          matchedCenterName = nearest.name;
          targetRedirectUrl = `/app/${nearest.subdomain}/admission?view=form&name=${encodeURIComponent(nameVal.cleanName)}&phone=${encodeURIComponent(phoneVal.cleanPhone)}&pincode=${cleanPin}${emailParam}`;
        } else {
          const baseUrl = config.redirection.studentUrl?.trim() || "/nearest-center";
          const sep = baseUrl.includes("?") ? "&" : "?";
          targetRedirectUrl = `${baseUrl}${sep}name=${encodeURIComponent(nameVal.cleanName)}&phone=${encodeURIComponent(phoneVal.cleanPhone)}&pincode=${cleanPin}${emailParam}`;
        }
      } else {
        const emailParam = cleanEmail ? `&email=${encodeURIComponent(cleanEmail)}` : "";
        const baseUrl = config.redirection.studentUrl?.trim() || "/nearest-center";
        const sep = baseUrl.includes("?") ? "&" : "?";
        targetRedirectUrl = `${baseUrl}${sep}name=${encodeURIComponent(nameVal.cleanName)}&phone=${encodeURIComponent(phoneVal.cleanPhone)}${emailParam}`;
      }
    }

    if (recentDuplicate) {
      return { 
        success: true, 
        leadId: recentDuplicate.id, 
        redirectUrl: targetRedirectUrl,
        matchedCenterName,
        message: "Welcome back! Redirecting you now..." 
      };
    }

    // 6. Save Lead in VisitorLead
    const lead = await db.visitorLead.create({
      data: {
        name: nameVal.cleanName,
        phone: phoneVal.cleanPhone,
        email: cleanEmail,
        source: sourceTag,
        intent: isFranchise ? "Social Campaign: Franchise Center Applicant" : "Social Campaign: Student Admission Interest",
        workspaceId: matchedWorkspaceId,
        status: "NEW",
        metadata: {
          campaignType: data.campaignType,
          socialSource: data.socialSource || "social_media",
          city: data.city?.trim(),
          state: data.state?.trim(),
          pinCode: cleanPin,
          questionnaireAnswers: data.answers || {},
          targetRedirectUrl,
          matchedCenterName,
          capturedAt: new Date().toISOString(),
        }
      }
    });

    revalidatePath(`/super-admin/enquiries`);
    if (matchedWorkspaceId) {
      revalidatePath(`/app/[tenant]/admin/enquiries`);
    }

    return {
      success: true,
      leadId: lead.id,
      redirectUrl: targetRedirectUrl,
      matchedCenterName,
      message: "Lead captured successfully!"
    };
  } catch (error: any) {
    console.error("Failed to submit campaign lead:", error);
    return { success: false, error: error.message || "Failed to process lead." };
  }
}

/**
 * Fetch Enquiries / Leads with Filters & Pagination
 */
export async function getEnquiries(params: {
  workspaceId?: string | null;
  status?: string;
  source?: string;
  category?: "ALL" | "STUDENTS" | "FRANCHISES" | "NEWSLETTER" | "CONTACTS";
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const {
      workspaceId,
      status,
      source,
      category,
      search,
      page = 1,
      pageSize = 20,
    } = params;

    const whereClause: any = {};

    // Workspace scoping
    if (workspaceId !== undefined) {
      whereClause.workspaceId = workspaceId;
    }

    // Status filter
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    // Category / Source filter
    if (category && category !== "ALL") {
      if (category === "STUDENTS") {
        whereClause.source = { in: ["SOCIAL_CAMPAIGN_STUDENT", "ADMISSION_DRAFT", "COURSE_INTEREST"] };
      } else if (category === "FRANCHISES") {
        whereClause.source = { in: ["SOCIAL_CAMPAIGN_FRANCHISE"] };
      } else if (category === "NEWSLETTER") {
        whereClause.source = "NEWSLETTER_SUBSCRIBE";
      } else if (category === "CONTACTS") {
        whereClause.source = { in: ["CONTACT_FORM", "FRANCHISE_CONTACT"] };
      }
    } else if (source && source !== "ALL") {
      whereClause.source = source;
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { intent: { contains: q, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [leads, totalCount] = await Promise.all([
      db.visitorLead.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              centerCode: true,
            }
          }
        }
      }),
      db.visitorLead.count({ where: whereClause })
    ]);

    return {
      success: true,
      leads,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      currentPage: page,
    };
  } catch (error: any) {
    console.error("Failed to fetch enquiries:", error);
    return { success: false, leads: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}

/**
 * Get Enquiry Statistics
 */
export async function getEnquiryStatistics(workspaceId?: string | null) {
  try {
    const baseWhere: any = {};
    if (workspaceId !== undefined) {
      baseWhere.workspaceId = workspaceId;
    }

    const [
      totalEnquiries,
      newLeads,
      contactedLeads,
      convertedLeads,
      studentLeads,
      franchiseLeads,
      newsletterSubscribers,
      generalContacts
    ] = await Promise.all([
      db.visitorLead.count({ where: baseWhere }),
      db.visitorLead.count({ where: { ...baseWhere, status: "NEW" } }),
      db.visitorLead.count({ where: { ...baseWhere, status: "CONTACTED" } }),
      db.visitorLead.count({ where: { ...baseWhere, status: "CONVERTED" } }),
      db.visitorLead.count({
        where: {
          ...baseWhere,
          source: { in: ["SOCIAL_CAMPAIGN_STUDENT", "ADMISSION_DRAFT", "COURSE_INTEREST"] }
        }
      }),
      db.visitorLead.count({
        where: {
          ...baseWhere,
          source: { in: ["SOCIAL_CAMPAIGN_FRANCHISE"] }
        }
      }),
      db.visitorLead.count({
        where: {
          ...baseWhere,
          source: "NEWSLETTER_SUBSCRIBE"
        }
      }),
      db.visitorLead.count({
        where: {
          ...baseWhere,
          source: { in: ["CONTACT_FORM", "FRANCHISE_CONTACT"] }
        }
      })
    ]);

    return {
      totalEnquiries,
      newLeads,
      contactedLeads,
      convertedLeads,
      studentLeads,
      franchiseLeads,
      newsletterSubscribers,
      generalContacts,
    };
  } catch (error) {
    console.error("Failed to fetch enquiry stats:", error);
    return {
      totalEnquiries: 0,
      newLeads: 0,
      contactedLeads: 0,
      convertedLeads: 0,
      studentLeads: 0,
      franchiseLeads: 0,
      newsletterSubscribers: 0,
      generalContacts: 0,
    };
  }
}

/**
 * Update Enquiry Status & Notes
 */
export async function updateEnquiryStatus(leadId: string, status: string, notes?: string) {
  try {
    const updated = await db.visitorLead.update({
      where: { id: leadId },
      data: {
        status,
        ...(notes !== undefined && { notes })
      }
    });

    revalidatePath("/super-admin/enquiries");
    if (updated.workspaceId) {
      revalidatePath(`/app/[tenant]/admin/enquiries`);
    }

    return { success: true, lead: updated };
  } catch (error: any) {
    console.error("Failed to update enquiry status:", error);
    return { success: false, error: error.message || "Failed to update status." };
  }
}

/**
 * Delete Enquiry
 */
export async function deleteEnquiry(leadId: string) {
  try {
    const deleted = await db.visitorLead.delete({
      where: { id: leadId }
    });

    revalidatePath("/super-admin/enquiries");
    if (deleted.workspaceId) {
      revalidatePath(`/app/[tenant]/admin/enquiries`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete enquiry:", error);
    return { success: false, error: error.message || "Failed to delete enquiry." };
  }
}

/**
 * Get count of new/uncontacted enquiries for notification badges
 */
export async function getPendingEnquiriesCount(workspaceId?: string | null): Promise<number> {
  try {
    const where: any = { status: "NEW" };
    if (workspaceId !== undefined) {
      where.workspaceId = workspaceId;
    }
    return await db.visitorLead.count({ where });
  } catch (error) {
    console.error("Failed to get pending enquiries count:", error);
    return 0;
  }
}

