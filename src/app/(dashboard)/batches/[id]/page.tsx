import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditBatchClient } from "./client";

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const batch = await prisma.batch.findUnique({
    where: { id: resolvedParams.id },
    include: { organization: true, certificates: true, labReports: true }
  });

  if (!batch) {
    notFound();
  }

  const organizations = await prisma.organization.findMany();

  return <EditBatchClient batch={batch} organizations={organizations} />;
}
