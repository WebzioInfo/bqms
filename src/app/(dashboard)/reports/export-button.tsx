"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportCsvButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (!data || data.length === 0) return;
    
    // Convert JSON to CSV
    const headers = ["Organization Name", "Entity Type", "Total Certificates", "Batches Tracked", "Inspections", "Trust Score"];
    const csvRows = [headers.join(",")];
    
    for (const row of data) {
      const values = [
        `"${row.name}"`,
        `"${row.type}"`,
        row._count?.certificates || 0,
        row._count?.batches || 0,
        row._count?.inspections || 0,
        row.trustScore || "N/A"
      ];
      csvRows.push(values.join(","));
    }
    
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create a link to trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `organization_report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" className="shadow-sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
