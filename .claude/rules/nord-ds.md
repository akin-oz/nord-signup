---

paths:

- "pages/**/*.vue"
- "components/**/*.vue"
- "plugins/**/*.ts"
- "nuxt.config.ts"

---

# Nord Design System Rule

## Theme

Use VET theme. Import path verified during implementation.

## Component imports — selective only

Do NOT use the whole-package import:

```tsx
import '@nordhealth/components' // FORBIDDEN
```

Use selective per-component imports:

```tsx
import '@nordhealth/components/lib/Input'
import '@nordhealth/components/lib/Button'
import '@nordhealth/components/lib/Checkbox'
import '@nordhealth/components/lib/Banner'
```

Rationale: Nord docs explicitly recommend per-component imports. Tree-shaking behavior for the whole package is unverified; selective imports make the bundle surface explicit. Bundle delta to be measured via `nuxi analyze` before submission and documented in ADR-003.

## What is forbidden

- **Shadow DOM access.** Do not reach into Nord component shadow roots for styling overrides or validation hooks. Couples the form to Nord internal markup that can change between versions.
- **Custom CSS overrides of Nord internals.** Use Nord's documented CSS custom properties for theming.
- **Wrapping Nord components in custom wrappers.** Use Nord components directly. Wrapping adds maintenance debt without benefit at this scope.

## Vue integration

Follow `nordhealth.design/web-components/` Vue integration guide. Register Nord components as Vue custom elements via Nuxt plugin (`plugins/nord-ds.client.ts`).