/// <reference types="vitest/globals" />
import { setActivePinia, createPinia } from 'pinia'
import { useSignupStore } from '../../app/stores/signup'

describe('useSignupStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with signupComplete false', () => {
      const store = useSignupStore()
      expect(store.signupComplete).toBe(false)
    })

    it('starts with empty email', () => {
      const store = useSignupStore()
      expect(store.email).toBe('')
    })

    it('isComplete getter returns false initially', () => {
      const store = useSignupStore()
      expect(store.isComplete).toBe(false)
    })
  })

  describe('markComplete', () => {
    it('sets signupComplete to true', () => {
      const store = useSignupStore()
      store.markComplete({ email: 'akin@example.com' })
      expect(store.signupComplete).toBe(true)
    })

    it('stores the email passed in', () => {
      const store = useSignupStore()
      store.markComplete({ email: 'akin@example.com' })
      expect(store.email).toBe('akin@example.com')
    })

    it('isComplete getter returns true after markComplete', () => {
      const store = useSignupStore()
      store.markComplete({ email: 'akin@example.com' })
      expect(store.isComplete).toBe(true)
    })
  })

  describe('reset', () => {
    it('sets signupComplete back to false after markComplete', () => {
      const store = useSignupStore()
      store.markComplete({ email: 'akin@example.com' })
      store.reset()
      expect(store.signupComplete).toBe(false)
    })

    it('clears email back to empty string after markComplete', () => {
      const store = useSignupStore()
      store.markComplete({ email: 'akin@example.com' })
      store.reset()
      expect(store.email).toBe('')
    })

    it('isComplete getter returns false after reset', () => {
      const store = useSignupStore()
      store.markComplete({ email: 'akin@example.com' })
      store.reset()
      expect(store.isComplete).toBe(false)
    })
  })

  describe('cross-route handoff scenario (ADR-005 contract)', () => {
    it('preserves state between markComplete and reset, simulating /success mount lifecycle', () => {
      const store = useSignupStore()

      // Step 1: form submit on / calls markComplete (ADR-005 mechanism #1).
      store.markComplete({ email: 'akin@example.com' })

      // Step 2: middleware on /success reads isComplete (ADR-005 mechanism #3).
      // The contract: middleware sees true here, so it does NOT redirect.
      expect(store.isComplete).toBe(true)

      // Step 3: /success.vue setup snapshots email into a local ref before
      // onMounted runs (ADR-005 mechanism #4). The store still holds the
      // email at this point.
      const snapshotedEmail = store.email
      expect(snapshotedEmail).toBe('akin@example.com')

      // Step 4: onMounted on /success calls reset (ADR-005 mechanism #4).
      store.reset()

      // Step 5: subsequent navigation to /success (refresh, back-button)
      // would now find isComplete false and be redirected to / (ADR-005
      // mechanism #5). Verify the contract holds.
      expect(store.isComplete).toBe(false)
      expect(store.email).toBe('')
    })
  })
})
