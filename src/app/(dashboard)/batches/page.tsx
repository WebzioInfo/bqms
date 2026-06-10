import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BatchesClient } from "./client";

export default async function BatchesPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  const batches = await prisma.batch.findMany({
    where: whereClause,
    include: { organization: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track and manage production batches.</p>
        </div>
        {["QC_USER", "LAB_STAFF", "SUPER_ADMIN"].includes(userRole) && (
          <div className="ml-auto flex items-center gap-2">
            <Link href="/batches/new">
              <Button className="shadow-sm">Log New Batch</Button>
            </Link>
          </div>
        )}
      </div>

      <BatchesClient data={batches} />
    </div>
  );
}
