# ADR-008: Nord DS Import Path Casing Correction

## Context

ADR-003 mandates selective per-component imports from `@nordhealth/components`. The `.claude/rules/nord-ds.md` rule encodes this as the operational example for Claude:

```ts
import '@nordhealth/components/lib/input'
import '@nordhealth/components/lib/button'
import '@nordhealth/components/lib/checkbox'
import '@nordhealth/components/lib/banner'
```

Two facts surfaced during step 1 implementation:

1. The actual files in `node_modules/@nordhealth/components/lib/` are PascalCase: `Input.js`, `Button.js`, `Checkbox.js`, `Banner.js`.
2. Nord's own integration documentation (`nordhealth.design/llms-full.txt`, Vue section) uses PascalCase paths verbatim: `import '@nordhealth/components/lib/Button'`.

The lowercase paths in the rule example resolve on macOS (case-insensitive HFS+/APFS) but will fail with `Cannot find module` on Linux (case-sensitive ext4). CI runners, Vercel/Netlify build images, and Docker images for production are Linux. Lowercase is portable-by-accident locally and broken-by-design in CI.

## Decision

All Nord component imports use **PascalCase paths**, matching the upstream filenames and Nord's own documentation:

```ts
import '@nordhealth/components/lib/Input'
import '@nordhealth/components/lib/Button'
import '@nordhealth/components/lib/Checkbox'
import '@nordhealth/components/lib/Banner'
```

The example in `.claude/rules/nord-ds.md` will be updated in the same direction (manually by Akın, since the rules directory is hook-protected).

## Alternatives considered

- **Keep lowercase to match the rule as written.** Rejected. The rule is wrong; matching a wrong rule produces broken code on the deployment target. Rules encode policy; when the policy and the rule example diverge, the example is corrected, not the implementation.
- **Add a build-time alias to map lowercase to PascalCase.** Rejected. Solves the symptom, hides the discrepancy, and adds a config layer no other consumer of `@nordhealth/components` carries. Future maintainers reading the import line would have no signal that lowercase only works because of an alias.
- **File a docs PR upstream and wait.** Not pursued as a blocker. Nord's docs already use PascalCase; the only outdated source was this project's local rule. Filing an upstream correction is not actionable because there is no upstream issue.

## Consequences

- Imports are portable across macOS dev and Linux CI/prod.
- The rule file matches upstream reality; no future drift between Claude's instructions and Nord's documentation.
- Cost: one manual edit to .claude/rules/nord-ds.md by Akın. The block-config-edits hook (ADR-001) prevents Claude from modifying the rules directory; this is the intended boundary, not a bug to route around.
- ADR-003's selective-import directive remains in force; ADR-008 specifies the path casing it left unspecified.

## Origin

**Claude-suggested, accepted.** Surfaced during step 1 of nuxt.config.ts implementation; Claude flagged the macOS-vs-Linux casing mismatch between the rule example, the actual `node_modules` filenames, and Nord's published Vue integration docs. Akın accepted and directed an ADR before any code committed.
