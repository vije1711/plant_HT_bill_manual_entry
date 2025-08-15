/*
 * Placeholder VFS bundle for Noto Sans Devanagari fonts.
 *
 * To generate:
 *   pdfmake build-vfs NotoSansDevanagari-Regular.ttf NotoSansDevanagari-Bold.ttf -o vfs_noto_deva.js
 * This will embed the base64 font data under the keys
 * 'NotoSansDevanagari-Regular.ttf' and 'NotoSansDevanagari-Bold.ttf'.
 */
if (typeof pdfMake !== 'undefined') {
  pdfMake.vfs = pdfMake.vfs || {};
  // Actual font data should replace this placeholder.
}

