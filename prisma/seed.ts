import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
  console.log("Starting seed...");

  // Clean up
  await prisma.auditLog.deleteMany();
  await prisma.verificationScan.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.laboratoryParameter.deleteMany();
  await prisma.laboratoryReport.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.trustScoreHistory.deleteMany();
  await prisma.apiClient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Organizations
  console.log("Creating organizations...");
  const org1 = await prisma.organization.create({
    data: {
      name: "Aqua Pure Waters",
      slug: "aqua-pure",
      type: "MINERAL_WATER",
      erpReferenceId: "ERP-AP-001",
      trustScore: 92.5,
    }
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "The Green Cafe",
      slug: "green-cafe",
      type: "CAFE",
      erpReferenceId: "ERP-GC-002",
      trustScore: 88.0,
    }
  });

  // Users
  console.log("Creating users...");
  const passwordHash = await bcrypt.hash("BiOfIxBiOfI", 10);
  
  await prisma.user.create({
    data: {
      email: "superadmin@bqms.com",
      name: "Super Admin",
      role: "SUPER_ADMIN",
      passwordHash
    }
  });

  await prisma.user.create({
    data: {
      email: "biofix@bqms.com",
      name: "Biofix Admin",
      role: "BIOFIX_ADMIN",
      passwordHash
    }
  });

  const inspector = await prisma.user.create({
    data: {
      email: "inspector@bqms.com",
      name: "Field Inspector",
      role: "INSPECTOR",
      passwordHash
    }
  });

  await prisma.user.create({
    data: {
      email: "qc@aquapure.com",
      name: "Aqua Pure QC",
      role: "QC_USER",
      organizationId: org1.id,
      passwordHash
    }
  });

  // Batches
  console.log("Creating batches...");
  const batch1 = await prisma.batch.create({
    data: {
      batchNumber: "B-2026-06-001",
      organizationId: org1.id,
      productionDate: new Date(),
      verificationStatus: "VERIFIED"
    }
  });

  // Lab Report
  console.log("Creating lab reports...");
  await prisma.laboratoryReport.create({
    data: {
      batchId: batch1.id,
      testDate: new Date(),
      reportedBy: "Lab Tech A",
      isCompliant: true,
      parameters: {
        create: [
          { name: "pH", type: "CHEMISTRY", value: 7.2, unit: "pH", standardMin: 6.5, standardMax: 8.5, isCompliant: true },
          { name: "E. Coli", type: "MICROBIOLOGY", value: 0, unit: "CFU/100ml", standardMax: 0, isCompliant: true }
        ]
      }
    }
  });

  // Certificate
  console.log("Creating certificates...");
  await prisma.certificate.create({
    data: {
      certificateNo: "CERT-AP-001",
      organizationId: org1.id,
      batchId: batch1.id,
      issueDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: "ACTIVE"
    }
  });

  // QR Code
  console.log("Creating QR codes...");
  await prisma.qRCode.create({
    data: {
      code: "QR-AP-B001",
      organizationId: org1.id,
      batchId: batch1.id,
      status: "ACTIVE"
    }
  });

  // Inspections
  console.log("Creating inspections...");
  await prisma.inspection.create({
    data: {
      organizationId: org2.id,
      inspectorId: inspector.id,
      inspectionDate: new Date(),
      complianceStatus: "PASS",
      notes: "Routine hygiene check passed."
    }
  });

  // API Client
  console.log("Creating API clients...");
  await prisma.apiClient.create({
    data: {
      name: "Demo Consumer",
      apiKeyHash: await bcrypt.hash("demo-api-key", 10),
    }
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
