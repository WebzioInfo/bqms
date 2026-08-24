import { PDF_IMAGES } from './images';

export function getSignatureSection() {
  return {
    image: PDF_IMAGES.signatureSectionBanner,
    width: 523.28,
    alignment: 'center',
    margin: [0, 10, 0, 10]
  };
}
