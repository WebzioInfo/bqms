import React from "react";
import { FormSkeleton } from "@/components/ui/skeletons";

export default function ReportEditLoading() {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-200">
      <FormSkeleton fields={8} />
    </div>
  );
}
