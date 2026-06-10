"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, ShieldCheck, FileSignature, QrCode, Beaker, PackageSearch, History, Settings, CheckCircle2, AlertTriangle, FileText, Download, MoreHorizontal, Mail, Phone, MapPin, RefreshCw, Activity, Zap, ArrowUpRight, ArrowDownRight, Calendar, User, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from "recharts";
import { format, subDays, isAfter } from "date-fns";

export function OrganizationDetailClient({ organization, labReports, auditLogs, metrics }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Format QR Scans for Analytics
  const scanData = useMemo(() => {
    // Generate last 14 days
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      return {
        date: format(d, 'MMM dd'),
        rawDate: d,
        scans: 0
      };
    });

    const allScans = organization.qrCodes?.flatMap((qr: any) => qr.scans) || [];
    
    allScans.forEach((scan: any) => {
      const scanDate = format(new Date(scan.scannedAt), 'MMM dd');
      const day = days.find(d => d.date === scanDate);
      if (day) day.scans++;
    });

    return days;
  }, [organization.qrCodes]);

  const trustScoreColor = (organization.trustScore || 0) >= 80 ? "text-emerald-500" : (organization.trustScore || 0) >= 60 ? "text-amber-500" : "text-rose-500";
  const complianceColor = metrics.complianceScore >= 80 ? "text-emerald-500" : metrics.complianceScore >= 60 ? "text-amber-500" : "text-rose-500";

  // Data table columns
  const inspectionColumns: Column<any>[] = [
    { key: "date", header: "Date", cell: (i) => <span suppressHydrationWarning>{format(new Date(i.inspectionDate), 'MMM dd, yyyy')}</span> },
    { key: "status", header: "Status", cell: (i) => <Badge variant={i.complianceStatus === "PASS" ? "default" : "destructive"}>{i.complianceStatus}</Badge> },
    { key: "inspector", header: "Inspector", cell: (i) => <span>{i.inspector?.name || i.inspector?.email}</span> },
    { key: "actions", header: "Actions", cell: (i) => <Link href={`/inspections/${i.id}`}><Button variant="ghost" size="sm">View</Button></Link> }
  ];

  const certColumns: Column<any>[] = [
    { key: "no", header: "Certificate No", cell: (c) => <span className="font-mono text-xs">{c.certificateNo}</span> },
    { key: "status", header: "Status", cell: (c) => <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"}>{c.status}</Badge> },
    { key: "issue", header: "Issued", cell: (c) => <span suppressHydrationWarning>{format(new Date(c.issueDate), 'MMM dd, yyyy')}</span> },
    { key: "expiry", header: "Expires", cell: (c) => <span suppressHydrationWarning>{c.expiryDate ? format(new Date(c.expiryDate), 'MMM dd, yyyy') : "N/A"}</span> },
    { key: "actions", header: "Actions", cell: (c) => <Link href={`/certificates/${c.id}`}><Button variant="ghost" size="sm">View</Button></Link> }
  ];

  const labColumns: Column<any>[] = [
    { key: "date", header: "Test Date", cell: (r) => <span suppressHydrationWarning>{format(new Date(r.testDate), 'MMM dd, yyyy')}</span> },
    { key: "batch", header: "Batch", cell: (r) => <Link href={`/batches/${r.batch?.id}`} className="text-primary hover:underline">{r.batch?.batchNumber}</Link> },
    { key: "status", header: "Result", cell: (r) => <Badge variant={r.isCompliant ? "default" : "destructive"}>{r.isCompliant ? "COMPLIANT" : "FAILED"}</Badge> },
    { key: "actions", header: "Actions", cell: (r) => <Link href={`/laboratory-reports/${r.id}`}><Button variant="ghost" size="sm">View</Button></Link> }
  ];

  const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, colorClass }: any) => (
    <Card className="shadow-sm border-muted/50 transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`p-2 rounded-lg bg-muted/50 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            {trend === "up" ? <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" /> : trend === "down" ? <ArrowDownRight className="h-4 w-4 text-rose-500 mr-1" /> : null}
            <span className={trend === "up" ? "text-emerald-600 font-medium" : trend === "down" ? "text-rose-600 font-medium" : "text-muted-foreground"}>{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex gap-5 items-center">
          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
              <Badge variant="outline" className="bg-primary/5">{organization.type}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {organization.address || "No Address"}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4"/> {organization.email || "No Email"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap h-9 px-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Zap className="h-4 w-4 mr-2" /> Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Manage Entity</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/organizations/${organization.id}/edit`)}>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem>Sync ERP Data</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/inspections/new?orgId=${organization.id}`)}>Log Inspection</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/certificates/new?orgId=${organization.id}`)}>Issue Certificate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/qr-codes/generate?orgId=${organization.id}`)}>Generate QR Codes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/laboratory-reports/new?orgId=${organization.id}`)}>Upload Lab Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Trust Score" value={organization.trustScore?.toFixed(1) || "N/A"} icon={ShieldCheck} trend="up" trendLabel="+2.4% vs last month" colorClass={trustScoreColor} />
        <MetricCard title="Compliance Rate" value={`${metrics.complianceScore}%`} icon={Activity} trend={metrics.complianceScore >= 80 ? "up" : "down"} trendLabel="Based on all tests" colorClass={complianceColor} />
        <MetricCard title="QR Scans" value={metrics.totalQrScans.toLocaleString()} icon={QrCode} trend="up" trendLabel="+12% this week" colorClass="text-blue-500" />
        <MetricCard title="Open Issues" value={metrics.openIssues} icon={AlertTriangle} trend={metrics.openIssues > 0 ? "down" : "up"} trendLabel={metrics.openIssues > 0 ? "Requires attention" : "All clear"} colorClass={metrics.openIssues > 0 ? "text-rose-500" : "text-emerald-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COMPLIANCE HEALTH PANEL */}
        <Card className="lg:col-span-1 shadow-sm h-full border-muted/50">
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
            <CardDescription>Current compliance standing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <span className="font-medium text-sm">ERP Sync</span>
              <Badge variant={organization.erpReferenceId ? "default" : "secondary"}>
                {organization.erpReferenceId ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Entity Status</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Certificates</span>
                <span className="font-medium">{metrics.activeCertificates}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Batches</span>
                <span className="font-medium">{organization.batches?.length || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recent Lab Reports</span>
                <span className="font-medium">{metrics.totalLabReports}</span>
              </div>
            </div>

            {organization.trustScoreHistory?.length > 1 && (
              <div className="pt-4 h-[120px]">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Trust Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={organization.trustScoreHistory}>
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TABS */}
        <Card className="lg:col-span-2 shadow-sm border-muted/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-2">
              <TabsList className="h-12 bg-transparent border-none w-full justify-start gap-4">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 data-[state=active]:shadow-none">Overview</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 data-[state=active]:shadow-none">Analytics</TabsTrigger>
                <TabsTrigger value="inspections" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 data-[state=active]:shadow-none">Inspections</TabsTrigger>
                <TabsTrigger value="certificates" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 data-[state=active]:shadow-none">Certificates</TabsTrigger>
                <TabsTrigger value="lab" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 data-[state=active]:shadow-none">Lab</TabsTrigger>
                <TabsTrigger value="audit" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 data-[state=active]:shadow-none">Logs</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6">
              <TabsContent value="overview" className="mt-0 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                    <div>
                      <span className="block text-muted-foreground mb-1 text-xs uppercase tracking-wider">Internal Slug</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">{organization.slug}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1 text-xs uppercase tracking-wider">Created</span>
                      <span suppressHydrationWarning>{format(new Date(organization.createdAt), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1 text-xs uppercase tracking-wider">Phone</span>
                      <span>{organization.phone || <span className="text-muted-foreground italic">Not Provided</span>}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1 text-xs uppercase tracking-wider">ERP ID</span>
                      <span>{organization.erpReferenceId || <span className="text-muted-foreground italic">Not Synced</span>}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Users</h3>
                  {organization.users?.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {organization.users.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.name || "Unnamed User"}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                      <User className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">No users have been assigned to this organization.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">QR Scan Volume (Last 14 Days)</h3>
                    <p className="text-sm text-muted-foreground mb-6">Engagement metrics across all generated QR codes.</p>
                  </div>
                  
                  {metrics.totalQrScans > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-muted/10 rounded-xl border border-dashed">
                      <QrCode className="h-12 w-12 text-muted-foreground/30 mb-4" />
                      <h4 className="text-lg font-medium text-foreground">No Scan Data</h4>
                      <p className="text-sm text-muted-foreground max-w-sm text-center mt-1">This organization's QR codes have not generated any scans yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="inspections" className="mt-0">
                <DataTable columns={inspectionColumns} data={organization.inspections || []} searchKey="complianceStatus" searchPlaceholder="Filter by status..." emptyMessage="No inspections logged." />
              </TabsContent>

              <TabsContent value="certificates" className="mt-0">
                <DataTable columns={certColumns} data={organization.certificates || []} searchKey="certificateNo" searchPlaceholder="Search certificates..." emptyMessage="No certificates issued." />
              </TabsContent>
              
              <TabsContent value="lab" className="mt-0">
                <DataTable columns={labColumns} data={labReports || []} searchKey="batchId" searchPlaceholder="Search by batch..." emptyMessage="No laboratory reports." />
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                {auditLogs?.length > 0 ? (
                  <div className="relative border-l border-muted ml-3 space-y-6 py-2">
                    {auditLogs.map((log: any) => (
                      <div key={log.id} className="relative pl-6">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{log.action}</span>
                            <span className="text-xs text-muted-foreground" suppressHydrationWarning>{format(new Date(log.createdAt), 'MMM dd, h:mm a')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                          {log.user && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><User className="h-3 w-3"/> {log.user.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">No audit logs found for this organization.</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
