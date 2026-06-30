import { getAuditLogById } from "@/app/actions/audit";
import { notFound } from "next/navigation";
import { AuditDetailClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAuditLogById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/audit">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Event Details</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review tamper-evident log payload and metadata.</p>
        </div>
      </div>

      <AuditDetailClient log={result.data} />
    </div>
  );
}
