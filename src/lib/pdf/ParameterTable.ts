import { PDF_COLORS } from './PDFTheme';
import { getStatusBadge } from './StatusBadge';

// standard NABL / BIS laboratory test method references
const METHOD_MAP: Record<string, string> = {
  'ph': 'IS 3025 (Part-11)',
  'tds': 'IS 3025 (Part-16)',
  'turbidity': 'IS 3025 (Part-10)',
  'sulphate': 'IS 3025 (Part-24)',
  'colour': 'IS 3025 (Part-4)',
  'odour': 'IS 3025 (Part-5)',
  'taste': 'IS 3025 (Part-8)',
  'residual free chlorine': 'IS 3025 (Part-26)',
  'alkalinity': 'IS 3025 (Part-23)',
  'chloride': 'IS 3025 (Part-32)',
  'e.coli': 'IS 15185',
  'coliform': 'IS 15185',
  'pseudomonas': 'IS 13428',
  'clostridia': 'IS 13428',
  'aerobic microbial count 22°c': 'IS 5402 (Part-1)',
  'aerobic microbial count 37°c': 'IS 5402 (Part-1)',
  'yeast & mold': 'IS 16069 (Part-1)',
  'yeast and mould': 'IS 16069 (Part-1)'
};

export function getParameterTable(rows: any[][], category: string) {
  // Filter rows belonging to the given category (row[1] is Category)
  const filteredRows = rows.filter(
    row => String(row[1] || '').trim().toUpperCase() === category.toUpperCase()
  );

  if (filteredRows.length === 0) return null;

  // Compile table headers with enterprise styling
  const tableHeaders = [
    { text: 'Sl No', style: 'tableHeader' },
    { text: 'Parameter', style: 'tableHeader', alignment: 'left' },
    { text: 'Unit', style: 'tableHeader' },
    { text: 'Method', style: 'tableHeader' },
    { text: 'Result', style: 'tableHeader' },
    { text: 'Acceptable Range', style: 'tableHeader' },
    { text: 'Status', style: 'tableHeader' },
    { text: 'Remarks', style: 'tableHeader', alignment: 'left' }
  ];

  const tableBody = [tableHeaders];

  filteredRows.forEach((row, index) => {
    const paramName = String(row[0] || '');
    const rawResult = String(row[2] || '');
    const unit = String(row[3] || '');
    const limit = String(row[4] || '');
    const rawStatus = String(row[5] || '');

    // 1. Resolve Method reference
    const lookupKey = paramName.toLowerCase().trim();
    const method = METHOD_MAP[lookupKey] || 'IS 3025';

    // 2. Intelligent cell rendering
    let displayResult: any = rawResult;
    let remarks = 'Within limits';

    const isFail = rawStatus.toUpperCase().includes('FAIL') || 
                   rawStatus.toUpperCase().includes('BELOW') || 
                   rawStatus.toUpperCase().includes('ABOVE') ||
                   (category.toUpperCase() === 'MICROBIOLOGY' && rawResult.toLowerCase().includes('present'));
                   
    const isNotTested = rawResult === 'Not Entered' || rawResult === 'Not Tested' || rawResult === '—' || !rawResult;

    // Unit formatting
    const unitSuffix = (unit && unit !== '—' && unit !== 'Descriptor' && !rawResult.includes(unit)) ? ` ${unit}` : '';

    let resultCellBg = (index % 2 === 1) ? PDF_COLORS.bgZebra : PDF_COLORS.white;
    let statusCellBg = resultCellBg;

    if (isNotTested) {
      displayResult = { text: 'Not Tested', italic: true, color: PDF_COLORS.neutral, alignment: 'center', fontSize: 7.5 };
      remarks = 'Not analyzed';
    } else if (rawResult === '0' && unit === 'mg/L' && (lookupKey.includes('chlorine') || lookupKey.includes('sulphate') || lookupKey.includes('chloride'))) {
      displayResult = {
        stack: [
          { text: 'BDL', bold: true, fontSize: 7.5, color: PDF_COLORS.textDark },
          { text: '✓ Below Limit', fontSize: 6, color: PDF_COLORS.pass, margin: [0, 1, 0, 0] }
        ],
        alignment: 'center'
      };
      remarks = 'Below Detection Limit';
    } else if (isFail) {
      // Failed Result styling: soft red cell fill, crimson text, explicit badge
      resultCellBg = PDF_COLORS.failBg;
      statusCellBg = PDF_COLORS.failBg;

      let label = 'Non-compliant';
      if (rawStatus.toUpperCase().includes('ABOVE') || (lookupKey === 'ph' && parseFloat(rawResult) > 8.5)) {
        label = 'Above Limit';
      } else if (rawStatus.toUpperCase().includes('BELOW')) {
        label = 'Below Limit';
      } else if (category.toUpperCase() === 'MICROBIOLOGY' && rawResult.toLowerCase().includes('present')) {
        label = 'Pathogen Present';
      }

      displayResult = {
        stack: [
          { text: `${rawResult}${unitSuffix}`, bold: true, fontSize: 8, color: PDF_COLORS.fail },
          { text: `✘ ${label}`, fontSize: 6, bold: true, color: PDF_COLORS.fail, margin: [0, 1, 0, 0] }
        ],
        alignment: 'center'
      };
      remarks = category.toUpperCase() === 'MICROBIOLOGY' ? 'Non-conforming (Pathogen Present)' : `Out of range (${label})`;
    } else {
      // Passing Result styling: clean result with subtle green indicator
      let subLabel = '✓ Within limits';
      if (category.toUpperCase() === 'MICROBIOLOGY') {
        if (rawResult.toLowerCase().includes('absent')) {
          subLabel = '✓ Complies';
          remarks = 'Complies with standard';
        }
      } else if (rawResult.toLowerCase() === 'agreeable') {
        subLabel = '✓ Satisfactory';
        remarks = 'Satisfactory';
      }

      displayResult = {
        stack: [
          { text: `${rawResult}${unitSuffix}`, bold: true, fontSize: 7.5, color: PDF_COLORS.textDark },
          { text: subLabel, fontSize: 6, color: PDF_COLORS.pass, margin: [0, 1, 0, 0] }
        ],
        alignment: 'center'
      };
    }

    const rowBg = (index % 2 === 1) ? PDF_COLORS.bgZebra : PDF_COLORS.white;

    tableBody.push([
      { text: String(index + 1), style: 'tableBodyCenter', fillColor: rowBg } as any,
      { text: paramName, style: 'tableBodyBold', fillColor: rowBg } as any,
      { text: unit, style: 'tableBodyCenter', fillColor: rowBg } as any,
      { text: method, style: 'tableBodyCenter', fillColor: rowBg } as any,
      { ...((typeof displayResult === 'string') ? { text: displayResult, style: 'tableBodyCenter' } : displayResult), fillColor: resultCellBg } as any,
      { text: limit, style: 'tableBodyCenter', fillColor: rowBg } as any,
      { ...getStatusBadge(rawStatus), fillColor: statusCellBg } as any,
      { text: remarks, style: 'tableBody', fillColor: rowBg } as any
    ]);
  });

  return {
    table: {
      headerRows: 1,
      dontBreakRows: true,
      widths: [20, '*', 38, 80, 70, 70, 45, 55],
      body: tableBody
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
      vLineWidth: () => 0.5,
      hLineColor: (i: number, node: any) => (i === 0 || i === 1) ? PDF_COLORS.primary : PDF_COLORS.border,
      vLineColor: () => PDF_COLORS.border,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 4,
      paddingBottom: () => 4
    },
    margin: [0, 0, 0, 14]
  };
}
