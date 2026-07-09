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
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 px-2 py-0.5 text-xs"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-550 hover:bg-amber-600 px-2 py-0.5 text-xs"><AlertCircle className="w-3.5 h-3.5 mr-1" /> WARNING</Badge>;
      case "FAIL":
        return <Badge className="bg-rose-500 hover:bg-rose-600 px-2 py-0.5 text-xs"><XCircle className="w-3.5 h-3.5 mr-1" /> FAIL</Badge>;
      default:
        return <Badge className="bg-slate-500 hover:bg-slate-650 px-2 py-0.5 text-xs"><Clock className="w-3.5 h-3.5 mr-1" /> PENDING</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      <div className="p-3.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Summary</h2>
        {getStatusBadge(overallStatus)}
      </div>
      
      <div className="p-3.5 space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs">Batch Number</span>
          <span className="font-bold text-slate-800 text-xs">{data.batchNumber || "—"}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs">Production Date</span>
          <span className="font-bold text-slate-800 text-xs">{data.productionDate || "—"}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs">Report Type</span>
          <span className="font-bold text-slate-800 text-xs">{data.reportType || "—"}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 py-1.5">
          <div className="bg-emerald-50 rounded-lg p-1.5 border border-emerald-100 text-center">
            <span className="block text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Passed</span>
            <span className="block text-base font-bold text-emerald-700">{passedCount}</span>
          </div>
          <div className="bg-amber-50 rounded-lg p-1.5 border border-amber-100 text-center">
            <span className="block text-[9px] text-amber-650 font-bold uppercase tracking-wider mb-0.5">Warning</span>
            <span className="block text-base font-bold text-amber-700">{warningCount}</span>
          </div>
          <div className="bg-rose-50 rounded-lg p-1.5 border border-rose-100 text-center">
            <span className="block text-[9px] text-rose-600 font-bold uppercase tracking-wider mb-0.5">Failed</span>
            <span className="block text-base font-bold text-rose-700">{failedCount}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs">Microbial Status</span>
          <span className={`font-bold text-xs ${microFailed > 0 ? "text-rose-600" : microPassed > 0 ? "text-emerald-600" : "text-slate-400"}`}>
            {microFailed > 0 ? "FAIL" : microPassed > 0 && pendingCount === 0 ? "PASS" : "PENDING"}
          </span>
        </div>
        
        {data.remarks && (
          <div className="pt-1">
            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Remarks</span>
            <p className="text-xs text-slate-700 italic line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              "{data.remarks}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
