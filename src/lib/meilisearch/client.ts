import prisma from "@/lib/prisma";
import { Meilisearch } from "meilisearch";
import { PrismaClient } from "@prisma/client";

const meiliClient = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700",
  apiKey: process.env.MEILISEARCH_ADMIN_KEY || "masterKey",
});



export async function syncOrganizationsToMeilisearch() {
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, type: true, trustScore: true }
  });

  const index = meiliClient.index("organizations");
  await index.addDocuments(orgs);
  return { success: true, count: orgs.length };
}

export async function searchOrganizations(query: string) {
  const index = meiliClient.index("organizations");
  const result = await index.search(query, {
    limit: 10
  });
  return result.hits;
}
