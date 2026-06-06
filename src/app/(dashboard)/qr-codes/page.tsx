import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        {["SUPER_ADMIN", "BIOFIX_ADMIN"].includes(userRole) && (
          <Link href="/qr-codes/generate">
            <Button>Generate QR Codes</Button>
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Scans</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qrCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No QR codes found.
                </TableCell>
              </TableRow>
            ) : (
              qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-mono">{qr.code}</TableCell>
                  <TableCell>{qr.organization?.name || "N/A"}</TableCell>
                  <TableCell>{qr.batch?.batchNumber || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={qr.status === "ACTIVE" ? "default" : "destructive"}>
                      {qr.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{qr._count.scans}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/qr-codes/${qr.id}`}>
                      <Button variant="ghost" size="sm">Analytics</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
