import prisma from "@/lib/prisma";

export class CertificateService {
  static async generateCertificate(data: { organizationId: string; batchId?: string }) {
    const certificateNo = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return prisma.certificate.create({
      data: {
        certificateNo,
        organizationId: data.organizationId,
        batchId: data.batchId,
      },
    });
  }

  static async getCertificate(certificateNo: string) {
    return prisma.certificate.findUnique({
      where: { certificateNo },
      include: {
        organization: true,
        batch: true,
      },
    });
  }
}
