export const PDF_COLORS = {
  primary: '#14B8A6',     // Teal
  secondary: '#0F172A',   // Slate Dark
  textDark: '#1E293B',    // Dark Charcoal
  textMuted: '#64748B',   // Muted Slate
  border: '#E5E7EB',      // Border light gray
  bgZebra: '#F8FAFC',     // Zebra stripe light gray
  bgCard: '#F8FAFC',      // Block backgrounds
  white: '#FFFFFF',
  
  // Statuses
  pass: '#10B981',        // Green
  fail: '#EF4444',        // Red
  warning: '#F97316',     // Orange
  neutral: '#64748B'      // Gray
};

export const PDF_FONTS = {
  primary: 'Roboto'
};

export const PDF_STYLES = {
  defaultStyle: {
    font: PDF_FONTS.primary,
    fontSize: 8.5,
    color: PDF_COLORS.textDark,
    lineHeight: 1.2
  },
  styles: {
    reportTitle: {
      fontSize: 15,
      bold: true,
      color: PDF_COLORS.primary,
      alignment: 'center',
      characterSpacing: 0.8
    },
    sectionHeader: {
      fontSize: 10,
      bold: true,
      color: PDF_COLORS.secondary,
      margin: [0, 8, 0, 4]
    },
    tableHeader: {
      fontSize: 8,
      bold: true,
      color: PDF_COLORS.white,
      fillColor: PDF_COLORS.primary,
      alignment: 'center',
      margin: [0, 3, 0, 3]
    },
    tableBody: {
      fontSize: 8,
      color: PDF_COLORS.textDark,
      margin: [0, 2, 0, 2]
    },
    tableBodyCenter: {
      fontSize: 8,
      color: PDF_COLORS.textDark,
      alignment: 'center',
      margin: [0, 2, 0, 2]
    },
    tableBodyBold: {
      fontSize: 8,
      bold: true,
      color: PDF_COLORS.textDark,
      margin: [0, 2, 0, 2]
    },
    badgeText: {
      fontSize: 7.5,
      bold: true
    },
    metaLabel: {
      fontSize: 8,
      bold: true,
      color: PDF_COLORS.textMuted
    },
    metaValue: {
      fontSize: 8,
      color: PDF_COLORS.textDark
    },
    footerText: {
      fontSize: 6.5,
      color: PDF_COLORS.textMuted,
      lineHeight: 1.3
    },
    watermarkText: {
      fontSize: 60,
      bold: true,
      color: '#E2E8F0',
      opacity: 0.15
    }
  }
};
