"use server";

import { EntityType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { OrganizationService } from "@/services/organization.service";
import prisma from "@/lib/prisma";

export async function createOrganization(data: {
  name: string;
  slug: string;
  type: EntityType;
}) {
  try {
    // Only SUPER_ADMIN can create an organization through this action
    await requireRole(["SUPER_ADMIN"]);

    const org = await OrganizationService.createOrganization({
      name: data.name,
      slug: data.slug,
      type: data.type,
    });
    revalidatePath("/dashboard/organizations");
    return { success: true, organization: org };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrganizations() {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    const orgs = await OrganizationService.getOrganizations();
    return { success: true, organizations: orgs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrganizationBySlug(slug: string) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN", "QC_USER", "INSPECTOR", "LAB_STAFF", "API_CLIENT"]);
    const org = await OrganizationService.getOrganizationBySlug(slug);
    return { success: true, organization: org };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOrganization(id: string, data: any) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    // @ts-ignore
    const userId = session?.user?.id;

    const org = await prisma.organization.update({
      where: { id },
      data
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "UPDATED",
          entity: "Organization",
          entityId: id,
          details: `Updated organization details for ${org.name}`
        }
      });
    }

    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${id}`);
    revalidatePath(`/dashboard/organizations/${id}/edit`);
    return { success: true, organization: org };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOrganization(id: string) {
  try {
    const session = await requireRole(["SUPER_ADMIN"]);
    // @ts-ignore
    const userId = session?.user?.id;

    // Fetch org name for logging before it's deleted
    const org = await prisma.organization.findUnique({ where: { id } });

    if (userId && org) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "DELETED",
          entity: "Organization",
          entityId: id,
          details: `Deleted organization ${org.name}`
        }
      });
    }

    await prisma.organization.delete({ where: { id } });
    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
