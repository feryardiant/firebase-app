import { resolve } from 'path'
import { readFileSync } from 'fs'
import { loadEnv } from 'vite'
import dotenv from 'dotenv'
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

import { author, name, description, version } from '../package.json'

/**
 * @type {import('vite').UserConfigFn}
 * @param {import('vite').ConfigEnv} conf
 * @returns {import('vite').UserConfig}
 */
export default ({ mode, command }) => {
  const envDir = resolve(__dirname, '../.env')
  const env = resolveEnv(mode, envDir)
  const APP_INFO = {
    title: env.APP_NAME,
    name: env.PROJECT_ID || name.split('/')[1],
    description,
    author,
    version
  }

  return {
    base: env.BASE_URL || '/',
    envDir,

    resolve: {
      alias: {
        '/@/': `/${resolve(__dirname, 'src')}/`
      },
    },

    define: {
      APP_INFO: JSON.stringify(APP_INFO),
      FIREBASE_CONFIG: env.FIREBASE_CONFIG
    },

    server: {
      fs: {
        allow: ['..']
      },

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
      })
    ]
  }
}

/**
 * @param {string} mode
 * @param {string} envDir
 */
const resolveEnv = (mode, envDir) => {
  const env = loadEnv(mode, envDir)

  if (mode !== 'production') {
    const { parsed } = dotenv.config({ path: envDir })
    for (const [key, val] of Object.entries(parsed)) {
      env[key] = env[key] || val
    }
  }

  const fbaseConfEnv = JSON.parse(process.env.FIREBASE_CONFIG || '{}')
  const fbaseConf = {
    appId: env.FIREBASE_APPID || process.env.FIREBASE_APPID,
    apiKey: env.FIREBASE_APIKEY || process.env.FIREBASE_APIKEY,
    messagingSenderId: env.FIREBASE_MEASUREMENTID || process.env.FIREBASE_MEASUREMENTID,
    measurementId: env.FIREBASE_MESSAGINGSENDERID || process.env.FIREBASE_MESSAGINGSENDERID,
    projectId: env.PROJECT_ID || process.env.PROJECT_ID,
  }

  for (const [key, val] of Object.entries(fbaseConf)) {
    fbaseConfEnv[key] = fbaseConfEnv[key] || val
  }

  env.FIREBASE_CONFIG = JSON.stringify(fbaseConfEnv)

  return env
}
