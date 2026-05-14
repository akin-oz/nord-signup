<script setup lang="ts">
definePageMeta({
  middleware: 'signup-complete',
})

const signupStore = useSignupStore()
// Snapshot email before onMounted clears the store; the template binds
// to this ref, not the store, so the greeting survives the reset.
const email = ref(signupStore.email)

onMounted(() => {
  signupStore.reset()
})
</script>

<template>
  <main>
    <h1>Welcome, {{ email }}.</h1>
  </main>
</template>
