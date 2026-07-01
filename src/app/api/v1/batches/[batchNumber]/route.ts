import { authenticateApiRequest, logRequest } from "@/lib/api/auth";
import { aggregateBatchData } from "@/lib/api/batch-aggregation";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ batchNumber: string }> }) {
  const { batchNumber } = await props.params;
  const auth = await authenticateApiRequest(req);
  if (!auth.isAuthenticated || !auth.organizationId) {
    return auth.errorResponse!;
  }

  const batchData = await aggregateBatchData(auth.organizationId, batchNumber);

  if (!batchData) {
    await logRequest(auth.organizationId, auth.apiKeyId || null, req, 404);
    return NextResponse.json({ error: `Batch '${batchNumber}' not found for your company.` }, { status: 404 });
  }

  await logRequest(auth.organizationId, auth.apiKeyId || null, req, 200);
  return NextResponse.json(batchData);
}
