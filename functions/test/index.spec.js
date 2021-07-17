import { assert } from 'chai'
import { resolve } from 'path'
import { stub } from 'sinon'
import admin from 'firebase-admin'
import testInit from 'firebase-functions-test'

import { loadEnv } from '../../util'

const env = loadEnv(resolve(__dirname, '../../.env'))
const test = testInit(
  JSON.parse(env.FIREBASE_CONFIG)
)

describe('the func', () => {
  let func, adminStub

  before((done) => {
    adminStub = stub(admin, 'initializeApp')

    return import('../src').then((fn) => {
      func = fn
    }).then(done).catch(done)
  })

  after(() => {
    test.cleanup()
  })

  it('should redirect', (done) => {
    const wrapped = test.wrap(func)
    const req = {
      path: '/foo'
    }

    const res = {
      redirect(code, url) {
        assert.equal(code, 302)
        done()
      }
    }

    return func(req, res).catch(done)
  })
})
