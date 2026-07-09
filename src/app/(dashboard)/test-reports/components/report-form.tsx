"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReportFormData, ParameterDef, STATIC_PARAMETERS, ResultValue } from "./types";
import { ProductionInfoSection } from "./ProductionInfoSection";
import { PhysicalParametersTable } from "./PhysicalParametersTable";
import { MicrobiologyTable } from "./MicrobiologyTable";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { AttachmentsSection } from "./AttachmentsSection";
import { Save, Send, History } from "lucide-react";
import { createTestReportWithResults, updateTestReportWithResults, evaluateResultsAction } from "@/app/actions/report";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { enterPendingTestResult } from "@/app/actions/reminder";
import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";

interface Props {
  organizationId: string;
  initialData?: any;
  disabled?: boolean;
}

export function ReportForm({ organizationId, initialData, disabled = false }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activePendingTestForCompletion, setActivePendingTestForCompletion] = useState<any | null>(null);
  const [quickValue, setQuickValue] = useState("");
  const [quickStringValue, setQuickStringValue] = useState("Absent");
  const [quickNotes, setQuickNotes] = useState("");
  const [isSubmittingQuickResult, setIsSubmittingQuickResult] = useState(false);

  const handleQuickSubmit = async () => {
    if (!activePendingTestForCompletion) return;
    setIsSubmittingQuickResult(true);
    try {
      const isCountType = activePendingTestForCompletion.parameterName.includes("Count") || activePendingTestForCompletion.parameterName === "Yeast & Mold";
      const result = await enterPendingTestResult(activePendingTestForCompletion.id, {
        value: isCountType ? quickValue : undefined,
        stringValue: isCountType ? undefined : quickStringValue,
        completionNotes: quickNotes
      });

      if (result.success) {
        toast.success("Incubation result entered successfully.");
        // Reset and close
        setActivePendingTestForCompletion(null);
        setQuickValue("");
        setQuickStringValue("Absent");
        setQuickNotes("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to enter incubation result.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to enter incubation result.");
    } finally {
      setIsSubmittingQuickResult(false);
    }
  };

  // Pre-populate if editing
  const getInitialResultsMap = () => {
    const initialResultsMap: Record<string, ResultValue> = {};
    if (initialData?.results) {
      for (const res of initialData.results) {
        const paramName = res.parameter?.name;
        const staticParam = STATIC_PARAMETERS.find(p => p.name === paramName);
        if (staticParam) {
          initialResultsMap[staticParam.id] = {
            parameterId: staticParam.id,
            value: res.value !== null && res.value !== undefined ? String(res.value) : "",
            stringValue: res.stringValue || "",
            isPass: res.isPass,
            qualityStatus: res.qualityStatus || (res.isPass ? "PASS" : "FAIL")
          };
        }
      }
    }
    return initialResultsMap;
  };
  
  const [formData, setFormData] = useState<ReportFormData>({
    productionDate: initialData?.productionDate ? new Date(initialData.productionDate).toISOString().split('T')[0] : "",
    batchNumber: initialData?.batchNumber || "",
    sampleTime: initialData?.sampleTime ? new Date(initialData.sampleTime).toISOString().slice(0, 16) : "",
    reportType: initialData?.reportType || "Daily",
    collectedBy: initialData?.collectedBy || "",
    verifiedBy: initialData?.verifiedBy || "",
    remarks: initialData?.remarks || "",
    results: getInitialResultsMap(),
    attachments: initialData?.attachments || [],
  });

  const getInitialEvaluatedStatuses = () => {
    const statuses: Record<string, "PASS" | "WARNING" | "FAIL" | "PENDING"> = {};
    if (initialData?.results) {
      for (const res of initialData.results) {
        const paramName = res.parameter?.name;
        const staticParam = STATIC_PARAMETERS.find(p => p.name === paramName);
        if (staticParam) {
          statuses[staticParam.id] = (res.qualityStatus || (res.isPass ? "PASS" : "FAIL")) as any;
        }
      }
    }
    return statuses;
  };

  const [evaluatedStatuses, setEvaluatedStatuses] = useState<Record<string, "PASS" | "WARNING" | "FAIL" | "PENDING">>(getInitialEvaluatedStatuses());

  useEffect(() => {
    const resultsList = Object.values(formData.results);
    if (resultsList.length === 0) {
      setEvaluatedStatuses({});
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const formatted = resultsList.map(r => ({
        parameterId: r.parameterId,
        value: r.value,
        stringValue: r.stringValue
      }));
      const res = await evaluateResultsAction(formatted);
      if (res.success && res.data) {
        setEvaluatedStatuses(res.data);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.results]);

  const updateData = useCallback((updates: Partial<ReportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateResult = useCallback((parameterId: string, value: string, stringValue: string = "") => {
    setFormData(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [parameterId]: {
          parameterId,
          value,
          stringValue,
          isPass: false,
        }
      }
    }));
  }, []);

  const handleSave = async (status: "DRAFT" | "SUBMITTED") => {
    // Validation
    if (!formData.productionDate || !formData.batchNumber) {
      toast.warning("Production Date and Batch Number are required.");
      return;
    }

    const resultsArray = Object.values(formData.results).filter(r => r.value !== "" || r.stringValue !== "");
    if (resultsArray.length === 0) {
      toast.warning("At least one parameter must be entered.");
      return;
    }

    setIsSaving(true);
    
    try {
      const finalResults = resultsArray.map(r => {
        return {
          ...r,
          isPass: r.isPass
        };
      });

      const payload = {
        organizationId: initialData?.organizationId || organizationId,
        status,
        batchNumber: formData.batchNumber,
        productionDate: formData.productionDate,
        sampleTime: formData.sampleTime || formData.productionDate, // Fallback
        reportType: formData.reportType,
        testedBy: formData.collectedBy, // Used as testedBy
        collectedBy: formData.collectedBy,
        verifiedBy: formData.verifiedBy,
        remarks: formData.remarks,
        attachments: formData.attachments
      };

      let result;
      if (initialData?.id) {
        result = await updateTestReportWithResults(initialData.id, payload, finalResults, "dummy-user-id");
      } else {
        result = await createTestReportWithResults(payload, finalResults, "dummy-user-id");
      }
      
      if (result.success) {
        toast.success(initialData?.id 
          ? "Water Test Report updated successfully." 
          : "Water Test Report created successfully."
        );
        router.push("/test-reports");
      } else {
        toast.error(result.error || "Unable to save Water Test Report.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to save Water Test Report.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 mt-6">
      <div className="flex-1 space-y-6">
        <ProductionInfoSection data={formData} updateData={updateData} disabled={disabled} />
        <PhysicalParametersTable parameters={STATIC_PARAMETERS} data={formData} updateResult={updateResult} disabled={disabled} evaluatedStatuses={evaluatedStatuses} />
        <MicrobiologyTable parameters={STATIC_PARAMETERS} data={formData} updateResult={updateResult} disabled={disabled} evaluatedStatuses={evaluatedStatuses} />
        
        {/* Pending Laboratory Tests Card (only visible in disabled/view mode) */}
        {disabled && initialData?.pendingTests && initialData.pendingTests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6 font-sans">
            <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Pending Laboratory Tests</h2>
                <p className="text-xs text-slate-400 font-semibold">Track and log incubation parameter progress.</p>
              </div>
              <div className="text-[10px] font-bold px-3 py-1 bg-slate-50 border rounded-lg text-slate-650 shrink-0">
                {(() => {
                  const pendingList = initialData.pendingTests;
                  const completedCount = pendingList.filter((t: any) => t.status === "COMPLETED").length;
                  const totalCount = pendingList.length;
                  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  return (
                    <span>
                      Microbiology Progress: {completedCount} / {totalCount} Completed ({pct}%)
                    </span>
                  );
                })()}
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {initialData.pendingTests.map((test: any) => {
                let badgeColor = "bg-slate-55 text-slate-500 border-slate-200";
                if (test.status === "COMPLETED") badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
                else if (test.status === "OVERDUE") badgeColor = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-black";
                else if (test.status === "DUE_SOON") badgeColor = "bg-amber-50 text-amber-700 border-amber-250 font-bold";
                else if (test.status === "WAITING") badgeColor = "bg-sky-50 text-sky-700 border-sky-200 font-semibold";

                const isCompleted = test.status === "COMPLETED";

                // Format due text relative to now or absolute
                const dueText = (() => {
                  const now = new Date();
                  const dueAt = new Date(test.dueAt);
                  const diffMs = dueAt.getTime() - now.getTime();
                  const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);

                  if (diffMs < 0) {
                    if (diffHours < 24) return "Yesterday";
                    return format(dueAt, "dd MMM yyyy");
                  } else {
                    if (diffHours < 24) {
                      const h = Math.round(diffHours);
                      return `Due in ${h} Hour${h > 1 ? "s" : ""}`;
                    }
                    const d = Math.round(diffHours / 24);
                    return `Due in ${d} Day${d > 1 ? "s" : ""}`;
                  }
                })();

                return (
                  <div key={test.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 text-sm">{test.parameterName}</span>
                        <Badge variant="outline" className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider ${badgeColor}`}>
                          {test.status}
                        </Badge>
                      </div>
                      <div className="text-slate-500 font-medium space-x-3">
                        {isCompleted ? (
                          <span>
                            Completed: {format(new Date(test.completedAt), "dd MMM yyyy, hh:mm a")} by <span className="font-semibold text-slate-700">{test.completedBy}</span>
                          </span>
                        ) : (
                          <span>Due date: {format(new Date(test.dueAt), "dd MMM yyyy, hh:mm a")} ({dueText})</span>
                        )}
                      </div>
                      {test.completionNotes && (
                        <p className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2 rounded border border-slate-100 mt-1 max-w-xl">
                          Notes: {test.completionNotes}
                        </p>
                      )}
                    </div>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActivePendingTestForCompletion(test);
                          const isCount = test.parameterName.includes("Count") || test.parameterName === "Yeast & Mold";
                          if (isCount) {
                            setQuickValue("");
                          } else {
                            setQuickStringValue("Absent");
                          }
                        }}
                        className="h-8 text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-850 border-sky-200 font-bold self-start sm:self-center shrink-0 rounded-lg shadow-sm"
                      >
                        Enter Result
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Remarks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Remarks</h2>
            <p className="text-sm text-slate-500">Any additional notes or observations.</p>
          </div>
          <Textarea 
            id="remarks" 
            placeholder={disabled ? "" : "Any additional notes or observations..."}
            value={formData.remarks || (disabled ? "—" : "")}
            onChange={(e) => updateData({ remarks: e.target.value })}
            className="focus:ring-blue-500 min-h-[100px] resize-y bg-white border border-slate-200"
            disabled={disabled}
          />
        </div>

        <AttachmentsSection data={formData} updateData={updateData} disabled={disabled} />
      </div>
           <div className="w-full xl:w-80 flex-shrink-0">
        <div className="sticky top-[72px] space-y-4">
          <ReportSummaryCard data={formData} parameters={STATIC_PARAMETERS} evaluatedStatuses={evaluatedStatuses} />
          
          {disabled ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 py-2.5 px-4 flex flex-row items-center gap-1.5">
                <History className="h-4 w-4 text-sky-700" />
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Audit Timeline</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="relative border-l border-slate-200 pl-4 space-y-4 text-xs font-medium font-sans">
                  {initialData?.updatedAt && (
                    <div className="relative">
                      <span className="absolute -left-[20px] top-0.5 bg-sky-100 border border-sky-200 rounded-full h-2.5 w-2.5"></span>
                      <p className="text-[10px] text-slate-400 font-bold select-none uppercase tracking-wide">Last Updated</p>
                      <p className="text-slate-800 font-bold">
                        {format(new Date(initialData.updatedAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>
                  )}
                  {initialData?.createdAt && (
                    <div className="relative">
                      <span className="absolute -left-[20px] top-0.5 bg-emerald-100 border border-emerald-250 rounded-full h-2.5 w-2.5"></span>
                      <p className="text-[10px] text-slate-400 font-bold select-none uppercase tracking-wide">Created</p>
                      <p className="text-slate-800 font-bold">
                        {format(new Date(initialData.createdAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2.5">
              <Button 
                variant="outline" 
                className="w-full justify-center h-10 border-slate-250 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg shadow-sm" 
                onClick={() => router.push("/test-reports")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                className="w-full justify-center h-10 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-md" 
                onClick={() => handleSave("SUBMITTED")}
                disabled={isSaving}
              >
                <ButtonLoader 
                  loading={isSaving} 
                  label={initialData?.id ? "Save Changes" : "Submit Report"} 
                  loadingLabel={initialData?.id ? "Saving..." : "Submitting..."} 
                  icon={<Send className="w-3.5 h-3.5" />}
                />
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Quick Incubation Entry Modal */}
      {activePendingTestForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Enter Incubation Result</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">Parameter: {activePendingTestForCompletion.parameterName}</p>
              </div>
              <button 
                onClick={() => setActivePendingTestForCompletion(null)}
                className="text-slate-450 hover:text-slate-700 text-sm font-bold p-1 hover:bg-slate-100 rounded"
                disabled={isSubmittingQuickResult}
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const isCount = activePendingTestForCompletion.parameterName.includes("Count") || activePendingTestForCompletion.parameterName === "Yeast & Mold";
                if (isCount) {
                  return (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Count Value (CFU/mL)</label>
                      <input 
                        type="number"
                        placeholder="e.g. 0, 15, 100"
                        value={quickValue}
                        onChange={(e) => setQuickValue(e.target.value)}
                        className="w-full text-xs h-9 px-3 rounded-lg border border-slate-250 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 focus:outline-none"
                        disabled={isSubmittingQuickResult}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Observation Result</label>
                      <select
                        value={quickStringValue}
                        onChange={(e) => setQuickStringValue(e.target.value)}
                        className="w-full text-xs h-9 px-2 rounded-lg border border-slate-250 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 focus:outline-none"
                        disabled={isSubmittingQuickResult}
                      >
                        <option value="Absent">Absent</option>
                        <option value="Present">Present</option>
                      </select>
                    </div>
                  );
                }
              })()}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Notes / Comments</label>
                <textarea 
                  placeholder="Any additional notes about the incubation or reading..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-250 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-550 focus:outline-none min-h-[70px] resize-y"
                  disabled={isSubmittingQuickResult}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 font-bold border-slate-200 rounded-lg text-xs" 
                onClick={() => setActivePendingTestForCompletion(null)}
                disabled={isSubmittingQuickResult}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                className="h-8 font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs shadow-sm"
                onClick={handleQuickSubmit}
                disabled={isSubmittingQuickResult}
              >
                <ButtonLoader
                  loading={isSubmittingQuickResult}
                  label="Save Result"
                  loadingLabel="Saving..."
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
