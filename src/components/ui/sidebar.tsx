"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShieldCheck, LogOut, Settings, LayoutDashboard, Database, QrCode, Users, Award, LineChart, RefreshCw, Code, ClipboardList, ClipboardCheck, Package, FileText } from "lucide-react";

const ROLE_NAVIGATION: Record<string, { name: string; href: string; icon: any }[]> = {
  SUPER_ADMIN: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Organizations", href: "/organizations", icon: Database },
    { name: "Users", href: "/users", icon: Users },
    { name: "Certificates", href: "/certificates", icon: Award },
    { name: "QR Management", href: "/qr-codes", icon: QrCode },
    { name: "Reports", href: "/reports", icon: LineChart },
    { name: "ERP Sync", href: "/erp-sync", icon: RefreshCw },
    { name: "API Marketplace", href: "/api-marketplace", icon: Code },
    { name: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  BIOFIX_ADMIN: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Organizations", href: "/organizations", icon: Database },
    { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
    { name: "Reports", href: "/reports", icon: LineChart },
    { name: "QR Management", href: "/qr-codes", icon: QrCode },
  ],
  INSPECTOR: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
    { name: "Organizations", href: "/organizations", icon: Database },
  ],
  QC_USER: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Batches", href: "/batches", icon: Package },
    { name: "Laboratory Reports", href: "/laboratory-reports", icon: FileText },
    { name: "Certificates", href: "/certificates", icon: Award },
  ],
  LAB_STAFF: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Batches", href: "/batches", icon: Package },
    { name: "Laboratory Reports", href: "/laboratory-reports", icon: FileText },
  ],
  API_CLIENT: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
  ]
};

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.QC_USER;

  return (
    <nav className="flex flex-col gap-2 px-4 py-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all font-medium",
              isActive 
                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
