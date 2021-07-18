<template>
  <main id="site-content">
    <router-view :key="fullPath" />
  </main>

  <toast :show="showToast" @close="close">
    <span>Reload</span>
  </toast>
</template>

<script>
import { ref } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'

export default {
  setup () {
    const { meta, fullPath } = useRoute()
    const showToast = ref(false)

    const close = () => {
      showToast.value = false
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
      showToast
    }
  }
}
</script>
