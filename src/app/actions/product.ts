"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products };
  } catch (error: any) {
    console.error("Failed to fetch products:", error);
    return { success: false, error: "Failed to fetch products." };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
    });
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: "Failed to fetch product." };
  }
}

export async function createProduct(data: any) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const product = await db.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock, 10),
        category: data.category,
        image: data.image,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/super-admin/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product." };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const product = await db.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock, 10),
        category: data.category,
        image: data.image,
        isActive: data.isActive,
      },
    });

    revalidatePath("/super-admin/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product." };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.product.delete({
      where: { id },
    });

    revalidatePath("/super-admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product. It may have existing orders." };
  }
}
