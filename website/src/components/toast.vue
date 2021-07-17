<template>
  <div v-if="opened" role="alert" class="toast rounded fixed left-4 bottom-4 px-4 py-3 bg-white border border-gray-300">
    <div class="message">
      <slot />
    </div>
    <button type="button" @click="$emit('close', $event)">Close</button>
  </div>
</template>

<script>
import { toRef } from 'vue'

export default {
  inheritAttrs: false,

  props: {
    open: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close'],

  setup (props) {
    const opened = toRef(props.open)

    return {
      opened
    }
  }
}
</script>
