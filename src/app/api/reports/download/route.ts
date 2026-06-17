import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import { ReportGeneratorService, ExportFormat } from '@/lib/reports';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const format = (searchParams.get('format') || 'csv') as ExportFormat;

  if (!type) {
    return NextResponse.json({ error: 'Missing report type' }, { status: 400 });
  }

  try {
    let reportData;

    // @ts-ignore
    const userRole = session.user.role;
    // @ts-ignore
    const orgId = session.user.organizationId;
    const whereClause = (userRole !== 'SUPER_ADMIN' && orgId) ? { companyId: orgId } : {};

    if (type === 'WATER_TEST_PENDING') {
      const reports = await prisma.waterTestReport.findMany({
        where: { ...whereClause, status: 'PENDING' },
        include: { company: true, batch: true }
      });

      reportData = {
        title: 'Pending Water Quality Tests',
        headers: ['Report Number', 'Batch', 'Company', 'Production Date', 'Status'],
        rows: reports.map(r => [
          r.reportNumber,
          r.batch.batchNumber,
          r.company.name,
          r.productionDate.toISOString().split('T')[0],
          r.status
        ]),
        metadata: {
          GeneratedAt: new Date().toISOString(),
          GeneratedBy: session.user.email || 'Unknown'
        }
      };
    } else {
      return NextResponse.json({ error: 'Report type not implemented yet' }, { status: 501 });
    }

    const fileContent = await ReportGeneratorService.generate(reportData, format);

    // Set correct Content-Type based on format
    const contentTypes: Record<ExportFormat, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml'
    };

    const fileExtensions: Record<ExportFormat, string> = {
      pdf: 'pdf',
      xlsx: 'xlsx',
      csv: 'csv',
      json: 'json',
      xml: 'xml'
    };

    return new NextResponse(fileContent as any, {
      headers: {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="${type.toLowerCase()}_report.${fileExtensions[format]}"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
