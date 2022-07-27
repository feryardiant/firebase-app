import type { Busboy, FileInfo } from 'busboy'
import busboy from 'busboy'
import type { Request, RequestHandler } from 'express'
import { simpleParser } from 'mailparser'
import { normalize } from './normalizer'

declare module 'express' {
  interface Request {
    rawBody?: any
    bb?: Busboy
  }
}

export { store as storeAttachment } from './attachment'

export const parseBody = (req: Request) => {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers })
    const body: Record<string, any> = {}

    function onError(err: unknown) {
      reject(err)
    }

    function onField(field: string, value: string) {
      body[field] = value
    }

    function onFile(name: string, _: ReadableStream, info: FileInfo) {
      console.info({ name, info }) // eslint-disable-line no-console
    }

    function cleanUp() {
      bb
        .off('error', onError)
        .off('field', onField)
        .off('file', onFile)
    }

    bb
      .on('field', onField)
      .on('file', onFile)
      .on('error', onError)

    bb.on('finish', () => {
      console.info('body:', body) // eslint-disable-line no-console
      // req.body = body
      resolve(body)
    })

    bb.on('close', () => {
      cleanUp()
      bb.end(req.rawBody)
    })

    req.pipe(bb)
  })
}

export function inboundParser(): RequestHandler {
  return async (req, res, next) => {
    if (!req.body.email)
      return next()

    try {
      await parseBody(req)
      req.body.email = await simpleParser(req.body.email)
      req.body.envelope = normalize(req.body)
      next()
    }
    catch (err) {
      next(err)
    }
  }
}
