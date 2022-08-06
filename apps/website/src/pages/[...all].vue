<script setup lang="ts">
const { all: _ } = defineProps<{
  all: string[]
}>()

const { t } = useI18n()
</script>

<template>
  <h1 class="font-light text-7xl leading-relaxed">
    {{ t('errors.not-found') }}
  </h1>
</template>

<route lang="yaml">
name: 404
meta:
  layout: errors
</route>
