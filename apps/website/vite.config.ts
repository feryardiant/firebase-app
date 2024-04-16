import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ServerOptions } from 'node:https'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import i18n from '@intlify/unplugin-vue-i18n/vite'
import unhead from '@unhead/addons/vite'
import { SchemaOrgResolver, schemaAutoImports } from '@unhead/schema-org/vue'
import { unheadVueComposablesImports } from '@unhead/vue'
import mdAnchor from 'markdown-it-anchor'
import mdLinkAttr from 'markdown-it-link-attributes'
import mdPrism from 'markdown-it-prism'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import markdown from 'unplugin-vue-markdown/vite'
import router from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import layouts from 'vite-plugin-vue-layouts'
import windicss from 'vite-plugin-windicss'
// import type { RouteMeta, RouteRecord } from 'vue-router'

import { author, name, version } from '../../package.json'

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  const envDir = '../../'
  const env = loadEnv(mode, envDir, ['FIREBASE', 'PROJECT', 'VITE'])
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

  return {
    envDir,

    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
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

      /**
       * @see https://vitejs.dev/config/server-options.html#server-https
       */
      https: httpsCert(envDir),

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
      server: {
        deps: {
          inline: ['@vue', '@vueuse', 'vue-demi'],
        },
      },
    },

    plugins: [
      vue({
        include: [/\.vue$/, /\.md$/],
      }),

      /**
       * @see https://github.com/antfu/unplugin-auto-import
       */
      autoImport({
        dts: 'src/.auto-imports.d.ts',
        dirs: [
          'src/composables',
          'src/store',
        ],
        imports: [
          '@vueuse/core',
          unheadVueComposablesImports,
          VueRouterAutoImports,
          {
            '@unhead/schema-org': schemaAutoImports,
          },
          'vue-i18n',
          {
            // add any other imports you were relying on
            'vue-router/auto': ['useLink'],
          },
          'vue/macros',
          'vue',
        ],
        vueTemplate: true,
      }),

      /**
       * @see https://github.com/antfu/unplugin-vue-components
       */
      components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue', 'md'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: 'src/.components.d.ts',
        directoryAsNamespace: true,
        resolvers: [
          SchemaOrgResolver(),
        ],
      }),

      /**
       * @see https://github.com/posva/unplugin-vue-router
       */
      router({
        dts: 'src/.typed-router.d.ts',
        extensions: ['.vue', '.md'],
      }),

      /**
       * @see https://unhead.unjs.io
       */
      unhead(),

      /**
       * @see https://github.com/JohnCampionJr/vite-plugin-vue-layouts
       */
      layouts(),

      /**
       * @see https://github.com/unplugin/unplugin-vue-markdown
       */
      markdown({
        wrapperComponent: 'page-content',
        wrapperClasses: 'prose max-w-none',
        headEnabled: true,
        excerpt: true,

        /**
         * @see https://markdown-it.github.io/markdown-it/
         */
        markdownItOptions: {
          html: true,
          typographer: true,
        },

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

      /**
       * @see https://github.com/antfu/vite-plugin-windicss
       */
      windicss(),

      /**
       * @see https://github.com/antfu/vite-plugin-pwa
       */
      pwa({
        filename: 'sw.ts',
        devOptions: {
          // enabled: true,
        },
        strategies: 'injectManifest',
        srcDir: 'src',
        scope: '/',
        manifest: {
          id: '/',
          name: env.VITE_APP_NAME,
          description: env.VITE_APP_DESCRIPTION,
          short_name: env.VITE_APP_NAME,
          theme_color: '#ffffff',
          icons: [
            {
              src: '/assets/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/assets/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/assets/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),

      /**
       * @see https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
       */
      i18n({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'locales/**')],
      }),
    ],
  }
})

function httpsCert(envDir: string): ServerOptions | undefined {
  try {
    return {
      cert: readFileSync(resolve(envDir, 'scripts/local-cert.pem')),
      key: readFileSync(resolve(envDir, 'scripts/local-key.pem')),
    }
  }
  catch {
    return undefined
  }
}
