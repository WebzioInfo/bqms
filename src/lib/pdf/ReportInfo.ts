import { PDF_COLORS } from './PDFTheme';

export function getReportInfo(metadata: Record<string, string> = {}) {
  // Extract and compute fields dynamically
  const reportNo = metadata['Report Number'] || '—';
  const batchNo = metadata['Batch Number'] || '—';
  const sampleCode = metadata['Sample Code'] || batchNo;
  const company = metadata['Company'] || 'N/A';
  const mfgDate = metadata['Production Date'] || '—';
  const sampleTime = metadata['Sample Time'] || '—';
  const reportType = metadata['Report Type'] || '—';
  const status = metadata['Overall Status'] || 'APPROVED';
  
  // Signatories/people involved
  const collectedBy = metadata['Collected By'] || 'QC Team';
  const testedBy = metadata['Tested By'] || 'QC Specialist';
  const verifiedBy = metadata['Verified By'] || 'Lab In-Charge';
  
  // Format current date for report generated
  const generatedDate = metadata['Report Generated'] || new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const shelfLife = metadata['Shelf Life'] || '30 Days';
  const bestBefore = metadata['Best Before'] || (mfgDate !== '—' ? `${mfgDate} (30 Days)` : '—');
  const sampleSource = metadata['Sample Source'] || 'Production Line';
  const location = metadata['Location'] || 'Plant Facility';

  // Construct the public verification URL
  const verifyUrl = `https://bqms.vercel.app/KNOWYOURWATER?batch=${encodeURIComponent(batchNo)}`;

  const tableBody = [
    // Row 1
    [
      { text: 'Sample Code', style: 'metaLabel' },
      { text: sampleCode, style: 'metaValue' },
      { text: 'Report Number', style: 'metaLabel' },
      { text: reportNo, style: 'metaValue' }
    ],
    // Row 2
    [
      { text: 'Customer / Client', style: 'metaLabel' },
      { text: company, style: 'metaValue' },
      { text: 'Collected On', style: 'metaLabel' },
      { text: sampleTime, style: 'metaValue' }
    ],
    // Row 3
    [
      { text: 'Sample Source', style: 'metaLabel' },
      { text: sampleSource, style: 'metaValue' },
      { text: 'Location / Address', style: 'metaLabel' },
      { text: location, style: 'metaValue' }
    ],
    // Row 4
    [
      { text: 'Manufacturing Date', style: 'metaLabel' },
      { text: mfgDate, style: 'metaValue' },
      { text: 'Best Before / Expiry', style: 'metaLabel' },
      { text: bestBefore, style: 'metaValue' }
    ],
    // Row 5
    [
      { text: 'Collected By', style: 'metaLabel' },
      { text: collectedBy, style: 'metaValue' },
      { text: 'Report Generated', style: 'metaLabel' },
      { text: generatedDate, style: 'metaValue' }
    ],
    // Row 6
    [
      { text: 'Report Type', style: 'metaLabel' },
      { text: reportType, style: 'metaValue' },
      { text: 'Report Status', style: 'metaLabel' },
      { 
        text: status, 
        style: 'metaValue', 
        bold: true,
        color: status === 'APPROVED' || status === 'PUBLISHED' || status === 'PASS' ? PDF_COLORS.pass : PDF_COLORS.fail 
      }
    ]
  ];

  return {
    columns: [
      // Left: Metadata Grid
      {
        width: '*',
        table: {
          widths: ['23%', '27%', '23%', '27%'],
          body: tableBody
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => PDF_COLORS.border,
          vLineColor: () => PDF_COLORS.border,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 5,
          paddingBottom: () => 5
        }
      },
      // Right: Certificate QR Code Block
      {
        width: 72,
        stack: [
          {
            qr: verifyUrl,
            fit: 60,
            alignment: 'center'
          },
          {
            text: 'SCAN TO VERIFY',
            fontSize: 5.5,
            bold: true,
            color: PDF_COLORS.secondary,
            alignment: 'center',
            margin: [0, 4, 0, 0]
          },
          {
            text: 'OFFICIAL REPORT',
            fontSize: 4.5,
            color: PDF_COLORS.textMuted,
            alignment: 'center',
            margin: [0, 1, 0, 0]
          }
        ],
        margin: [12, 4, 0, 0]
      }
    ],
    margin: [0, 0, 0, 15]
  };
}
