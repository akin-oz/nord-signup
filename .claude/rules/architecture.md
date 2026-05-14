# Architecture Rule — Flat Structure

## Core rule

Nuxt 3 ships flat. Do not introduce FSD, vertical slices, monorepo segmentation, or domain folders for this project.

## Allowed directory structure

```
nordhealth-signup/
├── app/                # srcDir (Nuxt 4 default)
│   ├── pages/          # Vue route pages
│   ├── middleware/     # Nuxt route middleware
│   ├── composables/    # useXxx() functions, no global state
│   ├── stores/         # Pinia stores, cross-route state only
│   └── plugins/        # Nuxt plugins (e.g., Nord DS registration)
├── tests/              # Test files in three tiers (unit/integration/e2e)
└── docs/adr/           # Architectural Decision Records      # Architectural Decision Records
```

## What is forbidden

- `src/features/<domain>/...` (FSD pattern, overkill for one form)
- `src/modules/...` (Nuxt modules pattern, no module needed)
- `components/` folder for a 3-field form (component splitting premature)
- `types/` folder; co-locate types with their consumers
- Nuxt 4 default `app/` srcDir is the contract; do not override with `srcDir: '.'`

## When to refactor toward FSD

Add FSD only when:

- A second domain enters the project (e.g., signup + onboarding + billing)
- Feature-flag-toggleable surfaces emerge that need isolation
- Multiple stakeholders introduce volatile, isolated change patterns

None of these apply here. FSD in this project would be architecture as resume padding.