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
2. Run `npm install` to install dependencies (required before running tests).
3. Open `1.4.1 GUI Entry.html` in a modern web browser.
4. Enter billing values in the provided fields.
5. Use the **Compute** button to calculate totals, **Reset** to clear fields, and **Save**/**Restore** for working with stored data.
6. Click **Download PDF** to export a printable PDF version of the bill.

## Repository Structure
- `1.4.1 GUI Entry.html` - Main application interface and logic.
- `xlsx.full.min.js` - Bundled SheetJS library used for Excel import/export.
- `iom-pdf.js` - PDF layout and export logic built on pdfmake.
- `test/` - Node-based tests, currently including `basic.test.js` for sample calculations and PDF generation.

## Development Notes
This project uses a `package.json` for dependency management and includes a `test` script to run the Node-based test suite.

### Development Dependencies
- `jsdom` – simulates a browser DOM so tests can run in Node.js without a real browser.

### Testing
Install dependencies with `npm install` and run tests with `npm test`.

## License
This project is licensed under the ISC License. See [LICENSE](LICENSE).

## Contributing
Contributions are welcome! Please extend the test suite where possible and run `npm test` before submitting any changes.
