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

  // Y-position height tracker (A4 height 842 - margins [128 top, 60 bottom] = 654 printable height)
  const PRINTABLE_HEIGHT = 654;
  let currentY = 180; // Est. height of Report Info block (~180pt including padding/margins)

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

    // Minimum height required to prevent orphan (header + table header + 2 rows)
    const minHeightRequired = sectionHeaderHeight + tableHeaderHeight + (2 * avgRowHeight);
    const totalSectionHeight = sectionHeaderHeight + tableHeaderHeight + (rowsCount * avgRowHeight) + spacingHeight;

    let pageBreak: 'before' | undefined = undefined;

    // If remaining space on the page is less than the minimum height, push to new page
    if (currentY + minHeightRequired > PRINTABLE_HEIGHT) {
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
    if (currentY + totalSectionHeight > PRINTABLE_HEIGHT) {
      // Handles multi-page table splits: calculate rows on the overflow page
      const remainingSpace = PRINTABLE_HEIGHT - currentY;
      const spaceForRows = remainingSpace - sectionHeaderHeight - tableHeaderHeight;
      const fitRows = Math.floor(spaceForRows / avgRowHeight);
      
      if (fitRows > 0) {
        const spillRows = rowsCount - fitRows;
        currentY = (spillRows * avgRowHeight) + spacingHeight;
      } else {
        currentY = totalSectionHeight;
      }
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
    pageMargins: [36, 128, 36, 60], // Left, Top, Right, Bottom
    header: function(currentPage: number) {
      return {
        stack: [
          getReportHeader(metadata)
        ],
        margin: [36, 12, 36, 0]
      };
    },
    background: getWatermark(),
    footer: getReportFooter(batchNumber),
    content: content,
    styles: PDF_STYLES.styles,
    defaultStyle: PDF_STYLES.defaultStyle
  };
}
