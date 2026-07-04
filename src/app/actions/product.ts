"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        variants: true
      },
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
      include: {
        variants: true
      }
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
        category: data.category,
        image: data.image,
        isActive: data.isActive ?? true,
        variants: {
          create: data.variants?.map((v: any) => ({
            name: v.name,
            price: parseFloat(v.price),
            stock: parseInt(v.stock, 10),
            isActive: v.isActive ?? true
          })) || []
        }
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
        category: data.category,
        image: data.image,
        isActive: data.isActive,
      },
    });

    if (data.variants) {
      const existingVariants = await db.productVariant.findMany({ where: { productId: id } });
      const incomingIds = data.variants.map((v: any) => v.id).filter(Boolean);

      // Deactivate variants that were removed in the UI
      for (const ev of existingVariants) {
        if (!incomingIds.includes(ev.id)) {
          await db.productVariant.update({
            where: { id: ev.id },
            data: { isActive: false }
          });
        }
      }

      // Upsert incoming variants
      for (const v of data.variants) {
        if (v.id) {
          await db.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              price: parseFloat(v.price),
              stock: parseInt(v.stock, 10),
              isActive: v.isActive ?? true
            }
          });
        } else {
          await db.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              price: parseFloat(v.price),
              stock: parseInt(v.stock, 10),
              isActive: v.isActive ?? true
            }
          });
        }
      }
    }

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
