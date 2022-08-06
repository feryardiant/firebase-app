import { expect } from 'chai'
import testInit from 'firebase-functions-test'

import pkg from '../package.json' assert {type: 'json'}
import { main } from '../src'

const test = testInit()

describe(pkg.name, () => {
  after(() => {
    test.cleanup()
  })

  it('should be ok', async () => {
    const req: any = { url: '/' }
    const res: any = {
      json: (obj: any) => {
        expect(obj.status).equal('OK')
      },
    }

    return main(req, res)
  })
})
