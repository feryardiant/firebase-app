<template>
  <main id="site-content">
    <router-view />
  </main>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Hello World')
})
</script>
