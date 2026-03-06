## Summary

This branch improves the animation and motion behavior of the `Final Bill Check` card and its `Tolerance Usage` panel in `1.4.1 GUI Entry.html`.

The previous version already had state-based color changes, but the motion treatment still felt generic:

- repeated sweep effects ran continuously regardless of whether values changed
- the status area pulsed in a fairly blunt way, especially in warning and danger states
- the tolerance bar updated abruptly with limited visual connection to the circular status ring
- there was no short "settle" animation when the underlying reconciliation values actually changed

The goal here was to make the component feel more intentional and informative rather than merely more animated.

## Problem

Before this change, the final-check animation had a few UX issues:

- motion did not clearly distinguish between passive state and fresh updates
- the strongest effects were always-on instead of being reserved for meaningful changes
- the status ring and tolerance fill did not feel synchronized
- the card could read as visually noisy while still not giving a strong sense of "new values just landed"
- reduced-motion handling existed, but the new animation design also needed to respect it fully

The requested improvement was specifically about making this animation better, not about changing reconciliation logic or altering any financial calculations.

## Approach

The update keeps the existing DOM structure and calculation rules, but changes how motion is produced and when it is triggered.

The new animation model separates motion into two categories:

1. Passive state motion

- `ok` uses a slow panel drift and a restrained breathing effect
- `warn` uses a more noticeable scan sweep and a slightly tighter breathing cycle
- `danger` keeps the most urgent motion, but with a cleaner pulse cadence and less "cheap" flicker
- `none` remains quiet

2. Update-triggered motion

- when the final-check values actually change, the card now runs a one-shot refresh sequence
- the status block performs a short lock-in animation
- the metric tiles reveal with light staggering
- the tolerance bar gets a one-pass shimmer
- this refresh animation does not replay endlessly; it only runs when the relevant values/state change

This produces motion that communicates both current status and recent updates.

## Implementation Details

### CSS changes

The final-check visuals in `1.4.1 GUI Entry.html` were reworked with a more structured motion system:

- registered `--final-usage` with `@property` so the circular usage ring can animate smoothly as a percentage value
- refined existing keyframes for warning and danger motion so they feel less harsh and less arbitrary
- added new keyframes for:
  - panel drift
  - status breathing
  - one-shot refresh sweep
  - status lock-in
  - metric reveal
  - metric sheen
  - tolerance shimmer
  - tolerance value pop
- upgraded the `#finalCheckBadge` styling so background motion, state glow, and the conic ring read as one visual system
- gave metric tiles their own overflow-isolated surface so one-shot sheen/reveal effects can happen cleanly
- added smoother transitions to the tolerance bar and tolerance value
- expanded `prefers-reduced-motion` coverage to include the new state-driven and refresh-only animations

### JavaScript changes

The reconciliation logic still computes the same values:

- `I9_check`
- `deltaFinal`
- status state (`ok`, `warn`, `danger`, `none`)
- tolerance state

What changed is how the UI responds after computing them:

- introduced a small helper that safely restarts transient animation classes
- added a `motionSignature` built from:
  - final-check state
  - tolerance state
  - rounded `I9_check`
  - rounded `FINAL`
  - rounded delta
  - tolerance usage
- the signature is stored on the badge and compared on each recompute
- if the signature changes, the card applies short-lived `is-refreshing` classes to the badge and tolerance card
- if the signature does not change, the one-shot refresh animation does not replay

This keeps the animation responsive without making the panel feel restless during unrelated recomputations.

## What Did Not Change

This branch does not change:

- the formula used for final reconciliation
- the final-check tolerance amount
- any values shown in the three metrics
- accessibility narration text content structure, beyond reflecting the same computed states as before
- general page layout outside the final-check and tolerance panels
- export, persistence, or other billing workflows

The change is intentionally scoped to presentation and animation behavior around the existing reconciliation output.

## User-Facing Result

After this change:

- the circular status ring eases into new usage values instead of feeling static or abrupt
- `Stable`, `Watch`, and `Action` have clearer visual personalities
- strong motion is reserved for actual value updates rather than always running at full intensity
- the tolerance bar now feels tied to the same status system as the main badge
- the component is more polished on repeated recalculations because it "locks in" rather than just pulsing forever

## Accessibility and Motion Safety

The new motion system preserves the existing reduced-motion intent and extends it so the new one-shot refresh effects are also suppressed when `prefers-reduced-motion: reduce` is active.

That matters here because the change adds more nuanced motion, and the accessibility behavior needed to scale with it rather than regress.

## Validation

Static validation completed:

```bash
git diff --check
```

Result:

- passed with no whitespace or patch-format issues

Attempted test command:

```bash
npm test
```

Result:

- could not run in the current environment
- local Node/NPM is failing under WSL1 with:
  - `WSL 1 is not supported. Please upgrade to WSL 2 or above.`
  - `Could not determine Node.js install directory`

Because of that environment limitation, this branch does not include a successful automated test run.

## Risk Assessment

Risk is moderate-low and mostly visual:

- the business logic and reconciliation formulas are unchanged
- the DOM structure is unchanged
- the biggest changes are to CSS motion and small UI-state bookkeeping for transient animation classes

Residual risks:

- some animation timing may still need subjective tuning after browser review
- `@property` support is modern-browser oriented, though the UI still has reasonable fallback behavior if it is not fully honored
- visual balance may vary slightly by theme because the badge inherits each theme's palette treatment

## Files Changed

- `1.4.1 GUI Entry.html`
- `pr_body.md`

## Suggested Commit Message

`Improve final check animation states`

## Suggested PR Title

`Improve final check animation states`
