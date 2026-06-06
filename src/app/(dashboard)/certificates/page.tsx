import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

  const columns: Column<any>[] = [
    {
      key: "certificateNo",
      header: "Certificate No",
      cell: (cert) => <span className="font-medium text-primary">{cert.certificateNo}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (cert) => <span>{cert.organization.name}</span>
    },
    {
      key: "batch",
      header: "Batch",
      cell: (cert) => <span>{cert.batch?.batchNumber || "N/A"}</span>
    },
    {
      key: "issueDate",
      header: "Issue Date",
      cell: (cert) => <span>{cert.issueDate.toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (cert) => (
        <Badge variant={cert.status === "ACTIVE" ? "default" : "secondary"}>
          {cert.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (cert) => (
        <div className="flex justify-end gap-2">
          <Link href={`/certificates/${cert.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View</Button>
          </Link>
          {cert.pdfUrl && (
            <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="shadow-sm">PDF</Button>
            </a>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage quality compliance certificates.</p>
        </div>
        {["SUPER_ADMIN", "BIOFIX_ADMIN"].includes(userRole) && (
          <div className="ml-auto flex items-center gap-2">
            <Link href="/certificates/new">
              <Button className="shadow-sm">Issue Certificate</Button>
            </Link>
          </div>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={certificates} 
        searchKey="certificateNo"
        searchPlaceholder="Search by certificate number..."
        emptyMessage="No certificates found."
      />
    </div>
  );
}
