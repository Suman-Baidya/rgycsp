"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getProductCategories() {
  try {
    const categories = await db.productCategory.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Failed to fetch product categories:", error);
    return { success: false, error: "Failed to fetch product categories." };
  }
}

export async function createProductCategory(data: any) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const category = await db.productCategory.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/super-admin/products");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Failed to create product category:", error);
    if (error.code === 'P2002') {
        return { success: false, error: "A category with this name already exists." };
    }
    return { success: false, error: "Failed to create product category." };
  }
}

export async function updateProductCategory(id: string, data: any) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const category = await db.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    revalidatePath("/super-admin/products");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Failed to update product category:", error);
    if (error.code === 'P2002') {
        return { success: false, error: "A category with this name already exists." };
    }
    return { success: false, error: "Failed to update product category." };
  }
}

export async function deleteProductCategory(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.productCategory.delete({
      where: { id },
    });

    revalidatePath("/super-admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product category:", error);
    return { success: false, error: "Failed to delete product category." };
  }
}
