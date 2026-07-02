"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ROLE_NAVIGATION } from "./navigation";
import { Tooltip } from "@base-ui/react/tooltip";

export function Sidebar({ user, roleLabel, role }: { user: any; roleLabel: string; role: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem("sidebar-collapsed", String(newVal));
    if (newVal) {
      document.documentElement.classList.add("sidebar-collapsed");
    } else {
      document.documentElement.classList.remove("sidebar-collapsed");
    }
  };

  const groups = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.QC;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-[var(--sidebar-width)] transition-[width] duration-300 ease-in-out flex-col border-r bg-card sm:flex shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4 justify-between shrink-0">
        <Link href="/" className={cn("flex items-center gap-2 font-bold font-heading overflow-hidden transition-all", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          <span className="whitespace-nowrap">BQMS</span>
        </Link>
        {isCollapsed && (
          <ShieldCheck className="h-6 w-6 text-primary shrink-0 mx-auto" />
        )}
        <button
          onClick={toggleSidebar}
          className={cn("p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors", isCollapsed && "absolute right-0 left-0 mx-auto w-fit")}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 px-3 py-4 overflow-y-auto flex-1 overflow-x-hidden">
        {groups.map((group: any, index: number) => (
          <div key={index} className="flex flex-col gap-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 whitespace-nowrap">
                {group.group}
              </h4>
            )}
            {isCollapsed && <div className="h-4" />} {/* Spacer for collapsed group title */}
            <div className="flex flex-col gap-[2px]">
              {group.items.map((item: any) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                
                const linkContent = (
                  <Link 
                    href={item.href} 
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none whitespace-nowrap",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      isCollapsed && "justify-center px-0 w-10 h-10 mx-auto"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );

                if (mounted && isCollapsed) {
                  return (
                    <Tooltip.Provider key={item.name} delay={200}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>{linkContent}</Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Positioner side="right" sideOffset={8}>
                            <Tooltip.Popup className="z-50 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded-md shadow-md">
                              {item.name}
                              <Tooltip.Arrow className="fill-slate-900" />
                            </Tooltip.Popup>
                          </Tooltip.Positioner>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  );
                }

                return <div key={item.name}>{linkContent}</div>;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section / Footer */}
      <div className="mt-auto p-4 border-t shrink-0 flex flex-col gap-3">
        <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed ? "justify-center" : "")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.email}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{roleLabel}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-destructive whitespace-nowrap",
            isCollapsed ? "justify-center w-full px-0" : "px-3 w-full"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
