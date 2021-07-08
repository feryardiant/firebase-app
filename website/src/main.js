import { createApp } from 'vue'
import { createRouter, createWebHistory, isNavigationFailure } from 'vue-router'
import { analytics } from './firebase'

import autoRoutes from 'pages-generated'
import { setupLayouts } from 'layouts-generated'

import App from './App.vue'

import 'windi.css'
import './main.css'

const routes = autoRoutes.map((route) => {
  return {
    ...route,
    alias: route.path.endsWith('/')
      ? `${route.path}index.html`
      : `${route.path}.html`,
  }
})

const router = createRouter({
  routes: setupLayouts(routes),
  history: createWebHistory(),
  scrollBehavior (from, to, position) {
    return position || { top: 0 }
  }
})

router.afterEach((to, from, failure) => {
  if (isNavigationFailure(failure)) {
    analytics?.logEvent('exception', {
      description: failure.message,
      fatal: false
    })
  } else {
    analytics?.logEvent('page_view', {
      page_location: to.fullPath,
      page_path: to.path,
      page_title: to.meta.title || '',
    })
  }
})

const app = createApp(App)

app.use(router)

app.mount('#app')
