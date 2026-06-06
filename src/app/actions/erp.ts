"use server";

import { requireRole } from "@/lib/auth/require-role";

export async function forceSyncErp() {
  try {
    await requireRole(["SUPER_ADMIN"]);
    
    // Simulate an ERP sync taking some time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return { success: true, message: "ERP data synchronized successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncAllActiveErp() {
  try {
    await requireRole(["SUPER_ADMIN"]);
    
    // Simulate syncing all active endpoints
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return { success: true, message: "All active ERP connections synchronized." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
