import { PDF_COLORS } from './PDFTheme';
import { PDF_IMAGES } from './images';

export function getReportHeader(metadata?: Record<string, string>) {
  const certNumber = metadata?.['Accreditation Number'] || metadata?.['Report Number'] || 'PCB/LAB/C06/2024';

  return {
    stack: [
      {
        columns: [
          // Left: Company logo and tagline
          {
            width: '*',
            stack: [
              {
                image: PDF_IMAGES.biofixLogo,
                width: 140,
                margin: [0, 5, 0, 5]
              },
              {
                text: 'STATE-OF-THE-ART WATER TESTING LABORATORY',
                fontSize: 6.5,
                bold: true,
                color: PDF_COLORS.primary,
                letterSpacing: 1.2,
                margin: [2, 0, 0, 0]
              },
              {
                text: 'AN ISO 9001:2015 CERTIFIED COMPLIANCE FACILITY',
                fontSize: 6,
                color: PDF_COLORS.textMuted,
                margin: [2, 2, 0, 0]
              }
            ],
            margin: [0, 10, 0, 0]
          },
          // Right: Accreditation ribbon
          {
            width: 130,
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: certNumber,
                        fontSize: 7.5,
                        bold: true,
                        alignment: 'center',
                        color: PDF_COLORS.secondary,
                        margin: [0, 2, 0, 4]
                      },
                      {
                        image: PDF_IMAGES.keralaPcb,
                        width: 32,
                        height: 32,
                        alignment: 'center',
                        margin: [0, 0, 0, 4]
                      },
                      {
                        text: 'GOVERNMENT APPROVED\nWATER TESTING LAB',
                        fontSize: 6,
                        bold: true,
                        alignment: 'center',
                        color: PDF_COLORS.secondary,
                        lineHeight: 1.15
                      }
                    ],
                    fillColor: '#FACC15', // Vibrant Yellow
                    margin: [8, 8, 8, 8]
                  }
                ]
              ]
            },
            layout: 'noBorders',
            alignment: 'right',
            margin: [0, -10, 0, 0]
          }
        ]
      },
      // Horizontal line accent under the logo/ribbon
      {
        canvas: [
          { type: 'rect', x: 0, y: 5, w: 523, h: 2, color: PDF_COLORS.primary }
        ],
        margin: [0, 8, 0, 15]
      },
      // Report Title
      {
        text: 'WATER QUALITY ANALYSIS REPORT',
        style: 'reportTitle',
        margin: [0, 0, 0, 15]
      }
    ]
  };
}
