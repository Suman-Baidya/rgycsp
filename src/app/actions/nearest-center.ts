"use server";

import { db } from "@/lib/prisma";
import { getPincodeDetails } from "./pincode";

export async function findNearestCenters(pinCode: string) {
  try {
    // Basic validation
    if (!pinCode || pinCode.length !== 6) {
      return { success: false, error: "Invalid PIN code" };
    }

    // Step 1: Look for exact PIN code match
    let centers = await db.workspace.findMany({
      where: { 
        pinCode,
        isActive: true
      },
      include: {
        siteSettings: true
      }
    });

    // Step 2: If no exact match, fetch district/state from public API and match that
    if (centers.length === 0) {
      const locationRes = await getPincodeDetails(pinCode);
      if (locationRes.success && locationRes.district) {
        centers = await db.workspace.findMany({
          where: {
            district: locationRes.district,
            isActive: true
          },
          include: {
            siteSettings: true
          }
        });

        // Step 3: If still none in district, match by state
        if (centers.length === 0 && locationRes.state) {
          centers = await db.workspace.findMany({
            where: {
              state: locationRes.state,
              isActive: true
            },
            include: {
              siteSettings: true
            }
          });
        }
      }
    }

    // Process to return only needed info
    const result = centers.map(c => ({
      id: c.id,
      name: c.name,
      subdomain: c.subdomain,
      pinCode: c.pinCode,
      district: c.district,
      state: c.state,
      logoUrl: c.siteSettings?.logoUrl,
      contactPhone: c.siteSettings?.contactPhone,
      address: c.siteSettings?.address
    }));

    return { success: true, centers: result };

  } catch (error: any) {
    console.error("Error finding nearest center:", error);
    return { success: false, error: "An error occurred while searching for centers." };
  }
}
