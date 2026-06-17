"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateWaterTestReportStatus, saveWaterTestResults } from "@/app/actions/water-test-reports";
import { Loader2, Beaker, CheckCircle2, AlertTriangle, FileText, UploadCloud, Clock } from "lucide-react";
import { format } from "date-fns";

export function WaterTestReportDetailClient({ report, userRole }: { report: any, userRole: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create initial state for results based on company params OR existing results
  const [results, setResults] = useState<Record<string, { result: string, remarks: string }>>(() => {
    const initialState: Record<string, { result: string, remarks: string }> = {};
    
    report.company.waterTestParams.forEach((param: any) => {
      if (!param.isActive) return;
      const existing = report.results.find((r: any) => r.parameterId === param.id);
      initialState[param.id] = {
        result: existing ? String(existing.testResult) : "",
        remarks: existing?.remarks || ""
      };
    });
    
    return initialState;
  });

  const handleStatusChange = (newStatus: any) => {
    startTransition(async () => {
      await updateWaterTestReportStatus(report.id, newStatus);
      router.refresh();
    });
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = Object.entries(results)
        .filter(([_, v]) => v.result.trim() !== "")
        .map(([parameterId, v]) => ({
          parameterId,
          testResult: parseFloat(v.result),
          remarks: v.remarks
        }));

      if (payload.length === 0) {
        alert("Please enter at least one result.");
        return;
      }

      await saveWaterTestResults(report.id, payload);
      router.refresh();
    });
  };

  const isCompleted = report.status === "COMPLETED" || report.status === "FAILED";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{report.reportNumber}</h1>
            <Badge variant={isCompleted ? (report.status === "COMPLETED" ? "default" : "destructive") : "default"}>
              {report.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Water Quality Test for Batch <span className="font-medium">{report.batch.batchNumber}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isCompleted && (
            <select 
              className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={report.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isPending}
            >
              <option value="PENDING">Pending</option>
              <option value="SAMPLE_SENT">Sample Sent</option>
              <option value="UNDER_TESTING">Under Testing</option>
              <option value="AWAITING_RESULT">Awaiting Result</option>
            </select>
          )}
          <Button variant="outline" onClick={() => router.push('/water-test-reports')}>Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Organization</span>
                <span className="font-medium">{report.company.name}</span>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Production Date</span>
                <span className="font-medium">{format(new Date(report.productionDate), 'PPP')}</span>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Sample Collected</span>
                <span className="font-medium">
                  {report.sampleCollectedDate ? format(new Date(report.sampleCollectedDate), 'PPp') : "Not Recorded"}
                </span>
                {report.sampleCollectedBy && <span className="block text-xs text-muted-foreground mt-1">By: {report.sampleCollectedBy}</span>}
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Due Date (SLA)</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  {report.dueDate ? format(new Date(report.dueDate), 'PPp') : "Not Set"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {report.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {report.attachments.map((att: any) => (
                    <li key={att.id} className="flex items-center gap-2 text-sm border p-2 rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                      <a href={att.cloudFile?.secureUrl} target="_blank" className="hover:underline text-primary">Attachment</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No attachments uploaded.</p>
              )}
              {!isCompleted && (
                <Button variant="outline" className="w-full mt-4" disabled>
                  <UploadCloud className="h-4 w-4 mr-2" /> Upload File
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Laboratory Results</CardTitle>
                  <CardDescription>Enter test results against the active parameters.</CardDescription>
                </div>
                {isCompleted && (
                  <Badge variant={report.status === "COMPLETED" ? "default" : "destructive"} className="text-sm py-1 px-3">
                    {report.status === "COMPLETED" ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                    {report.status === "COMPLETED" ? "COMPLIANT" : "NON-COMPLIANT"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveResults}>
                <div className="space-y-6">
                  {report.company.waterTestParams.filter((p: any) => p.isActive).map((param: any) => (
                    <div key={param.id} className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                      <div className="col-span-12 sm:col-span-4">
                        <Label className="font-semibold text-base">{param.name}</Label>
                        <div className="text-xs text-muted-foreground mt-1">
                          Range: {param.acceptableMin ?? 0} - {param.acceptableMax ?? '∞'} {param.unit}
                        </div>
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <Label className="text-xs text-muted-foreground mb-1 block">Result ({param.unit})</Label>
                        <Input 
                          type="number" 
                          step="any"
                          required
                          readOnly={isCompleted}
                          value={results[param.id]?.result || ""}
                          onChange={(e) => setResults({ ...results, [param.id]: { ...results[param.id], result: e.target.value }})}
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-5">
                        <Label className="text-xs text-muted-foreground mb-1 block">Remarks / Method</Label>
                        <Input 
                          readOnly={isCompleted}
                          value={results[param.id]?.remarks || ""}
                          onChange={(e) => setResults({ ...results, [param.id]: { ...results[param.id], remarks: e.target.value }})}
                          placeholder="Optional notes"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {!isCompleted && (
                  <div className="mt-8 pt-4 border-t flex justify-end">
                    <Button type="submit" size="lg" disabled={isPending}>
                      {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Results & Verify Compliance
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
