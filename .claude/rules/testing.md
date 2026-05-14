---

paths:

- "tests/**/*.ts"
- "tests/**/*.spec.ts"
- "vitest.config.ts"
- "playwright.config.ts"

---

# Testing Rule

## Test pyramid for this project

**Unit (Vitest):**

- useSignupValidation rules
    - email presence
    - password presence
    - password ≥15 characters

**Integration (Vitest + Vue Test Utils):**

- Pinia signupStore contract
    - markComplete writes signupComplete=true, email
    - reset clears state
    - after reset, isComplete=false

**E2e (Playwright):**

- Happy path: fill form → submit → success page shows email
- Route guard: direct GET /success → redirect to /
- Route guard: complete signup → success → refresh /success → redirect to /
- Validation: empty submit blocks
- Validation: password <15 chars blocks
- Targeted keyboard: focus password field, press Enter → form submits
- axe-core scan on / and /success, fail on serious/critical violations

## Deliberately NOT tested

- **Password visibility toggle** — Nord DS built-in; testing it tests upstream library, not project code.
- **Network failure** — submission is mocked; testing mock-of-mock is tautological. Banner UI exercised via validation errors.
- **Exhaustive Tab-order suite** — 3 fields, natural DOM order produces correct Tab order. axe-core covers focus indicators.

## Why integration test the store separately from e2e

E2e validates the full system. Integration test validates the **contract** ADR-005's middleware depends on. If the contract breaks, e2e reports the symptom; integration reports the cause. Both run in <1s; maintenance cost is negligible relative to diagnostic value.

## Test placement

```
tests/
├── unit/
│   └── validation.spec.ts
├── integration/
│   └── signup-store.spec.ts
└── e2e/
    ├── signup-flow.spec.ts
    └── accessibility.spec.ts
```

## Coverage philosophy

Not maximizing coverage. Testing the behaviors the form's code actually controls. Anything inherited from Nord DS, browser APIs, or mocks is deliberately out of scope.