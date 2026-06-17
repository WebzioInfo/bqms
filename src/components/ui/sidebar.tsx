"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShieldCheck, LogOut, Settings, LayoutDashboard, Database, QrCode, Users, Award, LineChart, RefreshCw, Code, ClipboardList, ClipboardCheck, Package, FileText, Beaker } from "lucide-react";

const ROLE_NAVIGATION: Record<string, { group: string; items: { name: string; href: string; icon: any }[] }[]> = {
  SUPER_ADMIN: [
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
        { name: "Certificates", href: "/certificates", icon: Award },
        { name: "Water Tests", href: "/water-test-reports", icon: Beaker },
        { name: "QR Management", href: "/qr-codes", icon: QrCode },
        { name: "Reports & Analytics", href: "/reports", icon: LineChart },
      ]
    },
    {
      group: "System Tools",
      items: [
        { name: "ERP Sync", href: "/erp-sync", icon: RefreshCw },
        { name: "API Marketplace", href: "/api-marketplace", icon: Code },
        { name: "Webhooks", href: "/webhooks", icon: ClipboardCheck },
        { name: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ],
  BIOFIX_ADMIN: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Organizations", href: "/organizations", icon: Database },
      ]
    },
    {
      group: "Compliance",
      items: [
        { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
        { name: "Water Tests", href: "/water-test-reports", icon: Beaker },
        { name: "Reports & Analytics", href: "/reports", icon: LineChart },
        { name: "QR Management", href: "/qr-codes", icon: QrCode },
      ]
    }
  ],
  INSPECTOR: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
        { name: "Organizations", href: "/organizations", icon: Database },
      ]
    }
  ],
  QC_USER: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Batches", href: "/batches", icon: Package },
      ]
    },
    {
      group: "Quality Control",
      items: [
        { name: "Water Tests", href: "/water-test-reports", icon: Beaker },
        { name: "Laboratory Reports", href: "/laboratory-reports", icon: FileText },
        { name: "Certificates", href: "/certificates", icon: Award },
      ]
    }
  ],
  LAB_STAFF: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
        { name: "Batches", href: "/batches", icon: Package },
        { name: "Water Tests", href: "/water-test-reports", icon: Beaker },
        { name: "Laboratory Reports", href: "/laboratory-reports", icon: FileText },
      ]
    }
  ],
  API_CLIENT: [
    {
      group: "Core Dashboard",
      items: [
        { name: "Overview", href: "/", icon: LayoutDashboard },
      ]
    }
  ]
};

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  const groups = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.QC_USER;

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
