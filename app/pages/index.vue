<script setup lang="ts">
const email = ref('')
const password = ref('')
const productUpdates = ref(false)
const submitting = ref(false)

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
  if (!okEmail || !okPassword) return

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
            v-model="email"
            type="email"
            name="email"
            label="Email"
            autocomplete="email"
            required
            expand
            :error="emailError"
            @input="onEmailInput"
            @blur="onEmailBlur"
          />

          <nord-input
            v-model="password"
            type="password"
            name="password"
            label="Password"
            autocomplete="new-password"
            required
            expand
            hint="Use 15+ characters. A passphrase like 'correct horse battery staple' works."
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
