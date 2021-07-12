import Busboy from 'busboy'
import { extname } from 'path'
import { simpleParser } from 'mailparser'

/**
 * @param {import('.').IncomingMail} envelope
 * @returns {import('.').Envelope}
 */
function normalizeMail(envelope) {
  const mail = {
    spamReport: envelope.spam_report,
    spamScore: parseFloat(envelope.spam_score),
    senderIp: envelope.sender_ip,
    subject: envelope.subject,
    date: envelope.email.date,
    messageId: null,
    inReplyTo: null,
    headers: envelope.email.headers,
    headerLines: envelope.email.headerLines,
    from: envelope.email.from.value[0],
    to: null
  }

  if (envelope.email.references) {
    const references = Array.isArray(envelope.email.references)
      ? envelope.email.references
      : envelope.email.references.split(',')

    mail.references = references
      .reduce((arr, ref) => {
        arr.push(...ref.split(','))
        return arr
      }, [])
      .filter((a) => a.length > 0)
  }

  const threadTopic = envelope.email.headers.has('thread-topic')
    ? envelope.email.headers.get('thread-topic')
    : mail.subject.toLowerCase().startsWith('re: ')
    ? mail.subject.slice(4)
    : null

  if (threadTopic) {
    mail.topic = threadTopic
  }

  for (const participant of ['to', 'cc', 'bcc', 'replyTo']) {
    if (!envelope.email[participant]) continue

    mail[participant] = Array.isArray(envelope.email[participant])
      ? envelope.email[participant].map((part) => part.value)
      : envelope.email[participant].value
  }

  mail.attachments = envelope.email.attachments
  mail.contents = {}

  for (const type of ['messageId', 'inReplyTo', 'html', 'text', 'textAsHtml']) {
    if (!envelope.email[type]) continue

    if (['messageId', 'inReplyTo'].includes(type)) {
      mail[type] = envelope.email[type]
      continue
    }

    mail.contents[type] = envelope.email[type]
  }

  return mail
}

/**
 * @param {import('express').Request} req
 * @returns {Promise<void>}
 */
const parseBody = (req) =>
  new Promise((resolve, reject) => {
    if (!req.headers['content-type']?.startsWith('multipart/form-data')) {
      return reject(new Error('Could not parse non-multipart data'))
    }

    const busboy = new Busboy({ headers: req.headers })
    const body = {}

    busboy.on('field', (field, value) => {
      body[field] = value
    })

    busboy
      .on('error', reject)
      .on('finish', () => {
        req.body = body
        resolve(body)
      })
      .end(req.rawBody)

    req.pipe(busboy)
  })

/**
 * @param {import('.').AttachmentFile} attachment
 * @param {import('@google-cloud/storage').Bucket} bucket
 * @returns {Promise<import('@google-cloud/storage').File>}
 */
export const storeAttachment = (attachment, bucket) =>
  new Promise((resolve, reject) => {
    const filename = `${attachment.checksum}${extname(
      attachment.filename
    ).toLowerCase()}`
    const file = bucket.file(`attachments/${filename}`)
    const stream = file.createWriteStream({
      public: true,
      metadata: {
        contentType: attachment.contentType
      }
    })

    stream.on('error', (err) => {
      attachment.isUploaded = false
      reject(err)
    })

    stream.on('finish', () => {
      attachment.isUploaded = true
      resolve(file)
    })

    stream.end(attachment.content)
  })

/**
 * @param {import('@google-cloud/storage').Bucket} bucket
 * @returns {import('express').RequestHandler}
 */
export const inboundParser = () => {
  return (req, _, next) =>
    parseBody(req)
      .then(async () => {
        req.body.email = await simpleParser(req.body.email)
        req.envelope = normalizeMail(req.body)

        return next()
      })
      .catch((err) => next(err))
}
