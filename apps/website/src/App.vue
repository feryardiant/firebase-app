<script setup>
import { ref } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'

const { meta, fullPath } = useRoute()
const showToast = ref(false)

// https://github.com/vueuse/head
useHead({
  title: `${meta.title} - ${APP_INFO.title}`,
  meta: [{ name: 'description', content: meta.description }],
})

const close = () => {
  showToast.value = false
}
</script>

<template>
  <main id="site-content">
    <router-view :key="fullPath" />
  </main>

  <toast :show="showToast" @close="close">
    <span>Reload</span>
  </toast>
</template>
