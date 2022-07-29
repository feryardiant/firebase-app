/**
 * @param {import('vite-ssg').ViteSSGContext} ctx
 */
export const install = async ({ isClient, router }) => {
  if (!isClient)
    return

  await router.isReady()
  // const { registerSW } = await import('virtual:pwa-register')

  // registerSW({ immediate: true })
}
