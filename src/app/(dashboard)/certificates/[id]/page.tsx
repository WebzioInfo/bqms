import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditCertificateClient } from "./client";

export default async function EditCertificatePage({ params }: { params: { id: string } }) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { organization: true }
  });

  if (!certificate) {
    redirect("/certificates");
  }

  const organizations = await prisma.organization.findMany();

  return <EditCertificateClient certificate={certificate} organizations={organizations} />;
}
