import { PDF_COLORS } from './PDFTheme';
import { PDF_IMAGES } from './images';

export function getReportFooter(batchNumber: string = '—') {
  return function(currentPage: number, pageCount: number) {
    return {
      stack: [
        // Thin separator line above footer
        {
          canvas: [
            { type: 'line', x1: 36, y1: 0, x2: 559, y2: 0, lineWidth: 0.5, color: PDF_COLORS.border }
          ],
          margin: [0, 0, 0, 5]
        },
        // Footer Content Columns
        {
          columns: [
            // Left: Certification Badges
            {
              width: '*',
              columns: [
                { image: PDF_IMAGES.stateEmblem, fit: [15, 15], width: 15 },
                { image: PDF_IMAGES.isoLogo, fit: [15, 15], width: 15, margin: [4, 0, 0, 0] },
                { image: PDF_IMAGES.msmeLogo, fit: [25, 15], width: 25, margin: [4, 0, 0, 0] },
                { image: PDF_IMAGES.keralaPcb, fit: [15, 15], width: 15, margin: [4, 0, 0, 0] },
                { image: PDF_IMAGES.lifeLogo, fit: [22, 15], width: 22, margin: [4, 0, 0, 0] }
              ],
              margin: [36, 0, 0, 0]
            },
            // Center: Page X of Y & Report ID
            {
              width: 'auto',
              stack: [
                {
                  text: `Page ${currentPage} of ${pageCount}`,
                  fontSize: 7,
                  color: PDF_COLORS.textMuted,
                  alignment: 'center'
                },
                {
                  text: `Report ID: ${batchNumber}`,
                  fontSize: 6,
                  color: PDF_COLORS.textMuted,
                  alignment: 'center',
                  margin: [0, 1, 0, 0]
                }
              ],
              alignment: 'center'
            },
            // Right: Company Details
            {
              width: 220,
              stack: [
                {
                  text: 'Biofix Technology L.L.P.',
                  fontSize: 6.5,
                  bold: true,
                  color: PDF_COLORS.secondary,
                  alignment: 'right'
                },
                {
                  text: 'MC Building, Bypass Road, Kondotty, Malappuram - 673638',
                  fontSize: 5.5,
                  color: PDF_COLORS.textMuted,
                  alignment: 'right',
                  margin: [0, 1, 0, 0]
                },
                {
                  text: 'biofixtechnology.com | info@biofixtechnology.com | +91 7510 510 946',
                  fontSize: 5.5,
                  color: PDF_COLORS.textMuted,
                  alignment: 'right',
                  margin: [0, 1, 0, 0]
                }
              ],
              margin: [0, 0, 36, 0]
            }
          ]
        }
      ],
      margin: [0, 0, 0, 20]
    };
  };
}
