"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { errorMessage, requireAnyRole, requirePlatformAdmin } from "@/lib/auth/tenant-access";

const LIST_PAGE_SIZE = 100;

export async function getApiProducts() {
  try {
    await requirePlatformAdmin();
    const products = await prisma.apiProduct.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        rateLimit: true,
        features: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: LIST_PAGE_SIZE,
    });
    
    const mapped = products.map(p => ({
      ...p,
      basePrice: p.price,
      requestLimit: p.rateLimit
    }));
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getApiProductById(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const product = await prisma.apiProduct.findUnique({
      where: { id },
      include: { 
        subscriptions: {
          where: user.role === Role.PLATFORM_ADMIN ? {} : { organizationId: user.organizationId as string },
          include: {
            organization: true
          }
        }
      }
    });
    if (!product) return { success: false, error: "Not found" };
    
    const mapped = {
      ...product,
      basePrice: product.price,
      requestLimit: product.rateLimit
    };
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createApiProduct(data: any, userId: string) {
  try {
    const user = await requirePlatformAdmin();
    const newProduct = await prisma.apiProduct.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.basePrice || "0"),
        rateLimit: parseInt(data.requestLimit || "1000", 10),
        features: data.features || [],
        createdBy: user.id || userId,
        isActive: data.isActive ?? true,
      }
    });
    revalidatePath("/api-products");
    return { success: true, data: { ...newProduct, id: newProduct.id } };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateApiProduct(id: string, data: any, userId: string) {
  try {
    const user = await requirePlatformAdmin();
    const updatedProduct = await prisma.apiProduct.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.basePrice || "0"),
        rateLimit: parseInt(data.requestLimit || "1000", 10),
        features: data.features || [],
        updatedBy: user.id || userId,
        isActive: data.isActive,
      }
    });
    revalidatePath("/api-products");
    revalidatePath(`/api-products/${id}`);
    return { success: true, data: updatedProduct };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteApiProduct(id: string) {
  try {
    await requirePlatformAdmin();
    await prisma.apiProduct.delete({
      where: { id }
    });
    revalidatePath("/api-products");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
