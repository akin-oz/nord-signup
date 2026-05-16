# ADR-005: Route Guard with Transient State

## Context

The brief: "Once signed up, they should be presented with a success page." This creates two concerns:

1. **Post-signup state transition** — moving from form to success display.
2. **Preventing direct access** to the success page by unauthorized routes (URL paste, bookmark, refresh).

Conflating these with authentication is a common scope error. The brief does not request authentication; it requests a state transition with appropriate access control.

## Decision

- Pinia store holds transient post-signup state (`signupComplete`, `email`).
- Route middleware guards `/success` by checking `signupStore.isComplete`.
- On `/success` mount, the store value is read for display, then reset.
- Refresh of `/success` finds an empty store → middleware redirects to `/`.

## Mechanism

1. Form submit → simulated async resolution → `signupStore.markComplete({ email })`
2. `navigateTo('/success')`
3. `middleware/signup-complete.ts` runs on every `/success` navigation; if `!signupStore.isComplete`, returns `navigateTo('/')`
4. `/success.vue` reads `signupStore.email`, displays welcome, calls `signupStore.reset()` on mount
5. Refresh of `/success` → Pinia state empty → middleware redirects to `/`

## Alternatives considered

- **URL query parameter (`/success?email=...`).** Rejected. Email in URL ends up in browser history, server access logs, referrer headers, shared screenshots, HAR exports. Privacy regression. The veterinary health-tech context (Provet Cloud) makes this regression more material in production.
- **localStorage token + middleware.** Rejected. This pattern implies authentication state, which is out of scope. Real authentication requires httpOnly cookies or server-side session, not localStorage (XSS surface). Implementing fake auth via localStorage in a signup form take-home expands scope into security territory the brief does not request, and introduces patterns that don't translate to production.
- **sessionStorage.** Rejected. Same scope concern (auth-shaped persistence), and tab-scoped persistence is the wrong semantic for a one-shot post-signup transition.
- **Inline success state on the form (no separate route).** Rejected. The brief says "success page" (a route), and the screening conversation specifically called out route middleware as a demonstration concern. Separate route is the right read.

## Consequences

- `/success` is non-bookmarkable and non-refreshable — correct behavior for a transition page.
- No authentication semantics smuggled into a non-auth feature.
- Pattern translates to production: real auth would replace the Pinia transient check with a server-validated session check in the same middleware shape.

## Production extension

When authentication becomes a real requirement, the middleware contract (`middleware/signup-complete.ts`) is the integration point. The check changes from `signupStore.isComplete` to `useAuth().isAuthenticated`; the rest stays. **The middleware contract is reusable; the state source isn't.**

## Origin

**Akın-initiated** (overall pattern). localStorage alternative: Claude-suggested-rejected (initial Claude suggestion proposed localStorage for refresh-persistence; rejected after recognizing scope expansion into authentication).

## Update — 16 May 2026

The brief explicitly requires "a way to make the password visible". This was missed during the initial scope distillation (step 0); discovered during the final pre-submission brief re-read on submission day.

The toggle is implemented via Nord's documented slot pattern from input.md: a slotted `<nord-button slot="end" variant="plain" square>` with two `<nord-icon>` elements (`interface-edit-on` for hidden state, `interface-edit-off` for visible state), each carrying a `label` attribute that provides the icon-only button its accessible name. A `<nord-tooltip>` paired via `aria-describedby` covers visual users. Toggle state lives in a local `ref<boolean>` and swaps the input's `type` attribute between `password` and `text`.

This stays within ADR-002's flat architecture (no new component) and ADR-003's selective Nord imports (adds Icon + Tooltip, total 8 components, still well under the whole-package surface). Validation timing (ADR-004) and the off-DOM probe (ADR-010) are unaffected — the toggle is presentation-layer only.

The visibility toggle was originally listed as a "deliberate omission" in this submission's polish-pass spec (step 7). The brief's literal text overrides that judgment; the README is updated to reflect this correctly rather than carrying the stale omission.