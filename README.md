# Plant HT Bill Manual Entry

This repository contains a single-page web application for manual entry and calculation of high-tension (HT) electricity bills.
It is designed to run entirely in the browser without a server component.

## Features
- Interactive form for entering billing details
- Real-time computation of bill totals
- Local storage support for restoring previous sessions
- Sample data loader for quick demonstrations
- Import/export functionality powered by [SheetJS](https://sheetjs.com/) via `xlsx.full.min.js`
- Offline Inter Office Memo (IOM) PDF export powered by [pdfMake](https://pdfmake.github.io/docs/) with optional Hindi (Devanagari) font support

## Getting Started
1. Clone or download the repository.
2. Open `1.4.1 GUI Entry.html` in a modern web browser.
3. Enter billing values in the provided fields.
4. Use the **Compute** button to calculate totals, **Reset** to clear fields, and **Save**/**Restore** for working with stored data.
5. After successful computation, click **Download IOM PDF** to generate the memo. The app will attempt to load `pdfmake.min.js` and the required font VFS files automatically; for offline use, place these files next to the HTML.

## Repository Structure
- `1.4.1 GUI Entry.html` - Main application interface and logic.
- `xlsx.full.min.js` - Bundled SheetJS library used for Excel import/export.
- `iom-pdf.js` - PDF generation logic for the Inter Office Memo.
- (optional) `vfs_noto_deva.js` - VFS bundle providing Noto Sans Devanagari fonts for Hindi text.

## Development Notes
There is currently no build system or automated test suite.
Running `npm test` will fail until a `package.json` file and tests are added.

## License
No license information has been provided.
