import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createHead } from '@vueuse/head'
import { createGtm, useGtm } from '@gtm-support/vue-gtm'

import autoRoutes from 'pages-generated'
import { setupLayouts } from 'layouts-generated'
import 'virtual:windi-devtools'

import 'virtual:windi.css'
import './assets/style.css'
import App from './app.vue'

const app = createApp(App)

// i18n resources
// https://vitejs.dev/guide/features.html#glob-import
const messages = Object.fromEntries(Object.entries(
  import.meta.glob<{ default: any }>('./../locales/*.y(a)?ml', { eager: true }),
).map(([key, value]) => {
  const yaml = key.endsWith('.yaml')
  return [key.slice(11, yaml ? -5 : -4), value.default]
}))

const i18n = createI18n({
  legacy: false,
  locale: 'id',
  messages,
})

app.use(i18n)

// Router Resources
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(autoRoutes),
})

app.use(router)

// Head Resources
const head = createHead()
app.use(head)

// GTM Resources
if (import.meta.env.VITE_GTM_KEY) {
  const gtm = createGtm({
    id: import.meta.env.VITE_GTM_KEY,
    debug: import.meta.env.DEV,
    vueRouter: router,
  })

  router.afterEach((to, from, failure) => {
    if (to.meta.layout === 'errors' || failure)
      useGtm()?.trackView(to.name as string, to.fullPath)
  })

  app.use(gtm)
}

app.mount('#app')
