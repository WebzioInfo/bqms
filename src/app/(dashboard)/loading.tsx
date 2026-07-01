"use client";

import React from "react";
import { TableSkeleton, Skeleton } from "@/components/ui/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
