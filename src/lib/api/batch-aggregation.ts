import prisma from "@/lib/prisma";

export async function aggregateBatchData(organizationId: string, batchNumber: string) {
  // 1. Fetch the Water Test Report
  const report = await prisma.waterTestReport.findFirst({
    where: {
      organizationId,
      batchNumber,
      isActive: true
    },
    include: {
      results: {
        include: {
          parameter: true
        }
      }
    }
  });

  if (!report) {
    return null;
  }

  // 2. Fetch the Company Organization details
  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  });

  if (!org) {
    return null;
  }

  // 3. Fetch the Certificate linked to this report
  const certificate = await prisma.certificate.findFirst({
    where: {
      organizationId,
      reportId: report.id,
      isActive: true
    }
  });

  // Calculate overall report quality status from its parameters
  const hasFail = report.results.some(
    r => r.qualityStatus === "FAIL" || (!r.qualityStatus && !r.isPass)
  );
  const hasWarning = report.results.some(r => r.qualityStatus === "WARNING");
  const overallStatus = hasFail ? "FAIL" : hasWarning ? "WARNING" : "PASS";

  const mappedParameters = report.results.map(r => ({
    parameter: r.parameter.name,
    value: r.value !== null && r.value !== undefined ? r.value : (r.stringValue || "—"),
    status: r.qualityStatus || (r.isPass ? "PASS" : "FAIL")
  }));

  let certExtra = { certificateNumber: `CERT-${report.id.substring(0, 5).toUpperCase()}`, standard: "BIS IS 14543" };
  if (certificate) {
    if (certificate.certificateUrl && certificate.certificateUrl.startsWith("{")) {
      try {
        certExtra = JSON.parse(certificate.certificateUrl);
      } catch (e) {}
    } else {
      certExtra.certificateNumber = certificate.id.substring(0, 8).toUpperCase();
    }
  }

  return {
    company: {
      name: org.name,
      address: org.address || "N/A",
      licenceNumber: org.licenseNumber || "N/A"
    },
    batch: {
      batchNumber: report.batchNumber,
      productionDate: report.productionDate ? report.productionDate.toISOString().split("T")[0] : report.sampleTime ? report.sampleTime.toISOString().split("T")[0] : "N/A",
      product: report.reportType === "DAILY" ? "Packaged Drinking Water" : report.reportType.replace(/_/g, " "),
      packageSize: "1 Litre" // standard default
    },
    testReport: {
      reportNumber: `RPT-${report.id.substring(0, 8).toUpperCase()}`,
      overallStatus,
      testedBy: report.testedBy || "Quality Control Inspector",
      approvedBy: report.verifiedBy || "Factory Quality Manager",
      remarks: report.remarks || "All parameters compliant.",
      parameters: mappedParameters
    },
    certificate: certificate ? {
      certificateNumber: certExtra.certificateNumber,
      status: certificate.status
    } : null,
    licence: {
      number: org.licenseNumber || "N/A",
      status: org.isActive ? "VALID" : "INVALID"
    }
  };
}
