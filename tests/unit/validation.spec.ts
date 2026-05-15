/// <reference types="vitest/globals" />
import { useSignupValidation } from '../../app/composables/useSignupValidation'

describe('useSignupValidation', () => {
  describe('validateEmail', () => {
    it('returns false and sets "Email is required." error when value is empty', () => {
      const { emailError, validateEmail } = useSignupValidation()
      const result = validateEmail('')
      expect(result).toBe(false)
      expect(emailError.value).toBe('Email is required.')
    })

    it('returns false and sets a format error when value has invalid format', () => {
      const { emailError, validateEmail } = useSignupValidation()
      const result = validateEmail('not-an-email')
      expect(result).toBe(false)
      expect(emailError.value).toBe('Enter a valid email address.')
    })

    it('returns true and clears emailError when value is a valid email', () => {
      const { emailError, validateEmail } = useSignupValidation()
      validateEmail('')
      expect(emailError.value).toBe('Email is required.')
      const result = validateEmail('user@example.com')
      expect(result).toBe(true)
      expect(emailError.value).toBe('')
    })
  })

  describe('validatePassword', () => {
    it('returns false and sets "Password is required." error when value is empty', () => {
      const { passwordError, validatePassword } = useSignupValidation()
      const result = validatePassword('')
      expect(result).toBe(false)
      expect(passwordError.value).toBe('Password is required.')
    })

    it('returns false and sets a length error when value has 14 characters', () => {
      const { passwordError, validatePassword } = useSignupValidation()
      const result = validatePassword('a'.repeat(14))
      expect(result).toBe(false)
      expect(passwordError.value).toBe('Password is too short. Use at least 15 characters.')
    })

    it('returns true and clears passwordError when value has exactly 15 characters', () => {
      const { passwordError, validatePassword } = useSignupValidation()
      validatePassword('')
      expect(passwordError.value).toBe('Password is required.')
      const result = validatePassword('a'.repeat(15))
      expect(result).toBe(true)
      expect(passwordError.value).toBe('')
    })

    it('returns true when value has 16 characters', () => {
      const { passwordError, validatePassword } = useSignupValidation()
      const result = validatePassword('a'.repeat(16))
      expect(result).toBe(true)
      expect(passwordError.value).toBe('')
    })
  })

  describe('clearError', () => {
    it("clears emailError but leaves passwordError when called with 'email'", () => {
      const { emailError, passwordError, validateEmail, validatePassword, clearError } =
        useSignupValidation()
      validateEmail('')
      validatePassword('')
      expect(emailError.value).toBe('Email is required.')
      expect(passwordError.value).toBe('Password is required.')

      clearError('email')

      expect(emailError.value).toBe('')
      expect(passwordError.value).toBe('Password is required.')
    })

    it("clears passwordError but leaves emailError when called with 'password'", () => {
      const { emailError, passwordError, validateEmail, validatePassword, clearError } =
        useSignupValidation()
      validateEmail('')
      validatePassword('')

      clearError('password')

      expect(emailError.value).toBe('Email is required.')
      expect(passwordError.value).toBe('')
    })
  })

  describe('reset', () => {
    it('clears both emailError and passwordError', () => {
      const { emailError, passwordError, validateEmail, validatePassword, reset } =
        useSignupValidation()
      validateEmail('')
      validatePassword('')

      reset()

      expect(emailError.value).toBe('')
      expect(passwordError.value).toBe('')
    })
  })
})
