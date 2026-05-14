import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

interface MarkCompletePayload {
  email: string
}

export const useSignupStore = defineStore('signup', () => {
  const signupComplete = ref(false)
  const email = ref('')

  const isComplete = computed(() => signupComplete.value)

  function markComplete(payload: MarkCompletePayload): void {
    signupComplete.value = true
    email.value = payload.email
  }

  function reset(): void {
    signupComplete.value = false
    email.value = ''
  }

  return { signupComplete, email, isComplete, markComplete, reset }
})
