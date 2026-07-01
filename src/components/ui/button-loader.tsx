"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonLoaderProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  icon?: React.ReactNode;
}

export function ButtonLoader({ loading, label, loadingLabel, icon }: ButtonLoaderProps) {
  if (loading) {
    return (
      <span className="flex items-center justify-center gap-2 select-none">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        <span>{loadingLabel || label}</span>
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center gap-2">
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
