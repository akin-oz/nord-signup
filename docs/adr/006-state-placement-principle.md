# ADR-006: State Placement Principle

## Context

A signup form has at least four kinds of state:

1. Ephemeral form-field values (email, password)
2. Derived/validation state (errors, dirty flags)
3. UI toggles (password visibility)
4. Post-action transition state (signup complete + email)

Putting all of these in the same container (one big Pinia store, or all local refs) is a mid-developer pattern that creates coupling and obscures lifecycle. This ADR sets the rule for placement.

## Decision — placement principle

State lives at the **narrowest scope that satisfies its access pattern.** Widening scope (component → composable → store) is a one-way door: it adds coupling and cleanup burden. Narrow by default; widen only when the access pattern demands it.

## Three tiers, applied to this form

| Tier | Lifetime | Access pattern | Used here for |
| --- | --- | --- | --- |
| Local refs | Component instance | Read/write by one component | Form field values (email, password), UI toggles (password visibility) |
| Composable | Component instance, reusable shape | Logic + state co-located, reusable | Validation state and rules — `useSignupValidation()` |
| Pinia store | App lifecycle, cross-route | Read by component A, written by component B | Post-signup transition state — `signupComplete`, `email` (written by `/`, read by `/success`) |

## Why this principle

- **Narrower scope = clearer lifecycle.** A local ref dies with the component; no cleanup required. A Pinia store persists until explicitly cleared.
- **Narrower scope = fewer test seams.** Local refs need no mocking. Pinia state needs setup/teardown.
- **Wider scope leaks intent.** Putting `email` (during form fill) in Pinia would signal "this is shared state." It isn't, until submission completes.

## Alternatives considered

- **All Pinia (single store for all signup state).** Rejected. Couples form-field lifecycle to app-lifecycle. Refresh during typing would either preserve mid-form state (bad UX) or require manual reset logic (unnecessary complexity).
- **All local refs + URL state for transition.** Rejected per ADR-005 (email in URL is a privacy regression).
- **Composable-only (no Pinia at all).** Rejected. Composables don't survive `navigateTo()` route transitions cleanly; the consumer of a composable on `/success` would be a different component instance than the producer on `/`. Pinia's singleton pattern is the right fit for cross-route handoff.

## Consequences

- Form field state is disposable. Closing the form starts over — correct UX.
- Validation logic is reusable via composable, but doesn't pollute global state.
- Transition state is bounded: written once, read once, cleared after read. ADR-005's middleware enforces the "read once" contract.

## Origin

**Akın-initiated.**