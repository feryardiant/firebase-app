<template>
  <div v-if="shown" role="alert" class="toast rounded fixed left-4 bottom-4 px-4 py-3 bg-white border border-gray-300">
    <div class="message">
      <slot />
    </div>
    <button type="button" @click="$emit('close', $event)">Close</button>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    show: {
      type: Boolean,
      default: () => true,
    }
  },

  emits: ['close'],

  setup (props) {
    return {
      shown: props.show
    }
  }
}
</script>
