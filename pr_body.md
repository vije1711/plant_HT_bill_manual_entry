## Summary

This branch refines the visual treatment of the sticky header card that contains the `WEG Billing Calculator` title.

The issue reported during review was a thick line appearing above the top menu/title card, making the header feel visually detached from the rest of the card surface. The previous implementation used a full-width `header::before` accent strip, which read more like a separate slab sitting on top of the card than an integrated detail.

This update replaces that full-width strip with a shorter, integrated accent tab so the header keeps its industrial styling without looking improperly assembled.

## Problem

Before this change:

- the header rendered a bright, full-width accent line across the top edge
- that line visually competed with the existing border and inset highlight already used by the card
- the combination made the `WEG Billing Calculator` panel look like it had an extra layer placed on top of it
- after the first pass at softening the line, the result became too understated and lost the intentional visual character of the header

The final goal for this branch was not simply to remove the line, but to make the top accent feel deliberate, integrated, and visually "cool" again.

## Final Approach

The header accent is still implemented through `header::before`, but its geometry and presentation were reworked:

- the accent no longer spans the full width of the header
- it now starts inset from the left edge
- it uses a compact width that scales responsively instead of stretching across the whole card
- its height was increased from a hairline into a small top tab
- a rounded lower edge was added so the shape feels attached to the header card
- a subtle shadow and inner highlight were added so the accent feels like a built-in piece of the panel rather than a painted rule

The original theme-driven gradient was preserved, so the accent still participates in the industrial palette and remains consistent with the existing brand/header styling.

## What Changed

In `1.4.1 GUI Entry.html`:

- updated the `header::before` pseudo-element used for the top accent treatment
- changed the accent from:
  - full-width
  - 3px tall
  - flat line styling
- to a new treatment that is:
  - left-inset
  - responsive in width
  - 8px tall
  - rounded at the bottom corners
  - lightly shadowed and highlighted
  - explicitly non-interactive with `pointer-events:none`

## What Did Not Change

This branch does not change:

- header layout structure
- toolbar controls
- menu behavior
- theme selection logic
- brand/title copy
- any business logic, calculations, or export workflows
- any test behavior outside of re-running the existing suite for regression confidence

This is a presentation-only polish change scoped to the header accent detail.

## User-Facing Impact

### Before

- the title/header card looked like it had a separate thick strip pasted on top
- the top edge drew too much attention away from the actual title and controls
- a first softening pass removed the harshness, but also removed too much personality

### After

- the `WEG Billing Calculator` card reads as a single integrated panel
- the header keeps a distinct styled accent without the detached-strip look
- the top detail feels more intentional and decorative instead of accidental
- the visual hierarchy shifts back toward the title and toolbar content

## Implementation Notes

The update intentionally keeps the existing gradient colors:

- copper-toned primary accent
- steel-toned trailing fade

That means the change improves the shape language of the header without forcing a broader retune of the active theme system.

The resulting accent behaves more like a design tab or integrated plate than a border override, which better matches the industrial control-panel style already present in the page chrome.

## Validation

Validated locally with:

```bash
npm test
```

Result:

- full test suite passed (`14/14`)

## Risk Assessment

Risk is low because:

- only CSS for the header accent pseudo-element changed
- no DOM structure changed
- no JavaScript logic changed
- no tests required updating to accommodate behavior changes

The main residual risk is purely visual and limited to how the accent feels across viewport sizes and themes, but the responsive width and preserved theme gradient help keep that risk narrow.

## Files Changed

- `1.4.1 GUI Entry.html`
- `pr_body.md`

## PR Title

Refine header accent integration
