import { getCertificateById } from "@/app/actions/certificate";
import { notFound } from "next/navigation";
import { CertificateDetailClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Printer } from "lucide-react";

export default async function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCertificateById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/certificates">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate: {result.data.certificateNumber}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Compliance & Certification Details</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm">
            <Printer className="mr-2 h-4 w-4" /> Print PDF
          </Button>
          <Link href={`/certificates/${id}/edit`}>
            <Button variant="outline" className="shadow-sm">
              <Edit className="mr-2 h-4 w-4" /> Edit Certificate
            </Button>
          </Link>
        </div>
      </div>

      <CertificateDetailClient certificate={result.data} />
    </div>
  );
}