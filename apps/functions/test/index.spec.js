import { resolve } from 'path'
import { expect } from 'chai'
import { stub } from 'sinon'
import supertest from 'supertest'
import admin from 'firebase-admin'
import functions from 'firebase-functions'
import testInit from 'firebase-functions-test'

import { loadEnv } from '../../../scripts/util'
import pkg from '../package.json'

const env = loadEnv(resolve(__dirname, '../../.env'))
const test = testInit(JSON.parse(env.FIREBASE_CONFIG))

describe(pkg.name, () => {
  let adminStub, functionsStub, inbound

  before(async () => {
    functionsStub = stub(functions, 'logger')
    adminStub = stub(admin, 'initializeApp').returns({
      firestore: stub(admin, 'firestore'),
      storage: stub(admin, 'storage').returns({
        bucket: stub()
      })
    })
  })

  after(() => {
    adminStub.restore()
    functionsStub.restore()
    test.cleanup()
  })

  describe('inbound', () => {
    beforeEach(async () => {
      const functions = await import('../src')

      inbound = test.wrap(functions.inbound)
    })

    it('should be ok', async () => {
      const req = {
        method: 'GET'
      }

      const res = {
        status: (code) => {
          expect(code).equal(404)
        },
        json: (obj) => {
          expect(obj.ok).equal(false)
        }
      }

      await inbound(req, res)
    })
  })
})
