import { getAuditLogs } from "@/app/actions/audit";
import { AuditClient } from "./client";

export default async function AuditPage() {
  const result = await getAuditLogs();
  const logs = result.success ? result.data : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm">System-wide tamper-evident record of all CRUD operations.</p>
      </div>

      <AuditClient data={logs || []} />
    </div>
  );
}
