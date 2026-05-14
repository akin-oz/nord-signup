# ADR-002: Flat Architecture

## Context

Nuxt 3 ships with a flat directory structure (`pages/`, `composables/`, `middleware/`, `stores/`). Deviating from the default requires evidence that the deviation pays for itself.

## Decision

Flat architecture for this project. No FSD slices, no domain folders, no monorepo segmentation. Pages, composables, stores, middleware live at top level.

## Alternatives considered — FSD (Feature-Sliced Design)

FSD adds value when stakeholder priorities are volatile and features need feature-flag-toggleable isolation. At BCD (my current project) that's the case — and the architecture is one of two responses I made to that dynamic. That's the BCD context, not the take-home context.

This take-home is one form on one route with one domain and no volatility. FSD here would be architecture as resume padding.

## Trigger to refactor

Introduce FSD when:

- A second domain enters the project (e.g., signup + onboarding + billing)
- Feature-flag-toggleable surfaces emerge that need isolated change patterns
- Multiple stakeholders introduce volatile, isolated priorities

None of these apply. Adopting FSD prematurely is a developer-fantasy pattern: applying advanced architecture without the load that justifies it.

## Consequences

- Onboarding for any reviewer is instant; Nuxt conventions are the structure.
- If the project grew, refactoring from flat to FSD is a known, mechanical pattern — no decisions are foreclosed.
- Co-locating types with consumers (no `types/` folder) is part of this discipline.

## Origin

**Akın-initiated.**