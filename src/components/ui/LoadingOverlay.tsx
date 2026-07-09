import React from "react";
import { PremiumSpinner } from "./Spinner";
import { ShieldCheck } from "lucide-react";

export function LoadingOverlay({ message = "Please wait..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-[6px] transition-all duration-300 animate-in fade-in select-none">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200/60 bg-white/95 p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-200">
        <div className="relative">
          <PremiumSpinner size="h-20 w-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-sky-600 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">{message}</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Processing your request. Please do not close or reload this window.
          </p>
        </div>
      </div>
    </div>
  );
}
