import { expect } from 'chai'
import { stub } from 'sinon'
import admin from 'firebase-admin'
import functions from 'firebase-functions'
import testInit from 'firebase-functions-test'

import { inbound } from '../src'

const test = testInit(JSON.parse(process.env.FIREBASE_CONFIG))

describe('app', () => {
  let adminStub, functionsStub

  before(async () => {
    functionsStub = stub(functions, 'logger')
    adminStub = stub(admin, 'initializeApp').returns({
      firestore: stub(admin, 'firestore'),
      storage: stub(admin, 'storage').returns({
        bucket: stub(),
      }),
    })
  })

  after(() => {
    adminStub.restore()
    functionsStub.restore()
    test.cleanup()
  })

  describe('inbound', () => {
    it('should be ok', async () => {
      const req = {
        method: 'GET',
      }

      const res = {
        status: (code) => {
          expect(code).equal(404)
        },
        json: (obj) => {
          expect(obj.ok).equal(false)
        },
      }

      const wrapped = test.wrap(inbound)
      await wrapped(req, res)
    })
  })
})
