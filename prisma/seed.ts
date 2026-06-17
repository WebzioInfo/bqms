import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient({});

async function main() {
  console.log("Starting massive enterprise seed...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Clean Up
  console.log("Cleaning existing data...");
  await prisma.documentReadReceipt.deleteMany();
  await prisma.documentApproval.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();

  await prisma.rootCauseAnalysis.deleteMany();
  await prisma.correctiveAction.deleteMany();
  await prisma.preventiveAction.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.closure.deleteMany();
  await prisma.cAPA.deleteMany();
  await prisma.nCR.deleteMany();

  await prisma.batchConsumption.deleteMany();
  await prisma.batchGenealogy.deleteMany();
  await prisma.rawMaterialLot.deleteMany();
  await prisma.supplierLot.deleteMany();
  await prisma.billOfMaterial.deleteMany();

  await prisma.waterTestResult.deleteMany();
  await prisma.waterTestReport.deleteMany();
  await prisma.waterTestParameter.deleteMany();

  await prisma.calibrationLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.maintenancePlan.deleteMany();
  await prisma.breakdownLog.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.asset.deleteMany();

  await prisma.retentionSample.deleteMany();
  await prisma.storageLocation.deleteMany();

  await prisma.batch.deleteMany();

  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Organizations
  console.log("Creating 5 Organizations...");
  const orgNames = ["Aqua Pure Waters", "Crystal Clear Beverages", "Apex Food Mfg", "Summit Mineral Water", "Zenith Bottling"];
  const orgs = [];
  for (const name of orgNames) {
    orgs.push(await prisma.organization.create({
      data: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        type: "MINERAL_WATER",
        erpReferenceId: faker.string.alphanumeric(8).toUpperCase(),
        trustScore: faker.number.float({ min: 80, max: 100 }),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress()
      }
    }));
  }

  // 3. Users (20 per org = 100)
  console.log("Creating 100 Users...");
  const users = [];
  const roles = ['SUPER_ADMIN', 'QC_USER', 'QC_USER', 'LAB_STAFF', 'INSPECTOR', 'QC_USER'];
  for (const org of orgs) {
    for (let i = 0; i < 20; i++) {
      users.push(await prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          passwordHash,
          role: roles[i % roles.length] as any,
          organizationId: org.id
        }
      }));
    }
  }

  // 4. Products & BOM
  console.log("Creating Bills of Material & Suppliers...");
  const boms = [];
  const supplierLots = [];
  const rawLots = [];
  for (const org of orgs) {
    const bom = await prisma.billOfMaterial.create({
      data: {
        organizationId: org.id,
        productName: faker.helpers.arrayElement(["20L Jar", "1L Bottle", "500ml Bottle", "250ml Bottle"]),
        version: "1.0",
        components: { preform: 1, cap: 1, label: 1 }
      }
    });
    boms.push(bom);

    for (let i = 0; i < 10; i++) {
      const supLot = await prisma.supplierLot.create({
        data: {
          organizationId: org.id,
          supplierName: faker.company.name(),
          materialName: faker.commerce.productMaterial(),
          lotNumber: faker.string.alphanumeric(10),
          receivedDate: faker.date.recent({ days: 60 }),
          quantity: faker.number.int({ min: 1000, max: 10000 }),
          unit: "units",
          isAccepted: true
        }
      });
      supplierLots.push(supLot);

      const rawLot = await prisma.rawMaterialLot.create({
        data: {
          organizationId: org.id,
          materialName: supLot.materialName,
          internalLotNo: "INT-" + faker.string.alphanumeric(8),
          supplierLotId: supLot.id,
          quantity: supLot.quantity,
          unit: supLot.unit,
          status: "APPROVED"
        }
      });
      rawLots.push(rawLot);
    }
  }

  // 5. Assets & Maintenance
  console.log("Creating 50 Assets...");
  const assets = [];
  for (const org of orgs) {
    for (let i = 0; i < 10; i++) {
      assets.push(await prisma.asset.create({
        data: {
          organizationId: org.id,
          assetCode: `AST-${org.slug.substring(0, 3).toUpperCase()}-${faker.string.numeric(4)}`,
          name: faker.helpers.arrayElement(["RO Plant", "Ozonator", "UV System", "Filling Machine", "Cap Sealing Machine"]),
          type: "PRODUCTION"
        }
      }));
    }
  }

  // 6. Documents
  console.log("Creating 100 Documents...");
  for (const org of orgs) {
    for (let i = 0; i < 20; i++) {
      await prisma.document.create({
        data: {
          organizationId: org.id,
          docNumber: `DOC-${faker.string.numeric(5)}`,
          title: faker.helpers.arrayElement(["SOP - Cleaning", "Quality Manual", "Maintenance Procedure"]),
          type: "SOP",
          status: "APPROVED",
          versions: {
            create: {
              versionNumber: "1.0",
              fileUrl: "https://example.com/doc.pdf",
              createdBy: faker.helpers.arrayElement(users.filter(u => u.organizationId === org.id)).id
            }
          }
        }
      });
    }
  }

  // 7. Batches (100+)
  console.log("Creating 100 Batches...");
  const batches = [];
  const batchStatuses = ['VERIFIED', 'PENDING', 'REJECTED', 'VERIFIED', 'VERIFIED'];
  for (const org of orgs) {
    for (let i = 0; i < 20; i++) {
      const batch = await prisma.batch.create({
        data: {
          organizationId: org.id,
          batchNumber: `B-${org.slug.substring(0, 3).toUpperCase()}-${faker.string.numeric(6)}`,
          productionDate: faker.date.recent({ days: 30 }),
          verificationStatus: faker.helpers.arrayElement(batchStatuses) as any
        }
      });
      batches.push(batch);

      // Batch Consumption
      await prisma.batchConsumption.create({
        data: {
          batchId: batch.id,
          materialLotId: faker.helpers.arrayElement(rawLots.filter(l => l.organizationId === org.id)).id,
          quantityUsed: faker.number.float({ min: 100, max: 500 }),
          unit: "units"
        }
      });
    }
  }

  // 8. Water Test Parameters & Reports
  console.log("Creating Water Test Reports for Batches...");
  const parameters = [];
  for (const org of orgs) {
    parameters.push(
      await prisma.waterTestParameter.create({ data: { organizationId: org.id, name: "pH", type: "PHYSICAL", unit: "pH", acceptableMin: 6.5, acceptableMax: 8.5 } }),
      await prisma.waterTestParameter.create({ data: { organizationId: org.id, name: "TDS", type: "CHEMISTRY", unit: "mg/L", acceptableMax: 500 } }),
      await prisma.waterTestParameter.create({ data: { organizationId: org.id, name: "E. Coli", type: "MICROBIOLOGY", unit: "MPN", acceptableMax: 0 } })
    );
  }

  const wtrs = [];
  const statuses = ['COMPLETED', 'PENDING', 'FAILED', 'COMPLETED', 'COMPLETED'];
  for (const batch of batches) {
    const orgId = batch.organizationId;
    const orgParams = parameters.filter(p => p.organizationId === orgId);

    // Simulate ~10% failure rate
    const isFailed = Math.random() < 0.1;

    const report = await prisma.waterTestReport.create({
      data: {
        companyId: orgId,
        batchId: batch.id,
        reportNumber: `WTR-${faker.string.numeric(8)}`,
        productionDate: batch.productionDate,
        status: isFailed ? 'FAILED' : faker.helpers.arrayElement(statuses) as any,
        createdBy: faker.helpers.arrayElement(users.filter(u => u.organizationId === orgId)).id,
        results: {
          create: [
            { parameterId: orgParams[0].id, testResult: isFailed ? 9.5 : faker.number.float({ min: 6.8, max: 8.2 }), isPass: !isFailed },
            { parameterId: orgParams[1].id, testResult: faker.number.float({ min: 50, max: 400 }), isPass: true },
            { parameterId: orgParams[2].id, testResult: 0, isPass: true }
          ]
        }
      }
    });
    wtrs.push(report);
  }

  // 9. CAPA & NCR (50 NCRs, 30 CAPAs)
  console.log("Creating 50 NCRs and 30 CAPAs...");
  const failedWTRs = wtrs.filter(w => w.status === 'FAILED');
  for (let i = 0; i < 50; i++) {
    const org = faker.helpers.arrayElement(orgs);
    const reporter = faker.helpers.arrayElement(users.filter(u => u.organizationId === org.id));
    const ncr = await prisma.nCR.create({
      data: {
        organizationId: org.id,
        ncrNumber: `NCR-${faker.string.numeric(6)}`,
        description: faker.helpers.arrayElement(["Microbial Contamination", "Label Defect", "Machine Calibration Failure", "Water Quality Failure - High pH"]),
        reportedBy: reporter.id,
        status: "OPEN"
      }
    });

    if (i < 30) {
      const capa = await prisma.cAPA.create({
        data: {
          ncrId: ncr.id,
          organizationId: org.id,
          capaNumber: `CAPA-${faker.string.numeric(6)}`,
          description: "Implement strict RO membrane replacement schedule",
          status: "IN_PROGRESS"
        }
      });

      // RCA
      if (i < 15) {
        await prisma.rootCauseAnalysis.create({
          data: {
            capaId: capa.id,
            analysisMethod: "5 Whys",
            findings: "RO Membrane degraded faster than expected due to incoming TDS spikes.",
            identifiedBy: reporter.id
          }
        });

        await prisma.correctiveAction.create({
          data: {
            capaId: capa.id,
            actionDetails: "Replace RO Membrane on Line 1.",
            assignedTo: reporter.id,
            dueDate: faker.date.soon({ days: 7 })
          }
        });
      }
    }
  }

  // 10. Retention Samples
  console.log("Creating 100 Retention Samples...");
  for (let i = 0; i < 100; i++) {
    const batch = faker.helpers.arrayElement(batches);
    const org = orgs.find(o => o.id === batch.organizationId)!;

    // Create loc if not exists
    let loc = await prisma.storageLocation.findUnique({ where: { code: `LOC-${org.slug}-A1` } });
    if (!loc) {
      loc = await prisma.storageLocation.create({
        data: {
          organizationId: org.id,
          code: `LOC-${org.slug}-A1`,
          description: "Shelf A1"
        }
      });
    }

    await prisma.retentionSample.create({
      data: {
        organizationId: org.id,
        batchId: batch.id,
        storageLocationId: loc.id,
        quantityStored: 5,
        unit: "bottles",
        expiryDate: faker.date.future({ years: 1 })
      }
    });
  }

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