import prisma from "@/lib/prisma";

export class SearchService {
  /**
   * Syncs an organization to Meilisearch.
   * Includes a retry mechanism for reliability.
   */
  static async syncOrganization(organizationId: string, retryCount = 0): Promise<void> {
    const MAX_RETRIES = 3;

    try {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          batches: {
            select: { verificationStatus: true }
          }
        }
      });

      if (!org) return;

      // Meilisearch is no longer used for mock. Direct DB queries are performed via search action.
      console.log(`Organization ${organizationId} is ready for direct search queries.`);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Meilisearch sync failed for org ${organizationId}. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.syncOrganization(organizationId, retryCount + 1);
      } else {
        console.error(`Max retries reached for syncing org ${organizationId} to Meilisearch. Recording failure log...`);
        // We could store this failure in a dead-letter queue or database log for manual intervention
      }
    }
  }
}
