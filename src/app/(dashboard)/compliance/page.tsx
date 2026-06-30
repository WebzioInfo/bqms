import { getComplianceRecords } from "@/app/actions/compliance";
import { ComplianceClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function CompliancePage() {
  const result = await getComplianceRecords();
  const records = result.success ? result.data : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance & CAPA</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage Non-Conformance Reports (NCR) and Corrective Actions.</p>
        </div>
        <Link href="/compliance/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Log Finding
          </Button>
        </Link>
      </div>

      <ComplianceClient data={records || []} />
    </div>
  );
}
