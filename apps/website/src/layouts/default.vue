<script lang="ts" setup>
const route = useRoute()

const title = computed(() => {
  // console.log(route.meta) // eslint-disable-line no-console
  return route.meta.title
})

useTitle(title, {
  titleTemplate: '%s - Creasi.CO',
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center text-gray-700">
    <router-view />
  </main>
</template>
