"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getWorkspaceOrders(workspaceId: string) {
  try {
    const orders = await db.productOrder.findMany({
      where: { workspaceId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true
              }
            }
          }
        }
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
        items: {
          include: {
            productVariant: {
              include: {
                product: true
              }
            }
          }
        },
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

export async function placeOrder(workspaceId: string, cartItems: { variantId: string, quantity: number }[], shippingCost: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!cartItems.length) {
      return { success: false, error: "Cart is empty." };
    }

    // Fetch variant details to calculate total securely
    const variantIds = cartItems.map(item => item.variantId);
    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
    });

    if (variants.length !== cartItems.length) {
      return { success: false, error: "Some products are no longer available." };
    }

    let itemsTotal = 0;
    const orderItemsData = cartItems.map(cartItem => {
      const variant = variants.find(v => v.id === cartItem.variantId)!;
      itemsTotal += variant.price * cartItem.quantity;
      return {
        productVariantId: variant.id,
        quantity: cartItem.quantity,
        priceAtTime: variant.price
      };
    });

    const totalAmount = itemsTotal + shippingCost;

    // Create the order
    const order = await db.productOrder.create({
      data: {
        workspaceId,
        totalAmount,
        shippingCost,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: orderItemsData
        }
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
        message: `${order.workspace?.name} placed a new order for ${cartItems.length} items.`,
        type: "INFO",
        link: "/super-admin/products?tab=orders"
      }
    });

    revalidatePath(`/app/[tenant]/admin/products`);
    revalidatePath(`/super-admin/products`);
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Failed to place order:", error);
    return { success: false, error: "Failed to place order." };
  }
}

export async function updateOrderStatus(orderId: string, status: any, paymentStatus: any) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const currentOrder = await db.productOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!currentOrder) {
      return { success: false, error: "Order not found" };
    }

    // If moving to APPROVED for the first time, reduce stock
    if (status === "APPROVED" && currentOrder.status !== "APPROVED" && currentOrder.status !== "SHIPPED" && currentOrder.status !== "DELIVERED") {
      // Loop through items and decrement stock
      for (const item of currentOrder.items) {
        await db.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    const order = await db.productOrder.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus
      },
    });

    revalidatePath("/super-admin/products");
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status." };
  }
}
