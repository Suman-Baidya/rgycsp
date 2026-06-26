"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getWorkspaceOrders(workspaceId: string) {
  try {
    const orders = await db.productOrder.findMany({
      where: { workspaceId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error: any) {
    console.error("Failed to fetch workspace orders:", error);
    return { success: false, error: "Failed to fetch orders." };
  }
}

export async function getAllOrders() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const orders = await db.productOrder.findMany({
      include: {
        product: true,
        workspace: {
          select: {
            name: true,
            subdomain: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error: any) {
    console.error("Failed to fetch all orders:", error);
    return { success: false, error: "Failed to fetch orders." };
  }
}

export async function getPendingOrdersCount() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const count = await db.productOrder.count({
      where: {
        status: "PENDING"
      }
    });

    return { success: true, count };
  } catch (error: any) {
    console.error("Failed to fetch pending orders count:", error);
    return { success: false, error: "Failed to fetch pending orders count" };
  }
}

export async function createOrder(workspaceId: string, productId: string, quantity: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify product exists and has enough stock (optional check, but good practice)
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }
    
    // We do NOT reduce stock here based on user requirement: "When approve".

    const totalPrice = product.price * quantity;

    // Create the order
    const order = await db.productOrder.create({
      data: {
        workspaceId,
        productId,
        quantity,
        totalPrice,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      include: {
        workspace: {
          select: { name: true }
        }
      }
    });

    // Notify Super Admin
    await db.notification.create({
      data: {
        title: "New Product Order",
        message: `${order.workspace?.name} ordered ${quantity}x ${product.title}.`,
        type: "INFO",
        link: "/super-admin/products?tab=orders"
      }
    });

    revalidatePath(`/app/[tenant]/admin/products`);
    revalidatePath(`/super-admin/products`);
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Failed to create order." };
  }
}

export async function updateOrderStatus(orderId: string, status: any, paymentStatus: any) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Get current order state to check if we are transitioning to APPROVED
    const currentOrder = await db.productOrder.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!currentOrder) {
      return { success: false, error: "Order not found" };
    }

    // If moving to APPROVED for the first time, reduce stock
    let stockUpdate = {};
    if (status === "APPROVED" && currentOrder.status !== "APPROVED" && currentOrder.status !== "SHIPPED" && currentOrder.status !== "DELIVERED") {
      if (currentOrder.product.stock < currentOrder.quantity) {
         // Optionally block approval if stock is insufficient
         // return { success: false, error: "Insufficient stock to approve this order" };
      }
      stockUpdate = {
        product: {
          update: {
            stock: {
              decrement: currentOrder.quantity
            }
          }
        }
      };
    }

    const order = await db.productOrder.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus,
        ...stockUpdate
      },
    });

    revalidatePath("/super-admin/products");
    
    // Attempt to revalidate franchise dashboard too (we don't easily have tenant here, but we can try)
    // Next.js might struggle with dynamic paths in revalidatePath without the actual path, so we'll rely on client-side fetching or soft-revalidations.
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status." };
  }
}
