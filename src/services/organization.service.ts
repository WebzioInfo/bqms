import prisma from "@/lib/prisma";
import { PrismaClient, EntityType } from "@prisma/client";



export class OrganizationService {
  static async createOrganization(data: { name: string; slug: string; type: EntityType }) {
    return prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
      },
    });
  }

  static async getOrganizations() {
    return prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getOrganizationBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug },
      include: {
        inspections: {
          orderBy: { inspectionDate: "desc" },
          take: 5,
        },
      },
    });
  }
}
