import { getCertificateById } from "@/app/actions/certificate";
import { notFound } from "next/navigation";
import { CertificateDetailClient } from "./client";

export default async function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCertificateById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CertificateDetailClient certificate={result.data} />
    </div>
  );
}