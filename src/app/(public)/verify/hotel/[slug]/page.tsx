import { OrganizationService } from "@/services/organization.service";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Wait for dynamic parameters if needed by Next.js 15
  const resolvedParams = await Promise.resolve(params);
  
  return {
    title: `Verify Hotel | ${resolvedParams.slug}`,
    description: `Water quality verification and compliance status for ${resolvedParams.slug}`
  };
}

export default async function VerifyHotelPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const organization = await OrganizationService.getOrganizationBySlug(resolvedParams.slug);

  if (!organization || organization.type !== "HOTEL") {
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{organization.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Hotel Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-medium">Trust Score</span>
            <span className="font-bold text-primary">{organization.trustScore || "N/A"}</span>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Recent Inspections</h3>
            {organization.inspections.length > 0 ? (
              <ul className="space-y-2">
                {organization.inspections.map((insp: any) => (
                  <li key={insp.id} className="flex justify-between p-2 bg-muted rounded">
                    <span>{new Date(insp.inspectionDate).toLocaleDateString()}</span>
                    <Badge>{insp.complianceStatus}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No inspections recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
