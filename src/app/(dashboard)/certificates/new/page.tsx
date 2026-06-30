import { CertificateForm } from "../components/certificate-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrganizations } from "@/app/actions/organization";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function NewCertificatePage() {
  const [orgResult, session] = await Promise.all([
    getOrganizations(),
    getServerSession(authOptions)
  ]);
  const organizations = orgResult.success ? orgResult.data : [];
  
  const currentUserId = (session?.user as any)?.id || "unknown";

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/certificates">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue Certificate</h1>
          <p className="text-muted-foreground mt-1 text-sm">Generate a new BIS IS 14543 compliance certificate.</p>
        </div>
      </div>

      <CertificateForm organizations={organizations || []} currentUserId={currentUserId} />
    </div>
  );
}