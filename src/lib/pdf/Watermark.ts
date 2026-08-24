import { PDF_IMAGES } from './images';

export function getWatermark() {
  return function(currentPage: number, pageSize: { width: number; height: number }) {
    // A4 size is 595.28 x 841.89 pt
    const width = 240;
    const height = 80;
    const x = (pageSize.width - width) / 2;
    const y = (pageSize.height - height) / 2;

    return {
      image: PDF_IMAGES.biofixLogo,
      width: width,
      opacity: 0.035, // 3.5% Opacity for ultra-subtle enterprise background seal
      absolutePosition: { x: x, y: y }
    };
  };
}
