import { PDF_IMAGES } from './images';

export function getReportHeader(metadata?: Record<string, string>) {
  return {
    image: PDF_IMAGES.headerBanner,
    width: 595.28,
    alignment: 'center',
    margin: [0, 0, 0, 0]
  };
}
