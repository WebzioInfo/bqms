import { PDF_STYLES } from './PDFTheme';
import { getReportHeader } from './ReportHeader';
import { getReportInfo } from './ReportInfo';
import { getSectionHeader } from './SectionHeader';
import { getParameterTable } from './ParameterTable';
import { getSignatureSection } from './SignatureSection';
import { getRemarksSection } from './RemarksSection';
import { getReportFooter } from './Footer';
import { getWatermark } from './Watermark';

export interface ReportData {
  title: string;
  headers: string[];
  rows: any[][];
  metadata?: Record<string, string>;
}

export function generateReportDefinition(data: ReportData): any {
  const metadata = data.metadata || {};
  const batchNumber = metadata['Batch Number'] || '—';

  // 1. Group parameters by category and build tables
  const physicalTable = getParameterTable(data.rows, 'PHYSICAL');
  const chemicalTable = getParameterTable(data.rows, 'CHEMICAL');
  const microbiologyTable = getParameterTable(data.rows, 'MICROBIOLOGY');

  const content: any[] = [];

  // Top margin is set to 170pt to clear the ~156pt header image with 14pt breathing room.
  // Printable height = A4 height (841.89) - top margin (170) - bottom margin (60) = 611.89pt (~612pt).
  const PRINTABLE_HEIGHT = 612;
  let currentY = 160; // Est. height of Report Info block (~160pt including padding/margins)

  // 2. Report Information Block (placed at the top of the content stream, page 1)
  content.push(getReportInfo(metadata));

  // Helper to process a section block with height check
  const processSection = (category: string, title: string, tableComponent: any) => {
    if (!tableComponent) return;

    const rowsCount = data.rows.filter(
      row => String(row[1] || '').trim().toUpperCase() === category.toUpperCase()
    ).length;

    const sectionHeaderHeight = 35;
    const tableHeaderHeight = 30;
    const avgRowHeight = 24;
    const spacingHeight = 20;

    const totalSectionHeight = sectionHeaderHeight + tableHeaderHeight + (rowsCount * avgRowHeight) + spacingHeight;

    let pageBreak: 'before' | undefined = undefined;

    // If remaining space on the current page is less than total section height, push section to top of next page
    if (currentY + totalSectionHeight > PRINTABLE_HEIGHT) {
      pageBreak = 'before';
      currentY = 0;
    }

    const header = getSectionHeader(title);
    if (pageBreak) {
      (header as any).pageBreak = pageBreak;
    }
    content.push(header);
    content.push(tableComponent);

    // Track Y-position after rendering the section
    if (pageBreak) {
      currentY = totalSectionHeight;
    } else {
      currentY += totalSectionHeight;
    }
  };

  // 3. Parameter Sections
  processSection('PHYSICAL', 'Physical Parameters', physicalTable);
  processSection('CHEMICAL', 'Chemical Parameters', chemicalTable);
  processSection('MICROBIOLOGY', 'Microbiological Parameters', microbiologyTable);

  // 4. Authorized Signatories Section
  let sigPageBreak: 'before' | undefined = undefined;
  const sigHeight = 95;
  if (currentY + sigHeight > PRINTABLE_HEIGHT) {
    sigPageBreak = 'before';
    currentY = 0;
  }
  const sigSection = getSignatureSection() as any;
  if (sigPageBreak) {
    sigSection.pageBreak = sigPageBreak;
  }
  content.push(sigSection);

  // 5. Remarks Page (starts on a separate page if remarks exist)
  const remarksSection = getRemarksSection(metadata['Remarks']);
  if (remarksSection) {
    content.push(remarksSection);
  }

  return {
    pageType: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [36, 170, 36, 60], // Left, Top (170pt clears 156pt header), Right, Bottom
    header: function(currentPage: number) {
      return {
        stack: [
          getReportHeader(metadata)
        ],
        margin: [0, 0, 0, 0]
      };
    },
    background: getWatermark(),
    footer: getReportFooter(batchNumber),
    content: content,
    styles: PDF_STYLES.styles,
    defaultStyle: PDF_STYLES.defaultStyle
  };
}
