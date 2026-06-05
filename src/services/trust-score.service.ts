import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TrustScoreService {
  /**
   * Calculates the trust score for an organization based on multiple metrics
   * and stores the historical record.
   * 
   * @param organizationId The organization to calculate the score for
   * @param triggerReason Why this recalculation was triggered
   */
  static async calculateTrustScore(organizationId: string, triggerReason: string) {
    try {
      // 1. Fetch relevant data for the organization
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          inspections: {
            orderBy: { inspectionDate: "desc" },
            take: 5,
          },
          batches: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              labReports: true,
            }
          }
        }
      });

      if (!org) throw new Error("Organization not found");

      let score = 100; // Base score

      // 2. Adjust based on inspections
      const latestInspection = org.inspections[0];
      if (latestInspection) {
        if (latestInspection.complianceStatus !== "COMPLIANT") {
          score -= 20; // Major penalty for non-compliance
        }
        
        // Freshness penalty (older than 6 months = decay)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (latestInspection.inspectionDate < sixMonthsAgo) {
          score -= 10;
        }
      } else {
        // No inspections yet
        score -= 30;
      }

      // 3. Adjust based on batch compliance
      if (org.batches.length > 0) {
        let nonCompliantBatches = 0;
        let rejectedBatches = 0;

        for (const batch of org.batches) {
          if (batch.verificationStatus === "REJECTED") rejectedBatches++;
          
          const hasFailedReports = batch.labReports.some(r => !r.isCompliant);
          if (hasFailedReports) nonCompliantBatches++;
        }

        score -= (rejectedBatches * 5); // 5 points off per rejected batch recently
        score -= (nonCompliantBatches * 3); // 3 points off per non-compliant lab report
      }

      // Floor the score at 0
      const finalScore = Math.max(0, Math.min(100, score));

      // 4. Transaction to update org and record history
      await prisma.$transaction([
        prisma.organization.update({
          where: { id: organizationId },
          data: { trustScore: finalScore }
        }),
        prisma.trustScoreHistory.create({
          data: {
            organizationId,
            score: finalScore,
            reason: triggerReason
          }
        })
      ]);

      return { success: true, score: finalScore };

    } catch (error: any) {
      console.error(`Failed to calculate trust score for ${organizationId}:`, error);
      return { success: false, error: error.message };
    }
  }
}
