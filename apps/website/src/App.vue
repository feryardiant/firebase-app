<script setup lang="ts">
const router = useRouter()
const { locale } = useI18n()
const menuOpened = toRef(sitePreference.value, 'menuOpened', false)
const bodyClass = computed(() => menuOpened.value ? 'overflow-hidden' : '')

const showToast = ref(false)
const close = () => {
  showToast.value = false
}

onMounted(() => {
  const redirect = sessionStorage.getItem('site-redirect')

  if (redirect) {
    sessionStorage.removeItem('site-redirect')
    router.push(redirect)
  }
})

if (!sitePreference.value.locale)
  sitePreference.value.locale = locale.value

if (locale.value !== sitePreference.value.locale)
  locale.value = sitePreference.value.locale

useHead({
  title: 'Creasi.CO',
  htmlAttrs: {
    lang: locale,
  },
  bodyAttrs: {
    class: bodyClass,
  },
  meta: [
    { name: 'description', content: 'Internal Company Management System for Creasi.CO' },
  ],
})
</script>

<template>
  <main id="site-content">
    <router-view :route="$route" />
  </main>

  <toast :show="showToast" @close="close">
    <span>Reload</span>
  </toast>
</template>
