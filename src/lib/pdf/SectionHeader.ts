import { PDF_COLORS } from './PDFTheme';

export function getSectionHeader(title: string) {
  return {
    columns: [
      {
        width: 3,
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: 3,
            h: 12,
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
        margin: [6, -1, 0, 0]
      }
    ],
    margin: [0, 10, 0, 8],
    keepWithNext: true
  };
}
