import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ParameterDef, ReportFormData, ResultValue } from "./types";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Props {
  parameters: ParameterDef[];
  data: ReportFormData;
  updateResult: (parameterId: string, value: string, stringValue?: string) => void;
}

export function PhysicalParametersTable({ parameters, data, updateResult }: Props) {
  const physicalParams = parameters.filter(
    (p) => p.category === "PHYSICAL" || p.category === "CHEMICAL"
  );

  const calculateStatus = (param: ParameterDef, valueStr: string): "PASS" | "FAIL" | "PENDING" => {
    if (!valueStr || valueStr.trim() === "") return "PENDING";
    const num = parseFloat(valueStr);
    if (isNaN(num)) return "PENDING";

    const min = param.minAcceptable ?? -Infinity;
    const max = param.maxAcceptable ?? Infinity;

    return (num >= min && num <= max) ? "PASS" : "FAIL";
  };

  const getStandardString = (param: ParameterDef) => {
    if (param.minAcceptable !== null && param.maxAcceptable !== null) {
      if (param.minAcceptable === param.maxAcceptable) {
        return param.minAcceptable.toString();
      }
      return `${param.minAcceptable} – ${param.maxAcceptable}`;
    }
    if (param.minAcceptable !== null) return `Min ${param.minAcceptable}`;
    if (param.maxAcceptable !== null) return `Max ${param.maxAcceptable}`;
    return "—";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-semibold text-slate-800">Physical & Chemical Parameters</h2>
        <p className="text-sm text-slate-500 mt-1">Enter numeric values. Status is automatically calculated based on BIS Standards.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 w-1/3">Parameter</th>
              <th className="px-6 py-4 w-1/4">Result</th>
              <th className="px-6 py-4 w-1/6">Unit</th>
              <th className="px-6 py-4 w-1/6">Standard</th>
              <th className="px-6 py-4 w-32 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {physicalParams.map((param) => {
              const result = data.results[param.id] || { value: "", stringValue: "" };
              const status = calculateStatus(param, result.value);

              return (
                <tr key={param.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-700">{param.name}</td>
                  <td className="px-6 py-3">
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={result.value}
                      onChange={(e) => updateResult(param.id, e.target.value)}
                      className="w-full max-w-[150px] focus:ring-blue-500 h-9"
                    />
                  </td>
                  <td className="px-6 py-3 text-slate-500">{param.unit}</td>
                  <td className="px-6 py-3 text-slate-500">{getStandardString(param)}</td>
                  <td className="px-6 py-3 text-center">
                    {status === "PASS" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-full justify-center py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                      </Badge>
                    )}
                    {status === "FAIL" && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 w-full justify-center py-1">
                        <XCircle className="w-3 h-3 mr-1" /> Fail
                      </Badge>
                    )}
                    {status === "PENDING" && (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 w-full justify-center py-1">
                        <AlertCircle className="w-3 h-3 mr-1" /> —
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
            {physicalParams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No physical/chemical parameters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
