# ADR-012: CI Pipeline — automated quality gates via GitHub Actions

## Context

Steps 7a, 7b, and 7c established a three-tier test suite: Vitest unit + integration (~300ms total) and Playwright e2e + axe-core a11y (9 scenarios). All tests are runnable locally via `npm run test:unit`, `npm run test:e2e`, and `npm run test`.

Local-green is necessary but not sufficient. Without push-driven gates:

- Commits pushed to `main` may not have been tested before push (developer discipline assumption)
- A broken commit surfaces only when the next developer pulls, or when Vercel's build silently succeeds against a broken state (Vercel build success ≠ test pass)
- The test infrastructure built in step 7 has no automated trigger surface beyond local intent

This is a take-home submission, so CI is not strictly required by the brief. But the submission's narrative argument is decision discipline and test infrastructure as a quality gate, not decoration. Shipping that infrastructure without an automated runner contradicts the narrative.

## Decision

Add a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on every push to `main` and every pull request to `main`. The workflow has three parallel jobs:

1. **lint** — `npm run lint` (ESLint, Nuxt-aware flat config) + `npm run format:check` (Prettier --check)
2. **test-unit** — `npm run test:unit` (Vitest, ~300ms)
3. **test-e2e** — `npm run test:e2e` (Playwright + axe-core, ~3s for 9 scenarios + 2 a11y scans)

All three jobs run in parallel on `ubuntu-latest` with Node 22 (project's local version per `.nvmrc` or `package.json` engines, whichever is canonical). The unit and integration tests share the same job since both run via `vitest run` and the integration tier needs no extra setup beyond happy-dom (already in devDependencies).

The e2e job installs the Chromium browser binary with system dependencies via `npx playwright install chromium --with-deps`. No browser cache because the run frequency is low; cache complexity for one job is over-engineering for a take-home.

## Alternatives considered

**Vercel build hooks only.** Vercel runs `npm run build` on every push and reports success/failure. This catches build-time errors (TypeScript, missing imports) but not test failures — `nuxt generate` doesn't run Vitest or Playwright. A broken test passes a green Vercel deploy. Rejected as insufficient.

**Pre-commit hooks via Husky or lefthook.** Runs on the developer's machine before commit. Reliable for the developer who configured it; useless for any other contributor or for catching what the developer's local environment masked (e.g., case-sensitive filesystem behavior between macOS and Linux — exactly the failure mode that prompted ADR-008). Rejected as developer-side, not gate.

**No CI at all.** Justifiable for a one-shot take-home that will not be maintained. Rejected because: (a) the submission already has 11 ADRs and a test suite, so the marginal cost of one more workflow file is low; (b) the absence of CI on a project that documents test strategy in its own ADR reads as decoration rather than infrastructure; (c) post-submission, this repo is part of Akın's portfolio under `akinoztorun.dev`, so it will live longer than the take-home review window.

## Consequences

- Every push to `main` and every PR triggers the three-job workflow. Broken commits become visible immediately, not on the next pull.
- Reviewer experience: a green badge in the README signals the submission has passed its own quality gates at the moment of submission, not just "passed locally at some point".
- Cross-machine compatibility verified continuously: macOS local vs Ubuntu CI is the surface where ADR-008 (PascalCase casing) and ADR-009 (Nuxt 4 srcDir) discovered their drifts. CI runs on Ubuntu, so these decisions are validated on every push.
- One-time cost: ~10 minutes for workflow authoring + Playwright cache cold-start (one CI run downloads Chromium browser binaries).
- Trade-off accepted: workflow uses Node 22 explicitly. If `package.json` engines field shifts later, the workflow needs an update too. The version is pinned in two places, but both are deliberate declarations rather than implicit defaults.

## Origin

Akın-initiated, Saturday morning submission integrity completion. The decision to add CI was made after the test infrastructure (steps 7a, 7b, 7c) and the skill-review compliance pass (commit a760e49) were complete — i.e., once the local test surface was provably reliable, the missing piece became the automated runner. Adding CI before the test infrastructure was complete would have been premature; adding it after the submission package is sealed would have been retroactive theater.