import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EditOrganizationClient } from "./client";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  // Only SUPER_ADMIN or BIOFIX_ADMIN can edit organizations. Or the org admin itself.
  if (userRole !== "SUPER_ADMIN" && userRole !== "BIOFIX_ADMIN") {
    if (orgId !== resolvedParams.id) {
      notFound();
    }
  }

  const organization = await prisma.organization.findUnique({
    where: { id: resolvedParams.id },
    include: {
      _count: {
        select: {
          users: true,
          batches: true,
          inspections: true,
          qrCodes: true,
          certificates: true
        }
      }
    }
  });

  if (!organization) {
    notFound();
  }

  return <EditOrganizationClient organization={organization} />;
}
