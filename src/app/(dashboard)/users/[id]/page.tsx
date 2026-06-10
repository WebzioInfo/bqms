import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditUserClient } from "./client";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: { organization: true }
  });

  if (!user) {
    notFound();
  }

  const organizations = await prisma.organization.findMany();

  return <EditUserClient user={user} organizations={organizations} />;
}
