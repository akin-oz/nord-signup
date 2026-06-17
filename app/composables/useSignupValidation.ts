import { ref } from 'vue'

export type SignupField = 'email' | 'password'

const PASSWORD_MIN_LENGTH = 15

export function useSignupValidation() {
  const emailError = ref('')
  const passwordError = ref(null)

  function validateEmail(value: string): boolean {
    if (!value) {
      emailError.value = 'Email is required.'
      return false
    }
    // Off-DOM probe per ADR-010: reuses the browser's native email
    // validator via a detached HTMLInputElement, avoiding shadow DOM
    // access on <nord-input> (forbidden by .claude/rules/nord-ds.md).
    const probe = document.createElement('input')
    probe.type = 'email'
    probe.value = value
    if (!probe.checkValidity()) {
      emailError.value = 'Enter a valid email address.'
      return false
    }
    emailError.value = ''
    return true
  }

  function validatePassword(value: string): boolean {
    if (!value) {
      passwordError.value = 'Password is required.'
      return false
    }
    if (value.length < PASSWORD_MIN_LENGTH) {
      passwordError.value = 'Password is too short. Use at least 15 characters.'
      return false
    }
    passwordError.value = null
    return true
  }

  function clearError(field: SignupField): void {
    if (field === 'email') {
      emailError.value = ''
      return
    }
    passwordError.value = null
  }

  function reset(): void {
    emailError.value = ''
    passwordError.value = null
  }

  return {
    emailError,
    passwordError,
    validateEmail,
    validatePassword,
    clearError,
    reset,
  }
}
