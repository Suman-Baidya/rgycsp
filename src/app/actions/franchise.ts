"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const STATE_CODES: Record<string, string> = {
  "andhra pradesh": "AP",
  "arunachal pradesh": "AR",
  "assam": "AS",
  "bihar": "BR",
  "chhattisgarh": "CG",
  "goa": "GA",
  "gujarat": "GJ",
  "haryana": "HR",
  "himachal pradesh": "HP",
  "jharkhand": "JH",
  "karnataka": "KA",
  "kerala": "KL",
  "madhya pradesh": "MP",
  "maharashtra": "MH",
  "manipur": "MN",
  "meghalaya": "ML",
  "mizoram": "MZ",
  "nagaland": "NL",
  "odisha": "OD",
  "punjab": "PB",
  "rajasthan": "RJ",
  "sikkim": "SK",
  "tamil nadu": "TN",
  "telangana": "TG",
  "tripura": "TR",
  "uttar pradesh": "UP",
  "uttarakhand": "UK",
  "west bengal": "WB",
  "andaman and nicobar islands": "AN",
  "chandigarh": "CH",
  "dadra and nagar haveli and daman and diu": "DN",
  "delhi": "DL",
  "jammu and kashmir": "JK",
  "ladakh": "LA",
  "lakshadweep": "LD",
  "puducherry": "PY"
};

function getStateCode(stateName: string): string {
  const normalized = stateName.trim().toLowerCase();
  if (STATE_CODES[normalized]) {
    return STATE_CODES[normalized];
  }
  const clean = normalized.replace(/[^a-z]/g, "");
  if (clean.length >= 2) {
    return clean.substring(0, 2).toUpperCase();
  }
  return "WB";
}

