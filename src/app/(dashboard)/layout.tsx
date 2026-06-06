import { ShieldCheck, LogOut, Settings, LayoutDashboard, Database, QrCode, Users, Award, LineChart, RefreshCw, Code, ClipboardList, ClipboardCheck, Package, FileText } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ROLE_NAVIGATION = {
  SUPER_ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/organizations", icon: Database },
    { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
    { name: "Reports", href: "/reports", icon: LineChart },
    { name: "QR Management", href: "/qr-codes", icon: QrCode },
  ],
  INSPECTOR: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
    { name: "Organizations", href: "/organizations", icon: Database },
  ],
  QC_USER: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Batches", href: "/batches", icon: Package },
    { name: "Laboratory Reports", href: "/laboratory-reports", icon: FileText },
    { name: "Certificates", href: "/certificates", icon: Award },
  ],
  LAB_STAFF: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Batches", href: "/batches", icon: Package },
    { name: "Laboratory Reports", href: "/laboratory-reports", icon: FileText },
  ],
  API_CLIENT: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ]
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role || "QC_USER";
  // @ts-ignore
  const navigation = ROLE_NAVIGATION[userRole] || ROLE_NAVIGATION.QC_USER;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold font-heading">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="">BQMS Admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-2 px-4 py-4">
          {navigation.map((item: { name: string; href: string; icon: any }) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground">
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <Link href="/api/auth/signout" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
             <div className="ml-auto font-medium text-sm capitalize">{userRole.replace("_", " ").toLowerCase()}</div>
          </div>
        </header>
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
