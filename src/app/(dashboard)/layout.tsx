import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarNav } from "@/components/ui/sidebar";
import { Role } from "@prisma/client";
import { NotificationCenter } from "@/components/NotificationCenter";

type DashboardSession = {
  user?: {
    role?: Role;
  };
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userRole = (session as DashboardSession).user?.role || Role.QC;
  const roleLabel = userRole.replace("_", " ").toLowerCase();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex shadow-sm">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold font-heading">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>BQMS</span>
          </Link>
        </div>
        
        <SidebarNav role={userRole} />
        
        <div className="mt-auto p-4 border-t">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-h-screen flex-col sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-md sm:h-16 sm:px-6">
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex items-center gap-3">
              <NotificationCenter />
              <div className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium capitalize text-foreground shadow-sm">
                {roleLabel}
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-5 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
