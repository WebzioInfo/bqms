import { ReportGeneratorService, ReportData } from "./src/lib/reports";

const reportData: ReportData = {
  title: "WATER QUALITY CONTROL TEST CERTIFICATE",
  metadata: { test: "123" },
  headers: ["A", "B"],
  rows: [["1", "2"]],
};

async function main() {
  try {
    const buffer = await ReportGeneratorService.generate(reportData, "pdf");
    console.log("Success! Buffer size:", buffer.length);
  } catch (error) {
    console.error("Failed to generate PDF:");
    console.error(error);
  }
}

main();
