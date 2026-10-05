import { db } from "../src/lib/prisma";

async function seedGuides() {
  console.log("Seeding initial user guides...");

  const existingCount = await db.userGuide.count();
  if (existingCount > 0) {
    console.log(`Already have ${existingCount} guides in database. Skipping seed.`);
    return;
  }

  const initialGuides = [
    // Super Admin Guides
    {
      title: "Platform Architecture & Super Admin Command Center",
      description: "Comprehensive guide to global multi-tenant routing, site settings, and franchise oversight.",
      category: "Platform Architecture",
      targetRole: "SUPER_ADMIN",
      contentType: "ARTICLE",
      content: `### Platform Architecture Overview

The ABCD Edu Hub platform is engineered with a hybrid multi-tenant structure supporting both Subdomain and Subdirectory modes.

#### Key Modules:
1. **Franchise Oversight**: Approve new applications, configure commission rates, and manage document authorities.
2. **Global Course Catalog**: Define unified curricula and master syllabi accessible across all branches.
3. **Wallet & Economy**: Manage central balance top-ups, instant credit approvals, and token deductions.
4. **Document Designer**: Real-time canvas designer for marksheet, certificate, and admit card layouts.`,
      order: 1,
      isPublished: true,
      createdByRole: "DEVELOPER"
    },
    {
      title: "Super Admin Franchise Management & KYC Verification",
      description: "Walkthrough of reviewing franchise applicant documentation, center codes, and territory allocations.",
      category: "Franchise Management",
      targetRole: "SUPER_ADMIN",
      contentType: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: "Watch this video to understand the complete application verification workflow.",
      order: 2,
      isPublished: true,
      createdByRole: "DEVELOPER"
    },
    {
      title: "Central Wallet & Franchise Recharge Approvals Manual",
      description: "Official guide on ledger reconciliation, credit requests, and state manager commission distribution.",
      category: "Financial Operations",
      targetRole: "SUPER_ADMIN",
      contentType: "PDF",
      pdfUrl: "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
      content: "Download or view the financial operation policy manual.",
      order: 3,
      isPublished: true,
      createdByRole: "DEVELOPER"
    },

    // Franchise Admin Guides
    {
      title: "Center Operations & Dashboard Navigation Walkthrough",
      description: "Essential introduction for new franchise center heads and staff administrators.",
      category: "Overview",
      targetRole: "FRANCHISE_ADMIN",
      contentType: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: "Watch this video walkthrough to get started with your center management portal.",
      order: 1,
      isPublished: true,
      createdByRole: "DEVELOPER"
    },
    {
      title: "Step-by-Step Student Admission & Fee Ledger Procedure",
      description: "How to register new admissions, collect monthly fees, and issue automatic receipts.",
      category: "Student Admissions",
      targetRole: "FRANCHISE_ADMIN",
      contentType: "ARTICLE",
      content: `### Student Admissions Guide

1. Navigate to **Students** or **Admissions** in your sidebar.
2. Click **New Admission** and enter student demographics, photo, and course selection.
3. Configure batch allocation and fee payment structure (One-time or Monthly installments).
4. Download the student enrollment form and instantly generate the student portal login credentials.
5. All fee collections immediately update your center revenue ledger.`,
      order: 2,
      isPublished: true,
      createdByRole: "DEVELOPER"
    },
    {
      title: "Franchise Center Operational Handbook & Examination Rules",
      description: "Official curriculum syllabi, admit card rules, and final marksheet delivery policies.",
      category: "Exams & Syllabus",
      targetRole: "FRANCHISE_ADMIN",
      contentType: "PDF",
      pdfUrl: "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
      content: "Download the complete examination guidelines and center operating handbook.",
      order: 3,
      isPublished: true,
      createdByRole: "DEVELOPER"
    }
  ];

  for (const guide of initialGuides) {
    await db.userGuide.create({
      data: guide
    });
  }

  console.log(`Successfully seeded ${initialGuides.length} starter user guides!`);
}

seedGuides()
  .catch((e) => {
    console.error("Error seeding guides:", e);
  })
  .finally(async () => {
    process.exit(0);
  });
