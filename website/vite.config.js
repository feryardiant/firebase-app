import { resolve } from 'path'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pages from 'vite-plugin-pages'
import layouts from 'vite-plugin-vue-layouts'
import windiCSS from 'vite-plugin-windicss'
import components from 'vite-plugin-components'
import markdown from 'vite-plugin-md'
import matter from 'gray-matter'
import mdIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import mdLinkAttr from 'markdown-it-link-attributes'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: resolve(__dirname, '../.env'),

  resolve: {
    alias: {
      '/~': resolve(__dirname, 'src')
    },
  },

  // https://github.com/vitejs/vite#dev-server-proxy
  proxy: {
    '/__': 'http://localhost:5000',
    '/api': {
      target: 'http://localhost:5001',
      rewrite: path => path.replace(/^\/api/, '/fery-wardiyanto/us-central')
    }
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
    ],
    exclude: [
      'vue-demi',
    ],
  },

  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    pages({
      extensions: ['vue', 'md'],
      extendRoute(page) {
        const path = resolve(__dirname, page.component.slice(1))
        const md = readFileSync(path, 'utf-8')
        const { data, excerpt } = matter(md, {
          excerpt: true,
          excerpt_separator: '<!-- more -->',
        })

        page.meta = Object.assign(page.meta || {}, {
          frontmatter: Object.assign({}, {
            comments: true,
            excerpt: mdIt().render(excerpt),
            layout: 'default',
            locale: 'id',
          }, data)
        })

        return page
      }
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    layouts(),

    // https://github.com/antfu/vite-plugin-md
    markdown({
      wrapperComponent: 'page',
      wrapperClasses: 'page-content entry-content',
      headEnabled: true,

      // see: https://markdown-it.github.io/markdown-it/
      markdownItOptions: {
        quotes: '""\'\'',
      },

      markdownItSetup(md) {
        md.use(mdAnchor, {
          permalink: true,
          // permalinkBefore: true,
          permalinkSymbol: '🔗',
          permalinkSpace: false,
          permalinkAttrs: () => ({ 'aria-hidden': true }),
        })

        md.use(mdLinkAttr, {
          pattern: /^(https?:\/\/|\/\/)/,
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
      },
    }),

    // https://github.com/antfu/vite-plugin-components
    components({
      extensions: ['vue', 'md'],
      customLoaderMatcher: path => path.endsWith('.md'),
      // customComponentResolvers: ViteIconsResolver({
      //   componentPrefix: '',
      // }),
    }),

    // https://github.com/antfu/vite-plugin-windicss
    windiCSS({
      safelist: 'prose prose-sm m-auto text-left',
      preflight: {
        enableAll: true,
      }
    })
  ]
})
