import { PDF_COLORS } from './PDFTheme';

export function getRemarksSection(remarksText?: string) {
  if (!remarksText || remarksText.trim() === '—' || remarksText.trim() === '') {
    return null;
  }

  // Parse remarks text to identify blocks
  const sections: { title: string; content: string }[] = [];
  
  // Clean remarks text
  const cleanText = remarksText.replace(/\r\n/g, '\n').trim();

  // Simple keyword matching for section splitting
  const lines = cleanText.split('\n');
  let currentSectionTitle = 'Overall Summary & Observations';
  let currentContentLines: string[] = [];

  const headingKeywords = [
    { key: 'OBSERVATIONS', title: 'Observations' },
    { key: 'NON-CONFORMANCE', title: 'Non-Conformance Details' },
    { key: 'RECOMMENDATIONS', title: 'Consultant Recommendations' },
    { key: 'CONSULTANT RECOMMENDATIONS', title: 'Consultant Recommendations' },
    { key: 'CONSULTANT NOTES', title: 'Consultant Notes' },
    { key: 'CORRECTIVE ACTIONS', title: 'Corrective Actions' },
    { key: 'SUMMARY', title: 'Overall Summary' }
  ];

  lines.forEach(line => {
    const trimmedLine = line.trim();
    const matchingHeading = headingKeywords.find(h => 
      trimmedLine.toUpperCase().startsWith(h.key) || 
      trimmedLine.toUpperCase().replace(':', '').trim() === h.key
    );

    if (matchingHeading) {
      if (currentContentLines.length > 0) {
        sections.push({
          title: currentSectionTitle,
          content: currentContentLines.join('\n').trim()
        });
      }
      currentSectionTitle = matchingHeading.title;
      currentContentLines = [];
      
      const headerPartLength = trimmedLine.split(':')[0].length;
      const contentPart = trimmedLine.substring(headerPartLength + 1).trim();
      if (contentPart) {
        currentContentLines.push(contentPart);
      }
    } else {
      currentContentLines.push(line);
    }
  });

  if (currentContentLines.length > 0) {
    sections.push({
      title: currentSectionTitle,
      content: currentContentLines.join('\n').trim()
    });
  }

  if (sections.length === 0) {
    sections.push({
      title: 'Overall Summary & Observations',
      content: cleanText
    });
  }

  const sectionBlocks = sections.map(sec => {
    return {
      stack: [
        {
          text: sec.title.toUpperCase(),
          fontSize: 8.5,
          bold: true,
          color: PDF_COLORS.secondary,
          characterSpacing: 0.5,
          margin: [0, 8, 0, 4]
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: sec.content,
                  fontSize: 8.5,
                  color: PDF_COLORS.textDark,
                  lineHeight: 1.4,
                  margin: [10, 8, 10, 8]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: (i: number) => (i === 0 ? 3 : 0.5),
            hLineColor: () => PDF_COLORS.border,
            vLineColor: (i: number) => (i === 0 ? PDF_COLORS.primary : PDF_COLORS.border),
            fillColor: () => PDF_COLORS.bgCard
          },
          margin: [0, 0, 0, 10]
        }
      ]
    };
  });

  return {
    pageBreak: 'before',
    stack: [
      {
        text: 'LABORATORY OBSERVATIONS & REMARKS',
        fontSize: 11,
        bold: true,
        color: PDF_COLORS.primary,
        characterSpacing: 0.8,
        margin: [0, 0, 0, 12]
      },
      ...sectionBlocks,
      // Consultant Signature
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      { text: 'CONSULTING OFFICER', fontSize: 7.5, bold: true, color: PDF_COLORS.textMuted, alignment: 'center', characterSpacing: 0.5 },
                      { text: 'Muhammed Anas M', fontSize: 9, bold: true, alignment: 'center', margin: [0, 16, 0, 2], color: PDF_COLORS.secondary },
                      { text: 'Chief of Solutions - Water Quality', fontSize: 7, color: PDF_COLORS.textMuted, alignment: 'center' },
                      { text: '● VERIFIED COMPLIANCE', fontSize: 6, bold: true, color: PDF_COLORS.pass, alignment: 'center', margin: [0, 4, 0, 0] }
                    ],
                    fillColor: PDF_COLORS.bgCard,
                    margin: [8, 8, 8, 8]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => PDF_COLORS.border,
              vLineColor: () => PDF_COLORS.border
            },
            margin: [0, 16, 0, 0]
          }
        ],
        keepWithNext: true
      }
    ],
    margin: [0, 6, 0, 6]
  };
}
