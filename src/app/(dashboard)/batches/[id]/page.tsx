import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditBatchClient } from "./client";

export default async function EditBatchPage({ params }: { params: { id: string } }) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
    include: { organization: true, certificates: true, labReports: true }
  });

  if (!batch) {
    redirect("/batches");
  }

  const organizations = await prisma.organization.findMany();

  return <EditBatchClient batch={batch} organizations={organizations} />;
}
