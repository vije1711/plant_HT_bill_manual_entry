## Summary

This PR is a focused follow-up on top of the recently merged toolbar / finance-readiness work.

It refines the `Due Date` area inside the `Adjustments & Carry-forward` card so the risk signal is:
- more compact than before
- still visible without hover
- usable in keyboard, touch, screen-reader, and forced-colors scenarios

The branch also commits `pr_body.md` itself so the branch carries its own written change log / source of truth.

## Why

The earlier UX pass improved the Due Date workflow, but the Due Date presentation still felt vertically heavy.

We compacted that section by:
- removing the decorative `DUE` badge
- removing the standalone preview line
- removing the separate `Risk:` row
- moving the risk indicator inline next to `Due Date`

That cleanup looked better visually, but review surfaced a few accessibility issues that needed to be fixed before the refactor was truly complete:
- icon-only risk state depended too much on color / hover
- the live status node could re-announce unchanged risk text on unrelated recomputes
- the forced-colors fallback selector was not strong enough to override the state-specific palette

This PR lands the compact design and the follow-up accessibility hardening together.

## What Changed

### 1. Compact inline due-date risk badge

The Due Date row in `Adjustments & Carry-forward` has been reworked.

#### Removed
- the old `DUE` label chip
- the standalone due-date preview row
- the standalone `Risk:` chip row

#### Added
- an inline risk badge beside `Due Date`
- warning-triangle icon + short visible state label
- compact badge states:
  - `NONE`
  - `SAFE`
  - `TODAY`
  - `RISK`
  - `LATE`

This keeps the section shorter while preserving a clear visible payment-risk signal.

### 2. Visible risk state without hover

The badge now exposes the current state directly in visible text instead of depending only on:
- color
- tooltip hover
- screen-reader-only text

This fixes the regression for:
- touch users
- sighted keyboard users
- forced-colors / high-contrast users
- anyone who cannot or does not hover the inline indicator

### 3. Assistive/live status support

The due-date risk assistive node remains connected to the date input through `aria-describedby`.

It now also acts as a polite status region so due-date quick-action changes can be announced to assistive technology.

Important follow-up hardening included in this branch:
- the live region is only rewritten when the announced risk text actually changes
- unrelated recomputes no longer keep re-announcing the same payment-risk message

### 4. Forced-colors support

Added a dedicated forced-colors fallback for the due-date risk badge.

The final selector explicitly targets both:
- `.due-date-risk-badge`
- `.due-date-risk-badge[data-state]`

That ensures the high-contrast fallback can win over the state-specific badge palette in forced-colors mode.

### 5. Test coverage

Expanded `test/readiness-ux.spec.js` to cover the new compact badge contract.

Added checks for:
- Due Date row structure after compaction
- visible state text in the risk badge
- tooltip updates
- assistive text updates
- live-region rewrite guard
- forced-colors override selector presence

## Files Changed

### `1.4.1 GUI Entry.html`
Contains the product changes for the Due Date section:
- compact label-row risk badge
- updated CSS for compact badge styling
- visible short state labels
- assistive/live-region behavior
- forced-colors fallback
- guarded live-region updates

### `test/readiness-ux.spec.js`
Contains regression coverage for:
- compact due-date badge structure
- visible risk labels
- tooltip + assistive text sync
- live-region non-reannouncement behavior
- forced-colors override selector coverage

### `pr_body.md`
Committed intentionally as the branch-local narrative of what this follow-up branch changes and why.

## Implementation Notes

### Visible label mapping
The compact badge uses short visible labels:
- `none` -> `NONE`
- `safe` -> `SAFE`
- `today` -> `TODAY`
- `high-risk` -> `RISK`
- `overdue` -> `LATE`

### Full accessible wording
The full assistive/tooltip wording remains:
- `Payment risk: Not set`
- `Payment risk: Safe`
- `Payment risk: Due today`
- `Payment risk: High risk`
- `Payment risk: Overdue`

### Logic intentionally unchanged
This PR does **not** change:
- due-date risk classification thresholds
- finance-readiness gating
- quick-action behavior
- validation rules
- IOM/PDF note wording

This is a presentation + accessibility follow-up around the existing due-date risk model.

## Testing

Ran:

```bash
npm test
```

Result:
- `14/14` tests passing

## Review-driven fixes included

This branch includes the follow-up fixes raised during review:
- keep the risk state visible without hover
- prevent repeated live-region announcements on unchanged recomputes
- ensure forced-colors overrides actually win against state-specific badge styling

## Notes

This is a targeted follow-up branch from `main` after PR #214 was merged.

It is intentionally narrow in scope:
- no toolbar reorganization here
- no new workflow changes
- just the Due Date risk badge cleanup and its accessibility/test hardening
