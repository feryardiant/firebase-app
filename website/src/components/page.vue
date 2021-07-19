<template>
  <header class="page-header">
    <post-meta v-slot="{ title }" :excerpt="false" :frontmatter="frontmatter">
      <h1 class="page-title entry-title">{{ title }}</h1>
    </post-meta>
  </header>

  <slot />
</template>

<script setup>
const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true
  }
})
</script>

<style lang="postcss">
.page-content {
  padding-left: 2rem;

  .header-anchor {
    position: absolute;
    left: 0;
    top: 2px;
    text-decoration: none;
    font-size: 1rem;
  }

  h1,
  h2,
  h3,
  h4 {
    position: relative;
    margin-left: -2rem;
    padding-left: 2rem;

    > .header-anchor {
      display: none;
    }

    &:hover > .header-anchor {
      display: block;
    }
  }
}
</style>
