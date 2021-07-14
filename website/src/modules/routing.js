import Cookies from 'js-cookie'
import { useAnalytics } from '../firebase'

/**
 * @param {import('vite-ssg').ViteSSGContext} ctx
 */
 export const install = async ({ app, isClient, router }) => {
  if (!isClient) return

  const redirect = Cookies.get('redirect')

  if (redirect) {
    Cookies.remove('redirect')
    router.push(redirect)
    return
  }

  const analytics = await useAnalytics()

  app.config.errorHandler = (error) => {
    analytics?.logEvent('exception', {
      description: error.toString(),
      fatal: true
    })
  }

  router.afterEach((to) => {
    analytics?.logEvent('page_view', {
      page_location: to.fullPath,
      page_path: to.path,
      page_title: to.meta.title,
    })
  })
}
