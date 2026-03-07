## Summary

This branch polishes the `Final Bill Check` panel in two connected ways:

- reworks the status/tolerance animation so it feels calmer and more deliberate
- compacts the right-side card stack so it no longer forces excessive empty space inside `Final Bill for IOM`

The work is scoped to [1.4.1 GUI Entry.html](./1.4.1%20GUI%20Entry.html) and is intentionally presentation-focused. No billing formulas or reconciliation math were changed.

## Why This Change Was Needed

Two issues were visible in the existing `Final Bill Check` area:

1. The motion behavior felt too generic and noisy.

- `Stable`, `Watch`, and `Action` all felt too similar
- refreshes did not clearly distinguish "live update" from "constant ambient motion"
- the tolerance bar and metrics did not have a clean one-shot update rhythm

2. The right column was vertically heavier than the left column.

- `Final Bill Check` content started lower than `Final Bill for IOM`
- the badge and tolerance card stack consumed too much height
- because both sections share the same grid row, the taller right column stretched the left section and created a visible dead zone at the bottom of `Final Bill for IOM`

The layout issue was not just subjective. It was measured before the compaction pass:

- left title-to-content gap: `12px`
- right title-to-content gap: `32px`
- empty space inside `Final Bill for IOM`: `133.65625px`
- gap between the check badge and tolerance card: `16px`

## Final Approach

### 1. Calm / premium motion profile

The animation direction chosen for this branch was the restrained option:

- `Stable` now uses a soft breathing treatment instead of a constant busy sweep
- `Watch` keeps a lighter scan behavior with lower visual pressure
- `Action` pulses the status tile rather than making the whole card feel alarmed
- real value changes trigger a one-shot refresh sequence instead of causing motion to loop constantly

### 2. Right-column compaction without type-scale changes

The height mismatch was fixed by reducing vertical bulk in the right column rather than shrinking the headline values.

This keeps the equal-height dashboard composition intact while avoiding the font disharmony risk that would come from scaling the key numbers down just to save space.

## What Changed

### Motion and state behavior

- registered `--final-usage` as a typed CSS custom property so the status ring can interpolate cleanly
- added calmer state-specific motion:
  - `finalStatusBreathe`
  - refined `checkWarnSweep`
  - softened `checkDangerPulse`
  - slower `toleranceAlert`
- added one-shot refresh animations:
  - `finalRefreshSweep`
  - `finalStatusSettle`
  - `finalMetricLift`
  - `finalMetricSheen`
  - `toleranceShimmer`
- expanded reduced-motion handling so the new transitions and refresh animations are disabled consistently when requested

### Refresh logic

- added `restartTransientClass(...)` to reliably restart one-shot animation classes
- introduced a `motionSignature` on the final-check badge so refresh animation only runs when state/value data actually changes
- refresh animation now applies to:
  - `#finalCheckBadge`
  - `.tolerance-card`
- static refreshes no longer retrigger the stronger motion path unnecessarily

### Layout and spacing

The compaction pass is intentionally spacing-only on the right column:

- `.final-check-card`
  - gap reduced from `16px` to `12px`
  - heading spacing aligned with the left card through a stronger heading override
- `#finalCheckBadge`
  - margin-top removed
  - overall padding reduced from `20px 24px 22px` to `16px 20px 18px`
  - internal gap reduced from `24px` to `20px`
- `#finalCheckBadge .status-wrap`
  - base width reduced from `118px` to `112px`
  - themed width reduced from `124px` to `116px`
  - internal gap reduced from `10px` to `8px`
  - padding reduced from `18px 14px` to `14px 12px`
- `#finalCheckBadge .metrics`
  - grid gap reduced from `12px 14px` to `10px 12px`
- `#finalCheckBadge .metric`
  - padding reduced from `10px 12px` to `8px 12px`
- `.tolerance-card`
  - gap reduced from `12px` to `10px`
  - padding reduced from `18px 20px 20px` to `14px 18px 16px`

## Verified Before/After Measurements

These measurements came from the Playwright capture used during the layout pass:

- right title gap: `32px -> 12px`
- left title gap: `12px -> 12px`
- empty space inside `Final Bill for IOM`: `133.65625px -> 73.65625px`
- gap between badge and tolerance card: `16px -> 12px`
- final-check column height: `506px -> 446px`
- final-check badge height: `278px -> 254px`
- tolerance card height: `127px -> 115px`

The important result is that the right card now starts at the same visual depth as the left card, and the shared grid row shrinks by `60px` without changing the primary number sizes.

## Files Changed

- `1.4.1 GUI Entry.html`
- `pr_body.md`

## Validation

Validated locally with:

```bash
git diff --check -- "1.4.1 GUI Entry.html"
```

Additional visual validation:

- captured pre/post layout measurements via Playwright
- confirmed the right title-to-content gap now matches the left card
- confirmed the shared top-row height dropped from `506px` to `446px`

Local capture artifacts were saved under `output/playwright/layout-check/` during development for comparison, but are not part of this commit.

## Risk Assessment

Risk is low to moderate and primarily visual:

- CSS for the final-check badge and tolerance card was retuned in several places
- the refresh logic now depends on a motion signature to decide when to animate
- no financial formulas, data mapping, or output calculations were changed

The main residual risk is visual feel across themes and viewport sizes, but the implementation deliberately avoids resizing the headline values and keeps the compaction focused on spacing and animation behavior.

## PR Title

Polish final bill check motion and spacing
