"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { FileText, Eye, Edit, Printer, Search, Calendar, User, SlidersHorizontal, Download } from "lucide-react";
import { PremiumSpinner } from "@/components/ui/Spinner";

interface TestReportsClientProps {
  data: any[];
}

export function TestReportsClient({ data }: TestReportsClientProps) {
  // Filter states
  const [search, setSearch] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeReportForPendingModal, setActiveReportForPendingModal] = useState<any | null>(null);
  const [resultFilter, setResultFilter] = useState("ALL");

  // Helper: Extract parameter result
  const getParamResult = (report: any, paramName: string) => {
    if (!report.results) return "—";
    const res = report.results.find((r: any) => r.parameter?.name === paramName);
    if (!res) return "—";
    return res.stringValue || res.value;
  };

  const getMicrobiologyStatus = (report: any) => {
    if (!report.results) return "PENDING";
    const microResults = report.results.filter((r: any) => r.parameter?.category === "MICROBIOLOGY");
    if (microResults.length === 0) return "—";
    const hasFail = microResults.some((r: any) => r.isPass === false);
    return hasFail ? "FAIL" : "PASS";
  };

  const getOverallResult = (report: any) => {
    if (!report.results || report.results.length === 0) return { label: "PENDING", color: "bg-slate-100 text-slate-700 border-slate-200" };
    const hasFail = report.results.some((res: any) => res.qualityStatus === "FAIL" || (!res.qualityStatus && res.isPass === false));
    if (hasFail) return { label: "FAIL", color: "bg-rose-50 text-rose-750 border-rose-200" };
    const hasWarning = report.results.some((res: any) => res.qualityStatus === "WARNING");
    if (hasWarning) return { label: "WARNING", color: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "PASS", color: "bg-emerald-50 text-emerald-700 border-emerald-250" };
  };

  // Filter application
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const repNo = item.reportNumber || item.id.substring(0, 8).toUpperCase();
      if (search && !repNo.toLowerCase().includes(search.toLowerCase())) return false;
      if (reportTypeFilter !== "ALL" && item.reportType !== reportTypeFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (batchFilter && !item.batchNumber.toLowerCase().includes(batchFilter.toLowerCase())) return false;
      
      const itemDate = item.productionDate ? new Date(item.productionDate) : new Date(item.sampleTime);
      if (dateFromFilter && itemDate < new Date(dateFromFilter)) return false;
      if (dateToFilter && itemDate > new Date(dateToFilter)) return false;

      if (resultFilter !== "ALL") {
        const overall = getOverallResult(item).label;
        if (overall !== resultFilter) return false;
      }

      return true;
    });
  }, [data, search, reportTypeFilter, statusFilter, batchFilter, dateFromFilter, dateToFilter, resultFilter]);

  // Pagination calculation
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, reportTypeFilter, statusFilter, batchFilter, dateFromFilter, dateToFilter, pageSize]);

  const triggerFilterLoader = useCallback(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cancel = triggerFilterLoader();
    return cancel;
  }, [search, reportTypeFilter, statusFilter, batchFilter, dateFromFilter, dateToFilter, resultFilter, currentPage, pageSize, triggerFilterLoader]);

  const statusVariants: Record<string, string> = {
    "DRAFT": "bg-gray-150 text-gray-700 border-gray-200",
    "SUBMITTED": "bg-sky-50 text-sky-800 border-sky-250",
    "APPROVED": "bg-emerald-50 text-emerald-800 border-emerald-250",
    "REJECTED": "bg-rose-50 text-rose-800 border-rose-250",
  };

  const resetFilters = () => {
    setSearch("");
    setReportTypeFilter("ALL");
    setStatusFilter("ALL");
    setBatchFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setResultFilter("ALL");
  };

  const exportCSV = () => {
    const headers = ["Report Number", "Production Date", "Batch Number", "Report Type", "Overall Status", "pH", "TDS", "Microbiology", "Created By", "Created Date"];
    const rows = filteredData.map(report => [
      report.reportNumber || report.id.substring(0, 8).toUpperCase(),
      report.productionDate ? format(new Date(report.productionDate), "yyyy-MM-dd") : "—",
      report.batchNumber,
      report.reportType,
      getOverallResult(report).label,
      getParamResult(report, "pH"),
      getParamResult(report, "TDS"),
      getMicrobiologyStatus(report),
      report.createdBy,
      format(new Date(report.createdAt), "yyyy-MM-dd")
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "water_test_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm select-none">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search & Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="h-7 text-[10px] font-bold">
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-[10px] font-bold">
              <Printer className="h-3 w-3 mr-1" /> Print List
            </Button>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[10px] h-7 text-slate-500 font-bold hover:text-slate-800">
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Report Number Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Report No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg"
            />
          </div>

          {/* Batch Code */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Batch..."
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg"
            />
          </div>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg"
            />
          </div>

          {/* Report Type */}
          <Select value={reportTypeFilter} onValueChange={(val) => setReportTypeFilter(val || "ALL")}>
            <SelectTrigger className="h-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Four Hourly pH">Four Hourly pH</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
            <SelectTrigger className="h-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Result Filter */}
          <Select value={resultFilter} onValueChange={(val) => setResultFilter(val || "ALL")}>
            <SelectTrigger className="h-8 text-xs bg-slate-50/50 border-slate-300 rounded-lg">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Results</SelectItem>
              <SelectItem value="PASS">Pass</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="FAIL">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Register */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
        {isFiltering && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center animate-in fade-in duration-150 select-none">
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-lg animate-in zoom-in-95 duration-150">
              <PremiumSpinner size="h-5 w-5" />
              <span className="text-xs font-bold text-slate-750 tracking-tight">Updating List...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 font-sans select-none">
                <th className="py-3 px-4">Report No</th>
                <th className="py-3 px-4">Production Date</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">pH</th>
                <th className="py-3 px-4">Pending Tests</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold text-xs select-none">
                    No reports match the selected parameters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((report) => {
                  const repNo = report.reportNumber || report.id.substring(0, 8).toUpperCase();
                  const result = getOverallResult(report);

                  return (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-sans text-xs">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-sky-600 shrink-0" />
                          <span className="font-mono">{repNo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {report.productionDate ? format(new Date(report.productionDate), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                        {report.batchNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono font-medium">
                        {getParamResult(report, "pH")}
                      </td>
                      <td className="py-3 px-4 select-none">
                        {(() => {
                          const pendingList = report.pendingTests || [];
                          const activePending = pendingList.filter((t: any) => t.status !== "COMPLETED");
                          const pendingCount = activePending.length;

                          if (pendingCount > 0) {
                            return (
                              <button 
                                onClick={() => setActiveReportForPendingModal(report)}
                                className="px-2 py-0.5 rounded border text-[9px] font-black uppercase bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors"
                              >
                                {pendingCount} Pending
                              </button>
                            );
                          } else {
                            return (
                              <span className="px-2 py-0.5 rounded border text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                                Completed
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {format(new Date(report.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="py-3 px-4 select-none">
                        <Badge variant="outline" className={`px-2 py-0.5 rounded border text-[9px] font-black tracking-wider uppercase ${statusVariants[report.status] || ""}`}>
                          {report.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 select-none">
                        <Badge variant="outline" className={`px-2 py-0.5 rounded border text-[9px] font-black tracking-wider uppercase ${result.color}`}>
                          {result.label}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex justify-end gap-2 select-none items-center">
                          <Link href={`/test-reports/${report.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-sky-50 text-slate-500 hover:text-sky-700" title="View Report">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/test-reports/${report.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-sky-50 text-slate-500 hover:text-sky-700" title="Edit Report">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Local Pagination controls */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 border-t border-slate-200 select-none bg-slate-50/30 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 mb-2 sm:mb-0">
              <span>Show</span>
              <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(Number(val))}>
                <SelectTrigger className="h-7 w-16 text-xs bg-white border-slate-300 rounded-md">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>records per page</span>
              <span className="ml-4 font-normal text-slate-400">Total: {filteredData.length} records</span>
            </div>

            <div className="flex gap-1.5 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-7 text-[10px] font-bold border-slate-200 rounded-md shadow-sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-7 text-[10px] font-bold border-slate-200 rounded-md shadow-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {activeReportForPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 font-sans text-left">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pending Incubations</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">Report No: RPT-{activeReportForPendingModal.reportNumber || activeReportForPendingModal.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setActiveReportForPendingModal(null)}
                className="text-slate-450 hover:text-slate-700 text-sm font-bold p-1 hover:bg-slate-100 rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              {(activeReportForPendingModal.pendingTests || []).map((test: any) => {
                let badgeColor = "bg-slate-55 text-slate-500 border-slate-200";
                if (test.status === "COMPLETED") badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
                else if (test.status === "OVERDUE") badgeColor = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-black";
                else if (test.status === "DUE_SOON") badgeColor = "bg-amber-50 text-amber-700 border-amber-250 font-bold";
                else if (test.status === "WAITING") badgeColor = "bg-sky-50 text-sky-700 border-sky-200 font-semibold";

                return (
                  <div key={test.id} className="flex justify-between items-center border-b pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-slate-700 block text-xs">{test.parameterName}</span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">
                        Due: {format(new Date(test.dueAt), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                    <Badge variant="outline" className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider ${badgeColor}`}>
                      {test.status.replace("_", " ")}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-8 rounded-lg" onClick={() => setActiveReportForPendingModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
