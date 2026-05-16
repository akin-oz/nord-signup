# Nordhealth Signup

Take-home submission for Nordhealth's Frontend Specialist role. A signup form
implemented with the Nord Design System on Nuxt 4 + TypeScript + Pinia, deployed
as a static SPA to Vercel.

[![CI](https://github.com/akin-oz/nordhealth-signup/actions/workflows/ci.yml/badge.svg)](https://github.com/akin-oz/nordhealth-signup/actions/workflows/ci.yml)

## Live demo

https://nord-signup.akinoztorun.dev

The take-home runs locally via `npm install && npm run dev`. The deployed
version is provided as a convenience.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000

# Tests
npm run test:unit    # Vitest, ~300ms (unit + integration)
npm run test:e2e     # Playwright + axe-core, 9 scenarios + 2 a11y scans
npm run test         # Both, sequenced

# Quality
npm run lint         # ESLint (Nuxt flat config)
npm run format:check # Prettier --check
```

Node version is pinned in `.nvmrc` (currently `22.17.1`); CI reads the same
file, so local and CI share a single source of truth for the runtime.

## Stack

Nuxt 4 with `srcDir: "app/"` (the framework default) running as a
client-rendered SPA — `ssr: false` per the brief, with both routes
prerendered at build time so first paint isn't gated on JS. State is split
across local refs, a `useSignupValidation()` composable, and one Pinia store
that exists solely to hand transition state from `/` to `/success`. The Nord
Design System ships the form's UI primitives via selective per-component
imports (`Input`, `Button`, `Checkbox`, `Banner`). TypeScript runs in strict
mode. Testing is three-tiered: Vitest for unit and integration, Playwright
plus axe-core for end-to-end and accessibility. Deployment is Vercel static;
GitHub Actions runs three parallel jobs (lint, unit, e2e) on every push and
PR.

## Decisions and assumptions

**Architecture follows Nuxt conventions, not feature-sliced design.** A
single-form, single-domain take-home doesn't carry the volatility load that
justifies FSD or vertical slicing. The structure is flat inside Nuxt 4's
default `srcDir: "app/"`: `app/pages/`, `app/composables/`, `app/middleware/`,
`app/stores/`, `app/plugins/`. State lives at the narrowest scope that
satisfies its access pattern — form fields are local refs, validation is a
composable, and the only Pinia store exists because `/success` is a different
component instance than `/` and the handoff has to survive `navigateTo`. The
trigger to refactor toward FSD (a second domain, feature-flag-toggleable
surfaces, multiple stakeholders) is documented; until those land, premature
abstraction is the larger risk.

**Validation reuses the platform email validator and follows NIST SP 800-63B
Rev 4 for password length.** Email format is checked through an off-DOM
probe — `document.createElement('input')` with `type="email"`, then
`probe.checkValidity()` — which consumes the same native engine that backs
`<input type="email">` without reaching into Nord's shadow DOM (Nord's
custom elements don't implement `ElementInternals`, so the host has no
`.validity` surface). Password minimum is **15 characters**, per NIST §3.1.1.2
item 1 for single-factor authentication; composition rules, strength meters,
and password hints are deliberately absent, all deprecated or forbidden in the
same spec. Validation triggers on blur per field and on submit; on-input only
clears already-shown errors, because validating mid-typing flags every email
as invalid until the user types the TLD. Field errors render via Nord's
`error` prop; non-field errors render via `<nord-banner>`. Two error classes,
two surfaces, no mixing.

**The performance budget treats `ssr: false` as one lever, not the whole
plan.** Both routes are prerendered to static HTML at build time, so the
client gets a paintable shell before any JS evaluates. The dominant lever for
a four-component form is keeping the Nord DS bundle small: selective imports
of `Input`, `Button`, `Checkbox`, and `Banner` produce a measured **49% JS
reduction** versus the whole-package import (497 KB → 251 KB on the largest
chunk, verified via `nuxi analyze`). Nord component CSS lives in shadow DOM
and never enters the bundled CSS, so selective imports move only JS surface.
Nuxt's vendor splitting is automatic and additive. The Nuxt version is pinned
exactly to `4.4.2` because `4.4.5` carries an unresolved upstream regression
([nuxt/nuxt#35033](https://github.com/nuxt/nuxt/issues/35033)) that breaks
`ssr: false` projects at dev-server boot.

**Route protection and test scope are scoped to what the brief actually
asks.** `/success` is guarded by middleware that reads Pinia, not by URL state
(email in URL leaks to history, logs, referrers) and not by localStorage
(implies authentication, which the brief doesn't request and which
localStorage shouldn't back anyway). Refresh of `/success` finds an empty
store and redirects to `/` — correct behavior for a transition page. Tests
answer questions the form's own behavior raises: validation rules
(Vitest unit), the store's read-once-then-clear contract that the middleware
depends on (Vitest integration), and the full user flow plus route guard plus
accessibility (Playwright + axe-core). What's deliberately not tested:
Nord's built-in password visibility toggle (upstream behavior), exhaustive
Tab-order suites (three fields and a button, axe-core covers labeling and
focus indicators), and network-failure assertions on a mocked submission
(mock-of-mock is tautological).

## Three Claude suggestions I rejected

1. **localStorage to persist `/success` refresh state.** Claude proposed
   storing a "signup-complete" token in localStorage so refreshing `/success`
   would keep working. Rejected because that pattern implies authentication
   state, expands scope into security territory the brief doesn't request,
   and localStorage isn't the right backing store for real auth anyway
   (XSS surface; httpOnly cookies or server sessions are the production
   answer). Refresh of `/success` redirecting to `/` is the correct behavior
   for a transition page, not a bug to paper over. (ADR-005)

2. **Five Claude Code hooks instead of three.** The initial hook proposal
   added a `branch-name-guard` and an `env-commit-guard` on top of lint, test,
   and config-edit guards. Rejected because branch naming and env-file
   protection solve multi-developer collaboration problems that don't exist
   on a solo take-home. Three hooks where each has a real purpose; the cut
   two would have been ceremony. (ADR-001)

3. **An eight-PR review ceremony with self-review comments.** Suggested as a
   way to make the AI-augmented workflow legible to reviewers. Rejected
   because the same audit trail compresses more densely into ADRs plus a
   three-bullet rejected-suggestions section. Forty inline comments across
   eight PRs would have replaced one readable surface with eight noisy ones.
   (ADR-001)

## ADR index

All decisions live in [`docs/adr/`](docs/adr/). Each ADR carries an `Origin`
field (Akın-initiated, Claude-suggested-accepted, Claude-suggested-rejected)
so the AI-augmented workflow is auditable in under 90 seconds.

| # | ADR | One-line summary |
|---|---|---|
| 001 | [Claude Code usage strategy](docs/adr/001-claude-code-usage-strategy.md) | Strict execution boundary; modular `.claude/rules/` + three lifecycle hooks enforce the ADR audit trail mechanically. |
| 002 | [Flat architecture](docs/adr/002-flat-architecture.md) | No FSD, no domain folders — Nuxt conventions are the structure for a one-form, one-domain project. |
| 003 | [Performance budget](docs/adr/003-performance-budget.md) | `ssr: false` + prerender + selective Nord DS imports; measured −49% JS versus whole-package import. |
| 004 | [Validation strategy](docs/adr/004-validation-strategy.md) | Nord built-in email validation, NIST 15-char password floor, on-blur per field, banner for non-field errors. |
| 005 | [Route guard with transient state](docs/adr/005-route-guard-with-transient-state.md) | Pinia + middleware for `/success`; rejected URL state (privacy) and localStorage (implies auth). |
| 006 | [State placement principle](docs/adr/006-state-placement-principle.md) | Narrowest scope that satisfies the access pattern: local refs → composable → store, in that order. |
| 007 | [Test strategy](docs/adr/007-test-strategy.md) | Vitest unit + integration, Playwright e2e + axe-core; tests answer real questions, no upstream coverage. |
| 008 | [Nord DS import path casing](docs/adr/008-nord-ds-import-path-casing.md) | PascalCase paths to match upstream filenames and survive case-sensitive Linux CI. |
| 009 | [Nuxt 4 `srcDir` correction](docs/adr/009-nuxt4-srcdir-and-architecture-correction.md) | Adopt the Nuxt 4 `app/` default; ADR-002's flat principle preserved, only the example tree updated. |
| 010 | [Off-DOM email validity probe](docs/adr/010-off-dom-email-validity-probe.md) | Detached `<input type="email">` + `checkValidity()` reuses the platform engine without shadow DOM access. |
| 011 | [Nuxt 4.4.2 version pin](docs/adr/011-nuxt-version-pin-for-upstream-regression.md) | Exact pin to work around [nuxt/nuxt#35033](https://github.com/nuxt/nuxt/issues/35033), a `ssr: false` dev-server regression on 4.4.4+. |
| 012 | [CI pipeline](docs/adr/012-ci-pipeline.md) | Three parallel GitHub Actions jobs (lint, unit, e2e); Node pinned via `.nvmrc` shared with local. |

## Project layout

```
nordhealth-signup/
├── app/                                # Nuxt 4 srcDir
│   ├── app.vue
│   ├── pages/
│   │   ├── index.vue                   # signup form
│   │   └── success.vue                 # post-signup transition page
│   ├── middleware/
│   │   └── signup-complete.ts          # /success route guard
│   ├── composables/
│   │   └── useSignupValidation.ts      # email + password rules
│   ├── stores/
│   │   └── signup.ts                   # transient cross-route state
│   └── plugins/
│       └── nord-ds.client.ts           # selective Nord component registration
├── tests/
│   ├── unit/validation.spec.ts         # Vitest, validation rules
│   ├── integration/signup-store.spec.ts # Vitest, store contract
│   └── e2e/
│       ├── signup-flow.spec.ts         # Playwright, full flow + guard
│       └── accessibility.spec.ts       # Playwright + axe-core
├── docs/adr/                           # 12 ADRs
├── .claude/                            # rules + hooks enforcing ADR boundary
├── .github/workflows/ci.yml            # three parallel jobs
├── nuxt.config.ts
└── package.json
```

## Deliberate omissions

- **No backend, no real authentication.** Submission is simulated async. Route
  guarding uses transient Pinia state, not a session; the middleware shape
  translates to a real `useAuth().isAuthenticated` check when auth becomes a
  requirement.
- **No password composition rules, no strength meter, no hints, no security
  questions.** All deprecated or forbidden by NIST SP 800-63B Rev 4 §3.1.1.2.
  Length is the rule.
- **No tests for Nord's password visibility toggle.** That's upstream Nord DS
  behavior; testing it tests their library, not this codebase.
- **No exhaustive Tab-order test suite.** Three fields and a button in natural
  DOM order; axe-core covers labeling and focus indicators. One targeted
  keyboard test (Enter submits while focused in password) covers the dynamic
  expectation that matters.
- **No network-failure assertions.** The submission is mocked, so asserting
  against the mock's failure mode would be tautological. The banner UI exists
  and is exercised by validation errors.
- **No multi-browser e2e matrix.** Chromium only — appropriate for the scope;
  cross-browser surface would matter for a production form, not a single-route
  take-home.
- **No CSS overrides on Nord components.** Shadow DOM is treated as opaque per
  Nord's own guidance.
