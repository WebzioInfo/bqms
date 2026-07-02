import { ShieldCheck, Settings, LayoutDashboard, Database, Users, Award, LineChart, Code, ClipboardList, Beaker, type LucideIcon } from "lucide-react";

export const ROLE_NAVIGATION: Record<string, { group: string; items: { name: string; href: string; icon: LucideIcon }[] }[]> = {
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
