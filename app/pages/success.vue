<script setup lang="ts">
definePageMeta({
  middleware: 'signup-complete',
})
useHead({ title: 'Welcome · Nordhealth' })

const signupStore = useSignupStore()
// Snapshot email before onMounted clears the store; the template binds
// to this ref, not the store, so the greeting survives the reset.
const email = ref(signupStore.email)

onMounted(() => {
  signupStore.reset()
})
</script>

<template>
  <main class="page">
    <section class="welcome">
      <div class="check" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="5 12.5 10 17.5 19 7" />
        </svg>
      </div>
      <h1>Welcome, {{ email }}.</h1>
      <p class="sub">Your account is ready.</p>
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
  text-align: center;
}

.welcome {
  width: 100%;
  max-width: 420px;
}

.welcome h1 {
  font-size: var(--n-font-size-xl);
  letter-spacing: -0.015em;
  margin: var(--n-space-l) 0 var(--n-space-s);
}

.sub {
  margin: 0;
  color: var(--n-color-text-weaker);
  line-height: 1.55;
}

.check {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--n-color-status-success-weak);
  color: var(--n-color-status-success);
}

.check svg {
  width: 32px;
  height: 32px;
}
</style>
