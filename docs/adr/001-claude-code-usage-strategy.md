# ADR-001: Claude Code Usage Strategy

## Context

This take-home was produced using Claude Code. The seniority signal isn't whether AI was used — it's whether the use was judgment-driven or generative-default.

## Decision

**Strict execution boundary.** Claude implements decisions; it does not author them. Every Claude-initiated suggestion that survived this boundary became its own ADR. Each ADR includes an **Origin** field: `Akın-initiated`, `Claude-suggested, accepted`, or `Claude-suggested, rejected`.

## Mechanical enforcement: rules + hooks

The boundary is enforced by two complementary mechanisms inside `.claude/`:

### 1. Rules (`.claude/rules/*.md`)

Claude Code supports a `.claude/rules/` directory ([official docs](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/)) where markdown files are auto-loaded into project context. Each rule file can optionally declare `paths` frontmatter to scope its loading to specific file patterns — reducing context noise and saving tokens.

Rather than a monolithic `CLAUDE.md`, decisions are codified as separate policy files:

```
.claude/
├── CLAUDE.md                    # Sparse project overview, model routing, stop rules
└── rules/
    ├── decisions.md             # (always loaded) strict boundary; suggestion → ADR
    ├── architecture.md          # (always loaded) flat structure constraints
    ├── nord-ds.md               # (paths: Nord-touching files) selective imports; no shadow DOM
    ├── validation.md            # (paths: form + composable) Nord email; NIST 15-char; on-blur
    └── testing.md               # (paths: test files) unit + integration + e2e + axe; exclusions
```

**Always-loaded rules** apply project-wide (decisions, architecture). **Path-scoped rules** load only when Claude opens files matching their patterns, keeping the context window lean per task.

### 2. Hooks (`.claude/settings.json` + `.claude/hooks/*.sh`)

Three lifecycle hooks ([official docs](https://code.claude.com/docs/en/hooks)) enforce the ADR boundary at tool-call time:

- **`PostToolUse` on `Edit|Write|MultiEdit` with `if: Edit(*.{vue,ts,js})`** → `lint-on-edit.sh` runs ESLint on the edited file. Fast feedback on style violations before Claude proceeds.
- **`Stop`** → `test-on-stop.sh` runs the full Vitest suite when Claude finishes a turn. Surfaces test failures as a system reminder via exit code 2.
- **`PreToolUse` on `Edit|Write|MultiEdit`** → `block-config-edits.sh` denies edits to `.claude/CLAUDE.md`, `.claude/rules/**`, `docs/adr/**`, `nuxt.config.ts`, and `package.json`. These files only change through deliberate ADR-tracked decisions; the hook makes that boundary mechanical instead of aspirational.

## Three layers, working together

| Layer | File location | Role |
| --- | --- | --- |
| Policy | `docs/adr/*.md` | What was decided and why |
| Rules | `.claude/rules/*.md` | How decisions translate to Claude's contextual instructions |
| Hooks | `.claude/hooks/*.sh` | When and how Claude is mechanically blocked from violating the policy |

## Alternatives considered

- **Monolithic `CLAUDE.md`, no rules directory.** Rejected. Works for small projects but rules grow with ADR count; co-locating concerns in one file makes lifecycle and review harder. The modular pattern lets each policy domain evolve independently. Path scoping also makes context use more efficient.
- **Rules only, no hooks.** Rejected. Rules shape Claude's context but don't enforce anything at execution time. Without hooks, an ADR like "ADRs are append-only; updates must be intentional" relies on Claude's adherence to written instructions. Hooks turn that into a hard block.
- **Five hooks** (also adding `branch-name-guard` and `env-commit-guard`). Rejected. Branch naming and env-file guards solve multi-developer collaboration problems that don't exist on a solo take-home. Three hooks where each one has a real purpose; the cut two would be ceremony.
- **Eight-PR ceremony with self-review comments.** Rejected. The audit trail this would provide is delivered more densely by ADRs plus a three-bullet rejected-suggestions section in the README. Forty inline comments compress to one readable surface.

## Consequences

- Adding a new ADR triggers updating (or creating) the corresponding rule file. The `block-config-edits` hook will deny ad-hoc rule changes without user instruction.
- Rules act as guardrails against Claude reverting to default patterns (shadow DOM access, URL query state, localStorage for guard).
- Lint and test hooks tighten the feedback loop: style issues caught at edit time, test failures caught at turn end.
- The audit trail is threefold: ADR (what was decided), rule file (how Claude is instructed), hook (how Claude is mechanically constrained).

## Origin

**Akın-initiated** — modular rules pattern and hook lifecycle verified against official Claude Code docs; rules pattern adopted after dry-run validation on a separate project and confirmation with other engineering teams using it. Three-hook set chosen by cutting branch and env guards from an initial five-hook plan that included unnecessary multi-developer ceremony.