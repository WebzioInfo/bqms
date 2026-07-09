"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingOverlay } from "./LoadingOverlay";

interface LoadingContextType {
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key?: string) => boolean;
  showOverlay: (message?: string) => void;
  hideOverlay: () => void;
  wrapPromise: <T>(promise: Promise<T>) => Promise<T>;
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
  const [showOverlayVisible, setShowOverlayVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearOverlayTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowOverlayVisible(false);
  }, []);

  const triggerOverlayWithDelay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowOverlayVisible(true);
    }, 200); // 200ms delay for visual feedback of slow transitions
  }, []);

  // Hide the loading overlay when route navigation is fully complete
  useEffect(() => {
    clearOverlayTimer();
  }, [pathname, searchParams, clearOverlayTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Intercept all internal anchor clicks to start the transition loader immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (
        anchor &&
        anchor.href &&
        !anchor.target &&
        !anchor.hasAttribute("download") &&
        !e.defaultPrevented &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        try {
          const url = new URL(anchor.href);
          const isSameOrigin = url.origin === window.location.origin;
          const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;
          const isHashChange = url.pathname === window.location.pathname && url.hash !== window.location.hash;
          
          if (isSameOrigin && isDifferentPath && !isHashChange) {
            triggerOverlayWithDelay();
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
  }, [triggerOverlayWithDelay]);

  // Intercept browser back/forward and pushState/replaceState
  useEffect(() => {
    const handlePopState = () => {
      triggerOverlayWithDelay();
    };
    window.addEventListener("popstate", handlePopState);

    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      const url = args[2]?.toString() || "";
      if (url.startsWith("/") && !url.includes("/_next/")) {
        triggerOverlayWithDelay();
      }
      return originalPush.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      const url = args[2]?.toString() || "";
      if (url.startsWith("/") && !url.includes("/_next/")) {
        triggerOverlayWithDelay();
      }
      return originalReplace.apply(this, args);
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, [triggerOverlayWithDelay]);

  // Intercept Next.js internal RSC fetches to display transition loader during programmatic Next.js navigations (router.push/replace)
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const url = args[0]?.toString() || "";
      const options = args[1];

      let isRscFetch = false;
      let isPrefetch = false;

      // Extract and check headers
      const headers = options?.headers;
      if (headers) {
        if (headers instanceof Headers) {
          if (headers.has("RSC") || headers.has("rsc")) {
            isRscFetch = true;
          }
          if (
            headers.get("Purpose") === "prefetch" || 
            headers.get("X-Next-Router-Prefetch") === "1" ||
            headers.get("x-next-router-prefetch") === "1"
          ) {
            isPrefetch = true;
          }
        } else if (typeof headers === "object") {
          const keys = Object.keys(headers).map(k => k.toLowerCase());
          if (keys.includes("rsc")) {
            isRscFetch = true;
          }
          if (
            (headers as Record<string, string>)["Purpose"] === "prefetch" ||
            (headers as Record<string, string>)["x-next-router-prefetch"] === "1" ||
            (headers as Record<string, string>)["X-Next-Router-Prefetch"] === "1"
          ) {
            isPrefetch = true;
          }
        }
      }

      if (url.includes("_rsc=")) {
        isRscFetch = true;
        if (url.includes("prefetch=1")) {
          isPrefetch = true;
        }
      }

      const isNavigation = isRscFetch && !isPrefetch;

      if (isNavigation) {
        triggerOverlayWithDelay();
      }

      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        if (isNavigation) {
          clearOverlayTimer();
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [triggerOverlayWithDelay, clearOverlayTimer]);

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

  const showOverlay = useCallback(() => {
    triggerOverlayWithDelay();
  }, [triggerOverlayWithDelay]);

  const hideOverlay = useCallback(() => {
    clearOverlayTimer();
  }, [clearOverlayTimer]);

  const wrapPromise = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    const key = Math.random().toString(36).substring(7);
    triggerOverlayWithDelay();
    startLoading(key);
    try {
      return await promise;
    } finally {
      stopLoading(key);
      clearOverlayTimer();
    }
  }, [triggerOverlayWithDelay, startLoading, stopLoading, clearOverlayTimer]);

  const contextValue = useMemo(() => ({
    startLoading,
    stopLoading,
    isLoading,
    showOverlay,
    hideOverlay,
    wrapPromise
  }), [startLoading, stopLoading, isLoading, showOverlay, hideOverlay, wrapPromise]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {!mounted ? (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 select-none animate-pulse">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50 shadow-2xl">
              <svg className="animate-spin h-14 w-14 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">BQMS</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Biofix Quality Management System</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {children}
          {showOverlayVisible && <LoadingOverlay message="Loading..." />}
        </>
      )}
    </LoadingContext.Provider>
  );
}
