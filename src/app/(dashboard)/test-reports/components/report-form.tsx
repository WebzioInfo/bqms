"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createTestReportWithResults, updateTestReportWithResults } from "@/app/actions/report";
import { Loader2, Save, Trash2, CheckCircle2, XCircle, CornerDownLeft, Sparkles, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Parameter {
  id: string;
  name: string;
  category: string;
  unit: string;
  minAcceptable: number | null;
  maxAcceptable: number | null;
}

interface ReportFormProps {
  initialData?: any;
  organizations: any[];
  currentUserId: string;
  parameters: Parameter[];
  recentReports: any[];
}

export function ReportForm({ initialData, organizations, currentUserId, parameters, recentReports }: ReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [reportType, setReportType] = useState(initialData?.reportType || "PACKAGED_DRINKING_WATER");
  const [organizationId, setOrganizationId] = useState(initialData?.organizationId || organizations[0]?.id || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [batchNumber, setBatchNumber] = useState(initialData?.batchNumber || "");
  const [sampleNumber, setSampleNumber] = useState(initialData?.sampleNumber || "");
  const [sampleTime, setSampleTime] = useState(
    initialData?.sampleTime 
      ? new Date(initialData.sampleTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [testedBy, setTestedBy] = useState(initialData?.testedBy || "");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");

  // Shift & metadata
  const [shift, setShift] = useState("Morning");
  const [plant, setPlant] = useState("Plant A");
  const [productionLine, setProductionLine] = useState("Line 1");
  const [packageSize, setPackageSize] = useState("1 Litre");
  const [collectedBy, setCollectedBy] = useState("Operator A");
  const [approvedBy, setApprovedBy] = useState("");

  // Parameter results state: { [parameterId]: string }
  const [results, setResults] = useState<Record<string, string>>({});

  // Initialize results when editing or from local storage
  useEffect(() => {
    if (initialData?.results) {
      const initialResults: Record<string, string> = {};
      initialData.results.forEach((res: any) => {
        initialResults[res.parameterId] = res.value.toString();
      });
      setResults(initialResults);
    }
  }, [initialData]);

  // Load local draft on mount
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  useEffect(() => {
    const draft = localStorage.getItem("bqms_lims_draft");
    if (draft && !initialData) {
      setHasLocalDraft(true);
    }
  }, [initialData]);

  // Autosave to local storage every 10 seconds (only if not editing)
  useEffect(() => {
    if (initialData) return;
    const interval = setInterval(() => {
      const draftData = {
        reportType,
        organizationId,
        status,
        batchNumber,
        sampleNumber,
        sampleTime,
        testedBy,
        remarks,
        results,
        shift,
        plant,
        productionLine,
        packageSize,
        collectedBy,
        approvedBy,
      };
      localStorage.setItem("bqms_lims_draft", JSON.stringify(draftData));
    }, 10000);

    return () => clearInterval(interval);
  }, [reportType, organizationId, status, batchNumber, sampleNumber, sampleTime, testedBy, remarks, results, shift, plant, productionLine, packageSize, collectedBy, approvedBy, initialData]);

  // Restore Draft
  const restoreDraft = () => {
    const draft = localStorage.getItem("bqms_lims_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setReportType(parsed.reportType);
        setOrganizationId(parsed.organizationId);
        setStatus(parsed.status);
        setBatchNumber(parsed.batchNumber);
        setSampleNumber(parsed.sampleNumber);
        setSampleTime(parsed.sampleTime);
        setTestedBy(parsed.testedBy);
        setRemarks(parsed.remarks);
        setResults(parsed.results || {});
        setShift(parsed.shift || "Morning");
        setPlant(parsed.plant || "Plant A");
        setProductionLine(parsed.productionLine || "Line 1");
        setPackageSize(parsed.packageSize || "1 Litre");
        setCollectedBy(parsed.collectedBy || "Operator A");
        setApprovedBy(parsed.approvedBy || "");
        setHasLocalDraft(false);
        setSuccessMsg("Draft report restored successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  };

  // Clear Draft
  const clearDraft = () => {
    localStorage.removeItem("bqms_lims_draft");
    setHasLocalDraft(false);
  };

  // Keyboard navigation & inputs references
  const inputsRef = useRef<Record<string, HTMLInputElement | HTMLButtonElement | null>>({});

  // Get filtered parameters based on type
  const getFilteredParameters = () => {
    const dailyNames = ["pH", "TDS", "Turbidity", "Conductivity", "Temperature", "Colour", "Odour", "Appearance", "Taste", "E.coli", "Coliform", "Pseudomonas", "Clostridia", "Yeast", "Mould"];
    const weeklyNames = [...dailyNames, "Barium", "Copper", "Iron", "Manganese", "Nitrate", "Nitrite", "Aluminium", "Calcium", "Magnesium", "Sulphide"];
    
    if (reportType === "DAILY") {
      return parameters.filter(p => dailyNames.includes(p.name));
    }
    if (reportType === "WEEKLY") {
      return parameters.filter(p => weeklyNames.includes(p.name));
    }
    if (reportType === "MONTHLY") {
      return parameters; // Show all
    }
    return parameters; // Complete / Packaged drinking water
  };

  const filteredParams = getFilteredParameters();
  const physicalParams = filteredParams.filter(p => p.category === "PHYSICAL");
  const chemicalParams = filteredParams.filter(p => p.category === "CHEMICAL");
  const microParams = filteredParams.filter(p => p.category === "MICROBIOLOGY");

  // Parameter Validation Logic
  const getParameterStatus = (param: Parameter, valueStr: string) => {
    if (!valueStr) return { status: "EMPTY", color: "text-slate-400 border-slate-200", bg: "bg-slate-50", badge: "info" };
    const val = parseFloat(valueStr);
    
    // Special Codes
    if (val === -1) return { status: "PASS", color: "text-emerald-600 border-emerald-200", bg: "bg-emerald-50/50", label: "BDL", isPass: true };
    if (val === -2) return { status: "FAIL", color: "text-rose-600 border-rose-200", bg: "bg-rose-50/50", label: "OSL", isPass: false };

    // pH Custom validation ranges
    if (param.name === "pH") {
      if (val >= 6.0 && val <= 8.5) return { status: "PASS", color: "text-emerald-600 border-emerald-200", bg: "bg-emerald-50/30", label: "PASS", isPass: true };
      if (val >= 5.8 && val <= 5.99) return { status: "WARNING", color: "text-amber-600 border-amber-200", bg: "bg-amber-50/30", label: "WARNING", isPass: true };
      return { status: "FAIL", color: "text-rose-600 border-rose-200", bg: "bg-rose-50/30", label: "FAIL", isPass: false };
    }

    // Microbiology Validation (Absent is 0.0, Present is 1.0, BDL is -1.0)
    if (param.category === "MICROBIOLOGY") {
      if (val === 0) return { status: "PASS", color: "text-emerald-600 border-emerald-200", bg: "bg-emerald-50/30", label: "Absent", isPass: true };
      if (val === 1) return { status: "FAIL", color: "text-rose-600 border-rose-200", bg: "bg-rose-50/30", label: "Present", isPass: false };
    }

    // Generic range validation
    const min = param.minAcceptable ?? -Infinity;
    const max = param.maxAcceptable ?? Infinity;
    if (val >= min && val <= max) {
      return { status: "PASS", color: "text-emerald-600 border-emerald-200", bg: "bg-emerald-50/30", label: "PASS", isPass: true };
    }
    return { status: "FAIL", color: "text-rose-600 border-rose-200", bg: "bg-rose-50/30", label: "FAIL", isPass: false };
  };

  // Get overall quality status (PASS / FAIL / WARNING)
  const getOverallStatus = () => {
    let hasFail = false;
    let hasWarning = false;
    let hasValue = false;

    filteredParams.forEach(p => {
      const valStr = results[p.id];
      if (valStr) {
        hasValue = true;
        const validation = getParameterStatus(p, valStr);
        if (validation.status === "FAIL") hasFail = true;
        if (validation.status === "WARNING") hasWarning = true;
      }
    });

    if (!hasValue) return { label: "PENDING", color: "bg-slate-100 text-slate-700 border-slate-300" };
    if (hasFail) return { label: "FAILING", color: "bg-rose-100 text-rose-800 border-rose-300" };
    if (hasWarning) return { label: "WARNING", color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "PASSING", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  const overallStatus = getOverallStatus();

  // Keyboard navigation helpers
  const handleKeyDown = (e: React.KeyboardEvent, index: number, list: Parameter[]) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus next item in list
      const nextIndex = index + 1;
      if (nextIndex < list.length) {
        inputsRef.current[list[nextIndex].id]?.focus();
      } else {
        // Find next section
        if (list === physicalParams && chemicalParams.length > 0) {
          inputsRef.current[chemicalParams[0].id]?.focus();
        } else if (list === chemicalParams && microParams.length > 0) {
          inputsRef.current[microParams[0].id]?.focus();
        } else {
          // Focus remarks
          document.getElementById("remarks")?.focus();
        }
      }
    }
  };

  // Load previous report values
  const copyPreviousReport = (prevReport: any) => {
    if (!prevReport?.results) return;
    const newResults: Record<string, string> = {};
    prevReport.results.forEach((res: any) => {
      newResults[res.parameterId] = res.value.toString();
    });
    setResults(newResults);
    setSuccessMsg(`Copied results from batch ${prevReport.batchNumber}.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Build results list to submit
    const resultsToSubmit = filteredParams.map(p => {
      const valStr = results[p.id];
      const val = valStr ? parseFloat(valStr) : 0;
      const validation = getParameterStatus(p, valStr || "0");
      return {
        parameterId: p.id,
        value: val,
        isPass: validation.isPass ?? true
      };
    });

    const reportData = {
      reportType,
      organizationId,
      status,
      batchNumber,
      sampleNumber: sampleNumber || null,
      sampleTime,
      testedBy,
      remarks: remarks || null,
    };

    if (!reportData.organizationId || !reportData.batchNumber || !reportData.testedBy) {
      setError("Organization, Batch Number, and Analyst Name (Tested By) are required.");
      setIsSubmitting(false);
      return;
    }

    const res = initialData
      ? await updateTestReportWithResults(initialData.id, reportData, resultsToSubmit, currentUserId)
      : await createTestReportWithResults(reportData, resultsToSubmit, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      // Clear autosave draft on success
      localStorage.removeItem("bqms_lims_draft");
      router.push(`/test-reports/${res.data.id}`);
    } else {
      setError(res.error || "An unexpected error occurred saving the report.");
    }
  };

  return (
    <div className="space-y-6">
      {hasLocalDraft && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-sm text-amber-900 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>Unfinished report draft data from a previous session was found. Do you want to restore it?</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-amber-300 hover:bg-amber-100" onClick={restoreDraft}>
              Restore Draft
            </Button>
            <Button size="sm" variant="ghost" className="text-amber-800 hover:text-amber-950 hover:bg-amber-100" onClick={clearDraft}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 shadow-sm flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100 shadow-sm flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* LEFT WORKSPACE (75% / 3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Card 1: Sample Information */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 font-heading">1. Sample Information</CardTitle>
              <CardDescription className="text-xs">Physical metadata of the water sample package</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-lg text-sm h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily Register</SelectItem>
                      <SelectItem value="WEEKLY">Weekly Register</SelectItem>
                      <SelectItem value="MONTHLY">Monthly Register</SelectItem>
                      <SelectItem value="PACKAGED_DRINKING_WATER">Complete Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Organization</Label>
                  <Select value={organizationId} onValueChange={setOrganizationId}>
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-lg text-sm h-9">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Batch Number</Label>
                  <Input 
                    value={batchNumber} 
                    onChange={e => setBatchNumber(e.target.value)} 
                    placeholder="e.g. EB26175" 
                    className="border-slate-200 rounded-lg text-sm h-9" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Sample Number</Label>
                  <Input 
                    value={sampleNumber} 
                    onChange={e => setSampleNumber(e.target.value)} 
                    placeholder="e.g. SMPL-001" 
                    className="border-slate-200 rounded-lg text-sm h-9" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Sample Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={sampleTime} 
                    onChange={e => setSampleTime(e.target.value)} 
                    className="border-slate-200 rounded-lg text-sm h-9" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Tested By (Analyst)</Label>
                  <Input 
                    value={testedBy} 
                    onChange={e => setTestedBy(e.target.value)} 
                    placeholder="Analyst Name" 
                    className="border-slate-200 rounded-lg text-sm h-9" 
                    required 
                  />
                </div>

                {/* Extended Lab Metadata fields */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Plant / Unit</Label>
                  <Input value={plant} onChange={e => setPlant(e.target.value)} className="border-slate-200 rounded-lg text-sm h-9" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Production Line</Label>
                  <Input value={productionLine} onChange={e => setProductionLine(e.target.value)} className="border-slate-200 rounded-lg text-sm h-9" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Package Size</Label>
                  <Input value={packageSize} onChange={e => setPackageSize(e.target.value)} className="border-slate-200 rounded-lg text-sm h-9" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Shift</Label>
                  <Select value={shift} onValueChange={setShift}>
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-lg text-sm h-9">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning Shift</SelectItem>
                      <SelectItem value="Evening">Evening Shift</SelectItem>
                      <SelectItem value="Night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Collected By</Label>
                  <Input value={collectedBy} onChange={e => setCollectedBy(e.target.value)} className="border-slate-200 rounded-lg text-sm h-9" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Approved By</Label>
                  <Input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Quality Manager" className="border-slate-200 rounded-lg text-sm h-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Physical Parameters */}
          {physicalParams.length > 0 && (
            <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white animate-in fade-in duration-300">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex justify-between items-center font-heading">
                  <span>2. Physical Parameters</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">BIS IS 14543</Badge>
                </CardTitle>
                <CardDescription className="text-xs">Physical attributes validated immediately at laboratory bench</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {physicalParams.map((param, index) => {
                    const validation = getParameterStatus(param, results[param.id] || "");
                    const isSelectType = param.unit === "Descriptor";
                    return (
                      <div key={param.id} className={`flex flex-col border p-3.5 rounded-xl transition-all ${validation.bg} ${validation.color}`}>
                        <div className="flex justify-between items-start mb-2">
                          <Label className="text-xs font-bold text-slate-855">{param.name}</Label>
                          {results[param.id] && (
                            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border capitalize bg-white/95 shadow-sm">
                              {validation.label || validation.status}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {isSelectType ? (
                            <Select 
                              value={results[param.id] || "0"} 
                              onValueChange={(val) => setResults(prev => ({ ...prev, [param.id]: val }))}
                            >
                              <SelectTrigger className="h-8 text-xs bg-white/95 border-slate-200 rounded-lg w-full">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Agreeable / Clear</SelectItem>
                                <SelectItem value="-2">Disagreeable / Turbid</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="relative flex-1">
                              <Input
                                ref={el => { inputsRef.current[param.id] = el; }}
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={results[param.id] || ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  setResults(prev => ({ ...prev, [param.id]: val }));
                                }}
                                onKeyDown={e => handleKeyDown(e, index, physicalParams)}
                                className="h-8 text-xs bg-white/95 border-slate-200 pr-12 rounded-lg"
                              />
                              <span className="absolute right-2.5 top-2 text-[10px] font-medium text-slate-400 select-none">
                                {param.unit}
                              </span>
                            </div>
                          )}

                          {!isSelectType && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setResults(prev => ({ ...prev, [param.id]: "-1" }))}
                              className="h-8 text-[10px] font-semibold px-2 hover:bg-slate-100 border-slate-200"
                            >
                              BDL
                            </Button>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-2 flex justify-between select-none">
                          <span>Limit: {param.minAcceptable !== null ? `${param.minAcceptable} - ` : ""}{param.maxAcceptable} {param.unit !== "Descriptor" && param.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Chemical Parameters */}
          {chemicalParams.length > 0 && (
            <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white animate-in fade-in duration-300">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 font-heading">3. Chemical Parameters</CardTitle>
                <CardDescription className="text-xs">Chemical parameters with instant range check and automatic validation</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {chemicalParams.map((param, index) => {
                    const validation = getParameterStatus(param, results[param.id] || "");
                    return (
                      <div key={param.id} className={`flex flex-col border p-3.5 rounded-xl transition-all ${validation.bg} ${validation.color}`}>
                        <div className="flex justify-between items-start mb-2">
                          <Label className="text-xs font-bold text-slate-800">{param.name}</Label>
                          {results[param.id] && (
                            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border capitalize bg-white/95 shadow-sm">
                              {validation.label || validation.status}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <div className="relative flex-1">
                            <Input
                              ref={el => { inputsRef.current[param.id] = el; }}
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={results[param.id] || ""}
                              onChange={e => {
                                const val = e.target.value;
                                setResults(prev => ({ ...prev, [param.id]: val }));
                              }}
                              onKeyDown={e => handleKeyDown(e, index, chemicalParams)}
                              className="h-8 text-xs bg-white/95 border-slate-200 pr-12 rounded-lg"
                            />
                            <span className="absolute right-2.5 top-2 text-[10px] font-medium text-slate-400 select-none">
                              {param.unit}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setResults(prev => ({ ...prev, [param.id]: "-1" }))}
                              className="h-8 text-[10px] font-semibold px-2 hover:bg-slate-100 border-slate-200"
                            >
                              BDL
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setResults(prev => ({ ...prev, [param.id]: "-2" }))}
                              className="h-8 text-[10px] font-semibold px-2 hover:bg-slate-100 text-rose-600 border-slate-200"
                            >
                              OSL
                            </Button>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-2 flex justify-between select-none">
                          <span>Limit: &lt;= {param.maxAcceptable} {param.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 4: Microbiological Parameters */}
          {microParams.length > 0 && (
            <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white animate-in fade-in duration-300">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 font-heading">4. Microbiological Parameters</CardTitle>
                <CardDescription className="text-xs">Microbiology records requiring segmented toggle selection</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {microParams.map((param, index) => {
                    const currentVal = results[param.id];
                    const validation = getParameterStatus(param, currentVal || "");

                    return (
                      <div key={param.id} className={`flex items-center justify-between border p-3 rounded-xl transition-all ${validation.bg} ${validation.color}`}>
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-slate-800">{param.name}</Label>
                          <p className="text-[10px] text-slate-400 font-medium">Limit: 0 {param.unit}</p>
                        </div>

                        {/* Segmented Toggles */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setResults(prev => ({ ...prev, [param.id]: "0" }))}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentVal === "0" 
                                ? "bg-white text-emerald-700 shadow-sm border border-slate-200" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            ✅ Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setResults(prev => ({ ...prev, [param.id]: "1" }))}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentVal === "1" 
                                ? "bg-rose-500 text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            ❌ Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setResults(prev => ({ ...prev, [param.id]: "-1" }))}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentVal === "-1" 
                                ? "bg-white text-slate-700 shadow-sm border border-slate-200" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            BDL
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 5: Weekly & Monthly Remarks */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 font-heading">5. Laboratory Remarks</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-xs font-semibold text-slate-600">Lab Analyst Remarks</Label>
                <Input
                  id="remarks"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. All values complied with BIS limits. Package seal intact."
                  className="border-slate-200 rounded-lg text-sm"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT PANEL (25% / 1 col) */}
        <div className="space-y-6">
          
          {/* Quality Indicator Badge */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-6 text-center space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-sans">OVERALL STATUS</span>
              <div className={`inline-block px-8 py-3 rounded-2xl border text-xl font-bold tracking-wider ${overallStatus.color}`}>
                {overallStatus.label}
              </div>
              <p className="text-[11px] text-slate-500">Automatically evaluated as you fill parameter values</p>
            </CardContent>
          </Card>

          {/* Batch Summary */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 font-heading">Batch Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Batch</span>
                <span className="font-semibold text-slate-800">{batchNumber || "Pending"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Product Line</span>
                <span className="font-semibold text-slate-800">{productionLine}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Shift</span>
                <span className="font-semibold text-slate-800">{shift}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Plant Unit</span>
                <span className="font-semibold text-slate-800">{plant}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 font-heading">LIMS Workstation Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {recentReports && recentReports.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyPreviousReport(recentReports[0])}
                  className="w-full justify-start text-xs border-slate-200 rounded-lg hover:bg-slate-100 shadow-sm"
                >
                  <Copy className="mr-2 h-4 w-4 text-slate-500" />
                  Copy Previous Batch Values
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const demoResults: Record<string, string> = {};
                  filteredParams.forEach(p => {
                    if (p.category === "MICROBIOLOGY") {
                      demoResults[p.id] = "0"; // Absent
                    } else if (p.name === "pH") {
                      demoResults[p.id] = "7.2";
                    } else if (p.name === "TDS") {
                      demoResults[p.id] = "120";
                    } else if (p.name === "Turbidity") {
                      demoResults[p.id] = "0.2";
                    } else {
                      demoResults[p.id] = "0";
                    }
                  });
                  setResults(demoResults);
                }}
                className="w-full justify-start text-xs border-slate-200 rounded-lg hover:bg-slate-100 shadow-sm"
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Fill Normal Standard Limits
              </Button>
            </CardContent>
          </Card>

          {/* Reference Limits */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 font-heading">BIS Standard Ranges</CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 font-semibold text-slate-700">
                <span>Parameter</span>
                <span>Standard Range</span>
              </div>
              {filteredParams.map(p => (
                <div key={p.id} className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>{p.name}</span>
                  <span>{p.minAcceptable !== null ? `${p.minAcceptable} - ` : ""}{p.maxAcceptable} {p.unit !== "Descriptor" && p.unit}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Previous Reports Side List */}
          <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 font-heading">Recent Laboratory Runs</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {recentReports && recentReports.length > 0 ? (
                recentReports.map(rep => {
                  const formattedDate = new Date(rep.sampleTime).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div 
                      key={rep.id} 
                      onClick={() => copyPreviousReport(rep)}
                      className="border rounded-xl p-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-2 group shadow-sm bg-white"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-primary group-hover:underline">Batch {rep.batchNumber}</span>
                        <span className="text-slate-400 font-medium">{formattedDate}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>pH: {rep.results.find((r: any) => r.parameter?.name === "pH")?.value || "N/A"}</span>
                        <span>TDS: {rep.results.find((r: any) => r.parameter?.name === "TDS")?.value || "N/A"}</span>
                        <Badge variant="outline" className="px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border-emerald-100">
                          {rep.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 text-xs py-4">No recent runs recorded.</div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* BOTTOM STICKY FOOTER PANEL */}
        <div className="col-span-1 xl:col-span-4 sticky bottom-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200/80 p-4 -mx-4 md:-mx-6 lg:-mx-8 flex justify-between items-center shadow-lg rounded-t-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold select-none hidden md:flex">
            <CornerDownLeft className="h-4 w-4" />
            <span>Press Enter to step down fields</span>
          </div>

          <div className="flex gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/test-reports")}
              className="border-slate-200 rounded-xl px-5 text-slate-600 font-semibold h-10"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setStatus("DRAFT")}
              className="border-slate-200 rounded-xl px-5 text-slate-700 font-semibold hover:bg-slate-50 shadow-sm h-10"
            >
              Save as Draft
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setStatus("SUBMITTED")}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-semibold shadow-md flex items-center gap-2 h-10"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Submit Report</span>
                </>
              )}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
