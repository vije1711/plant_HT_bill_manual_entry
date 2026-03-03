## Summary

This branch moves the IOM finance cutoff warning from the lower `Certification & Attachments` section to the top portion of the generated IOM/PDF.

The warning text itself is unchanged. The change is purely about document placement and visibility.

After this update, the warning now appears:
- immediately below the payee / bank information bar
- before the `Amount Mapping (per formula)` section

## Why

The due-date cutoff warning is one of the most operationally important instructions in the IOM:
- it is finance-facing
- it is time-sensitive
- it directly warns about delayed payment charges if payment is credited after `16:00 hrs IST` on the Due Date

Previously, the note appeared lower in the document inside `Certification & Attachments`, which made it easier to miss while reading the IOM top-down.

Moving it upward improves the document flow because the instruction now appears next to the payment context users are already reading:
- payee details
- vendor code
- bank account / IFSC / branch details

This gives the finance warning earlier visual priority and makes the IOM more usable as a payment-processing document.

## What Changed

### IOM template

In `1.4.1 GUI Entry.html`:
- inserted the existing `IMPORTANT (Finance)` warning directly after the `.info-bar`
- removed the same warning from the lower `Certification & Attachments` footer-note block
- kept the text content unchanged
- kept `data-testid="due-date-cutoff-note"` unchanged

This means the change is limited to rendered document order; it does not alter business logic, data binding, or note wording.

### Test coverage

Updated `test/basic.test.js` to protect the new placement.

The test now verifies that the due-date cutoff note:
- still renders
- still includes the expected cutoff wording
- still includes the formatted due date
- appears after `.info-bar`
- appears before `.mapping`

This helps prevent future regressions where the note gets pushed back into the lower certification block or otherwise loses its intended prominence.

## User-Facing Impact

### Before
- finance warning was buried in the lower certification area
- warning appeared after the mapping section
- users had to read deeper into the document to encounter the cutoff instruction

### After
- finance warning appears near the top of the IOM
- warning is seen alongside payment destination / banking details
- the payment-risk instruction is harder to overlook during processing

## Scope

This branch does **not** change:
- the wording of the finance cutoff note
- due-date calculation or validation rules
- finance-readiness gating logic
- IOM amount mapping logic
- signatures, receipt note, or attachment content
- PDF generation behavior apart from the note’s position in the rendered document

## Risk / Notes

This is a low-risk presentation change, but one practical note remains:
- because the warning now appears earlier on the page, very dense IOM layouts should still be visually checked for pagination balance when long bank/location strings are present

Functionally, the change is intentionally narrow.

## Validation

Validated locally with:

```bash
npm test
```

Result:
- `14/14` tests passed

Additional focused validation:
- `test/basic.test.js` passed with explicit DOM-order assertions for the moved warning

## Files Changed

- `1.4.1 GUI Entry.html`
- `test/basic.test.js`
- `pr_body.md`
