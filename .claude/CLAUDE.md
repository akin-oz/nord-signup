# Nordhealth Signup — Project Instructions

You are working on a Nuxt 3 take-home for a senior frontend role. The project is small (one form, one success route) but the bar is high: every decision is documented as an ADR in `docs/adr/`, and the mechanical enforcement of those decisions lives in `.claude/rules/`.

## Stop rules

Do NOT take any action without explicit instruction. If you see a place where something should be added (a file, a dependency, a configuration, a refactor), **ask** with rationale. The outcome of that ask — accepted, modified, or rejected — becomes a new ADR.

This is non-negotiable. Solo additions break the audit trail that makes the submission credible.

## Model routing

- Sonnet 4 for code generation, refactors, and most edits
- Opus 4 only when explicitly invoked for architectural decisions or non-trivial bug investigation
- Haiku for trivial edits (rename, format) when speed matters more than reasoning depth

## Decision → ADR

Every non-trivial decision lives in `docs/adr/NNN-slug.md`. Format:
- Context
- Decision
- Alternatives considered (with rejection reasoning)
- Consequences
- Origin (Akın-initiated / Claude-suggested-accepted / Claude-suggested-rejected)

## Enforcement

Policies in ADRs are enforced operationally via `.claude/rules/*.md`. Each rule file applies either project-wide or to specific file patterns via YAML `paths` frontmatter:
- `decisions.md` (always) — boundary on Claude's autonomy
- `architecture.md` (always) — flat structure constraints
- `nord-ds.md` (Nord-touching files) — Nord Design System usage rules
- `validation.md` (form + composables) — validation rules
- `testing.md` (test files) — test scope and exclusions

## Definition of done

A task is done when:
1. Code compiles and TypeScript strict passes
2. Tests at the appropriate level (per `testing.md`) cover the new behavior
3. If a new decision was made, an ADR is added and the relevant rule file updated
4. If a Claude suggestion was rejected, it's logged in the rejected-suggestions section of the README