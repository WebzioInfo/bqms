"use server";

import { EntityType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { OrganizationService } from "@/services/organization.service";

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
    const org = await OrganizationService.getOrganizationBySlug(slug);
    return { success: true, organization: org };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
