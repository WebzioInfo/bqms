import { PDF_COLORS } from './PDFTheme';

export function getSignatureSection() {
  return {
    stack: [
      {
        text: 'AUTHORISED SIGNATORIES',
        fontSize: 9,
        bold: true,
        color: PDF_COLORS.secondary,
        margin: [0, 15, 0, 8],
        keepWithNext: true
      },
      {
        columns: [
          // Signatory 1: Nisamudeen
          {
            width: '*',
            stack: [
              {
                text: 'Nisamudeen P',
                fontSize: 9,
                bold: true,
                alignment: 'center',
                color: PDF_COLORS.textDark
              },
              {
                text: 'Chief of Quality - Chemistry',
                fontSize: 7.5,
                color: PDF_COLORS.textMuted,
                alignment: 'center',
                margin: [0, 2, 0, 4]
              },
              {
                text: '● DIGITALLY APPROVED',
                fontSize: 6.5,
                bold: true,
                color: PDF_COLORS.pass,
                alignment: 'center'
              }
            ]
          },
          // Signatory 2: Shadiya
          {
            width: '*',
            stack: [
              {
                text: 'Shadiya T',
                fontSize: 9,
                bold: true,
                alignment: 'center',
                color: PDF_COLORS.textDark
              },
              {
                text: 'Chief of Quality - Microbiology',
                fontSize: 7.5,
                color: PDF_COLORS.textMuted,
                alignment: 'center',
                margin: [0, 2, 0, 4]
              },
              {
                text: '● DIGITALLY APPROVED',
                fontSize: 6.5,
                bold: true,
                color: PDF_COLORS.pass,
                alignment: 'center'
              }
            ]
          },
          // Signatory 3: Sulfikar
          {
            width: '*',
            stack: [
              {
                text: 'Sulfikar Ali M',
                fontSize: 9,
                bold: true,
                alignment: 'center',
                color: PDF_COLORS.textDark
              },
              {
                text: 'Chief Scientific Officer',
                fontSize: 7.5,
                color: PDF_COLORS.textMuted,
                alignment: 'center',
                margin: [0, 2, 0, 4]
              },
              {
                text: '● DIGITALLY APPROVED',
                fontSize: 6.5,
                bold: true,
                color: PDF_COLORS.pass,
                alignment: 'center'
              }
            ]
          }
        ]
      }
    ],
    margin: [0, 10, 0, 10],
    keepWithNext: true
  };
}
