<template>
  <main id="site-content">
    <router-view :key="fullPath" />
  </main>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'

const { meta, fullPath } = useRoute()

// https://github.com/vueuse/head
useHead({
  title: `${meta.title} - ${APP_INFO.title}`,
  meta: [
    { name: 'description', content: meta.description },
  ],
})
</script>
