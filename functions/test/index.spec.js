import { expect } from 'chai'
import { stub } from 'sinon'
import supertest from 'supertest'
import admin from 'firebase-admin'
import testInit from 'firebase-functions-test'
import { resolve } from 'path'

import { loadEnv } from '../../util'

const env = loadEnv(resolve(__dirname, '../../.env'))
const test = testInit(
  JSON.parse(env.FIREBASE_CONFIG)
)

describe('the func', () => {
  let apiFunc, adminStub

  before(async () => {
    adminStub = stub(admin, 'initializeApp').returns({
      firestore: stub(admin, 'firestore'),
      storage: stub(admin, 'storage').returns({
        bucket: stub()
      }),
    })

    const { func } = await import('../src')

    /** @type {import('supertest').Test} */
    apiFunc = supertest(func)
  })

  after(() => {
    adminStub.restore()
    test.cleanup()
  })

  it('should be ok', async () => {
    const res = await apiFunc.get('/mail')

    expect(res.status).equal(200)
  })

  it('should redirect', async () => {
    const res = await apiFunc.get('/foo')

    expect(res.status).equal(302)
  })
})
