<script setup lang="ts">
const router = useRouter()
const { t } = useI18n()

useTitle('Error - Creasi.CO')
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center text-gray-700">
    <router-view />

    <button type="button" class="text-sm m-3 mt-8" @click="router.back()">
      {{ t('button.back') }}
    </button>
  </main>
</template>
