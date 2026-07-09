"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingOverlay } from "./LoadingOverlay";

interface LoadingContextType {
  startLoading: (key: string, message?: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key?: string) => boolean;
  showOverlay: (message?: string) => void;
  hideOverlay: () => void;
  wrapPromise: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

function getMutationMessage(url: string, method: string): string {
  const cleanUrl = url.split("?")[0];
  if (cleanUrl.includes("/export")) {
    return "Generating PDF report...";
  }
  if (cleanUrl.includes("/download")) {
    return "Downloading document...";
  }
  if (cleanUrl.includes("/test-reports")) {
    if (method === "DELETE") return "Deleting test report...";
    if (method === "POST") return "Saving Water Test...";
    return "Updating Water Test...";
  }
  if (cleanUrl.includes("/compliance")) {
    if (method === "DELETE") return "Deleting compliance requirement...";
    return "Saving compliance data...";
  }
  if (cleanUrl.includes("/auth")) {
    if (cleanUrl.includes("/signout") || cleanUrl.includes("/clear")) return "Logging out...";
    return "Authenticating...";
  }
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    return "Saving changes...";
  }
  if (method === "DELETE") {
    return "Deleting record...";
  }
  return "Please wait...";
}

function getNavigationMessage(path: string): string {
  const cleanPath = path.split("?")[0];
  if (cleanPath === "/" || cleanPath === "/overview") return "Loading Dashboard...";
  if (cleanPath.startsWith("/test-reports")) {
    if (cleanPath.includes("/new")) return "Preparing Water Test Form...";
    if (cleanPath.includes("/edit")) return "Preparing Edit Form...";
    return "Fetching Laboratory Data...";
  }
  if (cleanPath.startsWith("/compliance")) return "Loading Compliance Requirements...";
  if (cleanPath.startsWith("/certificates")) return "Loading Certificates...";
  if (cleanPath.startsWith("/users")) return "Loading User Management...";
  if (cleanPath.startsWith("/settings")) return "Loading Settings...";
  if (cleanPath.startsWith("/login")) return "Loading Login Screen...";
  return "Loading Page...";
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingTasks, setLoadingTasks] = useState<Map<string, string>>(new Map());
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide the loading overlay when route navigation is fully complete
  useEffect(() => {
    setOverlayMessage(null);
  }, [pathname, searchParams]);

  // Intercept all internal anchor clicks
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
            setOverlayMessage(getNavigationMessage(url.pathname));
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

  // Intercept browser back/forward and pushState/replaceState
  useEffect(() => {
    // 1. Listen for browser Back/Forward (popstate)
    const handlePopState = () => {
      setOverlayMessage(getNavigationMessage(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);

    // 2. Monkeypatch pushState and replaceState to show loading during programatic router calls
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      const url = args[2]?.toString() || "";
      if (url.startsWith("/") && !url.includes("/_next/")) {
        setOverlayMessage(getNavigationMessage(url));
      }
      return originalPush.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      const url = args[2]?.toString() || "";
      if (url.startsWith("/") && !url.includes("/_next/")) {
        setOverlayMessage(getNavigationMessage(url));
      }
      return originalReplace.apply(this, args);
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, []);

  // Intercept all fetch requests globally (Route Handlers, Server Actions, exports, etc.)
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const url = args[0]?.toString() || "";
      const isInternal = url.includes("/_next/") || url.includes("webpack");
      const options = args[1];
      const method = options?.method?.toUpperCase() || "GET";

      let taskMessage = "Loading...";
      let isMutation = false;

      if (!isInternal) {
        if (method !== "GET") {
          isMutation = true;
          taskMessage = getMutationMessage(url, method);
          setOverlayMessage(taskMessage);
        } else {
          taskMessage = "Fetching data...";
        }

        setLoadingTasks((prev) => {
          const next = new Map(prev);
          next.set(url, taskMessage);
          return next;
        });
      }

      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        if (!isInternal) {
          setLoadingTasks((prev) => {
            const next = new Map(prev);
            next.delete(url);
            return next;
          });
          if (isMutation) {
            setOverlayMessage(null);
          }
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const startLoading = useCallback((key: string, message = "Loading...") => {
    setLoadingTasks((prev) => {
      const next = new Map(prev);
      next.set(key, message);
      return next;
    });
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingTasks((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingTasks.has(key);
    }
    return loadingTasks.size > 0;
  }, [loadingTasks]);

  const showOverlay = useCallback((message = "Loading...") => {
    setOverlayMessage(message);
  }, []);

  const hideOverlay = useCallback(() => {
    setOverlayMessage(null);
  }, []);

  const wrapPromise = useCallback(async <T,>(promise: Promise<T>, message = "Loading..."): Promise<T> => {
    const key = Math.random().toString(36).substring(7);
    showOverlay(message);
    startLoading(key, message);
    try {
      return await promise;
    } finally {
      stopLoading(key);
      hideOverlay();
    }
  }, [showOverlay, hideOverlay, startLoading, stopLoading]);

  // Check if we should render overlay
  const showLoader = overlayMessage !== null || isPending;
  const currentMessage = overlayMessage || "Please wait...";

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading, showOverlay, hideOverlay, wrapPromise }}>
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
          {showLoader && <LoadingOverlay message={currentMessage} />}
        </>
      )}
    </LoadingContext.Provider>
  );
}
