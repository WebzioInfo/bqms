import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Check } from "lucide-react";
import { Role } from "@prisma/client";

type SessionWithRole = {
  user?: {
    role?: Role;
  };
};

export default async function ApiMarketplacePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session as SessionWithRole).user?.role;
  if (role !== Role.PLATFORM_ADMIN && role !== Role.COMPANY_ADMIN) {
    redirect("/");
  }

  const products = await prisma.apiProduct.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      rateLimit: true,
      features: true,
    },
    orderBy: { price: 'asc' },
    take: 50,
  });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">API Marketplace</h2>
      </div>
      <p className="text-muted-foreground">Subscribe to API plans to integrate BQMS data into your internal systems.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description || "API Access Plan"}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-3xl font-bold mb-6">${product.price} <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {product.rateLimit.toLocaleString()} requests / hour
                </li>
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
