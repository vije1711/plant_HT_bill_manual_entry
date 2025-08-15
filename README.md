# Plant HT Bill Manual Entry

This repository contains a single-page web application for manual entry and calculation of high-tension (HT) electricity bills.
It is designed to run entirely in the browser without a server component.

## Features
- Interactive form for entering billing details
- Real-time computation of bill totals
- Local storage support for restoring previous sessions
- Sample data loader for quick demonstrations
- Import/export functionality powered by [SheetJS](https://sheetjs.com/) via `xlsx.full.min.js`
- PDF export support for generating printable bills

## Getting Started
1. Clone or download the repository.
2. Open `1.4.1 GUI Entry.html` in a modern web browser.
3. Enter billing values in the provided fields.
4. Use the **Compute** button to calculate totals, **Reset** to clear fields, and **Save**/**Restore** for working with stored data.

## Repository Structure
- `1.4.1 GUI Entry.html` - Main application interface and logic.
- `xlsx.full.min.js` - Bundled SheetJS library used for Excel import/export.
- `iom-pdf.js` - PDF layout and export logic built on pdfmake.
- `vfs_noto_deva.js` - Embedded Noto Sans Devanagari fonts for PDF output.

## Development Notes
This project uses a `package.json` for dependency management and includes `jsdom` as a development dependency. A `test` script is provided to run the Node-based test suite.

### Testing
Install dependencies with `npm install` and run tests with `npm test`.

## License
No license information has been provided.
