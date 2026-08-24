import { PDF_COLORS } from './PDFTheme';
import { PDF_IMAGES } from './images';

export function getReportFooter(batchNumber: string = '—') {
  return function(currentPage: number, pageCount: number) {
    return {
      stack: [
        // Clean, subtle divider line spanning printable width (523.28pt)
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 523.28, y2: 0, lineWidth: 0.5, color: PDF_COLORS.border }
          ],
          margin: [0, 0, 0, 6]
        },
        // Footer Content Columns with symmetrical margins and aligned baselines
        {
          columns: [
            // Left: Aligned Certification Badges
            {
              width: '*',
              columns: [
                { image: PDF_IMAGES.stateEmblem, fit: [14, 14], width: 14 },
                { image: PDF_IMAGES.isoLogo, fit: [14, 14], width: 14, margin: [3, 0, 0, 0] },
                { image: PDF_IMAGES.msmeLogo, fit: [22, 14], width: 22, margin: [3, 0, 0, 0] },
                { image: PDF_IMAGES.keralaPcb, fit: [14, 14], width: 14, margin: [3, 0, 0, 0] },
                { image: PDF_IMAGES.lifeLogo, fit: [20, 14], width: 20, margin: [3, 0, 0, 0] }
              ],
              margin: [0, 1, 0, 0]
            },
            // Center: Single-Line Page Number & Report ID
            {
              width: 'auto',
              stack: [
                {
                  text: [
                    { text: `Page ${currentPage} of ${pageCount}`, bold: true, color: PDF_COLORS.secondary },
                    { text: '  •  ', color: PDF_COLORS.primary, bold: true },
                    { text: `Report ID: ${batchNumber}`, color: PDF_COLORS.textMuted }
                  ],
                  fontSize: 6.5,
                  alignment: 'center'
                }
              ],
              alignment: 'center',
              margin: [0, 2, 0, 0]
            },
            // Right: Aligned Enterprise Company Block
            {
              width: 215,
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
              margin: [0, 0, 0, 0]
            }
          ]
        }
      ],
      margin: [36, 0, 36, 18] // Symmetrical 36pt left/right page margin
    };
  };
}
