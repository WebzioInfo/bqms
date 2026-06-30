"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Users2, Phone, Mail, MapPin, Building2, Clock, ShoppingCart } from "lucide-react";

interface CustomerDetailClientProps {
  customer: any;
}

export function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-orange-600" />
              Customer Profile
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={customer.type === "DISTRIBUTOR" ? "bg-blue-50 text-blue-700" : "bg-zinc-50"}>
                {customer.type}
              </Badge>
              <Badge variant={customer.isActive ? "default" : "secondary"} className={customer.isActive ? "bg-green-100 text-green-800" : ""}>
                {customer.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4" /> Email Address
              </dt>
              <dd className="text-base font-medium">{customer.email || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4" /> Phone Number
              </dt>
              <dd className="text-base font-medium">{customer.phone || "N/A"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4" /> Billing & Shipping Address
              </dt>
              <dd className="text-base font-medium bg-muted/20 p-4 rounded-lg border mt-1">
                {customer.address ? (
                  <span className="whitespace-pre-line">{customer.address}</span>
                ) : (
                  <span className="text-muted-foreground italic">No address provided.</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" /> Managing Organization
              </dt>
              <dd className="text-base font-medium text-primary">
                {customer.organization?.name}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Side Widgets */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {customer.orders && customer.orders.length > 0 ? (
              <div className="space-y-3">
                {/* Future iteration can map orders here */}
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Orders functionality to be implemented.
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No orders found for this customer.
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
                  <span className="font-medium">{format(new Date(customer.createdAt), "PP")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{format(new Date(customer.updatedAt), "PP")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
