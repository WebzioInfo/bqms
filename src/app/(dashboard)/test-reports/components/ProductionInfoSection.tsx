import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportFormData } from "./types";
import { format } from "date-fns";

interface Props {
  data: ReportFormData;
  updateData: (updates: Partial<ReportFormData>) => void;
  disabled?: boolean;
}

export function ProductionInfoSection({ data, updateData, disabled = false }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold text-slate-800">Production Information</h2>
        <p className="text-sm text-slate-500">Enter general details about the production batch and sample.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productionDate" className="text-slate-700 font-medium">Production Date <span className="text-red-500">*</span></Label>
          <Input 
            id="productionDate" 
            type={disabled && !data.productionDate ? "text" : "date"} 
            value={data.productionDate ? (disabled ? format(new Date(data.productionDate), "dd MMM yyyy") : data.productionDate) : (disabled ? "—" : "")}
            onChange={(e) => updateData({ productionDate: e.target.value })}
            className="focus:ring-blue-500"
            required
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber" className="text-slate-700 font-medium">Batch Number <span className="text-red-500">*</span></Label>
          <Input 
            id="batchNumber" 
            type="text" 
            placeholder="e.g. B-12345"
            value={data.batchNumber || (disabled ? "—" : "")}
            onChange={(e) => updateData({ batchNumber: e.target.value })}
            className="focus:ring-blue-500"
            required
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sampleTime" className="text-slate-700 font-medium">Sample Collection Time</Label>
          <Input 
            id="sampleTime" 
            type={disabled && !data.sampleTime ? "text" : "datetime-local"} 
            value={data.sampleTime ? (disabled ? format(new Date(data.sampleTime), "dd MMM yyyy, hh:mm a") : data.sampleTime) : (disabled ? "—" : "")}
            onChange={(e) => updateData({ sampleTime: e.target.value })}
            className="focus:ring-blue-500"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportType" className="text-slate-700 font-medium">Report Type <span className="text-red-500">*</span></Label>
          <Select 
            value={data.reportType || (disabled ? "—" : "")} 
            onValueChange={(val: any) => updateData({ reportType: val })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full focus:ring-blue-500">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Four Hourly pH">Four Hourly pH</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              {disabled && <SelectItem value="—">—</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectedBy" className="text-slate-700 font-medium">Collected By</Label>
          <Input 
            id="collectedBy" 
            type="text" 
            placeholder="Name of collector"
            value={data.collectedBy || (disabled ? "—" : "")}
            onChange={(e) => updateData({ collectedBy: e.target.value })}
            className="focus:ring-blue-500"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verifiedBy" className="text-slate-700 font-medium">Verified By</Label>
          <Input 
            id="verifiedBy" 
            type="text" 
            placeholder="Name of verifier"
            value={data.verifiedBy || (disabled ? "—" : "")}
            onChange={(e) => updateData({ verifiedBy: e.target.value })}
            className="focus:ring-blue-500"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
