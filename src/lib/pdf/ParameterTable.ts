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
  // Filter rows belonging to the given category (row[1] is the Category)
  const filteredRows = rows.filter(
    row => String(row[1] || '').trim().toUpperCase() === category.toUpperCase()
  );

  if (filteredRows.length === 0) return null;

  // Compile table headers
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

  // Map rows
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

    // 2. Intelligent cell rendering for Results
    let displayResult: any = rawResult;
    let remarks = '—';

    const isFail = rawStatus.toUpperCase().includes('FAIL') || rawStatus.toUpperCase().includes('BELOW') || rawStatus.toUpperCase().includes('ABOVE');
    const isWarning = rawStatus.toUpperCase().includes('WARNING');
    const isNotTested = rawResult === 'Not Entered' || rawResult === 'Not Tested' || rawResult === '—' || !rawResult;

    if (isNotTested) {
      displayResult = { text: 'Not Tested', italic: true, color: PDF_COLORS.neutral };
      remarks = 'Not analyzed';
    } else if (rawResult === '0' && unit === 'mg/L' && (lookupKey.includes('chlorine') || lookupKey.includes('sulphate') || lookupKey.includes('chloride'))) {
      displayResult = 'BDL'; // Below Detection Limit
      remarks = 'Below Detection Limit';
    } else {
      // Append unit to result text to look certified e.g. "78.3 mg/L"
      const unitSuffix = (unit && unit !== '—' && unit !== 'Descriptor' && !rawResult.includes(unit)) ? ` ${unit}` : '';
      
      if (isFail) {
        let label = 'Below Minimum';
        let labelColor = PDF_COLORS.warning;
        
        if (rawStatus.toUpperCase().includes('ABOVE') || lookupKey === 'ph' && parseFloat(rawResult) > 8.5) {
          label = 'Above Limit';
          labelColor = PDF_COLORS.fail;
        } else if (rawStatus.toUpperCase().includes('FAIL')) {
          label = 'Non-compliant';
          labelColor = PDF_COLORS.fail;
        }
        
        displayResult = {
          stack: [
            { text: `${rawResult}${unitSuffix}`, bold: true },
            { text: label, fontSize: 6.5, bold: true, color: labelColor, margin: [0, 1, 0, 0] }
          ]
        };
        remarks = `Out of range (${label})`;
      } else {
        displayResult = `${rawResult}${unitSuffix}`;
        remarks = 'Within limits';
      }
    }

    // Adjust remarks based on microbiology presence/absence
    if (category.toUpperCase() === 'MICROBIOLOGY') {
      if (rawResult.toLowerCase().includes('present')) {
        remarks = 'Non-conforming (Pathogen Present)';
      } else if (rawResult.toLowerCase().includes('absent')) {
        remarks = 'Complies with standard';
      }
    }

    // Zebra stripes formatting
    const isZebra = index % 2 === 1;
    const cellBg = isZebra ? PDF_COLORS.bgZebra : PDF_COLORS.white;

    tableBody.push([
      { text: String(index + 1), style: 'tableBodyCenter', fillColor: cellBg } as any,
      { text: paramName, style: 'tableBodyBold', fillColor: cellBg } as any,
      { text: unit, style: 'tableBodyCenter', fillColor: cellBg } as any,
      { text: method, style: 'tableBodyCenter', fillColor: cellBg } as any,
      { ...((typeof displayResult === 'string') ? { text: displayResult, style: 'tableBodyCenter' } : displayResult), fillColor: cellBg } as any,
      { text: limit, style: 'tableBodyCenter', fillColor: cellBg } as any,
      { ...getStatusBadge(rawStatus), fillColor: cellBg } as any,
      { text: remarks, style: 'tableBody', fillColor: cellBg } as any
    ]);
  });

  return {
    table: {
      headerRows: 1,
      dontBreakRows: true,
      widths: [20, '*', 38, 80, 65, 75, 45, 55],
      body: tableBody
    },
    layout: {
      hLineWidth: (i: number) => (i === 0 || i === 1) ? 1.2 : 0.5,
      vLineWidth: () => 0.5,
      hLineColor: (i: number) => (i === 0 || i === 1) ? PDF_COLORS.primary : PDF_COLORS.border,
      vLineColor: () => PDF_COLORS.border,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 4,
      paddingBottom: () => 4
    },
    margin: [0, 0, 0, 15]
  };
}
