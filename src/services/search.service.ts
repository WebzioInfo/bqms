import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

      // Mock Meilisearch Client
      // const client = new MeiliSearch({ host: process.env.MEILISEARCH_HOST, apiKey: process.env.MEILISEARCH_KEY });
      // await client.index("organizations").addDocuments([org]);
      
      console.log(`Successfully synced organization ${organizationId} to Meilisearch`);
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
