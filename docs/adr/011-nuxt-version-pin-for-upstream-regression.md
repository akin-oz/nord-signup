# ADR-011: Nuxt 4.4.2 Pin for Upstream Regression Workaround

## Context

ADR-003 mandates `ssr: false` to keep the runtime fully client-side per the brief, with `nitro.prerender.routes` providing static HTML for `/` and `/success` at build time. The initial `nuxi init` resolved `nuxt: ^4.4.5` from the caret-pinned dependency.

During step-5 dev server verification, `npm run dev` failed with:

```
ERROR  No entry found in rollupOptions.input
at resolveServerEntry (node_modules/@nuxt/vite-builder/dist/index.mjs:128:8)
```

The error fires at Vite's `configureServer` hook, not at template parse time. `nuxi prepare` succeeds cleanly; only the dev/build pipeline activates the failing code path.

## Finding

Empirical bisect confirmed by upstream issue:

1. Nuxt 4.4.2: dev server boots cleanly with the project's current configuration (`ssr: false` + `nitro.prerender.routes` + selective Nord component imports + Pinia module).
2. Nuxt 4.4.5 (initial caret resolution): dev server fails with the rollupOptions error.
3. Upstream issue [nuxt/nuxt#35033](https://github.com/nuxt/nuxt/issues/35033) reports the same symptom for `ssr: false` projects on 4.4.4+, with a "workaround available" label. The regression is acknowledged upstream.

Intermediate diagnostic step: removing `nitro.prerender` from `nuxt.config.ts` did not fix the error on 4.4.5, falsifying the initial hypothesis that the prerender block was the trigger. The version itself is the cause.

## Decision

Pin `nuxt` to exact version `"4.4.2"` in `package.json` (no caret, no tilde). The exact pin prevents `npm install` from resolving back into the regression range on a fresh checkout.

ADR-003's performance budget (`ssr: false` + `nitro.prerender.routes` for both routes) is preserved unchanged.

## Alternatives considered

- **Remove `ssr: false`.** Rejected. Directly violates ADR-003 and the brief's client-only requirement. The take-home brief is the wrong context to inverte a documented decision to chase a build error.
- **Remove `nitro.prerender`.** Rejected after empirical test: didn't fix the error on 4.4.5. Would also weaken ADR-003's prerender intent for the two routes.
- **Wait for upstream fix.** Rejected on deadline grounds. The take-home is due Saturday; the issue is open and unresolved as of the workaround date.
- **Downgrade to 4.4.2 (chosen).** Targets the version, not the configuration. ADR-003 intact. Trade-off: 4.4.2 is older and may carry other latent issues, though none have surfaced in the project.

## Consequences

- Exact version pin requires manual review when upgrading. A future maintainer must check whether [#35033](https://github.com/nuxt/nuxt/issues/35033) has been resolved before relaxing the pin back to a caret range.
- ADR-003's full performance budget is intact; no configuration changes were needed to apply this workaround.
- `nitro.prerender` continues to operate as designed on 4.4.2.
- Project documentation and `package.json` agree: pin is exact, the reason is upstream regression, and the reversal path is gated on upstream fix.

## Origin

**Empirical discovery, accepted.** Surfaced when `npm run dev` failed at step-5 verification. Issue #35033 was confirmed via web search before the version pin was applied. Akın directed an ADR before any further commits.
