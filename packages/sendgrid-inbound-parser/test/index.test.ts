import { expect } from 'chai'
import express from 'express'
import type { Request, Response } from 'express'
import request from 'supertest'

import { inboundParser } from '../src'
import pkg from '../package.json' assert {type: 'json'}
// import { fixture } from './fixtures'

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

  // it('should have email body', async () => {
  //   const { email } = await fixture('gmail')
  //   const res = await request(app)
  //     .post('/')
  //     .set('Content-Type', 'multipart/form-data')
  //     .field('SPF', 'pass')
  //     .field('email', email.raw)

  //   // for (const [field, value] of Object.entries(body))
  //   //   req.field(field, value as any)

  //   // const res = await req

  //   expect(res.body.ok).equal(true)
  //   expect(res.body.hasMail).equal(true)
  //   expect(res.status).equal(200)
  // })
})
