import { resolve } from 'path'
import { expect } from 'chai'
import { stub } from 'sinon'
import supertest from 'supertest'
import admin from 'firebase-admin'
import testInit from 'firebase-functions-test'

import { loadEnv } from '../../../scripts/util'
import pkg from '../package.json'

const env = loadEnv(resolve(__dirname, '../../.env'))
const test = testInit(JSON.parse(env.FIREBASE_CONFIG))

describe(pkg.name, () => {
  let apiFunc, adminStub

  before(async () => {
    adminStub = stub(admin, 'initializeApp').returns({
      firestore: stub(admin, 'firestore'),
      storage: stub(admin, 'storage').returns({
        bucket: stub()
      })
    })

    const { func } = await import('../src')

    /** @type {import('supertest').Test} */
    apiFunc = supertest(func)
  })

  after(() => {
    adminStub.restore()
    test.cleanup()
  })

  describe('func', () => {
    it('should be ok', async () => {
      const res = await apiFunc.get('/api')

      expect(res.status).equal(200)
    })

    it('should redirect', async () => {
      const res = await apiFunc.get('/foo')

      expect(res.status).equal(302)
    })
  })
})
