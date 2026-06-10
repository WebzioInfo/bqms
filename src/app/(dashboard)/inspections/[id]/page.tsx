import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditInspectionClient } from "./client";

export default async function EditInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const inspection = await prisma.inspection.findUnique({
    where: { id: resolvedParams.id },
    include: { organization: true, inspector: true }
  });

  if (!inspection) {
    notFound();
  }

  const organizations = await prisma.organization.findMany();

  return <EditInspectionClient inspection={inspection} organizations={organizations} />;
}
