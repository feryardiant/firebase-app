import { extname } from 'node:path'
import type { Writable } from 'node:stream'
import type { Buffer } from 'node:buffer'
import busboy from 'busboy'
import type { BusboyEvents } from 'busboy'
import type { Request, RequestHandler } from 'express'
import { simpleParser } from 'mailparser'
import type { Attachment, EmailAddress } from 'mailparser'
import mime from 'mime-types'
import type { Bucket, File } from '@google-cloud/storage'
import type { Envelope, NormalizedEmail, ParsedEmail } from './types'
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

function getFilename(attachment: Attachment): string {
  const ext = attachment.filename
    ? extname(attachment.filename).toLowerCase()
    : mime.extension(attachment.contentType)

  return `${attachment.checksum}${ext}`
}

/**
 * Store the attachment file to google storage bucket.
 */
export async function storeAttachment(attachment: Attachment, bucket: Bucket): Promise<File> {
  const file = bucket.file(`attachments/${getFilename(attachment)}`)

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
    return Number.parseFloat(value)

  return value
}

/**
 * Parse inbound mail body.
 */
function parseBody(req: Request): Promise<ParsedEmail> {
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
      resolve(body as ParsedEmail)
    })

    bb.end(req.rawBody)

    req.pipe(bb)
  })
}

export { Attachment, Envelope, EmailAddress, normalize, NormalizedEmail, ParsedEmail }

/**
 * Parse email field in inbound mail body.
 */
export async function parseEmail(req: Request): Promise<NormalizedEmail> {
  const parsed = await parseBody(req)
  const result: Record<string, any> = {}

  for (const [field, value] of Object.entries(parsed)) {
    if (field === 'email') {
      const normalized = await simpleParser(value).then(normalize)

      normalized.headers.set('sender-ip', parsed.sender_ip)
      normalized.headers.set('spam-report', parsed.spam_report)
      normalized.headers.set('spam-score', Number.parseFloat(parsed.spam_score))

      result[field] = normalized
      continue
    }

    result[field] = value
  }

  return result as NormalizedEmail
}

/**
 * Express middleware to parse request body.
 */
export function inboundParser(): RequestHandler {
  //

  return (req, _, next) => {
    if (req.method !== 'POST')
      return next()

    parseEmail(req).then((parsed) => {
      req.body = parsed
      next()
    }).catch((err) => {
      next(err)
    })
  }
}
