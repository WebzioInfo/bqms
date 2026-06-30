"use client";

import React, { useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Printer, History, Layers } from "lucide-react";

interface ReportDetailClientProps {
  report: any;
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  useEffect(() => {
    // PDF download is now handled by the API route
  }, []);

  const statusVariants: Record<string, string> = {
    "DRAFT": "bg-slate-100 text-slate-800 border-slate-200",
    "SUBMITTED": "bg-yellow-100 text-yellow-800 border-yellow-250",
    "APPROVED": "bg-emerald-100 text-emerald-800 border-emerald-250",
    "REJECTED": "bg-rose-100 text-rose-800 border-rose-250",
  };

  const getParamStatus = (res: any) => {
    const val = res.value;
    const strVal = res.stringValue;
    const param = res.parameter;
    if (!param) return { status: "PASS", label: "PASS", color: "text-emerald-700 bg-emerald-50 border-emerald-100" };

    if (!res.isPass) {
      if (param.category === "MICROBIOLOGY" && !param.name.includes("Count")) {
        return { status: "FAIL", label: strVal || "PRESENT", color: "text-rose-700 bg-rose-50 border-rose-250" };
      }
      return { status: "FAIL", label: "FAIL", color: "text-rose-700 bg-rose-50 border-rose-250" };
    }

    if (param.category === "MICROBIOLOGY" && !param.name.includes("Count")) {
        return { status: "PASS", label: strVal || "ABSENT", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }

    return { status: "PASS", label: "PASS", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  };

  const getResultsByCategory = () => {
    const results = report.results || [];
    const phys = results.filter((r: any) => r.parameter?.category === "PHYSICAL");
    const chem = results.filter((r: any) => r.parameter?.category === "CHEMICAL");
    const physChem = [...phys, ...chem];
    const micro = results.filter((r: any) => r.parameter?.category === "MICROBIOLOGY");
    return { physChem, micro };
  };

  const { physChem, micro } = getResultsByCategory();

  const renderParameterSection = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <Card className="shadow-sm rounded-xl overflow-hidden border-slate-200 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-2.5">
          <CardTitle className="text-xs font-black uppercase text-slate-800 tracking-wider">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-200 text-slate-500 font-bold select-none">
                <th className="py-2.5 px-4 w-1/3">Parameter</th>
                <th className="py-2.5 px-4 w-1/4">Measured Value</th>
                <th className="py-2.5 px-4 w-1/6">Unit</th>
                <th className="py-2.5 px-4 w-1/6">Acceptable Limit</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((res: any) => {
                const param = res.parameter;
                const status = getParamStatus(res);
                const displayVal = res.stringValue || res.value;

                return (
                  <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50/30 font-medium">
                    <td className="py-2.5 px-4 text-slate-850 font-bold">{param?.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-800 text-sm">
                      {displayVal}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{param?.unit}</td>
                    <td className="py-2.5 px-4 text-slate-400 select-none">
                      {param?.minAcceptable !== null && param?.maxAcceptable !== null
                        ? param.minAcceptable === param.maxAcceptable ? String(param.minAcceptable) : `${param.minAcceptable} - ${param.maxAcceptable}`
                        : param?.minAcceptable !== null ? `>= ${param.minAcceptable}` : `<= ${param?.maxAcceptable}`} 
                    </td>
                    <td className="py-2.5 px-4 text-center select-none">
                      <Badge variant="outline" className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${status.color}`}>
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  };

  const printItems = report.results || [];

  const handleDownloadPDF = async () => {
    try {
      // Dynamically import pdfmake to avoid bloating the client bundle and fix Node.js issues
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
      
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      
      if (pdfMake && pdfFonts && pdfFonts.pdfMake) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      const metadata: Record<string, string> = {
        "Report Number": report.reportNumber || report.id.substring(0, 8).toUpperCase(),
        "Company": report.organization?.name || "N/A",
        "Batch Number": report.batchNumber || "N/A",
        "Production Date": report.productionDate ? format(new Date(report.productionDate), "dd MMM yyyy") : "N/A",
        "Sample Time": report.sampleTime ? format(new Date(report.sampleTime), "dd MMM yyyy, hh:mm a") : "N/A",
        "Report Type": report.reportType,
        "Collected By": report.collectedBy || "N/A",
        "Tested By": report.testedBy || "N/A",
        "Verified By": report.verifiedBy || "N/A",
        "Overall Status": report.status,
      };

      if (report.remarks) metadata["Remarks"] = report.remarks;

      const headers = ["Parameter", "Category", "Result", "Unit", "Standard", "Status"];
      const rows = (report.results || []).map((res: any) => {
        const p = res.parameter;
        if (!p) return [];

        let standardStr = "—";
        if (p.minAcceptable !== null && p.maxAcceptable !== null) {
          standardStr = p.minAcceptable === p.maxAcceptable ? String(p.minAcceptable) : `${p.minAcceptable} - ${p.maxAcceptable}`;
        } else if (p.minAcceptable !== null) {
          standardStr = `>= ${p.minAcceptable}`;
        } else if (p.maxAcceptable !== null) {
          standardStr = `<= ${p.maxAcceptable}`;
        }

        let statusStr = "PASS";
        if (!res.isPass) statusStr = "FAIL";

        return [p.name, p.category, res.stringValue || String(res.value || 0), p.unit || "", standardStr, statusStr];
      }).filter((r: string[]) => r.length > 0);

      const documentDefinition: any = {
        content: [
          { text: "WATER QUALITY CONTROL TEST CERTIFICATE", style: "header" },
          { text: "\n" }
        ],
        styles: {
          header: { fontSize: 18, bold: true, alignment: "center" },
          tableHeader: { bold: true, fillColor: "#f2f2f2" }
        }
      };

      Object.entries(metadata).forEach(([k, v]) => {
        documentDefinition.content.push({ text: `${k}: ${v}`, margin: [0, 0, 0, 5] });
      });
      documentDefinition.content.push({ text: "\n" });

      const tableBody = [
        headers.map(h => ({ text: h, style: "tableHeader" })),
        ...rows.map(row => row.map((cell: any) => String(cell || "")))
      ];

      documentDefinition.content.push({
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill("*"),
          body: tableBody
        }
      });

      // Let pdfmake handle the download directly in the browser
      pdfMake.createPdf(documentDefinition).download(`report_${report.batchNumber || report.id}.pdf`);
      
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <>
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
                Report No: <span className="font-mono">{report.reportNumber || report.id.substring(0,8).toUpperCase()}</span>
              </h2>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="h-8 border-slate-250 text-xs font-bold rounded-lg px-4 hover:bg-slate-50 flex items-center gap-1.5">
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 space-y-4">
            <Card className="shadow-sm rounded-xl overflow-hidden border-slate-200 bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-2.5">
                <CardTitle className="text-xs font-black uppercase text-slate-800 tracking-wider flex justify-between items-center">
                  <span>Production Information</span>
                  <Badge variant="outline" className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider select-none ${statusVariants[report.status] || ""}`}>
                    {report.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4 text-xs">
                  <div className="border-b pb-1">
                    <dt className="text-slate-400 font-bold select-none uppercase text-[9px] tracking-wider mb-0.5">Production Date</dt>
                    <dd className="font-bold text-slate-800">{report.productionDate ? format(new Date(report.productionDate), "dd MMMM yyyy") : "N/A"}</dd>
                  </div>
                  <div className="border-b pb-1">
                    <dt className="text-slate-400 font-bold select-none uppercase text-[9px] tracking-wider mb-0.5">Batch Number</dt>
                    <dd className="font-bold text-slate-800 font-mono text-sm">{report.batchNumber || "N/A"}</dd>
                  </div>
                  <div className="border-b pb-1">
                    <dt className="text-slate-400 font-bold select-none uppercase text-[9px] tracking-wider mb-0.5">Sample Collection Time</dt>
                    <dd className="font-bold text-slate-800">{report.sampleTime ? format(new Date(report.sampleTime), "dd MMMM yyyy, hh:mm a") : "N/A"}</dd>
                  </div>
                  <div className="border-b pb-1">
                    <dt className="text-slate-400 font-bold select-none uppercase text-[9px] tracking-wider mb-0.5">Report Type</dt>
                    <dd className="font-bold text-slate-800">{report.reportType}</dd>
                  </div>
                  <div className="border-b pb-1">
                    <dt className="text-slate-400 font-bold select-none uppercase text-[9px] tracking-wider mb-0.5">Collected By</dt>
                    <dd className="font-bold text-slate-850">{report.collectedBy || "N/A"}</dd>
                  </div>
                  <div className="border-b pb-1">
                    <dt className="text-slate-400 font-bold select-none uppercase text-[9px] tracking-wider mb-0.5">Verified By</dt>
                    <dd className="font-bold text-slate-850">{report.verifiedBy || "N/A"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {renderParameterSection("Physical & Chemical Parameters", physChem)}
            {renderParameterSection("Microbiological Parameters", micro)}

            {report.remarks && (
              <Card className="shadow-sm rounded-xl overflow-hidden border-slate-200 bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-2.5">
                  <CardTitle className="text-xs font-black uppercase text-slate-800 tracking-wider">Remarks</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs font-medium text-slate-700 bg-slate-50/30 leading-relaxed font-sans">
                  {report.remarks}
                </CardContent>
              </Card>
            )}
            
            {report.attachments && report.attachments.length > 0 && (
              <Card className="shadow-sm rounded-xl overflow-hidden border-slate-200 bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-2.5">
                  <CardTitle className="text-xs font-black uppercase text-slate-800 tracking-wider">Attachments</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {report.attachments.map((att: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-slate-50 py-1 px-3 rounded-md">{att}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="xl:col-span-1 space-y-4 select-none">
            <Card className="shadow-sm rounded-xl border-slate-200 bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2.5 px-4 flex flex-row items-center gap-1.5">
                <History className="h-4 w-4 text-sky-700" />
                <CardTitle className="text-xs font-bold text-slate-850 uppercase tracking-wider">Audit Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="relative border-l border-slate-200 pl-4 space-y-4 text-xs font-medium font-sans">
                  <div className="relative">
                    <span className="absolute -left-[20px] top-0.5 bg-sky-100 border border-sky-200 rounded-full h-2.5 w-2.5"></span>
                    <p className="text-[10px] text-slate-400 font-bold select-none uppercase tracking-wide">Last Updated</p>
                    <p className="text-slate-800 font-bold">{format(new Date(report.updatedAt), "dd MMM yyyy, hh:mm a")}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[20px] top-0.5 bg-emerald-100 border border-emerald-250 rounded-full h-2.5 w-2.5"></span>
                    <p className="text-[10px] text-slate-400 font-bold select-none uppercase tracking-wide">Created</p>
                    <p className="text-slate-800 font-bold">{format(new Date(report.createdAt), "dd MMM yyyy, hh:mm a")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


    </>
  );
}
