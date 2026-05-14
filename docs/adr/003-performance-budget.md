# ADR-003: Performance Budget

## Context

The brief specifies "client-side only rendered." Treating that as a single performance decision is a mid-level read. Client-side rendering is one lever in a broader performance budget that includes server response, bundle composition, and JS execution.

## Decision

Performance budget for this submission:

1. **`ssr: false`** per brief.
2. **Prerender enabled** for static routes (`/` and `/success`).
3. **Code splitting** via Nuxt defaults (vendor chunks separated).
4. **Selective-path imports from `@nordhealth/components`** — only `nord-input`, `nord-button`, `nord-checkbox`, `nord-banner` enter the bundle.

## Alternatives considered — whole-package import

`import '@nordhealth/components'` ships the entire DS (50+ components) for a 3-field form. Nord docs explicitly recommend per-component imports for this reason. Tree-shaking behavior for the bundled package is unverified — measured via `nuxi analyze` before commit:

- Naive import baseline: [TO BE MEASURED FRIDAY]
- Selective import: [TO BE MEASURED FRIDAY]
- Delta: [TO BE DOCUMENTED HERE]

If the delta is marginal, this ADR will be honestly revised: the measurement showed tree-shaking works; selective imports were chosen anyway for explicit dependency surface and readability.

## Empirical context — BCD measurements

At BCD I applied a comparable performance lever set to the sign-in route and measured:

- **TTFB: ~6,060ms → ~100ms** (~60x improvement via prerender + edge config)
- **Speed Index: 4.9s → 2.2s** (~2.2x improvement via vendor chunk splitting)
- **Script count: 57 → 39** (code splitting)
- **Largest JS chunk: 545KB → 172KB** (vendor splitting)

Same lever family applies here at smaller scope. Source: Lighthouse reports from `dev.bcd.net/sign-in` (March 2026 baseline vs May 2026 post-optimization).

## Top lever in this context

**DS splitting > prerender > Nuxt code splitting.**

For a single-route signup form, prerender's value is bounded (one route is already trivial to prerender). Nuxt code splitting is automatic. The active lever is keeping Nord DS bundle minimal — 50+ components dropped to 4.

## Consequences

- Bundle size scoped to the form's actual surface area.
- Cost: explicit import maintenance when components change — acceptable for a 4-component form.
- TTFB and Speed Index will be measurable in the submission (`nuxi analyze` output included).

## Origin

**Akın-initiated.**