import React from "react";
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 p-1 animate-in fade-in duration-300">
      {/* Page header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse"></div>
      </div>
      
      {/* 4 Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
