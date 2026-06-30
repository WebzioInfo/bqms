"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShieldCheck, Settings, LayoutDashboard, Database, Users, Award, LineChart, Code, ClipboardList, Beaker, type LucideIcon } from "lucide-react";

const ROLE_NAVIGATION: Record<string, { group: string; items: { name: string; href: string; icon: LucideIcon }[] }[]> = {
  PLATFORM_ADMIN: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Organizations", href: "/organizations", icon: Database },
        { name: "Users", href: "/users", icon: Users },
      ]
    },
    {
      group: "Compliance & Data",
      items: [
        { name: "Reports & Analytics", href: "/reports", icon: LineChart },
      ]
    },
    {
      group: "System Tools",
      items: [
        { name: "API Products", href: "/api-products", icon: Code },
        { name: "API Marketplace", href: "/api-marketplace", icon: Code },
        { name: "Compliance", href: "/compliance", icon: ShieldCheck },
        { name: "Audit Logs", href: "/audit", icon: ClipboardList },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ],
  COMPANY_ADMIN: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Users", href: "/users", icon: Users },
      ]
    },
    {
      group: "Production & Quality",
      items: [
        { name: "Water Tests", href: "/test-reports", icon: Beaker },
        { name: "Certificates", href: "/certificates", icon: Award },
        { name: "Customers", href: "/customers", icon: Users },
        { name: "API Marketplace", href: "/api-marketplace", icon: Code },
        { name: "Compliance", href: "/compliance", icon: ShieldCheck },
        { name: "Reports & Analytics", href: "/reports", icon: LineChart },
      ]
    },
    {
      group: "Settings",
      items: [
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ],
  QC: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
      ]
    },
    {
      group: "Quality Control",
      items: [
        { name: "Water Tests", href: "/test-reports", icon: Beaker },
        { name: "Compliance", href: "/compliance", icon: ShieldCheck },
      ]
    }
  ]
};

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  const groups = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.QC;

  return (
    <nav className="flex flex-col gap-6 px-3 py-4 overflow-y-auto">
      {groups.map((group, index) => (
        <div key={index} className="flex flex-col gap-1">
          <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
            {group.group}
          </h4>
          <div className="flex flex-col gap-[2px]">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
