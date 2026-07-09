import React from "react";
import { cn } from "@/lib/utils";

export function PremiumSpinner({ className, size = "h-12 w-12" }: { className?: string; size?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center shrink-0", size, className)}>
      {/* Outer spinning ring with gradient-like look */}
      <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
      <div className="absolute inset-0 rounded-full border-4 border-t-sky-600 border-r-sky-400 animate-spin" />
      
      {/* Inner reverse-spinning ring */}
      <div className="absolute h-3/5 w-3/5 rounded-full border-2 border-slate-200 border-b-sky-600/30 animate-spin duration-700 [animation-direction:reverse]" />
    </div>
  );
}
