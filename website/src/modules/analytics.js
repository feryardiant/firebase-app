import { useAnalytics } from '../firebase'

/**
 * @param {import('vite-ssg').ViteSSGContext} ctx
 */
 export const install = async ({ app, isClient, router }) => {
  if (!isClient) return

  const analytics = await useAnalytics()

  app.config.errorHandler = async (error) => {
    analytics?.logEvent('exception', {
      description: error.toString(),
      fatal: true
    })
  }

  router.afterEach(async (to) => {
    analytics?.logEvent('page_view', {
      page_location: to.fullPath,
      page_path: to.path,
      page_title: to.meta.title || '',
    })
  })
}
