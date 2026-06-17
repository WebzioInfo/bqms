"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWaterTestReport } from "@/app/actions/water-test-reports";
import { Loader2 } from "lucide-react";

export function CreateWaterTestClient({ batches, companyId }: { batches: any[], companyId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    batchId: "",
    productionDate: new Date().toISOString().slice(0, 10),
    sampleCollectedDate: new Date().toISOString().slice(0, 16), // datetime-local format
    sampleCollectedBy: "",
    laboratoryName: "",
    expectedTurnaroundHours: "72",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId) return alert("Please select a batch");

    startTransition(async () => {
      try {
        const report = await createWaterTestReport({
          batchId: formData.batchId,
          companyId,
          productionDate: new Date(formData.productionDate),
          sampleCollectedDate: formData.sampleCollectedDate ? new Date(formData.sampleCollectedDate) : undefined,
          sampleCollectedBy: formData.sampleCollectedBy,
          laboratoryName: formData.laboratoryName,
          expectedTurnaroundHours: parseInt(formData.expectedTurnaroundHours)
        });
        
        router.push(`/water-test-reports/${report.id}`);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Water Test Report</h1>
        <p className="text-muted-foreground mt-1">Initiate a new laboratory water quality test for a batch.</p>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
          <CardDescription>Fill in the details of the sample sent for testing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid gap-2">
              <Label htmlFor="batch">Production Batch</Label>
              <select
                id="batch"
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.batchId}
                onChange={(e) => setFormData({...formData, batchId: e.target.value})}
              >
                <option value="" disabled>Select a batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batchNumber} (Prod: {b.productionDate.toString().slice(0,10)})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Production Date</Label>
                <Input type="date" required value={formData.productionDate} onChange={(e) => setFormData({...formData, productionDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Sample Collected On</Label>
                <Input type="datetime-local" value={formData.sampleCollectedDate} onChange={(e) => setFormData({...formData, sampleCollectedDate: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Collected By (Optional)</Label>
                <Input value={formData.sampleCollectedBy} onChange={(e) => setFormData({...formData, sampleCollectedBy: e.target.value})} placeholder="Name of sampler" />
              </div>
              <div className="grid gap-2">
                <Label>Laboratory Name (Optional)</Label>
                <Input value={formData.laboratoryName} onChange={(e) => setFormData({...formData, laboratoryName: e.target.value})} placeholder="Internal or External Lab" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Expected Turnaround Time (Hours)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.expectedTurnaroundHours}
                onChange={(e) => setFormData({...formData, expectedTurnaroundHours: e.target.value})}
              >
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours (Default)</option>
                <option value="120">5 Days</option>
                <option value="168">7 Days</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">This will configure the automated reminder and escalation engine.</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Initiate Test Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
