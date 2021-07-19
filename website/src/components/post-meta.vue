<template>
  <p class="page-meta">
    <time v-if="postDate" class="published" :datetime="postDate" :title="postDate">{{
      formatDate(postDate)
    }}</time>

    <span v-for="tag in frontmatter.tags" :key="tag" class="tag">#{{ tag }}</span>
  </p>

  <slot v-bind="{ title: frontmatter.title }">
    <h1 class="page-title entry-title">{{ frontmatter.title }}</h1>
  </slot>

  <figure v-if="frontmatter.thumb">
    <img :alt="frontmatter.title" :src="`/uploads/${frontmatter.thumb}`" />
  </figure>

  <p v-if="excerpt && frontmatter.excerpt" class="excerpt" v-html="frontmatter.excerpt" />
</template>

<script setup>
import { defineProps } from 'vue'

const { excerpt, frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
  excerpt: {
    type: Boolean,
    default: () => true,
  }
})

const postDate = frontmatter.modified || frontmatter.date
const formatDate = (date) => new Date(date).toLocaleDateString()
</script>

<style lang="postcss" scoped>
h1,
h3 {
  &.page-title {
    font-weight: 700;
    line-height: 1.6em;
    margin-top: 0;
    margin-bottom: 0;

    > a {
      @apply inline-block;
      text-decoration: none;
      font-weight: inherit;
    }
  }
}

h3.page-title {
  font-size: 1.8rem;
}

.page-title {
  padding-bottom: 0.5em;
}

p.page-meta {
  margin-top: 0;
  margin-bottom: 0.5em;
  @apply text-sm text-gray-500;

  * {
    margin-right: 0.5rem;
  }
}
</style>
