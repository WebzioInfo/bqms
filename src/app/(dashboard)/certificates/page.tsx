import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  const certificates = await prisma.certificate.findMany({
    where: whereClause,
    include: { organization: true, batch: true },
    orderBy: { issueDate: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        {["SUPER_ADMIN", "BIOFIX_ADMIN"].includes(userRole) && (
          <Link href="/certificates/new">
            <Button>Issue Certificate</Button>
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate No</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No certificates found.
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.certificateNo}</TableCell>
                  <TableCell>{cert.organization.name}</TableCell>
                  <TableCell>{cert.batch?.batchNumber || "N/A"}</TableCell>
                  <TableCell>{cert.issueDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={cert.status === "ACTIVE" ? "default" : "secondary"}>
                      {cert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/certificates/${cert.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {cert.pdfUrl && (
                        <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">PDF</Button>
                        </a>
                      )}
                    </div>
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
