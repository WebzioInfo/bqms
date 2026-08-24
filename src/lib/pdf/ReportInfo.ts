import { PDF_COLORS } from './PDFTheme';

export function getReportInfo(metadata: Record<string, string> = {}) {
  // Extract fields
  const reportNo = metadata['Report Number'] || '—';
  const batchNo = metadata['Batch Number'] || '—';
  const sampleCode = metadata['Sample Code'] || batchNo;
  const company = metadata['Customer / Client'] || metadata['Company'] || 'N/A';
  const mfgDate = metadata['Production Date'] || '—';
  const sampleTime = metadata['Sample Time'] || metadata['Collected On'] || '—';
  const reportType = metadata['Report Type'] || '—';
  const status = metadata['Overall Status'] || metadata['Report Status'] || 'APPROVED';
  
  const collectedBy = metadata['Collected By'] || 'QC Team';
  const testedBy = metadata['Tested By'] || 'QC Specialist';
  const verifiedBy = metadata['Verified By'] || 'Lab In-Charge';
  
  const generatedDate = metadata['Report Generated'] || new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const bestBefore = metadata['Best Before'] || (mfgDate !== '—' ? `${mfgDate} (30 Days)` : '—');
  const sampleSource = metadata['Sample Source'] || 'Production Line';
  const location = metadata['Location'] || 'Plant Facility';
  const customerAddress = metadata['Customer Address'] || metadata['Address'] || '';

  const verifyUrl = `https://bqms.vercel.app/KNOWYOURWATER?batch=${encodeURIComponent(batchNo)}`;

  const labelStyle = { fontSize: 7.5, bold: true, color: '#475569' };
  const valueStyle = { fontSize: 7.5, color: '#0F172A' };

  const tableBody: any[][] = [
    // Row 1
    [
      { text: 'Sample Code', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: sampleCode, ...valueStyle, bold: true, fillColor: PDF_COLORS.bgCard },
      { text: 'Report Number', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: reportNo, ...valueStyle, bold: true, fillColor: PDF_COLORS.bgCard }
    ],
    // Row 2
    [
      { text: 'Customer / Client', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: company, ...valueStyle, fillColor: PDF_COLORS.bgCard },
      { text: 'Collected On', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: sampleTime, ...valueStyle, fillColor: PDF_COLORS.bgCard }
    ],
    // Row 3
    [
      { text: 'Sample Source', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: sampleSource, ...valueStyle, fillColor: PDF_COLORS.bgCard },
      { text: 'Location', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: location, ...valueStyle, fillColor: PDF_COLORS.bgCard }
    ],
    // Row 4
    [
      { text: 'Manufacturing Date', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: mfgDate, ...valueStyle, fillColor: PDF_COLORS.bgCard },
      { text: 'Best Before', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: bestBefore, ...valueStyle, fillColor: PDF_COLORS.bgCard }
    ],
    // Row 5
    [
      { text: 'Collected By', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: collectedBy, ...valueStyle, fillColor: PDF_COLORS.bgCard },
      { text: 'Report Generated', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: generatedDate, ...valueStyle, fillColor: PDF_COLORS.bgCard }
    ],
    // Row 6
    [
      { text: 'Report Type', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: reportType, ...valueStyle, fillColor: PDF_COLORS.bgCard },
      { text: 'Report Status', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { 
        text: status, 
        fontSize: 7.5,
        bold: true,
        color: (status === 'APPROVED' || status === 'PUBLISHED' || status === 'PASS') ? PDF_COLORS.pass : PDF_COLORS.fail,
        fillColor: PDF_COLORS.bgCard
      }
    ]
  ];

  // Integrate Customer Address if present
  if (customerAddress) {
    tableBody.push([
      { text: 'Customer Address', ...labelStyle, fillColor: PDF_COLORS.bgCard },
      { text: customerAddress, ...valueStyle, colSpan: 3, fillColor: PDF_COLORS.bgCard },
      {},
      {}
    ]);
  }

  return {
    columns: [
      // Left: Integrated Enterprise Metadata Grid Card
      {
        width: '*',
        table: {
          widths: ['22%', '28%', '22%', '28%'],
          body: tableBody
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => PDF_COLORS.border,
          vLineColor: () => PDF_COLORS.border,
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      },
      // Right: Enterprise QR Code Card
      {
        width: 76,
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    qr: verifyUrl,
                    fit: 56,
                    alignment: 'center',
                    margin: [0, 2, 0, 4]
                  },
                  {
                    text: 'SCAN TO VERIFY',
                    fontSize: 5.5,
                    bold: true,
                    color: PDF_COLORS.secondary,
                    alignment: 'center',
                    characterSpacing: 0.5
                  },
                  {
                    text: 'OFFICIAL REPORT',
                    fontSize: 4.5,
                    color: PDF_COLORS.textMuted,
                    alignment: 'center',
                    margin: [0, 1, 0, 0]
                  }
                ],
                fillColor: PDF_COLORS.bgCard,
                margin: [4, 4, 4, 4]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => PDF_COLORS.border,
          vLineColor: () => PDF_COLORS.border
        },
        margin: [10, 0, 0, 0]
      }
    ],
    margin: [0, 0, 0, 14]
  };
}
