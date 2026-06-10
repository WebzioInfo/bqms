import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QRCodesClient } from "./client";

export default async function QRCodesPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  const qrCodes = await prisma.qRCode.findMany({
    where: whereClause,
    include: { organization: true, batch: true, _count: { select: { scans: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and track generated QR codes.</p>
        </div>
        {["SUPER_ADMIN", "BIOFIX_ADMIN"].includes(userRole) && (
          <div className="ml-auto flex items-center gap-2">
            <Link href="/qr-codes/generate">
              <Button className="shadow-sm">Generate QR Codes</Button>
            </Link>
          </div>
        )}
      </div>

      <QRCodesClient data={qrCodes} />
    </div>
  );
}
