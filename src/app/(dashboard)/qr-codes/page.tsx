import { getCertificates } from "@/app/actions/certificate";
import { QrCodesClient } from "./client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function QrCodesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { data: certificates } = await getCertificates();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">QR Code Management</h2>
      </div>
      <QrCodesClient initialData={certificates || []} />
    </div>
  );
}
