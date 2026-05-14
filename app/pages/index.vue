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
  <main>
    <h1>Create your account</h1>

    <form novalidate @submit.prevent="onSubmit">
      <nord-input
        v-model="email"
        type="email"
        name="email"
        label="Email"
        autocomplete="email"
        required
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

      <nord-button type="submit" :disabled="submitting" :loading="submitting">
        Sign up
      </nord-button>
    </form>
  </main>
</template>
