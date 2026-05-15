<script setup lang="ts">
type FocusableInput = { focus: () => void }

const email = ref('')
const password = ref('')
const productUpdates = ref(false)
const submitting = ref(false)

const emailInputRef = ref<FocusableInput | null>(null)
const passwordInputRef = ref<FocusableInput | null>(null)

const signupStore = useSignupStore()
const { emailError, passwordError, validateEmail, validatePassword, clearError } =
  useSignupValidation()

function onEmailBlur(): void {
  validateEmail(email.value)
}

function onPasswordBlur(): void {
  validatePassword(password.value)
}

function onEmailInput(): void {
  if (emailError.value) clearError('email')
}

function onPasswordInput(): void {
  if (passwordError.value) clearError('password')
}

async function onSubmit(): Promise<void> {
  const okEmail = validateEmail(email.value)
  const okPassword = validatePassword(password.value)
  if (!okEmail || !okPassword) {
    // Focus the first failed field (email wins on DOM order) so keyboard /
    // AT users land at the field they need to fix instead of tab-walking
    // back from the submit button.
    if (okEmail) {
      passwordInputRef.value?.focus()
    } else {
      emailInputRef.value?.focus()
    }
    return
  }

  submitting.value = true
  // Simulated async submit per ADR-005 mechanism step 1.
  await new Promise((resolve) => setTimeout(resolve, 500))
  signupStore.markComplete({ email: email.value })
  await navigateTo('/success')
}
</script>

<template>
  <main class="page">
    <section class="form-card">
      <h1>Create your account</h1>
      <p class="sub">Start your free trial. We will not share your email.</p>

      <form novalidate @submit.prevent="onSubmit">
        <nord-stack gap="m">
          <nord-input
            ref="emailInputRef"
            v-model="email"
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            autocomplete="email"
            required
            hide-required
            expand
            :error="emailError"
            @input="onEmailInput"
            @blur="onEmailBlur"
          />

          <nord-input
            ref="passwordInputRef"
            v-model="password"
            type="password"
            name="password"
            label="Password"
            autocomplete="new-password"
            required
            hide-required
            expand
            hint="Use 15+ characters. A passphrase like ‘correct horse battery staple’ works."
            hint-below
            :error="passwordError"
            @input="onPasswordInput"
            @blur="onPasswordBlur"
          />

          <nord-checkbox
            v-model="productUpdates"
            type="checkbox"
            name="productUpdates"
            label="Send me product updates"
          />

          <nord-visually-hidden role="status">
            {{ submitting ? 'Signing up' : '' }}
          </nord-visually-hidden>

          <nord-button
            type="submit"
            variant="primary"
            expand
            :disabled="submitting"
            :loading="submitting"
          >
            Sign up
          </nord-button>
        </nord-stack>
      </form>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-space-xl) var(--n-space-l);
}

.form-card {
  width: 100%;
  max-width: 420px;
}

.form-card h1 {
  font-size: var(--n-font-size-xl);
  letter-spacing: -0.01em;
  margin: 0 0 var(--n-space-xs);
}

.sub {
  margin: 0 0 var(--n-space-l);
  color: var(--n-color-text-weaker);
  font-size: var(--n-font-size-s);
}
</style>
