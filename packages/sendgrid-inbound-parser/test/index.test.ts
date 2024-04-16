import express from 'express'
import type { Request, Response } from 'express'
import request from 'supertest'

import { inboundParser } from '../src'
import pkg from '../package.json'
// import { fixture, providers } from './fixtures'

let app: any

describe(pkg.name, () => {
  beforeEach(() => {
    app = express()

    app.all('/', inboundParser(), (req: Request, res: Response) => {
      res.json({
        ok: true,
        hasMail: !!req.body?.email,
      })
    })
  })

  it('should not have email body', async () => {
    const res = await request(app).get('/')

    expect(res.body.ok).equal(true)
    expect(res.body.hasMail).equal(false)
    expect(res.status).equal(200)
  })

  // it.each(providers)('should have %s mail body', async (provider) => {
  //   const { email } = await fixture(provider)
  //   const res = await request(app)
  //     .post('/')
  //     .set('Content-Type', 'multipart/form-data')
  //     .field('SPF', 'pass')
  //     .field('email', email.raw)

  //   expect(res.body.ok).equal(true)
  //   expect(res.body.hasMail).equal(true)
  //   expect(res.status).equal(200)
  // })
})
