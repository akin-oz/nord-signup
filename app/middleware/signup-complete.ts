export default defineNuxtRouteMiddleware(() => {
  const signupStore = useSignupStore()
  if (!signupStore.isComplete) return navigateTo('/')
})
