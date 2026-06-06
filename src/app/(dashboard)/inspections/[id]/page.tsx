import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditInspectionClient } from "./client";

export default async function EditInspectionPage({ params }: { params: { id: string } }) {
  const inspection = await prisma.inspection.findUnique({
    where: { id: params.id },
    include: { organization: true, inspector: true }
  });

  if (!inspection) {
    redirect("/inspections");
  }

  const organizations = await prisma.organization.findMany();

  return <EditInspectionClient inspection={inspection} organizations={organizations} />;
}
