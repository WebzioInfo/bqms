import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarNav } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // @ts-ignore
  const userRole = session?.user?.role || "QC_USER";

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex shadow-sm">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold font-heading">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="">BQMS Admin</span>
          </Link>
        </div>
        
        <SidebarNav role={userRole} />
        
        <div className="mt-auto p-4 border-t">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
             <div className="ml-auto font-medium text-sm capitalize px-3 py-1 bg-primary/10 text-primary rounded-full">{userRole.replace("_", " ").toLowerCase()}</div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-8 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
