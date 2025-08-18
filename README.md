# Plant HT Bill Manual Entry

This repository contains a single-page web application for manual entry and calculation of high-tension (HT) electricity bills.
It is designed to run entirely in the browser without a server component.

## Features
- Interactive form for entering billing details
- Real-time computation of bill totals
- Local storage support for restoring previous sessions
- Sample data loader for quick demonstrations
- Import/export functionality powered by [SheetJS](https://sheetjs.com/) via `xlsx.full.min.js`
- PDF export via browser print for generating printable bills

## Getting Started
1. Clone or download the repository.
2. Run `npm install` to install dependencies (required before running tests).
3. Open `1.4.1 GUI Entry.html` in a modern web browser.
4. Enter billing values in the form. Totals are recalculated automatically as you type.
5. Use toolbar buttons to load sample data, reset the form, import or export sheets, and generate printable previews. See [Using the Application](#using-the-application) for details.

## Using the Application
- **Add / Update Month Sheet** – store the current bill in an in-memory workbook.
- **Upload Excel** – import an existing workbook.
- **Download Excel** – export the workbook with all saved sheets.
- **Sample Data** – populate the form with demonstration values.
- **Reset** – clear the current form; **Clear Sheets** removes all stored sheets.
- **Render Preview** – generate a printable view of the bill; **Save as PDF** downloads that preview as a PDF.

## Repository Structure
- `1.4.1 GUI Entry.html` - Main application interface and logic.
- `xlsx.full.min.js` - Bundled SheetJS library used for Excel import/export.
- `test/` - Node-based tests, currently including `basic.test.js` for sample calculations.

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
