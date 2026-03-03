## Summary

This branch stabilizes the finance readiness badge shown inside the `Make IOM` toolbar control.

Before this change, the badge text switched between `Ready` and `Blocked`, and because those labels are different widths, the `Make IOM` summary would subtly resize. That caused neighboring toolbar items like `Configuration` and `More` to shift horizontally, creating a visible "wiggle" in the header.

This update removes that movement while preserving the existing readiness wording and logic.

## Why

`Make IOM` is a high-traffic toolbar control, and the finance readiness state is expected to change as users fill in or correct required fields.

The old behavior created two UX problems:
- the top toolbar felt visually unstable because adjacent menus moved when the readiness label changed
- the badge itself did not keep the state text in a stable visual center once width reservation was introduced

The final implementation fixes both of those issues and also avoids a new accessibility pitfall where a hard-coded width could clip `Blocked` for users with larger effective font sizes.

## What Changed

### Toolbar badge stabilization

In `1.4.1 GUI Entry.html`:
- the finance readiness badge now reserves a font-aware minimum width instead of sizing directly off the current label text
- the badge content is laid out so the visible state text stays centered even though the status dot appears on the left
- a hidden trailing spacer equal to the dot width balances the badge, so `Ready` and `Blocked` occupy the same visual center

This keeps the toolbar stable without changing the actual state text.

### Accessibility-safe sizing

The final implementation intentionally uses:
- `min-inline-size` instead of a hard fixed width
- `flex: 0 0 auto` instead of a rigid badge cap

Why this matters:
- the toolbar still avoids width jitter in normal use
- the badge can grow if browser font metrics are larger than expected
- `Blocked` will not be clipped for users who enable larger minimum font sizes or other text-scaling behavior

### No logic changes

This branch does **not** change:
- finance readiness computation
- `Ready` / `Blocked` wording
- badge color semantics
- IOM gating behavior
- toolbar structure or menu behavior

This is a focused presentation-layer fix for badge stability.

## Test Coverage

Updated `test/readiness-ux.spec.js` to lock in the new behavior with source-level regression checks.

The new assertions verify that:
- the finance readiness badge reserves a font-aware minimum width
- the badge includes a hidden balancing spacer matching the left status dot
- the readiness label is a flexing centered item inside the badge slot

This gives us stable regression coverage without relying on brittle layout measurements in JSDOM.

## User-Facing Impact

### Before
- `Ready` / `Blocked` changes could make `Configuration` and `More` shift sideways
- the toolbar looked slightly unstable during readiness updates
- early attempts to stabilize width risked clipping under larger font settings

### After
- `Configuration` and `More` stay put
- the `Make IOM` badge still shows the same readiness state
- `Ready` and `Blocked` remain visually centered within the badge
- the badge can grow when larger font metrics require it

## Validation

Validated locally with:

```bash
node --test test/readiness-ux.spec.js
npm test
```

Results:
- `test/readiness-ux.spec.js` passed
- full test suite passed (`14/14`)

## Files Changed

- `1.4.1 GUI Entry.html`
- `test/readiness-ux.spec.js`
- `pr_body.md`

## Notes

This is a low-risk UI polish branch.

The change is intentionally narrow, but it is still worth visually checking the toolbar across:
- multiple themes
- browser zoom levels
- fallback fonts / minimum font-size settings

That said, the implementation is specifically designed to behave better under those conditions than the earlier fixed-width approach.
