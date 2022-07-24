<template>
  <div v-if="show" role="alert" class="toast rounded fixed left-4 bottom-4 px-4 py-3 bg-white border border-gray-300">
    <div class="message">
      <slot />
    </div>
    <button type="button" @click="emit('close', $event)">Close</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])
const { show } = defineProps({
  show: {
    type: Boolean,
    default: () => true
  }
})
</script>
