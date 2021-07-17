<template>
  <main id="site-content">
    <router-view :key="fullPath" />
  </main>

  <Toast :open="toastOpen" @close="close">
    <span>Reload</span>
  </Toast>
</template>

<script>
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'

export default {
  setup () {
    const { meta, fullPath } = useRoute()
    const {
      offlineReady,
      needRefresh,
      updateServiceWorker
    } = useRegisterSW()

    const toastOpen = computed(() => {
      return offlineReady.value || needRefresh.value
    })

    const close = async () => {
      offlineReady.value = false
      needRefresh.value = false
    }

    // https://github.com/vueuse/head
    useHead({
      title: `${meta.title} - ${APP_INFO.title}`,
      meta: [
        { name: 'description', content: meta.description },
      ],
    })

    return {
      close,
      fullPath,
      needRefresh,
      offlineReady,
      toastOpen,
      updateServiceWorker
    }
  }
}
</script>
