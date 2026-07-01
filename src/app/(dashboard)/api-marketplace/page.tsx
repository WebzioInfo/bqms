import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getSubscriptionDetails, getAdminSubscriptions } from "@/app/actions/api-subscription";
import { MarketplaceClient } from "./components/marketplace-client";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";

export default async function ApiMarketplacePage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const role = user.role;
  if (role !== Role.PLATFORM_ADMIN && role !== Role.COMPANY_ADMIN) {
    redirect("/");
  }

  const orgId = user.organizationId || "";

  // Fetch active products
  const products = await prisma.apiProduct.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  // Fetch subscription details if company admin
  let subscriptionData = null;
  if (orgId) {
    const res = await getSubscriptionDetails(orgId);
    if (res.success) {
      subscriptionData = res.data;
    }
  }

  // Fetch admin logs and subscriptions if platform admin
  let adminData = null;
  if (role === Role.PLATFORM_ADMIN) {
    const res = await getAdminSubscriptions();
    if (res.success) {
      adminData = res.data;
    }
  }

  // Setup dynamic Base URL
  const baseUrl = `http://localhost:3000/api/v1`;

  return (
    <div className="flex-1 space-y-6">
      <MarketplaceClient
        products={products}
        subscriptionData={subscriptionData}
        adminData={adminData}
        currentOrgId={orgId}
        currentUserId={user.id}
        isPlatformAdmin={role === Role.PLATFORM_ADMIN}
        defaultBaseUrl={baseUrl}
      />
    </div>
  );
}
