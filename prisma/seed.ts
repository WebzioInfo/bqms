import { PrismaClient, Role, WaterTestStatus, CertificateStatus, NonConformanceStatus, CorrectiveActionStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting BQMS V3 Enterprise Seed...");

  // Clean the database (though it should be empty after reset)
  console.log("Cleaning database...");
  await prisma.waterTestResult.deleteMany();
  await prisma.waterTestParameter.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.waterTestReport.deleteMany();
  await prisma.verificationRecord.deleteMany();
  await prisma.correctiveAction.deleteMany();
  await prisma.nonConformanceRecord.deleteMany();
  await prisma.complianceTemplate.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.apiSubscription.deleteMany();
  await prisma.apiProduct.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create Global Parameters
  const params = [
    // Physical & Chemical
    { name: "pH", category: "PHYSICAL", unit: "—", minAcceptable: 6.5, maxAcceptable: 8.5 },
    { name: "TDS", category: "PHYSICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 500 },
    { name: "Turbidity", category: "PHYSICAL", unit: "NTU", minAcceptable: 0, maxAcceptable: 1 },
    { name: "Sulphate", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
    { name: "Colour", category: "PHYSICAL", unit: "Hazen", minAcceptable: 0, maxAcceptable: 5 },
    { name: "Odour", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
    { name: "Taste", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
    { name: "Residual Free Chlorine", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0.2, maxAcceptable: 1.0 },
    { name: "Alkalinity", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
    { name: "Chloride", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 250 },

    // Microbiology
    { name: "E.coli", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
    { name: "Coliform", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
    { name: "Pseudomonas", category: "MICROBIOLOGY", unit: "CFU/250ml", minAcceptable: 0, maxAcceptable: 0 },
    { name: "Clostridia", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
    { name: "Aerobic Microbial Count 22°C", category: "MICROBIOLOGY", unit: "CFU/ml", minAcceptable: 0, maxAcceptable: 100 },
    { name: "Aerobic Microbial Count 37°C", category: "MICROBIOLOGY", unit: "CFU/ml", minAcceptable: 0, maxAcceptable: 20 },
    { name: "Yeast & Mold", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  ];
  
  console.log("Creating parameters...");
  const createdParams = [];
  for (const p of params) {
    const cp = await prisma.waterTestParameter.create({ data: p });
    createdParams.push(cp);
  }

  // API Products
  console.log("Creating API Products...");
  const apiProducts = await Promise.all([
    prisma.apiProduct.create({
      data: {
        name: "Basic Data Access",
        price: 0,
        rateLimit: 1000,
        features: ["Read Batches", "Read Test Reports"]
      }
    }),
    prisma.apiProduct.create({
      data: {
        name: "Enterprise Sync",
        price: 499,
        rateLimit: 50000,
        features: ["Full CRUD", "Real-time Webhooks"]
      }
    })
  ]);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Platform Admin
  console.log("Creating Platform Admin...");
  const platformAdmin = await prisma.user.create({
    data: {
      name: "Global Super Admin",
      email: "admin@biofix.com",
      passwordHash,
      role: Role.PLATFORM_ADMIN,
    }
  });

  const companyNames = [
    "Gangothri Aqua",
    "Crystal Pure Water",
    "Aqua Fresh Industries",
    "Blue Drop Beverages",
    "Aqua Life Packaged Water"
  ];

  console.log("Creating Companies & Users...");
  
  for (const companyName of companyNames) {
    // Create Organization
    const org = await prisma.organization.create({
      data: {
        name: companyName,
        address: faker.location.streetAddress() + ", " + faker.location.city(),
        licenseNumber: "BIS-" + faker.string.alphanumeric(8).toUpperCase(),
        contactEmail: faker.internet.email(),
        contactPhone: faker.phone.number(),
        createdBy: platformAdmin.id
      }
    });

    // Create Company Admin
    const companyAdmin = await prisma.user.create({
      data: {
        organizationId: org.id,
        name: `${companyName} Admin`,
        email: `admin@${companyName.toLowerCase().replace(/ /g, '')}.com`,
        passwordHash,
        role: Role.COMPANY_ADMIN,
        createdBy: platformAdmin.id
      }
    });

    // Create QC Users
    const qcUsers = [];
    for (let i = 1; i <= 3; i++) {
      const qc = await prisma.user.create({
        data: {
          organizationId: org.id,
          name: `${faker.person.firstName()} (QC ${i})`,
          email: `qc${i}@${companyName.toLowerCase().replace(/ /g, '')}.com`,
          passwordHash,
          role: Role.QC,
          createdBy: companyAdmin.id
        }
      });
      qcUsers.push(qc);
    }

    // Create API Subscription
    const subscription = await prisma.apiSubscription.create({
      data: {
        organizationId: org.id,
        productId: apiProducts[faker.number.int({ min: 0, max: 1 })].id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Create API Key
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    await prisma.apiKey.create({
      data: {
        organizationId: org.id,
        subscriptionId: subscription.id,
        name: "Default Integration Key",
        keyHash,
        lastUsedAt: faker.date.recent(),
      }
    });

    // Create 3 Reports per company (Total 15)
    for (let b = 1; b <= 3; b++) {
      const isFailed = faker.number.int({ min: 1, max: 10 }) > 8;
      const batchNumberStr = `B-${faker.string.alphanumeric(6).toUpperCase()}-${b}`;
      
      // Create Test Report
      const report = await prisma.waterTestReport.create({
        data: {
          organizationId: org.id,
          batchNumber: batchNumberStr,
          reportType: "PACKAGED_DRINKING_WATER",
          status: isFailed ? WaterTestStatus.REJECTED : WaterTestStatus.APPROVED,
          sampleTime: faker.date.recent({ days: 60 }),
          testedBy: qcUsers[faker.number.int({ min: 0, max: 2 })].name,
          remarks: isFailed ? "Failed parameters detected." : "All parameters within limit.",
          createdBy: qcUsers[0].id
        }
      });

      // Create Results
      const resultsData = createdParams.map(p => {
        let value = 0;
        let isPass = true;
        
        if (p.name === "pH") {
          value = isFailed && faker.datatype.boolean() ? faker.number.float({ min: 5.0, max: 6.4 }) : faker.number.float({ min: 6.5, max: 8.0 });
          isPass = value >= p.minAcceptable! && value <= p.maxAcceptable!;
        } else if (p.category === "MICROBIOLOGY") {
          value = isFailed && faker.datatype.boolean() ? faker.number.int({ min: 1, max: 5 }) : 0;
          isPass = value === 0;
        } else {
          value = faker.number.float({ min: p.minAcceptable || 0, max: (p.maxAcceptable || 100) * 0.9 });
        }

        return {
          reportId: report.id,
          parameterId: p.id,
          value,
          isPass
        };
      });

      await prisma.waterTestResult.createMany({
        data: resultsData
      });

      // Create Certificate if Passed
      if (!isFailed) {
        await prisma.certificate.create({
          data: {
            organizationId: org.id,
            batchNumber: batchNumberStr,
            status: CertificateStatus.ISSUED,
            issuedAt: faker.date.recent({ days: 10 }),
          }
        });

        // Verification Scan
        if (faker.datatype.boolean()) {
          await prisma.verificationRecord.create({
            data: {
              batchNumber: batchNumberStr,
              scannedAt: faker.date.recent({ days: 5 }),
              ipAddress: faker.internet.ipv4(),
              userAgent: faker.internet.userAgent(),
              location: faker.location.city(),
              isValid: true
            }
          });
        }
      } else {
        // Create NCR
        const ncr = await prisma.nonConformanceRecord.create({
          data: {
            organizationId: org.id,
            batchNumber: batchNumberStr,
            title: `Failed Lab Test for Batch ${batchNumberStr}`,
            description: "Test results fall outside of acceptable limits for standard IS 14543.",
            severity: "HIGH",
            status: NonConformanceStatus.OPEN,
            createdBy: qcUsers[0].id
          }
        });

        // CAPA
        await prisma.correctiveAction.create({
          data: {
            ncrId: ncr.id,
            actionPlan: "Halt production on line. Recalibrate RO membranes. Retest new samples.",
            assignedTo: qcUsers[1].id,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            status: CorrectiveActionStatus.PENDING
          }
        });
      }
    }
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
