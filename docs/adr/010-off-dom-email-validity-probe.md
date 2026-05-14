# ADR-010: Off-DOM Email Validity Probe

## Context

ADR-004 mandates email validation by relying on `<nord-input type="email">` built-in validation, with explicit prohibitions against custom regex and third-party validation libraries. The composable contract approved at step 4 reflected this with the signature `validateEmail(value: string, validity?: ValidityState): boolean`, the intent being that the form would pass `event.target.validity` from the input's blur event.

While preparing the form template at step 5, investigation of Nord's public API surfaced a gap between that intent and what Nord actually exposes.

## Finding — Nord's nord-input does not expose ValidityState on its host

Empirical observations from `raw/components/input.md` and `node_modules/@nordhealth/components/lib/`:

1. The documented host-level API for `<nord-input>` lists `value`, `error`, `required`, `type`, `hint`, etc., and methods `focus()`, `blur()`, `click()`. No `validity`, no `checkValidity()`, no `reportValidity()`, no `validationMessage`.
2. The component file `FormAssociatedMixin-*.js` is misleadingly named: it only adds label/error slot rendering and a `FormDataController` that listens to the form's `formdata` event. It does not implement the Web Components form-association protocol.
3. `grep -rE "formAssociated\s*=" node_modules/@nordhealth/components/lib/` returns nothing. `static formAssociated = true` is not set on any component.
4. `grep -rE "attachInternals" node_modules/@nordhealth/components/lib/` returns nothing. `ElementInternals` is not used. The host therefore has none of the validity surface the platform grants form-associated custom elements.

The only `ValidityState` for an email input within `<nord-input>` lives on the inner native `<input>` inside the shadow root. Reading it from the form would require reaching into the shadow DOM, which `.claude/rules/nord-ds.md` explicitly forbids: *"Shadow DOM access. Do not reach into Nord component shadow roots for styling overrides or validation hooks."*

The `validity?` parameter on the approved composable signature is therefore unfillable through the public API. ADR-004's "use nord-input built-in validation" needs an implementation that doesn't depend on a surface Nord doesn't expose.

## Decision

Email format validation runs through an **off-DOM probe**: the composable creates a detached `HTMLInputElement` via `document.createElement('input')`, sets `type = 'email'` and `value`, and calls `probe.checkValidity()`. The browser's native email validator — the same engine that backs `<input type="email">` and that ADR-004 sought to reuse — is consumed via the standard `HTMLInputElement` API on a transient element that is never attached to the document.

The composable signature becomes:

```ts
validateEmail(value: string): boolean
```

The `validity?: ValidityState` parameter is dropped. Form code calls `validateEmail(email.value)` without template refs or event-target casting.

## Alternatives considered

- **A. Off-DOM probe (chosen).** Uses the platform email validator with no regex, no library, no shadow DOM access. Composable becomes DOM-dependent — unit tests run under `happy-dom` (already in devDependencies); not a new test infrastructure cost.
- **B. Drop the `validity?` arg, presence check only, lean on the browser's native validation bubble.** Set `type="email"` + `required`, omit `novalidate`, let the browser's native validation UI fire on submit. Rejected: Nord's docs explicitly tell consumers to set `novalidate`, and native bubbles look nothing like Nord's `error` prop rendering. Mixing two error surfaces (Nord's inline error + the browser's tooltip) is the inconsistent UX ADR-004's "two error classes, two surfaces" rule was written to prevent.
- **C. Keep the current signature, never populate `validity`, accept presence-only.** Rejected: ADR-004's "rely on nord-input type='email' built-in validation" becomes vacuous because Nord doesn't surface validity; "use it" reduces to "do nothing." A user could submit `abc` as an email address and pass validation.
- **D. Render a hidden mirrored `<input type="email">` on the page, two-way bound to `email.value`, read its `.validity` via template ref.** Achieves the same validity check as A. Rejected: adds a permanent dead element to the DOM and an extra binding, with no benefit over A's transient detached element.

## Consequences

- ADR-004's intent — reuse the browser's native email engine, no custom format logic — is preserved. The implementation surface shifts from `event.target.validity` (shadow-coupled) to a transient probe (uncoupled).
- The composable becomes DOM-dependent. Unit tests run under `happy-dom`, which is already present in devDependencies and sufficient to back `document.createElement('input')` + `checkValidity()`. No new dependency.
- No shadow DOM access; the nord-ds rule is honored.
- Form code at step 5 is materially simpler: `validateEmail(email.value)` and `validatePassword(password.value)` with no template-ref-or-event-target plumbing for validity.
- If Nord adds true form association via `ElementInternals` in a future release (exposing `.validity` on the host), this composable can be revised to consume it without changing the form's call sites — `validateEmail(value)` is a stable surface.

## Origin

**Claude-suggested, accepted.** The gap between ADR-004's intent ("use nord-input built-in validation") and Nord's public API surfaced at step 5 design. Akın approved the off-DOM probe pattern and directed an ADR before the composable revision.
