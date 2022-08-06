import { resolve } from 'path'
import { readFileSync } from 'fs'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vueI18n as i18n } from '@intlify/vite-plugin-vue-i18n'
import windicss from 'vite-plugin-windicss'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import markdown from 'vite-plugin-md'
import meta from '@yankeeinlondon/meta-builder'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import pages from 'vite-plugin-pages'
import layouts from 'vite-plugin-vue-layouts'
import mdIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import mdLinkAttr from 'markdown-it-link-attributes'
import mdPrism from 'markdown-it-prism'
import matter from 'gray-matter'
// import type { RouteMeta, RouteRecord } from 'vue-router'

import { author, name, version } from '../../package.json'

export default defineConfig(({ mode }) => {
  const envDir = '../../'
  const env = loadEnv(mode, envDir, ['FIREBASE', 'PROJECT'])
  const FIREBASE_CONFIG = {
    projetId: env.PROJECT_ID,
    appId: env.FIREBASE_APP_ID,
    apiKey: env.FIREBASE_API_KEY,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID,
    storageBucket: `${env.PROJECT_ID}.appspot.com`,
    authDomain: `${env.PROJECT_ID}.firebaseapp.com`,
  }

  const APP_INFO = {
    title: env.APP_NAME,
    name: env.PROJECT_ID || name.split('/')[1],
    description: '',
    author,
    version,
  }

  /** @type {import('vite').UserConfig} */
  return {
    envDir,
    resolve: {
      alias: {
        '~/': `${resolve(__dirname, 'src')}/`,
      },
    },

    define: {
      APP_INFO: JSON.stringify(APP_INFO),
      FIREBASE_CONFIG: JSON.stringify(FIREBASE_CONFIG),
    },

    server: {
      fs: {
        allow: [envDir],
      },

      // https://vitejs.dev/config/#server-proxy
      proxy: {
        '/__': 'http://localhost:5000',
        '/api': {
          target: 'http://localhost:5001',
          rewrite: path => `/fery-wardiyanto/us-central1/${path}`,
        },
      },
    },

    optimizeDeps: {
      include: [
        '@vueuse/core',
        '@vueuse/head',
        'vue-i18n',
        'vue-router',
        'vue',
      ],
      exclude: [
        'vue-demi',
      ],
    },

    // https://github.com/vitest-dev/vitest
    test: {
      include: ['test/**/*.test.ts'],
      environment: 'happy-dom',
      globals: true,
      deps: {
        inline: ['@vue', '@vueuse', 'vue-demi'],
      },
    },

    plugins: [
      vue({
        include: [/\.vue$/, /\.md$/],
        reactivityTransform: true,
      }),

      // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
      i18n({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'locales/**')],
      }),

      // https://github.com/hannoeru/vite-plugin-pages
      pages({
        extensions: ['vue', 'md'],
        extendRoute({ title, description, meta, ...route }) {
          const frontmatter = {
            title,
            comments: true,
            layout: 'default',
            locale: 'en',
          }

          if (typeof route.component === 'string' && route.component.endsWith('.md')) {
            const path = resolve(__dirname, route.component.slice(1))
            const { data, excerpt } = matter(readFileSync(path, 'utf-8'), {
              excerpt: true,
              excerpt_separator: '<!-- more -->',
            })

            meta.frontmatter = Object.assign({}, frontmatter, {
              excerpt: excerpt ? mdIt().render(excerpt) : undefined,
            }, data)
          }

          route.meta = Object.assign({}, {
            title: frontmatter.title,
            description: description || APP_INFO.description,
          }, meta)

          return route
        },
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

        excerpt: true,

        builders: [
          meta({
            metaProps: ['title', 'description', 'tags'],
            routeProps: ['layout', 'locale', 'container'],
            headProps: ['title'],
          }),
        ],

        markdownItSetup(md) {
          md.use(mdPrism)

          md.use(mdAnchor, {
            permalink: mdAnchor.permalink.ariaHidden({
              renderAttrs: () => ({ 'aria-hidden': 'true' }),
            }),
          })

          md.use(mdLinkAttr, {
            matcher: (link: string) => /^(https?:\/\/|\/\/)/.test(link),
            attrs: {
              target: '_blank',
              rel: 'noopener',
            },
          })
        },
      }),

      // https://github.com/antfu/vite-plugin-components
      components({
        dts: 'src/components.d.ts',
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue', 'md'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      }),

      // https://github.com/antfu/unplugin-auto-import
      autoImport({
        dts: 'src/auto-imports.d.ts',
        dirs: [
          'src/composables',
          'src/store',
        ],
        imports: [
          '@vueuse/head',
          '@vueuse/core',
          'vue-i18n',
          'vue-router',
          'vue/macros',
          'vue',
        ],
        vueTemplate: true,
      }),

      // https://github.com/antfu/vite-plugin-windicss
      windicss(),

      pwa({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'icons/safari-pinned-tab.svg'],
        manifest: {
          name: APP_INFO.title,
          short_name: APP_INFO.name,
          description: APP_INFO.description,
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
      }),
    ],
  }
})
