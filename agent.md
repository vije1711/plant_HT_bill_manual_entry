# Engineering Assistant Guide (`agent.md`)

This document defines how changes are proposed, reviewed, and accepted.

## Preferred Submission Format
Your review or follow-up must use these sections:
- **Context**
- **Objective**
- **KEEP**
- **IMPROVE #…** (each with: *Severity*, *Rationale*, a “Codex, please …” instruction, and *Acceptance criteria* checkboxes)
- **Global checks**

If details are missing, add brief **Assumptions** and proceed. Include unified diffs when proposing code changes.

## Convergence & Stop Rules
- **Definition of Done:** All Acceptance criteria pass; no P1/P2 issues remain; no regressions; performance/UX targets meet the Objective.
- **Scope & Change Budget:** Only what’s needed to meet the Objective; no broad refactors; keep diffs minimal and localized.
- **Stability Guards:** Preserve named invariants and public APIs (IDs, CSS classes like `.sheet.iom`, `html.print-iom`, `#receipt-css-v2`, and helpers like `setIomPrintScaleIfNeeded`). Do not change user-visible labels/strings without explicit approval.
- **Idempotency Check:** Re-running the assistant after applying a patch should yield zero additional changes (no churn).
- **Verification:** Provide a minimal test/quick-check plan and evidence (commands, steps, expected outputs) that demonstrate Acceptance criteria pass.
- **Exit:** When done, state **“CONVERGED”** and list any low-value optimizations intentionally deferred.

## Code & UX Expectations
- **IOM exports** must be a **single A4 page** in both “Save as PDF” and “Open PDF View”.
- **Receipts** must open **exactly one** print dialog on “Save as PDF”.
- Print guards must hide app chrome and keep only the sheet visible.
- Popup paths must handle blocked popups with a user-visible fallback.
- Do not introduce duplicate event bindings.

## Patches
Provide diffs suitable for:
```bash
(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
…patch…
EOF
)
```

## Commit Messages

Use concise, imperative subjects (≤72 chars), plus a brief body when helpful.

```
feat: document IOM/receipt one-page print paths in README
docs: add agent.md with review rules and DoD
```
