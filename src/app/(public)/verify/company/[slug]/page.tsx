import { getOrganizationBySlug } from "@/app/actions/organization";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `Verify Company | ${params.slug}`,
    description: `Water quality verification for ${params.slug}`
  };
}

export default async function VerifyCompanyPage({ params }: { params: { slug: string } }) {
  const result = await getOrganizationBySlug(params.slug);

  if (!result.success || !result.organization || result.organization.type !== "MINERAL_WATER") {
    notFound();
  }

  const { organization } = result;

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{organization.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mineral Water Company Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-medium">Company Trust Score</span>
            <span className="font-bold text-primary">{organization.trustScore || "N/A"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
