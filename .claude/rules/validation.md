```yaml
---
paths:
  - "composables/useSignupValidation.ts"
  - "pages/index.vue"
  - "tests/unit/validation.spec.ts"
---
```

# Validation Rule

## Email

Use Nord DS `<nord-input type="email">` built-in validation. Per Nord docs: "validation parameters and relevant keyboard for devices with dynamic keyboards."

Do NOT add:

- Custom regex for email format
- Third-party validation library (Zod, yup, VeeValidate)
- Async validation against a domain blocklist (out of scope)

## Password

**Minimum length: 15 characters.**

Rationale: NIST SP 800-63B Rev 4 (July 2025) §3.1.1.2 item 1 specifies passwords used as single-factor authentication SHALL be ≥15 characters. This signup creates a single-factor authentication context (no MFA in scope).

Do NOT add:

- Composition rules (mixed case, digits, symbols) — deprecated per NIST §3.1.1.2 item 5
- Password strength meter — length floor is the rule
- Password hints — forbidden per NIST item 7
- Security questions — forbidden per NIST item 8
- Truncation of stored password — forbidden per NIST item 9 (relevant only when backend exists; document as production extension)

Inline UX guidance shown under the password field:

> Use 15+ characters. A passphrase like 'correct horse battery staple' works.
>

## Validation timing

- **On-blur per field:** trigger validation when the field loses focus.
- **On-submit:** trigger server-side validation (in this submission, the simulated async submit).
- **On-input clears errors:** while the user is correcting a previously-shown error, the error message clears as they type.

Do NOT validate on-input. Users complete the format before the format is valid (email needs @ and TLD); on-input shows errors mid-typing.

## Error display

- **Inline per field:** Nord `error` prop on the field for field-level errors.
- **Form-level banner:** `<nord-banner>` for non-field errors (network failure, server 500, generic submission failure).

Two error classes, two surfaces. Do not mix them.