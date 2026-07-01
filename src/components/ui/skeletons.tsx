"use client";

import React from "react";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200/80 ${className}`}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow-sm border-zinc-200">
      <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-24" />
        ))}
      </div>
      <div className="divide-y divide-zinc-200">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton 
                key={c} 
                className={`h-4 ${c === 0 ? "w-32" : c === cols - 1 ? "w-16 ml-auto" : "w-28"}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 border-t pt-4 border-zinc-100">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5 p-3 rounded-lg bg-zinc-50/50">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-5 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full rounded-t-sm" 
            style={{ height: `${((i * 17) % 60) + 25}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
