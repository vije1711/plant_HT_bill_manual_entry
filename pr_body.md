## Summary

This branch removes the Due Date quick-action strip from the `Adjustments & Carry-forward` card to make the Due Date area cleaner and shorter.

The removed controls were:
- `Today`
- `+7 Days`
- `Month End`
- `Previous Working Day`
- `Clear`

After this change, the Due Date area is intentionally simplified to:
- the `Due Date` label
- the inline payment-risk badge
- the native date input
- the existing hint / validation behavior

## Why

The quick-action strip was adding visual and vertical weight inside one of the densest cards in the app.

Even after exploring a more compact strip treatment, the cleaner outcome was to remove the quick actions entirely and let the field rely on direct date entry / native date-picker interaction.

This improves the form in a few practical ways:
- reduces vertical space in the `Adjustments & Carry-forward` card
- lowers visual clutter around the due-date field
- removes extra focus targets from a busy section of the form
- keeps the due-date risk indicator as the main supporting signal instead of competing with shortcut buttons

## What Changed

### UI

In `1.4.1 GUI Entry.html`:
- removed the `.due-date-actions` quick-action group from the Due Date field
- removed the five quick-action buttons from the DOM
- kept the compact inline due-date risk badge and assistive status text in place
- kept the native Due Date input unchanged

### Styling

Removed the quick-action-specific styling for:
- `.due-date-field .due-date-actions`
- `.due-date-field .due-date-actions .ghost`

This returns the Due Date block to a simpler layout without the extra action row.

### JavaScript

Removed the quick-action helper code and listeners:
- `dueDateMonthEndIso()`
- `previousWorkingDayIso(baseIso)`
- shared `setDueDateIso(...)`
- click handlers for:
  - `dueDateToday`
  - `dueDatePlus7`
  - `dueDateMonthEnd`
  - `dueDatePrevWorkingDay`
  - `dueDateClear`

The standard manual Due Date change flow remains intact.

### Tests

Updated `test/readiness-ux.spec.js` to reflect the intentional removal.

Removed shortcut-specific tests that no longer apply and replaced them with a structural regression test that confirms:
- `.due-date-actions` is absent
- all five legacy quick-action button IDs are absent

This keeps the suite aligned with the new intended UI instead of preserving dead expectations.

## Behavior After Change

What still works:
- manual Due Date entry
- native browser date-picker usage
- Due Date validation
- due-date risk classification / badge updates
- finance readiness behavior tied to Due Date
- existing IOM gating behavior

What is intentionally removed:
- one-click date shortcuts from the Due Date field
- dedicated `Clear` button for the Due Date field

## Tradeoffs

This branch deliberately favors a cleaner and more compact form over shortcut-heavy date entry.

Tradeoff to note:
- users lose fast preset actions such as `Month End` and `Previous Working Day`

That said, the resulting UI is simpler, easier to scan, and better aligned with the goal of reducing visual crowding in the card.

## Validation

Validated locally with:

```bash
npm test
```

Result:
- `14/14` tests passed

## Files Changed

- `1.4.1 GUI Entry.html`
- `test/readiness-ux.spec.js`
- `pr_body.md`

## Notes

This is a focused UI simplification branch.

It does not change:
- PDF / IOM wording
- finance-readiness logic
- due-date risk-state rules
- rendering / print gating rules

It only removes the Due Date quick-action surface and its supporting code/tests.
