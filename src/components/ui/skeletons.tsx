"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = "h-6 w-6" }: { className?: string; size?: string }) {
  return <Loader2 className={cn("animate-spin text-sky-650", size, className)} />;
}

export function SpinnerContainer({ message = "Loading content...", minHeight = "min-h-[200px]" }: { message?: string; minHeight?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-8 w-full", minHeight)}>
      <Spinner size="h-8 w-8" />
      <span className="text-[10px] font-bold text-slate-500 font-sans tracking-wide uppercase">{message}</span>
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-slate-100 dark:bg-slate-800", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4.5 w-4.5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3.5 w-36" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-pulse">
      <div className="h-14 bg-slate-50/50 border-b flex items-center px-6 justify-between gap-4">
        <Skeleton className="h-4 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 flex items-center px-6 gap-6">
            {Array.from({ length: cols }).map((_, j) => {
              // Vary width to look like natural table values
              const widthClass = j === 0 ? "w-1/4" : j === 1 ? "w-1/6" : j === 2 ? "w-1/5" : "w-1/12";
              return <Skeleton key={j} className={cn("h-3.5", widthClass)} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t gap-3">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="border-b pb-4 flex justify-between items-center">
          <Skeleton className="h-6 w-36 animate-pulse" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="h-[200px] flex items-end gap-3 justify-between px-4">
        {Array.from({ length: 12 }).map((_, i) => {
          // Vary chart height
          const heights = ["h-[40px]", "h-[70px]", "h-[100px]", "h-[60px]", "h-[120px]", "h-[140px]", "h-[90px]", "h-[150px]", "h-[80px]", "h-[130px]", "h-[110px]", "h-[160px]"];
          return <Skeleton key={i} className={cn("w-full rounded-t-md", heights[i % heights.length])} />;
        })}
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex justify-between items-center border-b pb-3.5 last:border-0 last:pb-0">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
