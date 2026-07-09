import React from "react";
import { DetailSkeleton } from "@/components/ui/skeletons";

export default function ReportDetailLoading() {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-200">
      <DetailSkeleton />
    </div>
  );
}
