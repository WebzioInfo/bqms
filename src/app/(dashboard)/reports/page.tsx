import { getReportsData } from "@/app/actions/reports";
import { ReportsClient } from "./client";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const { data } = await getReportsData();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
      </div>
      <ReportsClient initialData={data || { chartData: [], complianceData: [] }} />
    </div>
  );
}
