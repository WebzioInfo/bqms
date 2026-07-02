import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParameterDef, ReportFormData } from "./types";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Props {
  parameters: ParameterDef[];
  data: ReportFormData;
  updateResult: (parameterId: string, value: string, stringValue?: string) => void;
  disabled?: boolean;
  evaluatedStatuses: Record<string, "PASS" | "WARNING" | "FAIL" | "PENDING">;
}

import React from "react";

export const PhysicalParametersTable = React.memo(function PhysicalParametersTable({ parameters, data, updateResult, disabled = false, evaluatedStatuses }: Props) {
  const physicalParams = parameters.filter(
    (p) => p.category === "PHYSICAL" || p.category === "CHEMICAL"
  );

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

  const isTextParam = (param: ParameterDef) => {
    return param.unit === "Descriptor" || param.id === "Colour" || param.id === "Odour" || param.id === "Taste";
  };

  const getDefaultValue = (param: ParameterDef) => {
    return isTextParam(param) ? "—" : "0";
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
              const status = (evaluatedStatuses && evaluatedStatuses[param.id]) || "PENDING";

              const displayValue = isTextParam(param)
                ? (result.stringValue || result.value || (disabled ? "—" : ""))
                : (result.value !== "" && result.value !== null && result.value !== undefined ? result.value : (disabled ? getDefaultValue(param) : ""));

              return (
                <tr key={param.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-700">{param.name}</td>
                  <td className="px-6 py-3">
                    {isTextParam(param) ? (
                      <Select
                        value={displayValue === "—" || !displayValue ? "" : displayValue}
                        onValueChange={(value) => updateResult(param.id, "", value || "")}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full max-w-[150px] focus:ring-blue-500 h-9 bg-white">
                          <SelectValue placeholder="Select Value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agreeable">Agreeable</SelectItem>
                          <SelectItem value="Not Agreeable">Not Agreeable</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={disabled ? "text" : "number"}
                        step="any"
                        placeholder="0.00"
                        value={displayValue}
                        onChange={(e) => updateResult(param.id, e.target.value)}
                        className="w-full max-w-[150px] focus:ring-blue-500 h-9"
                        disabled={disabled}
                      />
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{param.unit}</td>
                  <td className="px-6 py-3 text-slate-500">{getStandardString(param)}</td>
                  <td className="px-6 py-3 text-center">
                    {status === "PASS" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-full justify-center py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                      </Badge>
                    )}
                    {status === "WARNING" && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 w-full justify-center py-1">
                        <AlertCircle className="w-3 h-3 mr-1" /> Warning
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
});
