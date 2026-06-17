"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createWaterTestParameter, toggleWaterTestParameter } from "@/app/actions/water-test-parameters";
import { Loader2, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function WaterTestParametersTab({ organizationId, parameters }: { organizationId: string, parameters: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "PHYSICAL",
    unit: "",
    acceptableMin: "",
    acceptableMax: ""
  });

  const handleAddParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createWaterTestParameter({
        organizationId,
        name: formData.name,
        type: formData.type as any,
        unit: formData.unit,
        acceptableMin: formData.acceptableMin ? parseFloat(formData.acceptableMin) : undefined,
        acceptableMax: formData.acceptableMax ? parseFloat(formData.acceptableMax) : undefined,
      });
      setShowAddForm(false);
      setFormData({ name: "", type: "PHYSICAL", unit: "", acceptableMin: "", acceptableMax: "" });
      router.refresh();
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleWaterTestParameter(id, !currentStatus);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Water Test Parameters</h3>
          <p className="text-sm text-muted-foreground">Manage the laboratory parameters and acceptable limits.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} disabled={isPending}>
          {showAddForm ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Add Parameter</>}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddParameter} className="p-4 border rounded-lg bg-muted/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1">
              <label className="text-xs font-medium mb-1 block">Type</label>
              <select 
                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="PHYSICAL">Physical</option>
                <option value="CHEMISTRY">Chemistry</option>
                <option value="MICROBIOLOGY">Microbiology</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block">Parameter Name</label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. pH, Turbidity" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block">Unit</label>
              <Input required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="e.g. mg/L" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Acceptable Min (Optional)</label>
              <Input type="number" step="any" value={formData.acceptableMin} onChange={(e) => setFormData({...formData, acceptableMin: e.target.value})} placeholder="e.g. 6.5" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Acceptable Max (Optional)</label>
              <Input type="number" step="any" value={formData.acceptableMax} onChange={(e) => setFormData({...formData, acceptableMax: e.target.value})} placeholder="e.g. 8.5" />
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Parameter
          </Button>
        </form>
      )}

      {parameters?.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Acceptable Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param) => (
                <TableRow key={param.id}>
                  <TableCell className="font-medium">{param.name}</TableCell>
                  <TableCell><Badge variant="outline">{param.type}</Badge></TableCell>
                  <TableCell>{param.unit}</TableCell>
                  <TableCell>
                    {param.acceptableMin !== null ? param.acceptableMin : '0'} - {param.acceptableMax !== null ? param.acceptableMax : '∞'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={param.isActive ? "default" : "secondary"}>
                      {param.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggle(param.id, param.isActive)}
                      disabled={isPending}
                    >
                      {param.isActive ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 border border-dashed rounded-lg">
          <Settings className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No water test parameters configured.</p>
        </div>
      )}
    </div>
  );
}
