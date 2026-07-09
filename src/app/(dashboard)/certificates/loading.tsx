import React from "react";
import { TableSkeleton } from "@/components/ui/skeletons";

export default function CertificatesLoading() {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-100/80 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-100/50 rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-slate-100/80 rounded animate-pulse" />
      </div>
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
