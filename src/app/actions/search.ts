"use server";

import prisma from "@/lib/prisma";

export async function searchOrganizations(query: string) {
  if (!query) return [];

  // @ts-ignore - Assuming standard next-auth setup with GET handler exported
  const { GET: authOptions } = await import("@/app/api/auth/[...nextauth]/route");
  const { getServerSession } = await import("next-auth/next");
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }
  
  const orgs = await prisma.organization.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive"
      }
    },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      trustScore: true
    }
  });
  
  return orgs;
}
