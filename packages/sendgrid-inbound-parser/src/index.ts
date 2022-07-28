import { extname } from 'path'
import type { Writable } from 'stream'
import busboy from 'busboy'
import type { BusboyEvents } from 'busboy'
import type { Request, RequestHandler, Response } from 'express'
import { simpleParser } from 'mailparser'
import type { Logger } from '@firebase/logger'
import type { Bucket, File } from '@google-cloud/storage'
import type { AttachmentFile, NormalizedEmail } from './types'
import { normalize } from './normalizer'

declare module 'express' {
  interface Request {
    rawBody?: Buffer
    body: NormalizedEmail
  }
}

/**
 * Store file buffer into writable stream.
 */
async function store(stream: Writable, file: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err)
    })

    stream.on('finish', () => {
      resolve()
    })

    stream.end(file)
  })
}

/**
 * Store the attachment file to google storage bucket.
 */
export async function storeAttachment(attachment: AttachmentFile, bucket: Bucket): Promise<File> {
  const ext = extname(attachment.filename as string).toLowerCase()
  const name = `${attachment.checksum}${ext}`
  const file = bucket.file(`attachments/${name}`)

  const stream = file.createWriteStream({
    public: true,
    metadata: {
      contentType: attachment.contentType,
    },
  })

  await store(stream, attachment.content)

  return file
}

/**
 * Normalize field with it's given value
 */
function parseFieldValue(field: string, value: string) {
  if (['envelope', 'charsets'].includes(field))
    return JSON.parse(value)

  if (field === 'spam_score')
    return parseFloat(value)

  return value
}

/**
 * Parse inbound mail body.
 */
function parseBody(req: Request): Promise<Record<string, any>> {
  const bb = busboy({ headers: req.headers })
  const body: Record<string, any> = {}

  const onField: BusboyEvents['field'] = (field, value) => {
    body[field] = parseFieldValue(field, value)
  }

  const onFile: BusboyEvents['file'] = (filename, _, info) => {
    body.attachments.push({ filename, info })
  }

  const cleanUp = () => {
    bb.off('field', onField)
    bb.off('file', onFile)
  }

  return new Promise((resolve, reject) => {
    bb.on('field', onField)
    bb.on('file', onFile)

    bb.on('error', (error) => {
      cleanUp()
      reject(error)
    })

    bb.on('finish', () => {
      cleanUp()
      resolve(body)
    })

    bb.end(req.rawBody)

    req.pipe(bb)
  })
}

/**
 * Parse email field in inbound mail body.
 */
export async function parseEmail(req: Request): Promise<NormalizedEmail> {
  const parsed = await parseBody(req)
  const result: Record<string, any> = {}

  for (const [field, value] of Object.entries(parsed)) {
    if (field === 'email') {
      result[field] = await simpleParser(value).then(normalize)
      continue
    }

    result[field] = value
  }

  return result as NormalizedEmail
}

export function inboundParser(): RequestHandler {
  //

  return async (req, _, next) => {
    if (req.method !== 'POST')
      return next()

    try {
      req.body = await parseEmail(req)
      next()
    }
    catch (err) {
      next(err)
    }
  }
}

export function handleInbound(logger: Logger) {
  //

  return async (req: Request, res: Response) => {
    try {
      req.body = await parseEmail(req)

      logger.info('Message recieved', req.body)

      res.json({
        ok: true,
      })
    }
    catch (error) {
      logger.error(error)

      res.json({
        ok: false,
      })
    }
  }
}
