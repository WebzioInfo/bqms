import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditCertificateClient } from "./client";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { id: resolvedParams.id },
    include: { organization: true, batch: true }
  });

  if (!certificate) {
    notFound();
  }

  const organizations = await prisma.organization.findMany();

  return <EditCertificateClient certificate={certificate} organizations={organizations} />;
}
