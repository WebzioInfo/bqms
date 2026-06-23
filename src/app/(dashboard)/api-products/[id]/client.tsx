"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Server, Activity, Users, Clock, CheckCircle2, DollarSign } from "lucide-react";

interface ApiProductDetailClientProps {
  product: any;
}

export function ApiProductDetailClient({ product }: ApiProductDetailClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-600" />
              Product Configuration
            </div>
            <Badge variant={product.isActive ? "default" : "secondary"} className={product.isActive ? "bg-green-100 text-green-800" : ""}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-base">{product.description || "No description provided."}</p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
            <div className="bg-muted/10 p-4 rounded-xl border border-muted/50">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" /> Base Price (Monthly)
              </dt>
              <dd className="text-2xl font-bold">${product.basePrice.toFixed(2)}</dd>
            </div>
            <div className="bg-muted/10 p-4 rounded-xl border border-muted/50">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" /> Daily Request Limit
              </dt>
              <dd className="text-2xl font-bold">{product.requestLimit.toLocaleString()}</dd>
            </div>
          </dl>

          {product.features && product.features.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Included Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm bg-muted/20 p-2 rounded-lg border">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Widgets */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Active Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {product.subscriptions && product.subscriptions.length > 0 ? (
              <div className="space-y-3">
                {product.subscriptions.map((sub: any) => (
                  <div key={sub.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{sub.organization?.name || "Unknown Org"}</p>
                      <p className="text-xs text-muted-foreground">Since {format(new Date(sub.startDate), "PP")}</p>
                    </div>
                    <Badge variant={sub.status === "ACTIVE" ? "default" : "secondary"}>
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No organizations are currently subscribed to this product.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(product.createdAt), "PP")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{format(new Date(product.updatedAt), "PP")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
