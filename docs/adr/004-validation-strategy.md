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