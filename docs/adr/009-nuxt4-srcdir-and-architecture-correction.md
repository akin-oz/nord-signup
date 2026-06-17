# ADR-009: Nuxt 4 `app/` srcDir and Architecture Documentation Correction

## Context

ADR-002 mandated a flat directory structure ("Nuxt 3 ships flat") and the example tree placed `pages/`, `composables/`, `middleware/`, `stores/`, and `plugins/` at the repo root. The `.claude/rules/architecture.md` rule encoded the same root-level tree.

Both were correct for Nuxt **3**. This project is on **Nuxt 4** (`nuxt: ^4.4.5` in package.json). Nuxt 4 changed the default `srcDir` from the project root to `app/`. `nuxi init` on Nuxt 4 produces `app/app.vue` and expects `app/pages/`, `app/composables/`, `app/middleware/`, `app/stores/`, `app/plugins/` etc. Only `server/`, `public/`, `tests/`, `node_modules/`, configs, and ADR/rule infrastructure stay at the root.

The drift was discovered after `plugins/nord-ds.client.ts` and `stores/signup.ts` were created at the repo root following ADR-002's example. Empirical verification:

- `.nuxt/types/plugins.d.ts` lists only framework and Pinia-module plugins; `plugins/nord-ds.client.ts` is absent.
- `.nuxt/imports.d.ts` contains no `useSignupStore`.

The files are dead weight in their current location. Nuxt's auto-discovery only scans inside `srcDir`, which defaults to `app/`.

## Decision

1. Adopt Nuxt 4's default `srcDir: "app/"`. Do not override it in `nuxt.config.ts`. Defaults are the contract; overriding them adds maintenance for no gain.
2. Move the misplaced files:
    - `plugins/nord-ds.client.ts` → `app/plugins/nord-ds.client.ts`
    - `stores/signup.ts` → `app/stores/signup.ts`
3. Future code per the original step plan goes under `app/`:
    - `app/composables/useSignupValidation.ts`
    - `app/middleware/signup-complete.ts`
    - `app/pages/index.vue`, `app/pages/success.vue`
4. The tests/ directory stays at the repo root per ADR-007 (Vitest/Playwright convention; not Nuxt-scanned). ADR-007's test placement under tests/unit/, tests/integration/, tests/e2e/ remains correct as-is.
5. ADR-002's intent — **flat structure inside `srcDir`, no FSD/domain folders** — is unchanged. Only the directory example is corrected.

## Resulting tree

```
nord-signup/
├── app/                   # srcDir (Nuxt 4 default)
│   ├── app.vue
│   ├── pages/
│   ├── middleware/
│   ├── composables/
│   ├── stores/
│   └── plugins/
├── tests/                 # Vitest + Playwright, not Nuxt-scanned
├── docs/adr/
├── .claude/
├── nuxt.config.ts
└── package.json
```

`server/` and `public/` would also live at the root if added; not in scope for this submission.

## Alternatives considered

- **Override `srcDir: '.'` to keep root-level `pages/`, `stores/`, etc.** Rejected. Works, but inverts the Nuxt 4 default and signals to any reviewer that the project resists framework conventions. The take-home brief is exactly the wrong place for that signal. Future Nuxt upgrades would also be more likely to surface friction on this configuration than on the default.
- **Leave files where they are and hope auto-discovery picks them up.** Empirically rejected — `.nuxt/types/plugins.d.ts` and `.nuxt/imports.d.ts` confirm the files are invisible to Nuxt's resolver.
- **Amend ADR-002 in place.** Rejected. ADRs are append-only by convention (the audit trail is the value). A new ADR that supersedes the directory example is cleaner than mutating ADR-002, and it preserves the record of why the correction was needed.

## Consequences

- ADR-002's textual decision (flat structure inside srcDir) holds; only the example tree is corrected.
- `.claude/rules/architecture.md` needs the same tree correction. Akın will edit it manually (rules directory is hook-protected).
- Two files move; commit history records the move via `git mv`.
- All step-4-onward code created at `app/...` paths.

## Origin

**Claude-suggested, accepted.** Drift was caught before step 4 began, after step 2 and step 3 had already produced the misplaced files. Akın directed the correction be tracked as a separate ADR (not an ADR-002 amendment).
