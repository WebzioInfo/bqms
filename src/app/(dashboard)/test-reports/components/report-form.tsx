"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReportFormData, ParameterDef, STATIC_PARAMETERS, ResultValue } from "./types";
import { ProductionInfoSection } from "./ProductionInfoSection";
import { PhysicalParametersTable } from "./PhysicalParametersTable";
import { MicrobiologyTable } from "./MicrobiologyTable";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { AttachmentsSection } from "./AttachmentsSection";
import { Save, Send } from "lucide-react";
import { createTestReportWithResults, updateTestReportWithResults } from "@/app/actions/report";

interface Props {
  organizationId: string;
  initialData?: any;
}

export function ReportForm({ organizationId, initialData }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

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
            isPass: res.isPass
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

  const updateData = (updates: Partial<ReportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateResult = (parameterId: string, value: string, stringValue: string = "") => {
    setFormData(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [parameterId]: {
          parameterId,
          value,
          stringValue,
          isPass: false, // This will be calculated server-side or right before submit
        }
      }
    }));
  };

  const calculatePassStatus = (param: ParameterDef, result: any) => {
    if (param.category === "MICROBIOLOGY" && !param.name.includes("Count")) {
        if (result.stringValue === "Absent") return true;
        if (result.stringValue === "Present") return false;
    }
    const num = parseFloat(result.value);
    if (isNaN(num)) return false; // Default fail if not calculable
    const min = param.minAcceptable ?? -Infinity;
    const max = param.maxAcceptable ?? Infinity;
    return num >= min && num <= max;
  };

  const handleSave = async (status: "DRAFT" | "SUBMITTED") => {
    // Validation
    if (!formData.productionDate || !formData.batchNumber) {
      alert("Validation Error: Production Date and Batch Number are required.");
      return;
    }

    const resultsArray = Object.values(formData.results).filter(r => r.value !== "" || r.stringValue !== "");
    if (resultsArray.length === 0) {
      alert("Validation Error: At least one parameter must be entered.");
      return;
    }

    setIsSaving(true);
    
    try {
      const finalResults = resultsArray.map(r => {
        const param = STATIC_PARAMETERS.find(p => p.id === r.parameterId);
        return {
          ...r,
          isPass: param ? calculatePassStatus(param, r) : false
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
        alert(`Success: Report ${status === "DRAFT" ? "saved as draft" : "submitted"} successfully.`);
        router.push("/test-reports");
      } else {
        alert(`Error: ${result.error || "Failed to save report."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error: An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 mt-6">
      <div className="flex-1 space-y-6">
        <ProductionInfoSection data={formData} updateData={updateData} />
        <PhysicalParametersTable parameters={STATIC_PARAMETERS} data={formData} updateResult={updateResult} />
        <MicrobiologyTable parameters={STATIC_PARAMETERS} data={formData} updateResult={updateResult} />
        <AttachmentsSection data={formData} updateData={updateData} />
      </div>
      
      <div className="w-full xl:w-80 flex-shrink-0">
        <div className="sticky top-6 space-y-6">
          <ReportSummaryCard data={formData} parameters={STATIC_PARAMETERS} />
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-center h-12" 
              onClick={() => handleSave("DRAFT")}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button 
              className="w-full justify-center h-12 bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleSave("SUBMITTED")}
              disabled={isSaving}
            >
              <Send className="w-4 h-4 mr-2" /> Submit Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
