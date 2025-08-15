import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import notoVfs from './vfs_noto_deva.js';

// Extend built-in Roboto vfs with Noto Devanagari fonts
pdfMake.vfs = { ...pdfMake.vfs, ...notoVfs };

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  NotoDeva: {
    normal: 'NotoSansDevanagari-Regular.ttf',
    bold: 'NotoSansDevanagari-Bold.ttf'
  }
};

const docDefinition = {
  defaultStyle: { font: 'Roboto' },
  content: [
    { text: 'Sample English text rendered with Roboto.' },
    { text: 'यह हिंदी पाठ है', style: 'hindi' }
  ],
  styles: {
    hindi: { font: 'NotoDeva' }
  }
};

pdfMake.createPdf(docDefinition);
