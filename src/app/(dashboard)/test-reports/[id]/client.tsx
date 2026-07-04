"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import { ReportForm } from "../components/report-form";
import { STATIC_PARAMETERS } from "../components/types";
import { generateReportDefinition } from "@/lib/pdf";

interface ReportDetailClientProps {
  report: any;
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  const handleDownloadPDF = async () => {
    try {
      // Dynamically import pdfmake to avoid bloating the client bundle and fix Node.js issues
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
      
      const pdfMake = (pdfMakeModule.default || pdfMakeModule) as any;
      const pdfFonts = (pdfFontsModule.default || pdfFontsModule) as any;
      
      if (pdfMake && pdfFonts && pdfFonts.pdfMake) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      const metadata: Record<string, string> = {
        "Report Number": report.reportNumber || report.id.substring(0, 8).toUpperCase(),
        "Company": report.organization?.name || "N/A",
        "Batch Number": report.batchNumber || "—",
        "Production Date": report.productionDate ? format(new Date(report.productionDate), "dd MMM yyyy") : "—",
        "Sample Time": report.sampleTime ? format(new Date(report.sampleTime), "dd MMM yyyy, hh:mm a") : "—",
        "Report Type": report.reportType || "—",
        "Collected By": report.collectedBy || "—",
        "Tested By": report.testedBy || "—",
        "Verified By": report.verifiedBy || "—",
        "Overall Status": report.status,
      };

      if (report.remarks || report.remarks === "") {
        metadata["Remarks"] = report.remarks || "—";
      } else {
        metadata["Remarks"] = "—";
      }

      const headers = ["Parameter", "Category", "Result", "Unit", "Standard", "Status"];
      const rows = STATIC_PARAMETERS.map((p) => {
        const res = (report.results || []).find(
          (r: any) => r.parameter?.name === p.name || r.parameterId === p.id
        );

        let displayVal = "—";
        let statusStr = "—";

        if (res) {
          displayVal = res.stringValue || (res.value !== null && res.value !== undefined ? String(res.value) : "—");
          statusStr = res.qualityStatus || (res.isPass ? "PASS" : "FAIL");
        } else {
          // Default display rules
          if (p.category === "MICROBIOLOGY") {
            displayVal = "Not Entered";
          } else if (p.unit === "Descriptor" || p.id === "Colour" || p.id === "Odour" || p.id === "Taste") {
            displayVal = "—";
          } else {
            displayVal = "0"; // Numeric
          }
          statusStr = "—";
        }

        let standardStr = "—";
        if (p.minAcceptable !== null && p.maxAcceptable !== null) {
          standardStr = p.minAcceptable === p.maxAcceptable ? String(p.minAcceptable) : `${p.minAcceptable} - ${p.maxAcceptable}`;
        } else if (p.minAcceptable !== null) {
          standardStr = `>= ${p.minAcceptable}`;
        } else if (p.maxAcceptable !== null) {
          standardStr = `<= ${p.maxAcceptable}`;
        }

        return [p.name, p.category, displayVal, p.unit || "", standardStr, statusStr];
      });

      const documentDefinition = generateReportDefinition({
        title: "WATER QUALITY CONTROL TEST CERTIFICATE",
        metadata,
        headers,
        rows
      });

      // Let pdfmake handle the download directly in the browser
      pdfMake.createPdf(documentDefinition).download(`report_${report.batchNumber || report.id}.pdf`);
      
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <Link href="/test-reports">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <span className="text-[10px] font-bold text-sky-850 uppercase tracking-widest block font-sans">
              WATER TEST REPORT
            </span>
            <h2 className="text-base font-black text-slate-800 font-sans tracking-tight">
              Report No: <span className="font-mono">{report.reportNumber || report.id.substring(0, 8).toUpperCase()}</span>
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPDF} 
            className="h-8 border-slate-250 text-xs font-bold rounded-lg px-4 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Download PDF</span>
          </Button>
          {report.status === "DRAFT" && (
            <Link href={`/test-reports/${report.id}/edit`}>
              <Button className="h-8 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg px-4 shadow-md flex items-center gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <ReportForm 
        initialData={report} 
        organizationId={report.organizationId} 
        disabled={true} 
      />
    </div>
  );
}
