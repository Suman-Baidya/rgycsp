"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "APPLICATION" | "FEES";
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  category?: "sidebar" | "system" | "notice";
  badgeText?: string;
  badgeColor?: "amber" | "rose" | "emerald" | "blue" | "sky" | "purple" | "indigo" | "zinc";
  actionText?: string;
  count?: number;
}

export type NotificationQueryOptions = {
  workspaceId?: string;
  portal?: "super-admin" | "admin" | "student";
  tenant?: string;
};

export async function getNotifications(param?: string | NotificationQueryOptions) {
  try {
    const options: NotificationQueryOptions =
      typeof param === "string" ? { workspaceId: param } : param || {};

    let session: any = null;
    try {
      session = await auth();
    } catch {
      // outside request scope or session uninitialized
    }
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    let targetWorkspaceId = options.workspaceId;

    // Resolve workspace ID from tenant if not explicitly provided
    if (!targetWorkspaceId && options.tenant && options.tenant !== "super-admin") {
      const { getWorkspaceByTenant } = await import("@/lib/workspace");
      const ws = await getWorkspaceByTenant(options.tenant);
      if (ws) {
        targetWorkspaceId = ws.id;
      }
    }

    // Determine active portal mode
    let activePortal = options.portal;
    if (!activePortal) {
      if (userRole === "SUPER_ADMIN" || userRole === "SUPER_ADMIN_MANAGER") {
        activePortal = targetWorkspaceId ? "admin" : "super-admin";
      } else if (userRole === "STUDENT") {
        activePortal = "student";
      } else if (targetWorkspaceId) {
        activePortal = "admin";
      }
    }

    const sidebarNotices: NotificationItem[] = [];

    // ==========================================================
    // 1. DYNAMIC SIDEBAR NOTICES FOR SUPER ADMIN
    // ==========================================================
    if (activePortal === "super-admin") {
      // (a) Pending Franchise Applications
      try {
        const pendingFranchises = await db.franchiseApplication.count({
          where: { status: "PENDING" },
        });
        if (pendingFranchises > 0) {
          sidebarNotices.push({
            id: "sidebar-franchise-pending",
            title: "Franchise Applications Pending",
            message: `${pendingFranchises} new franchise application${pendingFranchises > 1 ? "s" : ""} awaiting review and approval.`,
            type: "APPLICATION",
            link: "/super-admin/franchises",
            isRead: false,
            createdAt: new Date().toISOString(),
            category: "sidebar",
            badgeText: `${pendingFranchises} Pending`,
            badgeColor: "amber",
            actionText: "Review Applications",
            count: pendingFranchises,
          });
        }
      } catch (err) {
        console.error("Error checking pending franchise count:", err);
      }

      // (b) Pending Product Orders
      try {
        const pendingOrders = await db.productOrder.count({
          where: { status: "PENDING" },
        });
        if (pendingOrders > 0) {
          sidebarNotices.push({
            id: "sidebar-orders-pending",
            title: "Product Orders Awaiting Dispatch",
            message: `${pendingOrders} student product/kit order${pendingOrders > 1 ? "s" : ""} awaiting dispatch and fulfillment.`,
            type: "INFO",
            link: "/super-admin/products",
            isRead: false,
            createdAt: new Date().toISOString(),
            category: "sidebar",
            badgeText: `${pendingOrders} Pending`,
            badgeColor: "rose",
            actionText: "Process Orders",
            count: pendingOrders,
          });
        }
      } catch (err) {
        console.error("Error checking pending product orders count:", err);
      }

      // (c) Pending Wallet Topup / Recharge Requests
      try {
        const pendingWallet = await db.walletTransaction.count({
          where: {
            status: "PENDING",
            type: "CREDIT",
            isCommission: false,
          },
        });
        if (pendingWallet > 0) {
          sidebarNotices.push({
            id: "sidebar-wallet-pending",
            title: "Wallet Top-up Requests",
            message: `${pendingWallet} franchise wallet recharge request${pendingWallet > 1 ? "s" : ""} awaiting clearance.`,
            type: "FEES",
            link: "/super-admin/wallet",
            isRead: false,
            createdAt: new Date().toISOString(),
            category: "sidebar",
            badgeText: `${pendingWallet} Pending`,
            badgeColor: "emerald",
            actionText: "Approve Topups",
            count: pendingWallet,
          });
        }
      } catch (err) {
        console.error("Error checking pending wallet requests:", err);
      }

      // (d) Pending Student Document Requests
      try {
        const config = await db.registrationConfig.findFirst();
        const minutes = (config as any)?.autoIssueAfterRequestMinutes || ((config as any)?.autoIssueAfterRequestHours ? (config as any).autoIssueAfterRequestHours * 60 : 60);
        const thresholdDate = new Date();
        thresholdDate.setMinutes(thresholdDate.getMinutes() - minutes);

        const pendingDocs = await db.studentProfile.count({
          where: {
            documentIssueRequestedAt: {
              not: null,
              gte: thresholdDate,
            },
            certificateApproved: false,
            certificateIssuedToStudent: false,
          },
        });
        if (pendingDocs > 0) {
          sidebarNotices.push({
            id: "sidebar-docs-pending",
            title: "Document Verification Requests",
            message: `${pendingDocs} student certificate/marksheet verification request${pendingDocs > 1 ? "s" : ""} pending.`,
            type: "WARNING",
            link: "/super-admin/students",
            isRead: false,
            createdAt: new Date().toISOString(),
            category: "sidebar",
            badgeText: `${pendingDocs} Pending`,
            badgeColor: "blue",
            actionText: "Verify Documents",
            count: pendingDocs,
          });
        }
      } catch (err) {
        console.error("Error checking pending student document requests:", err);
      }
    }

    // ==========================================================
    // 2. DYNAMIC SIDEBAR NOTICES FOR WORKSPACE ADMIN
    // ==========================================================
    if (activePortal === "admin" && targetWorkspaceId) {
      // (a) Pending Admission Applications
      try {
        const pendingAdmissions = await db.admissionApplication.count({
          where: {
            workspaceId: targetWorkspaceId,
            status: "PENDING",
          },
        });
        if (pendingAdmissions > 0) {
          const admissionsHref = options.tenant
            ? `/app/${options.tenant}/admin/admissions`
            : `/admin/admissions`;
          sidebarNotices.push({
            id: "sidebar-admissions-pending",
            title: "Admission Applications Pending",
            message: `${pendingAdmissions} student admission application${pendingAdmissions > 1 ? "s" : ""} awaiting verification.`,
            type: "APPLICATION",
            link: admissionsHref,
            isRead: false,
            createdAt: new Date().toISOString(),
            category: "sidebar",
            badgeText: `${pendingAdmissions} Pending`,
            badgeColor: "sky",
            actionText: "Review Admissions",
            count: pendingAdmissions,
          });
        }
      } catch (err) {
        console.error("Error checking workspace admissions count:", err);
      }

      // (b) Pending Fee Payments Clearance
      try {
        const pendingFees = await db.invoice.count({
          where: {
            workspaceId: targetWorkspaceId,
            status: "PENDING",
            paymentProof: { not: null },
          },
        });
        if (pendingFees > 0) {
          const feesHref = options.tenant
            ? `/app/${options.tenant}/admin/fees`
            : `/admin/fees`;
          sidebarNotices.push({
            id: "sidebar-fees-pending",
            title: "Student Fee Clearances",
            message: `${pendingFees} student fee payment receipt${pendingFees > 1 ? "s" : ""} submitted for clearance.`,
            type: "FEES",
            link: feesHref,
            isRead: false,
            createdAt: new Date().toISOString(),
            category: "sidebar",
            badgeText: `${pendingFees} Pending`,
            badgeColor: "rose",
            actionText: "Clear Fees",
            count: pendingFees,
          });
        }
      } catch (err) {
        console.error("Error checking workspace fee clearances:", err);
      }
    }

    // ==========================================================
    // 3. DYNAMIC NOTICES FOR STUDENT PORTAL
    // ==========================================================
    if (activePortal === "student") {
      // (a) Published Branch Notices & Circulars (Informational, marked read so no false red badge)
      try {
        if (targetWorkspaceId) {
          const ws = await db.workspace.findUnique({
            where: { id: targetWorkspaceId },
            include: { siteSettings: true },
          });
          if (ws?.siteSettings) {
            const settings = ws.siteSettings as any;
            const aboutSection = settings?.sections?.find((s: any) => s.type === "about");
            const rawNotices = (aboutSection?.content as any)?.notices || [];
            const noticesHref = options.tenant
              ? `/app/${options.tenant}/student/notices`
              : `/student/notices`;

            rawNotices.slice(0, 3).forEach((noticeItem: any, idx: number) => {
              sidebarNotices.push({
                id: `student-notice-${idx}`,
                title: noticeItem.title || "Institutional Notice",
                message: noticeItem.description || noticeItem.message || "Important announcement from administration.",
                type: "INFO",
                link: noticesHref,
                isRead: true, // Marked read: informational so it does not falsely increment unread badge
                createdAt: noticeItem.date ? new Date(noticeItem.date).toISOString() : new Date().toISOString(),
                category: "notice",
                badgeText: noticeItem.tag || "Notice",
                badgeColor: "emerald",
                actionText: "Read Notice",
                count: 0,
              });
            });
          }
        }
      } catch (err) {
        console.error("Error checking student notices:", err);
      }

      // (b) Pending Student Fee Invoices
      try {
        if (userId) {
          const studentProfile = await db.studentProfile.findFirst({
            where: {
              userId,
              ...(targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {}),
            },
            select: { id: true },
          });

          if (studentProfile) {
            const pendingInvoices = await db.invoice.count({
              where: {
                studentProfileId: studentProfile.id,
                status: "PENDING",
              },
            });
            if (pendingInvoices > 0) {
              const studentFeesHref = options.tenant
                ? `/app/${options.tenant}/student/fees`
                : `/student/fees`;
              sidebarNotices.push({
                id: "student-invoice-pending",
                title: "Tuition Fee Due",
                message: `You have ${pendingInvoices} tuition fee invoice${pendingInvoices > 1 ? "s" : ""} pending payment clearance.`,
                type: "FEES",
                link: studentFeesHref,
                isRead: false,
                createdAt: new Date().toISOString(),
                category: "sidebar",
                badgeText: `${pendingInvoices} Due`,
                badgeColor: "rose",
                actionText: "Pay Fees",
                count: pendingInvoices,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error checking student fee dues:", err);
      }
    }

    // ==========================================================
    // 4. PERSONAL DATABASE NOTIFICATIONS ONLY
    // We only fetch notifications explicitly targeted to this specific user (userId).
    // Stale broadcast logs with userId: null are NOT included so they don't inflate counts.
    // ==========================================================
    let personalNotifications: any[] = [];
    try {
      if (userId) {
        personalNotifications = await db.notification.findMany({
          where: {
            userId: userId,
            isRead: false,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
      }
    } catch (err) {
      console.error("Error fetching personal db notifications:", err);
    }

    const realPersonalNotifications: NotificationItem[] = personalNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as any,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      category: "system",
      count: 1,
    }));

    // Combine sidebar pending action items + personal notifications
    const allNotifications = [...sidebarNotices, ...realPersonalNotifications];

    // Total unread count equals the exact sum of live sidebar pending badges + unread personal notifications
    const sidebarPendingTotal = sidebarNotices
      .filter((n) => !n.isRead)
      .reduce((sum, item) => sum + (item.count !== undefined ? item.count : 1), 0);

    const personalUnreadTotal = realPersonalNotifications.filter((n) => !n.isRead).length;

    const unreadCount = sidebarPendingTotal + personalUnreadTotal;

    return {
      success: true,
      notifications: allNotifications,
      unreadCount,
      sidebarCount: sidebarNotices.filter((n) => !n.isRead).length,
      systemCount: realPersonalNotifications.length,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      sidebarCount: 0,
      systemCount: 0,
    };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    if (id.startsWith("sidebar-") || id.startsWith("student-notice-") || id.startsWith("sys-")) {
      return { success: true };
    }

    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(workspaceId?: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      await db.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}
