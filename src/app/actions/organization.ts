"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { errorMessage, requirePlatformAdmin } from "@/lib/auth/tenant-access";

const LIST_PAGE_SIZE = 100;

export async function getOrganizations() {
  try {
    await requirePlatformAdmin();
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        licenseNumber: true,
        contactEmail: true,
        contactPhone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
      take: LIST_PAGE_SIZE,
    });
    return { success: true, data: orgs };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getOrganizationById(id: string) {
  try {
    await requirePlatformAdmin();
    const org = await prisma.organization.findUnique({
      where: { id }
    });
    if (!org) return { success: false, error: "Not found" };
    return { success: true, data: org };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createOrganization(data: any) {
  try {
    await requirePlatformAdmin();
    const newOrg = await prisma.organization.create({
      data: {
        name: data.name,
        address: data.address,
        licenseNumber: data.licenseNumber,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        isActive: data.isActive ?? true,
      }
    });
    revalidatePath("/organizations");
    return { success: true, data: newOrg };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateOrganization(id: string, data: any) {
  try {
    await requirePlatformAdmin();
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        licenseNumber: data.licenseNumber,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        isActive: data.isActive,
      }
    });
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${id}`);
    return { success: true, data: updatedOrg };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteOrganization(id: string) {
  try {
    await requirePlatformAdmin();
    await prisma.organization.delete({
      where: { id }
    });
    revalidatePath("/organizations");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
