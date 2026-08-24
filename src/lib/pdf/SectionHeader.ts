import { PDF_COLORS } from './PDFTheme';

export function getSectionHeader(title: string) {
  return {
    columns: [
      {
        width: 3.5,
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 1,
            w: 3.5,
            h: 11,
            color: PDF_COLORS.primary
          }
        ]
      },
      {
        width: '*',
        text: title.toUpperCase(),
        fontSize: 9.5,
        bold: true,
        color: PDF_COLORS.secondary,
        characterSpacing: 0.6,
        margin: [6, -1, 0, 0]
      }
    ],
    margin: [0, 10, 0, 6],
    keepWithNext: true
  };
}
