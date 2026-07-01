"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({ className, size = "h-6 w-6" }: { className?: string; size?: string }) {
  return <Loader2 className={`animate-spin text-sky-650 ${size} ${className}`} />;
}

export function SpinnerContainer({ message = "Loading content...", minHeight = "min-h-[200px]" }: { message?: string; minHeight?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 w-full ${minHeight}`}>
      <Spinner size="h-8 w-8" />
      <span className="text-[10px] font-bold text-slate-500 font-sans tracking-wide uppercase">{message}</span>
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="inline-flex items-center justify-center">
      <Spinner size="h-4 w-4 text-slate-400" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return <SpinnerContainer message="Loading data table..." minHeight="min-h-[300px]" />;
}

export function CardSkeleton() {
  return <SpinnerContainer message="Loading statistics..." minHeight="min-h-[140px]" />;
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return <SpinnerContainer message="Loading form fields..." minHeight="min-h-[250px]" />;
}

export function DetailSkeleton() {
  return <SpinnerContainer message="Loading record details..." minHeight="min-h-[300px]" />;
}

export function ChartSkeleton() {
  return <SpinnerContainer message="Loading data analytics..." minHeight="min-h-[320px]" />;
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return <SpinnerContainer message="Loading database list..." minHeight="min-h-[200px]" />;
}
