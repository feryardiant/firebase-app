import { resolve } from 'path'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pages from 'vite-plugin-pages'
import layouts from 'vite-plugin-vue-layouts'
import windiCSS from 'vite-plugin-windicss'
import components from 'vite-plugin-components'
import markdown from 'vite-plugin-md'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import matter from 'gray-matter'
import mdIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import mdLinkAttr from 'markdown-it-link-attributes'

import { app } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  envDir: resolve(__dirname, '../.env'),

  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`
    },
  },

  server: {
    // https://vitejs.dev/config/#server-proxy
    proxy: {
      '/__': 'http://localhost:5000',
      '/app': {
        target: 'http://localhost:5001',
        rewrite: path => `/fery-wardiyanto/us-central1/${path}`
      }
    },
  },

  optimizeDeps: {
    include: [
      '@vueuse/core',
      'vue',
      'vue-router',
    ],
    exclude: [
      'vue-demi',
    ],
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
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
    }),

    pwa({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/safari-pinned-tab.svg'],
      manifest: {
        name: app.name,
        short_name: app.name,
        description: app.description,
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/mobile-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/mobile-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/mobile-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ]
})
