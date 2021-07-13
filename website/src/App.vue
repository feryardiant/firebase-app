<template>
  <main id="site-content">
    <router-view />
  </main>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import { app } from '../package.json'

// https://github.com/vueuse/head
useHead({
  title: app.name,
  meta: [
    { name: 'description', content: app.description },
  ],
})
</script>
