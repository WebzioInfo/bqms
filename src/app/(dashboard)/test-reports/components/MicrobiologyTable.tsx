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

export function MicrobiologyTable({ parameters, data, updateResult, disabled = false, evaluatedStatuses }: Props) {
  const microParams = parameters.filter((p) => p.category === "MICROBIOLOGY");

  const getStandardString = (param: ParameterDef) => {
    if (param.maxAcceptable === 0) return "Absent";
    if (param.minAcceptable !== null && param.maxAcceptable !== null) {
      return `Max ${param.maxAcceptable} ${param.unit}`;
    }
    return "—";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-semibold text-slate-800">Microbiological Parameters</h2>
        <p className="text-sm text-slate-500 mt-1">Select Absent/Present or enter numeric value depending on parameter.</p>
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
            {microParams.map((param) => {
              const result = data.results[param.id] || { value: "", stringValue: "" };
              
              // Determine if this is typically a Present/Absent or Numeric parameter
              const isNumericTarget = param.name.includes("Count");
              const status = (evaluatedStatuses && evaluatedStatuses[param.id]) || "PENDING";

              return (
                <tr key={param.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-700">{param.name}</td>
                  <td className="px-6 py-3">
                    {isNumericTarget ? (
                      <Input
                        type={disabled ? "text" : "number"}
                        step="1"
                        placeholder="0"
                        value={result.value !== "" && result.value !== null && result.value !== undefined ? result.value : (disabled ? "Not Entered" : "")}
                        onChange={(e) => updateResult(param.id, e.target.value, "")}
                        className="w-full max-w-[150px] focus:ring-blue-500 h-9"
                        disabled={disabled}
                      />
                    ) : (
                      <Select
                        value={result.stringValue || (result.value === "0" ? "Absent" : result.value === "1" ? "Present" : "") || (disabled ? "Not Entered" : "")}
                        onValueChange={(val) => {
                          if (val === "Absent") updateResult(param.id, "0", "Absent");
                          else if (val === "Present") updateResult(param.id, "1", "Present");
                          else updateResult(param.id, "", val || undefined);
                        }}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full max-w-[150px] focus:ring-blue-500 h-9 bg-white">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Absent">Absent</SelectItem>
                          <SelectItem value="Present">Present</SelectItem>
                          {disabled && <SelectItem value="Not Entered">Not Entered</SelectItem>}
                        </SelectContent>
                      </Select>
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
            {microParams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No microbiological parameters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
