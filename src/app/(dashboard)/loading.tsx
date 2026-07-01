import React from "react";
import { SpinnerContainer } from "@/components/ui/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-12 min-h-[500px] animate-in fade-in duration-300">
      <SpinnerContainer message="Preparing page layout..." minHeight="min-h-[400px]" />
    </div>
  );
}
