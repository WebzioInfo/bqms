"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => addToast(message, "success", duration), [addToast]);
  const error = useCallback((message: string, duration?: number) => addToast(message, "error", duration), [addToast]);
  const warning = useCallback((message: string, duration?: number) => addToast(message, "warning", duration), [addToast]);
  const info = useCallback((message: string, duration?: number) => addToast(message, "info", duration), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none select-none"
      aria-live="assertive"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss pause on hover logic
  React.useEffect(() => {
    if (toast.duration === 0) return;
    
    let timer: NodeJS.Timeout;
    const intervalTime = 50;
    const steps = (toast.duration || 5000) / intervalTime;
    let currentStep = steps;

    if (!isHovered) {
      timer = setInterval(() => {
        currentStep -= 1;
        setProgress((currentStep / steps) * 100);
        if (currentStep <= 0) {
          clearInterval(timer);
          onClose();
        }
      }, intervalTime);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isHovered, toast.duration, onClose]);

  const iconMap = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  };

  const borderMap = {
    success: "border-l-4 border-l-emerald-500 border-zinc-200 bg-white",
    error: "border-l-4 border-l-rose-500 border-zinc-200 bg-white",
    warning: "border-l-4 border-l-amber-500 border-zinc-200 bg-white",
    info: "border-l-4 border-l-blue-500 border-zinc-200 bg-white",
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ease-out ${borderMap[toast.type]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="alert"
    >
      {iconMap[toast.type]}
      <div className="flex-1 text-xs font-medium text-zinc-800 break-words leading-relaxed select-text pr-2">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Toast Progress Indicator */}
      {toast.duration !== 0 && (
        <div 
          className={`absolute bottom-0 left-0 h-0.5 transition-all duration-75 ${
            toast.type === "success" ? "bg-emerald-500" :
            toast.type === "error" ? "bg-rose-500" :
            toast.type === "warning" ? "bg-amber-500" :
            "bg-blue-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
