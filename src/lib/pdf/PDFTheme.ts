export const PDF_COLORS = {
  primary: '#0D9488',       // Deep Biofix Teal Green
  primaryDark: '#0F766E',   // Darker Teal for accents
  primaryLight: '#ECFDF5',  // Soft Mint background
  secondary: '#0F172A',     // Slate Dark
  textDark: '#1E293B',      // Dark Charcoal
  textMuted: '#64748B',     // Muted Slate
  border: '#E2E8F0',        // Border light soft slate
  borderSubtle: '#F1F5F9',  // Ultra light separator
  bgZebra: '#F8FAFC',       // Zebra stripe light slate
  bgCard: '#F8FAFC',        // Block backgrounds
  white: '#FFFFFF',
  
  // Ribbon Gold/Yellow
  ribbonYellow: '#FACC15',
  ribbonBorder: '#EAB308',
  ribbonText: '#0F172A',

  // Statuses
  pass: '#059669',          // Emerald Green
  passBg: '#ECFDF5',        // Light Mint Fill
  fail: '#DC2626',          // Red
  failBg: '#FEF2F2',        // Light Red Fill
  warning: '#D97706',       // Amber / Orange
  warningBg: '#FFFBEB',     // Light Amber Fill
  neutral: '#64748B'        // Gray
};

export const PDF_FONTS = {
  primary: 'Roboto'
};

export const PDF_STYLES = {
  defaultStyle: {
    font: PDF_FONTS.primary,
    fontSize: 8,
    color: PDF_COLORS.textDark,
    lineHeight: 1.25
  },
  styles: {
    reportTitle: {
      fontSize: 14,
      bold: true,
      color: PDF_COLORS.primary,
      alignment: 'center',
      characterSpacing: 1.2
    },
    sectionHeader: {
      fontSize: 9.5,
      bold: true,
      color: PDF_COLORS.secondary,
      characterSpacing: 0.5,
      margin: [0, 8, 0, 4]
    },
    tableHeader: {
      fontSize: 7.5,
      bold: true,
      color: PDF_COLORS.white,
      fillColor: PDF_COLORS.primary,
      alignment: 'center',
      margin: [0, 4, 0, 4]
    },
    tableBody: {
      fontSize: 7.5,
      color: PDF_COLORS.textDark,
      margin: [0, 3, 0, 3]
    },
    tableBodyCenter: {
      fontSize: 7.5,
      color: PDF_COLORS.textDark,
      alignment: 'center',
      margin: [0, 3, 0, 3]
    },
    tableBodyBold: {
      fontSize: 7.5,
      bold: true,
      color: PDF_COLORS.textDark,
      margin: [0, 3, 0, 3]
    },
    badgeText: {
      fontSize: 7,
      bold: true
    },
    metaLabel: {
      fontSize: 7.5,
      bold: true,
      color: PDF_COLORS.textMuted
    },
    metaValue: {
      fontSize: 7.5,
      color: PDF_COLORS.textDark
    },
    footerText: {
      fontSize: 6,
      color: PDF_COLORS.textMuted,
      lineHeight: 1.3
    },
    watermarkText: {
      fontSize: 60,
      bold: true,
      color: '#E2E8F0',
      opacity: 0.035
    }
  }
};
