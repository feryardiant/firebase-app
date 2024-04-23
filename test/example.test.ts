import { browser } from '@wdio/globals'

describe('example', () => {
  beforeEach(async () => {
    await browser.url('/')
  })

  it('should be ok', async () => {
    await expect(browser).toHaveTitle('Example')
  })
})
