<template>
  <main id="site-content">
    <router-view />
  </main>
</template>

<script setup>
import { useHead } from '@vueuse/head'

// https://github.com/vueuse/head
useHead({
  title: APP_INFO.title,
  meta: [
    { name: 'description', content: APP_INFO.description },
  ],
})
</script>
