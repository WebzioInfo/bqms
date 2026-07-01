import { ParameterDef, ReportFormData } from "./types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface Props {
  data: ReportFormData;
  parameters: ParameterDef[];
  evaluatedStatuses: Record<string, "PASS" | "WARNING" | "FAIL" | "PENDING">;
}

export function ReportSummaryCard({ data, parameters, evaluatedStatuses }: Props) {
  let passedCount = 0;
  let warningCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  let microPassed = 0;
  let microFailed = 0;

  parameters.forEach(param => {
    const status = (evaluatedStatuses && evaluatedStatuses[param.id]) || "PENDING";

    if (status === "PENDING") {
      pendingCount++;
    } else if (status === "PASS") {
      passedCount++;
      if (param.category === "MICROBIOLOGY") microPassed++;
    } else if (status === "WARNING") {
      warningCount++;
    } else {
      failedCount++;
      if (param.category === "MICROBIOLOGY") microFailed++;
    }
  });

  const overallStatus = failedCount > 0 ? "FAIL" : warningCount > 0 ? "WARNING" : pendingCount > 0 ? "PENDING" : "PASS";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASS":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /> PASS</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-550 hover:bg-amber-600 px-3 py-1"><AlertCircle className="w-4 h-4 mr-1.5" /> WARNING</Badge>;
      case "FAIL":
        return <Badge className="bg-rose-500 hover:bg-rose-600 px-3 py-1"><XCircle className="w-4 h-4 mr-1.5" /> FAIL</Badge>;
      default:
        return <Badge className="bg-slate-500 hover:bg-slate-650 px-3 py-1"><Clock className="w-4 h-4 mr-1.5" /> PENDING</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden sticky top-6 font-sans">
      <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">Overall Status</span>
          {getStatusBadge(overallStatus)}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-500 text-sm">Batch Number</span>
          <span className="font-semibold text-slate-800">{data.batchNumber || "—"}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-500 text-sm">Production Date</span>
          <span className="font-semibold text-slate-800">{data.productionDate || "—"}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-500 text-sm">Report Type</span>
          <span className="font-semibold text-slate-800">{data.reportType || "—"}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 py-3">
          <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100 text-center">
            <span className="block text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Passed</span>
            <span className="block text-xl font-bold text-emerald-700">{passedCount}</span>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 border border-amber-100 text-center">
            <span className="block text-[10px] text-amber-650 font-bold uppercase tracking-wider mb-1">Warning</span>
            <span className="block text-xl font-bold text-amber-700">{warningCount}</span>
          </div>
          <div className="bg-rose-50 rounded-lg p-2 border border-rose-100 text-center">
            <span className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider mb-1">Failed</span>
            <span className="block text-xl font-bold text-rose-700">{failedCount}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-500 text-sm">Microbial Status</span>
          <span className={`font-semibold ${microFailed > 0 ? "text-rose-600" : microPassed > 0 ? "text-emerald-600" : "text-slate-400"}`}>
            {microFailed > 0 ? "FAIL" : microPassed > 0 && pendingCount === 0 ? "PASS" : "PENDING"}
          </span>
        </div>
        
        {data.remarks && (
          <div className="pt-2">
            <span className="block text-slate-500 text-sm mb-1">Remarks</span>
            <p className="text-sm text-slate-700 italic line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{data.remarks}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
