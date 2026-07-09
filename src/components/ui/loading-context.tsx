"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key?: string) => boolean;
  showOverlay: (message?: string) => void;
  hideOverlay: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
  const pathname = usePathname();

  // Hide the loading overlay when route navigation is complete
  useEffect(() => {
    setOverlayMessage(null);
  }, [pathname]);

  // Intercept all page link clicks to show loading overlay immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (
        anchor &&
        anchor.href &&
        !anchor.target &&
        !anchor.hasAttribute("download") &&
        !e.defaultPrevented
      ) {
        try {
          const url = new URL(anchor.href);
          const isSameOrigin = url.origin === window.location.origin;
          const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;
          const isHashChange = url.pathname === window.location.pathname && url.hash !== window.location.hash;
          
          if (isSameOrigin && isDifferentPath && !isHashChange) {
            setOverlayMessage("Loading Page...");
          }
        } catch (err) {
          // Ignore invalid URL parsing
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingKeys.has(key);
    }
    return loadingKeys.size > 0;
  }, [loadingKeys]);

  const showOverlay = useCallback((message = "Loading...") => {
    setOverlayMessage(message);
  }, []);

  const hideOverlay = useCallback(() => {
    setOverlayMessage(null);
  }, []);

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading, showOverlay, hideOverlay }}>
      {children}
      {overlayMessage !== null && <LoadingOverlayComponent message={overlayMessage} />}
    </LoadingContext.Provider>
  );
}

function LoadingOverlayComponent({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/20 backdrop-blur-sm transition-all duration-300 animate-in fade-in select-none">
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 shadow-2xl max-w-sm w-full mx-4 border-slate-150 animate-in zoom-in-95 duration-250">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-sm font-semibold text-slate-800">{message}</span>
        <span className="text-xs text-muted-foreground text-center">Please do not close or reload this window.</span>
      </div>
    </div>
  );
}
