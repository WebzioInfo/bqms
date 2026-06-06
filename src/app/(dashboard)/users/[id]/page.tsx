import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditUserClient } from "./client";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { organization: true }
  });

  if (!user) {
    redirect("/users");
  }

  const organizations = await prisma.organization.findMany();

  return <EditUserClient user={user} organizations={organizations} />;
}