export async function submitFranchiseApplication(data: any) {
  try {
    const {
      fullName,
      dob,
      mobile,
      whatsapp,
      email,
      password,
      centerName,
      pinCode,
      state,
      district,
      addressDetail,
      computerCount,
      teacherCount,
      roomCount,
      spaceSqFt,
      photoUrl,
      signatureUrl,
      idProofUrl
    } = data;

    // Check if email already used
    const existingApp = await db.franchiseApplication.findFirst({
      where: {
        email: email,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existingApp) {
      return { success: false, error: "An application with this email already exists." };
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: "An account with this email is already registered." };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create application
    const application = await db.franchiseApplication.create({
      data: {
        fullName,
        dob: dob ? new Date(dob) : new Date(),
        mobile,
        whatsapp: whatsapp || mobile,
        email,
        passwordHash,
        centerName,
        pinCode,
        state,
        district,
        addressDetail,
        computerCount: parseInt(String(computerCount)) || 0,
        teacherCount: parseInt(String(teacherCount)) || 0,
        roomCount: roomCount ? parseInt(String(roomCount)) : null,
        spaceSqFt: spaceSqFt ? parseFloat(String(spaceSqFt)) : null,
        photoUrl,
        signatureUrl,
        idProofUrl,
        status: "PENDING"
      }
    });

    // Create a global notification for Super Admin
    await db.notification.create({
      data: {
        workspaceId: null as any, // workspaceId is optional now
        title: "New Franchise Application",
        message: `A new franchise application for "${centerName}" has been submitted by ${fullName}.`,
        type: "APPLICATION",
        link: "/super-admin/franchises"
      }
    });

    revalidatePath("/(admin)/super-admin/franchises", "page");

    return { success: true, data: application };
  } catch (error: any) {
    console.error("Franchise application submit error:", error);
    return { success: false, error: error.message || "Failed to submit application." };
  }
}

export async function checkFranchiseStatus(emailOrPhone: string) {
  try {
    const trimmed = emailOrPhone.trim();
    const application = await db.franchiseApplication.findFirst({
      where: {
        OR: [
          { email: trimmed },
          { mobile: trimmed }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    if (!application) {
      return { success: false, error: "No application found for this email or mobile number." };
    }

    return { success: true, data: application };
  } catch (error: any) {
    console.error("Check status error:", error);
    return { success: false, error: "An error occurred while tracking status." };
  }
}

export async function verifyCenterCode(code: string) {
  try {
    const cleanCode = code.trim().toUpperCase();
    
    // First find by username (center code) in FranchiseApplication
    const application = await db.franchiseApplication.findFirst({
      where: {
        username: cleanCode,
        status: "APPROVED"
      }
    });

    if (application) {
      // Find workspace
      const subdomain = cleanCode.toLowerCase().replace(/[^a-z0-9]/g, "");
      const workspace = await db.workspace.findUnique({
        where: { subdomain },
        include: { siteSettings: true }
      });

      return {
        success: true,
        data: {
          code: cleanCode,
          centerName: application.centerName,
          ownerName: application.fullName,
          district: application.district,
          state: application.state,
          pinCode: application.pinCode,
          address: `${application.addressDetail}, Dist: ${application.district}, ${application.state} - ${application.pinCode}`,
          isActive: workspace?.isActive ?? true,
          logoUrl: workspace?.logoUrl ?? null,
          joinedAt: application.updatedAt
        }
      };
    }

    // Fallback search: find workspace by subdomain match
    const cleanSub = code.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const workspace = await db.workspace.findFirst({
      where: {
        OR: [
          { subdomain: cleanSub },
          { subdomain: cleanCode.toLowerCase() }
        ]
      },
      include: {
        roles: {
          where: { role: "ADMIN" },
          include: { user: true }
        },
        siteSettings: true
      }
    });

    if (workspace) {
      const adminRole = workspace.roles[0];
      const address = workspace.siteSettings?.address || "Registered Address";
      return {
        success: true,
        data: {
          code: workspace.subdomain.toUpperCase(),
          centerName: workspace.name,
          ownerName: adminRole?.user?.name || "Center Administrator",
          district: workspace.siteSettings?.address?.split(",")?.[1]?.trim() || "",
          state: workspace.siteSettings?.address?.split(",")?.[2]?.trim() || "",
          pinCode: "",
          address: address,
          isActive: workspace.isActive,
          logoUrl: workspace.logoUrl,
          joinedAt: workspace.createdAt
        }
      };
    }

    return { success: false, error: "Center not registered or invalid code." };
  } catch (error: any) {
    console.error("Verify center error:", error);
    return { success: false, error: "Verification failed." };
  }
}

export async function getFranchiseApplications() {
  try {
    const applications = await db.franchiseApplication.findMany({
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: applications };
  } catch (error: any) {
    console.error("Fetch applications error:", error);
    return { success: false, error: error.message || "Failed to load applications." };
  }
}

export async function updateFranchiseApplicationStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
  details?: {
    rejectionReason?: string;
    customSubdomain?: string;
    customStateCode?: string;
  }
) {
  try {
    const application = await db.franchiseApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    if (application.status !== "PENDING") {
      return { success: false, error: `This application has already been ${application.status.toLowerCase()}.` };
    }

    if (status === "REJECTED") {
      const updated = await db.franchiseApplication.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: details?.rejectionReason || "Documents or details did not meet criteria."
        }
      });
      revalidatePath("/(admin)/super-admin/franchises", "page");
      return { success: true, data: updated };
    }

    // APPROVED: Generate Username (e.g. WB-002) and Workspace
    const stateCode = (details?.customStateCode || getStateCode(application.state)).toUpperCase();
    
    // Find next sequential unique 3 digit number for this StateCode
    let codeStr = "";
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 100) {
      // Let's generate a random 3 digit number or count-based
      const num = Math.floor(1 + Math.random() * 999);
      const suffix = String(num).padStart(3, '0');
      const testUsername = `${stateCode}-${suffix}`;
      
      // Check in FranchiseApplication and User tables
      const appCheck = await db.franchiseApplication.findFirst({
        where: { username: testUsername }
      });
      
      const userCheck = await db.user.findUnique({
        where: { username: testUsername }
      });
      
      if (!appCheck && !userCheck) {
        codeStr = testUsername;
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      // Fallback: sequential search
      for (let i = 1; i <= 999; i++) {
        const suffix = String(i).padStart(3, '0');
        const testUsername = `${stateCode}-${suffix}`;
        const appCheck = await db.franchiseApplication.findFirst({
          where: { username: testUsername }
        });
        const userCheck = await db.user.findUnique({
          where: { username: testUsername }
        });
        if (!appCheck && !userCheck) {
          codeStr = testUsername;
          isUnique = true;
          break;
        }
      }
    }

    if (!isUnique) {
      return { success: false, error: "Failed to generate unique username code." };
    }

    // Subdomain generation: code lowercased, hyphens removed, alphanumeric only
    const subdomain = (details?.customSubdomain || codeStr.toLowerCase().replace(/[^a-z0-9]/g, "")).toLowerCase();

    // Check if subdomain is already in use
    const existingWorkspace = await db.workspace.findUnique({
      where: { subdomain }
    });

    if (existingWorkspace) {
      return { success: false, error: `The subdomain "${subdomain}" is already in use.` };
    }

    // Check if user exists by email
    let user = await db.user.findUnique({
      where: { email: application.email }
    });

    if (user) {
      // If user already exists, update their username/roles
      await db.user.update({
        where: { id: user.id },
        data: {
          username: codeStr,
          role: "USER"
        }
      });
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          name: application.fullName,
          email: application.email,
          username: codeStr,
          passwordHash: application.passwordHash,
          role: "USER"
        }
      });
    }

    // Create Workspace and WorkspaceRole
    const workspace = await db.workspace.create({
      data: {
        name: application.centerName,
        subdomain: subdomain,
        logoUrl: application.photoUrl || null,
        isActive: true,
        tokensBalance: 100, // Initial seed tokens for the franchise
        siteSettings: {
          create: {
            siteName: application.centerName,
            contactEmail: application.email,
            contactPhone: application.mobile,
            whatsapp: application.whatsapp,
            address: `${application.addressDetail}, PIN - ${application.pinCode}, Dist: ${application.district}, State: ${application.state}`
          }
        }
      }
    });

    // Bind Owner to Workspace as ADMIN
    await db.workspaceRole.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "ADMIN"
      }
    });

    // Update application
    const updated = await db.franchiseApplication.update({
      where: { id },
      data: {
        status: "APPROVED",
        username: codeStr
      }
    });

    revalidatePath("/(admin)/super-admin/franchises", "page");
    revalidatePath("/franchises", "page");
    revalidatePath("/workspaces", "page");

    return {
      success: true,
      data: updated,
      username: codeStr,
      subdomain: subdomain
    };
  } catch (err: any) {
    console.error("Failed to update status:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function getPendingFranchiseCount() {
  try {
    const count = await db.franchiseApplication.count({
      where: {
        status: "PENDING",
      },
    });
    return count;
  } catch (error) {
    console.error("Error fetching pending franchise count:", error);
    return 0;
  }
}
