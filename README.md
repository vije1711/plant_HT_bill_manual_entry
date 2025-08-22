# WEG Billing Calculator (Single-file App)

A single HTML file that computes HT bills, manages tariffs/PO rates, and exports:
- **IOM – HT Bill**: one-page A4 PDF via **Save as PDF** or **Open PDF View**
- **Central Dak Receipt**: lightweight receipt generator + **Save as PDF/Open PDF View**

## Quick Start
1. Open `1.4.1 GUI Entry.html` in a modern Chromium browser (Chrome/Edge).
2. Pick **Billing Month**, enter HT Bill inputs and Wind credits/debits.
3. Click **Make IOM ▾ → Render IOM**, then:
   - **Save as PDF** for a one-page A4 export (no blank lead page).
   - **Open PDF View** if you prefer an `about:blank` popup; allow popups.
4. For **Central Dak Receipt — Inputs**, fill the fields → **Render Receipt** → **Save as PDF** (exactly one print dialog) or **Open PDF View**.

> Tip: In the browser print dialog, turn **off** “Headers and footers”. **Default** margins are fine.

## Features
- **IOM one-page scaling**: `.sheet.iom` + `html.print-iom` + `setIomPrintScaleIfNeeded()` fit to A4.
- **Receipt print guard**: scoped `#htmlPrintHost` CSS; receipt renders as `.sheet.rcpt` with `role="document"`.
- **No double print dialogs** for receipts: the card’s “Save as PDF” prints directly.
- **Rates Manager**: editable tariffs/PO rates, parity badge with tolerance `FINAL_CHECK_TOL`.
- **Excel export**: builds a month sheet via SheetJS.
- **Offline-friendly**: prefers local `./xlsx.full.min.js`, then CDNs.

## Troubleshooting
- **Popup blocked (Open PDF View)**: allow popups for the file; the app falls back to a Blob URL with a warning.
- **Unexpected page split**: ensure you used **Save as PDF** from within the app, not the browser’s generic print on the whole page.
- **Missing Excel lib**: place `xlsx.full.min.js` next to the HTML or launch with `?xlsx=/path/to/xlsx.full.min.js`.

## Development Notes
- Keep IDs stable: `#htmlPrintHost`, `#saveHtmlPdf`, `#openHtmlPdf`, `#receiptCard`, etc.
- IOM print scope: add `iom` class to the IOM sheet; the app toggles `html.print-iom` during print.
- Receipt CSS is injected once as `#receipt-css-v2`; the popup path de-scopes `#htmlPrintHost` selectors.
- Avoid adding second click handlers to `#saveHtmlPdf` (prevents duplicate print dialogs).

## License
Add your project license here.
