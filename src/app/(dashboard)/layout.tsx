import { ShieldCheck, LogOut, Settings, LayoutDashboard, Database, QrCode } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all hover:text-primary">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground">
            <Database className="h-4 w-4" />
            Organizations
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground">
            <QrCode className="h-4 w-4" />
            QR Codes
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
        <div className="mt-auto p-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* Mobile menu could go here */}
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
             <div className="ml-auto font-medium text-sm">Biofix Admin</div>
          </div>
        </header>
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
