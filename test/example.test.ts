import { webdriverio } from '@vitest/browser/providers'

describe('example', () => {
  it('should be ok', async () => {
    // webdriverio.name
    // const browser = await openBrowser()

    await expect(webdriverio.name).toEqual('chrome')
  })
})
