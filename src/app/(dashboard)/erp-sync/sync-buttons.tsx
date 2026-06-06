"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { forceSyncErp, syncAllActiveErp } from "@/app/actions/erp";
import { useRouter } from "next/navigation";

export function ForceSyncButton({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    const res = await forceSyncErp();
    setLoading(false);
    if (res.success) {
      alert("Sync completed successfully for organization.");
      router.refresh();
    } else {
      alert(`Sync failed: ${res.error}`);
    }
  };

  return (
    <Button variant="outline" size="sm" className="shadow-sm" onClick={handleSync} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
      Force Sync
    </Button>
  );
}

export function SyncAllButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSyncAll = async () => {
    setLoading(true);
    const res = await syncAllActiveErp();
    setLoading(false);
    if (res.success) {
      alert("Global sync completed successfully.");
      router.refresh();
    } else {
      alert(`Global sync failed: ${res.error}`);
    }
  };

  return (
    <Button className="shadow-sm" onClick={handleSyncAll} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Sync All Active
    </Button>
  );
}
