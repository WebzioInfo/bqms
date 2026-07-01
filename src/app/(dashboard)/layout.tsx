import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarNav } from "@/components/ui/sidebar";
import { Role } from "@prisma/client";
import { NotificationCenter } from "@/components/NotificationCenter";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";

import { ToastProvider } from "@/components/ui/toast-context";
import { LoadingProvider } from "@/components/ui/loading-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error("[DEBUG AUTH] layout.tsx - failed to get authenticated user, redirecting to clear stale session:", error);
    redirect("/api/auth/clear-stale-session");
  }

  const userRole = user.role || Role.QC;
  const roleLabel = userRole.replace("_", " ").toLowerCase();

  let organizationName = "";

  // Enforce correct organization context for Company Admins
  const actualOrgId = user.organizationId;
  if (userRole === Role.COMPANY_ADMIN && !actualOrgId) {
    console.error(`[AUDIT ERROR] COMPANY_ADMIN ${user.email} is missing an organization association. Redirecting to clear stale session.`);
    redirect("/api/auth/clear-stale-session");
  }

  if (actualOrgId) {
    const org = await prisma.organization.findUnique({
      where: { id: actualOrgId },
      select: { id: true, name: true }
    });
    organizationName = org?.name || "";
  }

  return (
    <LoadingProvider>
      <ToastProvider>
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
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background/90 px-4 backdrop-blur-md sm:h-16 sm:px-6 shadow-sm select-none">
          <div className="flex w-full items-center justify-between">
            {/* Left side: Company / Org name */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant:</span>
              <span className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                {organizationName || "Platform Administration"}
              </span>
            </div>

            {/* Right side: Notifications & User profile info */}
            <div className="flex items-center gap-4">
              <NotificationCenter />
              
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.name || user.email}</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wide">{user.email}</span>
                </div>
                
                <div className="rounded-md border bg-card px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-650 shadow-sm border-slate-200">
                  {roleLabel}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-5 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  </ToastProvider>
</LoadingProvider>
  );
}
