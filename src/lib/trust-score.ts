import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function calculateTrustScore(organizationId: string) {
  // Fetch organization with its latest 5 inspections and batches
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      inspections: {
        orderBy: { inspectionDate: "desc" },
        take: 5
      },
      batches: {
        orderBy: { productionDate: "desc" },
        take: 5
      }
    }
  });

  if (!org) return null;

  let score = 100;

  // Deduction logic based on inspections
  for (const inspection of org.inspections) {
    if (inspection.complianceStatus === "CRITICAL_VIOLATION") score -= 30;
    else if (inspection.complianceStatus === "MINOR_VIOLATION") score -= 10;
  }

  // Deduction logic based on batches (if it's a mineral water company)
  if (org.type === "MINERAL_WATER") {
    const unverifiedCount = org.batches.filter(b => b.verificationStatus !== "VERIFIED").length;
    score -= (unverifiedCount * 5); // Penalty for having unverified batches
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Save updated score to the database
  await prisma.organization.update({
    where: { id: organizationId },
    data: { trustScore: score }
  });

  return score;
}
