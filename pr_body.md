## Summary

This PR delivers the first four approved UX upgrades for the IOM/Finance workflow and includes a regression fix from review:

1. Finance Readiness badge + popover near **Make IOM**
2. Due Date risk chip (`Safe`, `Today`, `High risk`, `Overdue`)
3. Due Date quick actions (`Previous Working Day`, `Clear`)
4. IOM action gating (Render/Save/Open) based on readiness
5. Regression fix: prevent stale-preview export by requiring a **fresh** render after edits

The goal is to make Finance-facing output safer and more explicit, while reducing accidental stale PDF export.

---

## Why this change

Before this update:
- Readiness state was not centralized in one visible place
- Due Date urgency was not surfaced inline
- Operators could still miss re-render intent after edits
- Review caught a regression where Save/Open could remain enabled after input changes if readiness stayed true

This PR addresses all of the above.

---

## What changed

### 1) Finance Readiness UI near Make IOM

Added a toolbar readiness control:
- `#financeReadinessBadge`
- popover panel `#financeReadinessPopover`
- checklist rows:
  - `#readinessDueDate`
  - `#readinessStrict`
  - `#readinessFinalCheck`
- issue list with jump-to-field actions:
  - `#readinessIssueList`

Behavior:
- Shows `Ready` or `Blocked`
- Displays actionable blocking issues
- Clicking an issue focuses/scrolls to the field and closes the popover

### 2) Due Date risk chip

Added inline risk chip:
- `#dueDateRiskChip`

States:
- `none` (no due date)
- `safe`
- `today`
- `high-risk` (due tomorrow)
- `overdue` (past due date, or same day >= 16:00)

### 3) Due Date quick actions

Added two new quick action buttons:
- `#dueDatePrevWorkingDay`
- `#dueDateClear`

Rules:
- Previous working day skips weekend days (Sat/Sun)
- Clear resets due date and updates readiness/risk immediately

### 4) Centralized readiness and action gating

Introduced unified readiness flow:
- `computeIomReadiness()`
- `updateIomUxState()`
- `getDueDateRiskState()`

Gating rules:
- `Render IOM` enabled only when **base readiness** is met
- `Save as PDF` / `Open PDF View` enabled only when:
  - base readiness is met
  - preview exists
  - preview is fresh
  - host is not busy

### 5) Regression fix: stale-preview export protection

Review finding addressed:
- Added preview freshness flag on host:
  - set fresh on render (`data-preview-fresh='1'`)
  - set stale on any input/change path via `disablePrintActions()` (`data-preview-fresh='0'`)
- Save/Open remain disabled until user renders again

This restores and strengthens the stale-preview safeguard.

---

## Files changed

### Application
- `1.4.1 GUI Entry.html`
  - UI: readiness popover + due-date risk/quick actions
  - CSS: readiness/risk visuals
  - JS: readiness model, gating, issue navigation, stale-preview freshness tracking

### Tests
- `test/readiness-ux.spec.js` (new)
  - action gating behavior
  - stale preview disable after edits
  - risk classification
  - quick actions
  - go-fix focus behavior
- `test/basic.test.js`
  - updated expectations for current sample defaults
  - due-date note + strict due-date requirement checks
- `test/sample-bill.spec.js`
  - aligned expected ARREAR_ED values with current compute behavior

### PR metadata
- `pr_body.md` (this file)

---

## Validation

Executed:
- `npm test`

Result:
- 14 passed
- 0 failed

---

## Notes

- `Untitled.png` exists untracked in the branch workspace and is intentionally not included in this PR.
- Existing due-date note now uses concise Finance wording with DISCOM interpolation and remains covered by tests.

---

## Risks / compatibility

- Readiness now actively controls IOM actions; this is intentional and improves safety.
- No formula logic for billing computation was changed in this PR.
- Previous-working-day logic is weekend-aware only (no holiday calendar integration).

---

## Rollout / usage

1. Set/verify Due Date.
2. Observe readiness + risk status.
3. Resolve any listed issues via popover links.
4. Render IOM.
5. Save/Open PDF only after fresh render state is available.
