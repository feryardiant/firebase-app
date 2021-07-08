import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAnalytics } from './firebase'

import autoRoutes from 'pages-generated'
import { setupLayouts } from 'layouts-generated'

import App from './App.vue'

import 'windi.css'
import './main.css'

const app = createApp(App)

app.config.errorHandler = async (error) => {
  const analytics = await useAnalytics()

  analytics?.logEvent('exception', {
    description: error.toString(),
    fatal: true
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(autoRoutes.map((route) => {
    return {
      ...route,
      alias: route.path.endsWith('/')
        ? `${route.path}index.html`
        : `${route.path}.html`,
    }
  })),
  scrollBehavior (from, to, position) {
    return position || { top: 0 }
  }
})

router.afterEach(async (to) => {
  const analytics = await useAnalytics()

  analytics?.logEvent('page_view', {
    page_location: to.fullPath,
    page_path: to.path,
    page_title: to.meta.title || '',
  })
})

app.use(router)

app.mount('#app')
