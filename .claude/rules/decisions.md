# Decisions Rule — Strict Execution Boundary

## Core rule

Claude does not author decisions. Claude implements decisions that Akın has made.

## Operational consequences

1. **No solo additions.** If code generation would require adding a file, dependency, configuration block, or refactor not explicitly requested, stop and ask.
2. **Suggestion → ADR.** When Claude proposes an addition and Akın responds (accept / modify / reject), capture the exchange as an ADR in `docs/adr/`. The ADR's `Origin` field records whether Claude initiated the suggestion.
3. **No "best practice" backfills.** Do not add patterns Claude considers idiomatic unless they were specified. Idiomatic-by-default is the autonomy boundary this rule prevents.

## What this looks like in practice

- Akın: "Add a Pinia store for signup state."

  Claude: implements the store as specified. Does **not** add a persistence plugin, devtools hookup, or composable wrapper unless asked.

- Akın: "The middleware should redirect to `/` when state is empty."

  Claude: implements exactly that. Does **not** add a 'session expired' message, toast, or analytics event.

- Claude notices that a piece of the implementation could be more robust (e.g., "this validation could also handle whitespace trimming"):

  Claude: asks before implementing. The response becomes an ADR addendum or a new ADR.


## Audit trail

Every ADR has an `Origin` field. The README has a "Claude suggestions I rejected" section with 3 bullets. The combination of ADR Origins + rejection log makes the AI-augmented workflow legible to a reviewer in under 90 seconds.