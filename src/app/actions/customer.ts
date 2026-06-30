"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import {
  errorMessage,
  requireAnyRole,
  resolveWritableOrganizationId,
  scopedOrganizationWhere,
} from "@/lib/auth/tenant-access";

const LIST_PAGE_SIZE = 100;

export async function getCustomers() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const customers = await prisma.customer.findMany({
      where: scopedOrganizationWhere(user),
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: LIST_PAGE_SIZE,
    });
    
    const mapped = customers.map(c => ({
      ...c,
      type: "DISTRIBUTOR"
    }));
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getCustomerById(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const customer = await prisma.customer.findFirst({
      where: { id, ...scopedOrganizationWhere(user) },
      include: { 
        organization: true,
      }
    });
    if (!customer) return { success: false, error: "Not found" };
    
    const mapped = {
      ...customer,
      type: "DISTRIBUTOR"
    };
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createCustomer(data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);
    const newCustomer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        organizationId,
        createdBy: user.id || userId,
        isActive: data.isActive ?? true,
      }
    });
    revalidatePath("/customers");
    return { success: true, data: { ...newCustomer, id: newCustomer.id } };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateCustomer(id: string, data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);
    const updated = await prisma.customer.updateMany({
      where: { id, organizationId },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        updatedBy: user.id || userId,
        isActive: data.isActive,
      }
    });
    if (updated.count === 0) return { success: false, error: "Not found" };
    const updatedCustomer = await prisma.customer.findFirst({ where: { id, organizationId } });
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true, data: updatedCustomer };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const deleted = await prisma.customer.deleteMany({
      where: { id, ...scopedOrganizationWhere(user) }
    });
    if (deleted.count === 0) return { success: false, error: "Not found" };
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
