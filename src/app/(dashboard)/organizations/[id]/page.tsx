import { getOrganizationById } from "@/app/actions/organization";
import { notFound } from "next/navigation";
import { OrganizationDetailClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrganizationById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  // Get related stats
  const usersCount = await prisma.user.count({ where: { organizationId: id } });
  const certificatesCount = await prisma.certificate.count({ where: { organizationId: id } });
  const ncrCount = await prisma.nonConformanceRecord.count({ where: { organizationId: id, status: { not: "CLOSED" } } });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/organizations">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{result.data.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Organization Details & Settings</p>
          </div>
        </div>
        
        <Link href={`/organizations/${id}/edit`}>
          <Button variant="outline" className="shadow-sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Details
          </Button>
        </Link>
      </div>

      <OrganizationDetailClient 
        organization={result.data} 
        stats={{ usersCount, certificatesCount, ncrCount }} 
      />
    </div>
  );
}