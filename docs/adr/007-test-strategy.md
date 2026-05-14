# ADR-007: Test Strategy

## Context

The brief does not mention testing explicitly, but a senior submission without tests is incomplete. The seniority signal is not coverage volume — it's whether each test answers a question the form's behavior actually raises.

## Decision — test stack

| Level | Tool | Scope |
| --- | --- | --- |
| Unit | Vitest | `useSignupValidation()` rules — email presence, password presence, password ≥15 |
| Integration | Vitest + Vue Test Utils | Pinia store contract — write on signup, read on success mount, reset clears state |
| E2e | Playwright | Full user flow + route guard + accessibility scan + targeted keyboard |

## What E2e covers

- **Happy path:** fill form → submit → success page shows email
- **Route guard (direct):** GET `/success` directly → redirect to `/`
- **Route guard (refresh):** complete signup → success visible → refresh `/success` → redirect to `/` (Pinia cleared)
- **Validation:** empty submit shows field errors, submit blocked
- **Validation:** password under 15 chars shows error, submit blocked
- **Targeted keyboard:** focus password field, press Enter → form submits (real user behavior, not Tab-order theatre)
- **axe-core scan:** runs as Playwright fixture on `/` and `/success`; assertion fails on serious/critical violations

## What is deliberately not tested

- **Password visibility toggle.** `nord-input type="password"` ships this behavior. Testing it tests upstream Nord DS, not this codebase. Excluding upstream library behavior from local test surface is a deliberate scope boundary.
- **Network failure handling.** Submission is mocked. Testing mock-of-mock fails the "test answers a real question" filter. The error banner UI (ADR-004) is exercised via validation errors; the network-failure code path is implemented but not asserted because the mock makes the assertion tautological.
- **Exhaustive Tab-order suite.** Three form fields plus a button. Natural DOM order produces correct Tab order; axe-core checks form labeling and focus indicators. Adding a multi-step keyboard suite for trivial Tab order would be test theatre. One targeted keyboard test (Enter submits) covers the real user behavior question.

## Why integration-test the Pinia store separately from e2e

E2e validates that the full system works. Integration test validates the **contract** the store exposes — that ADR-005's "read once, then clear" pattern actually clears on mount, that a second `/success` visit gets an empty store. This is the contract the middleware (ADR-005) depends on.

If the contract breaks, e2e tells me the symptom; integration test tells me the cause. Both layers run in <1 second; the maintenance cost is negligible for the diagnostic value.

## Accessibility test rationale

Nord DS publishes an accessibility checklist (`nordhealth.design/accessibility-checklist/`). Submitting work that uses Nord components without verifying the checklist would be cargo-cult adoption. axe-core scan covers the static portion of the checklist (ARIA, contrast, labels, headings). The targeted keyboard test covers the one dynamic accessibility expectation that matters for a form: submit-on-Enter while in a field.

## Consequences

- Test suite runtime: targeted, fast enough to run on every save.
- Coverage scope: behavior the form's code actually controls, nothing inherited from Nord or mocks.
- Maintenance debt: minimal — tests don't duplicate each other, don't test upstream libraries.

## Origin

**Akın-initiated.**