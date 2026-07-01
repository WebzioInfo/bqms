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

export async function getCertificates() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const certificates = await prisma.certificate.findMany({
      where: scopedOrganizationWhere(user),
      select: {
        id: true,
        organizationId: true,
        reportId: true,
        report: {
          select: {
            batchNumber: true,
          }
        },
        certificateUrl: true,
        status: true,
        issuedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { issuedAt: 'desc' },
      take: LIST_PAGE_SIZE,
    });
    
    const orgs = await prisma.organization.findMany({ where: user.role === Role.PLATFORM_ADMIN ? {} : { id: user.organizationId as string } });
    const orgMap = Object.fromEntries(orgs.map(o => [o.id, o]));
    
    const mapped = certificates.map(c => {
      let extra = { certificateNumber: c.id.substring(0, 8).toUpperCase(), expiryDate: null, standard: "BIS IS 14543" };
      if (c.certificateUrl && c.certificateUrl.startsWith("{")) {
        try { extra = JSON.parse(c.certificateUrl); } catch (e) {}
      }
      return {
        ...c,
        ...extra,
        batchNumber: c.report?.batchNumber || "Unknown",
        reportNumber: c.reportId.substring(0, 8).toUpperCase(),
        issueDate: c.issuedAt,
        organization: orgMap[c.organizationId] || null
      };
    });
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getCertificateById(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const certificate = await prisma.certificate.findFirst({
      where: { id, ...scopedOrganizationWhere(user) },
      include: {
        report: true,
      }
    });
    if (!certificate) return { success: false, error: "Not found" };
    
    const org = await prisma.organization.findUnique({ where: { id: certificate.organizationId } });
    
    let extra = { certificateNumber: certificate.id.substring(0, 8).toUpperCase(), expiryDate: null, standard: "BIS IS 14543" };
    if (certificate.certificateUrl && certificate.certificateUrl.startsWith("{")) {
      try { extra = JSON.parse(certificate.certificateUrl); } catch (e) {}
    }
    
    const mapped = {
      ...certificate,
      ...extra,
      issueDate: certificate.issuedAt,
      organization: org,
      linkedReports: certificate.report ? [{
        ...certificate.report,
        reportNumber: certificate.report.id.substring(0, 8).toUpperCase(),
      }] : [],
    };
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createCertificate(data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.PLATFORM_ADMIN]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);

    const certificateNumber = data.certificateNumber || `CERT-${Date.now()}`;
    const issueDate = new Date(data.issueDate);
    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months validity

    const extra = JSON.stringify({ certificateNumber, expiryDate, standard: data.standard || "BIS IS 14543", certificateImage: data.certificateImage });

    const newCertificate = await prisma.certificate.create({
      data: {
        certificateUrl: extra,
        issuedAt: issueDate,
        status: data.status || "ISSUED",
        reportId: data.reportId,
        organizationId,
        createdBy: user.id || userId,
        isActive: true,
      }
    });
    revalidatePath("/certificates");
    return { success: true, data: { ...newCertificate, id: newCertificate.id } };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateCertificate(id: string, data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.PLATFORM_ADMIN]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);

    const issueDate = data.issueDate ? new Date(data.issueDate) : undefined;
    let expiryDate = undefined;
    
    if (issueDate) {
      expiryDate = new Date(issueDate);
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    }
    
    const extra = JSON.stringify({ certificateNumber: data.certificateNumber, expiryDate, standard: data.standard, certificateImage: data.certificateImage });

    const updated = await prisma.certificate.updateMany({
      where: { id, organizationId },
      data: {
        certificateUrl: extra,
        status: data.status,
        issuedAt: issueDate,
        reportId: data.reportId,
        updatedBy: user.id || userId,
      }
    });
    if (updated.count === 0) return { success: false, error: "Not found" };
    const updatedCertificate = await prisma.certificate.findFirst({ where: { id, organizationId } });
    revalidatePath("/certificates");
    revalidatePath(`/certificates/${id}`);
    return { success: true, data: updatedCertificate };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteCertificate(id: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.PLATFORM_ADMIN]);
    const deleted = await prisma.certificate.deleteMany({
      where: { id, ...scopedOrganizationWhere(user) }
    });
    if (deleted.count === 0) return { success: false, error: "Not found" };
    revalidatePath("/certificates");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
