import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Scan, ShieldCheck, MapPin } from "lucide-react";

export default async function ViewQRCodePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const qr = await prisma.qRCode.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      organization: true, 
      batch: true,
      scans: {
        orderBy: { scannedAt: 'desc' },
        take: 50
      }
    }
  });

  if (!qr) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Scan history and metrics for code {qr.code}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Scan className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qr.scans.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Badge variant={qr.status === "ACTIVE" ? "default" : "destructive"}>{qr.status}</Badge>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Origin</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{qr.organization?.name || "Unassigned"}</div>
            <div className="text-xs text-muted-foreground mt-1">Batch: {qr.batch?.batchNumber || "None"}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Recent Scan Activity</CardTitle>
          <CardDescription>Geographic and timestamp data for recent user scans.</CardDescription>
        </CardHeader>
        <CardContent>
          {qr.scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
              <Scan className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p>No scans recorded for this QR code yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {qr.scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Scan Event</p>
                      <p className="text-xs text-muted-foreground">
                        IP: {scan.ipAddress} • User Agent: {scan.userAgent?.substring(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {scan.scannedAt.toLocaleDateString()} {scan.scannedAt.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
