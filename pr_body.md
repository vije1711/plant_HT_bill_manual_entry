## Summary

This PR completes the finance-readiness and toolbar UX refactor for the standalone HT Bill processing app.

It adds a dedicated Due Date workflow for IOM generation, introduces finance-readiness gating around IOM/PDF actions, and reorganizes the top toolbar into a cleaner, more task-oriented structure.

The branch also includes a substantial round of UX hardening after review, especially around:
- stale-preview prevention
- keyboard accessibility
- focus recovery
- menu placement on short or narrow viewports
- backward compatibility for persisted due-date state

`pr_body.md` is intentionally committed in this branch as the written source of what was changed and why.

## Why

The original request was to improve the IOM finance workflow, specifically:
- add a Due Date input under `Adjustments & Carry-forward`
- add a short, formal note for Finance clarifying the DISCOM cut-off
- make the due-date selection experience less clunky

As we implemented that, a few adjacent issues became clear:
- Save/Open PDF actions could remain enabled after inputs changed, which risked exporting stale previews
- the new finance-readiness information needed to be visible without overcrowding the header
- the toolbar had become too wide and was wrapping awkwardly
- several menu and focus behaviors needed to be reworked after consolidation

This PR addresses all of that as one coherent UX pass.

## What Changed

### 1. Due Date and finance-readiness workflow

Added a dedicated `Due Date` field in the form and wired it into readiness and IOM generation.

Included a concise finance-facing payment cut-off note in the generated IOM/PDF using the DISCOM context, so Finance is clearly instructed to process payment before the DISCOM cut-off time.

Improved the due-date workflow with quick actions so users can set a practical due date faster instead of typing it manually every time.

Also added readiness checks so:
- `Render IOM` is enabled only when base readiness is satisfied
- `Save as PDF` / `Open PDF View` are enabled only when a fresh preview exists
- any relevant form change invalidates stale preview actions until the IOM is rendered again

### 2. Stale-preview protection and compatibility fixes

Hardened the render/export flow so stale IOM previews cannot be accidentally reused.

This includes:
- invalidating preview freshness when regular form inputs change
- invalidating preview freshness when due-date quick actions change the due date
- keeping Save/Open disabled until the preview is fresh again

Added backward-compatibility protection for existing persisted browser state:
- legacy `rc_dueDate` values are restored into the new `dueDate` field
- the new due-date control is excluded from INR masking, including text-input fallback scenarios

### 3. Toolbar and dropdown consolidation

Reorganized the top bar into a cleaner, task-based structure:
- `Billing Month`
- `Workbook`
- `Make IOM`
- `Configuration`
- `More`

This removed the old overcrowded top-level sprawl and grouped related actions together.

#### Workbook
Merged the previous Sheets / Workbook / Analysis areas into a single `Workbook` menu.

The Workbook dropdown now contains:
- workbook actions
- sheet browsing/search
- analysis actions
- a clearly separated danger zone for `Clear Sheets`

#### Make IOM
Folded Finance readiness into `Make IOM` instead of keeping it as a separate top-level item.

The menu now provides:
- inline readiness chip in the summary
- readiness checklist
- `Go Fix` issue actions
- IOM actions
- print preference controls

#### Configuration
Kept `Configuration` as its own top-level item and split the contents into more scannable groups:
- A. Shares
- B. Central Dak
- C. Rendered details
- D. Vendor display
- E. Bank details
- F. Approvals

#### More
Reduced `More` to lower-frequency actions:
- theme selection
- utility actions
- reset in a separate danger zone

### 4. Menu usability and accessibility hardening

A large part of this branch is follow-up refinement after review to make the consolidated menus behave correctly.

Key fixes include:
- restoring sheet-search arrow-key navigation into filtered sheet results
- allowing `ArrowUp` from sheet search to move back into preceding Workbook actions
- ensuring empty sheet-result states still allow arrow navigation into Workbook actions
- filtering disabled IOM actions out of roving keyboard navigation
- preserving keyboard focus when readiness issues are refreshed inside `Make IOM`
- closing `Make IOM` when `Go Fix` actions are clicked and focusing the correct field
- restoring document-level `Escape` close behavior for `Configuration`
- restoring focus correctly when `Configuration` is dismissed via outside click
- keeping `Configuration` open during `Load/Import` by exempting the hidden file input from outside-click dismissal
- supporting directional keyboard navigation for the 2-column theme grid in `More`
- allowing arrow navigation to leave the bottom row of the theme grid and continue into the next menu section

### 5. Responsive placement and viewport behavior

The consolidated menus are wider and taller than before, so menu placement needed dedicated handling.

This branch adds and refines a shared placement helper that now:
- clamps menus horizontally to the viewport
- preserves each panel's CSS max-height cap
- remeasures after dynamic content changes
- repositions menus after Workbook sheet list refreshes and after Make IOM readiness refreshes
- prefers the larger space above when a wrapped sticky toolbar leaves too little usable room below

This keeps the menus usable across:
- short viewports
- split-screen layouts
- wrapped toolbar layouts
- higher zoom scenarios

### 6. Workbook refresh behavior after download

When `Auto-update on Download` is enabled, downloading the workbook can create/update the current month sheet.

The open Workbook browser now refreshes immediately after that update so the newly added month appears in the visible sheet list right away, without requiring the user to close/reopen the menu.

### 7. Header polish

Replaced the old generic circle mark with a cleaner animated lightning/power icon in the header.

The final version keeps the motion subtle and includes reduced-motion support.

## Files

### `1.4.1 GUI Entry.html`
Contains the full product change set:
- Due Date UI and note integration
- finance-readiness UI and gating
- toolbar/menu restructuring
- configuration regrouping
- menu placement logic
- keyboard/focus behavior fixes
- header icon refresh

### `test/readiness-ux.spec.js`
Expanded significantly to cover the new UX contract, including:
- readiness gating
- stale-preview invalidation
- due-date compatibility behavior
- consolidated toolbar structure
- Workbook search and arrow navigation
- menu placement behavior
- Make IOM focus/placement behavior
- Configuration close/focus behavior
- theme-grid keyboard navigation
- auto-refresh behavior after download

### `pr_body.md`
Committed as the branch-local change log / source of truth for this work.

## Testing

Ran:

```bash
npm test
```

Result:
- `14/14` tests passing

## Notes

This branch went through multiple review-driven hardening passes. The final state is intentionally more robust than the original feature request because the toolbar consolidation exposed several real keyboard, focus, and viewport edge cases that are now covered by tests.
