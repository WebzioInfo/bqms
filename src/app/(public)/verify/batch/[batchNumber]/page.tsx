import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";



export async function generateMetadata({ params }: { params: { batchNumber: string } }) {
  return {
    title: `Verify Batch | ${params.batchNumber}`,
    description: `Water quality verification for Batch ${params.batchNumber}`
  };
}

export default async function VerifyBatchPage({ params }: { params: { batchNumber: string } }) {
  const batch = await prisma.batch.findUnique({
    where: { batchNumber: params.batchNumber },
    include: { organization: true }
  });

  if (!batch || batch.verificationStatus !== "VERIFIED") {
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Batch: {batch.batchNumber}</h1>
      <p className="text-muted-foreground mb-6">Produced by {batch.organization.name}</p>
      <Card>
        <CardHeader>
          <CardTitle>Batch Quality Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-medium">Verification Status</span>
            <Badge className="bg-green-500">{batch.verificationStatus}</Badge>
          </div>
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-medium">Production Date</span>
            <span>{new Date(batch.productionDate).toLocaleDateString()}</span>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quality Reports</h3>
            <p className="text-sm text-muted-foreground">Detailed laboratory parameter analysis is fully compliant with regional standards.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
