import Busboy from 'busboy'
import { extname } from 'path'
import { simpleParser } from 'mailparser'

/**
 * @param {import('.').IncomingMail} body
 * @returns {import('.').Envelope}
 */
function normalizeMail (body) {
  const mail = {
    spamReport: body.spam_report,
    spamScore: parseFloat(body.spam_score),
    senderIp: body.sender_ip,
    subject: body.subject,
    date: body.email.date,
    messageId: body.email.messageId,
    from: body.email.from.value[0],
    to: null
  }

  if (body.email.references) {
    const references = Array.isArray(body.email.references)
      ? body.email.references
      : body.email.references.split(',')

    mail.references = references.reduce((arr, ref) => {
      arr.push(...ref.split(','))
      return arr
    }, []).filter(a => a.length > 0)
  }

  const threadTopic = body.email.headers.has('thread-topic')
    ? body.email.headers.get('thread-topic')
    : (mail.subject.toLowerCase().startsWith('re: ') ? mail.subject.slice(4) : null)

  if (threadTopic) {
    mail.topic = threadTopic
  }

  for (const participant of ['to', 'cc', 'bcc', 'replyTo']) {
    if (!body.email[participant]) continue

    mail[participant] = Array.isArray(body.email[participant])
      ? body.email[participant].map((part) => part.value)
      : body.email[participant].value
  }

  for (const contentType of ['inReplyTo', 'html', 'text', 'textAsHtml']) {
    if (body.email[contentType]) {
      mail[contentType] = body.email[contentType]
    }
  }

  mail.attachments = body.email.attachments

  return mail
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<void>}
 */
const parseBody = (req) => new Promise((resolve, reject) => {
  if (!req.headers['content-type']?.startsWith('multipart/form-data')) {
    return reject(new Error('Could not parse non-multipart data'))
  }

  const busboy = new Busboy({ headers: req.headers })

  busboy.on('field', (field, value) => {
    req.body[field] = value
  })

  busboy
    .on('error', reject)
    .on('finish', resolve)
    .end(req.rawBody)

  req.pipe(busboy)
})

/**
 * @param {import('.').AttachmentFile} attachment
 * @param {import('@google-cloud/storage').Bucket} bucket
 * @returns {Promise<import('@google-cloud/storage').File>}
 */
export const storeAttachment = (attachment, bucket) => new Promise((resolve, reject) => {
  const filename = `${attachment.checksum}${extname(attachment.filename).toLowerCase()}`
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
 * @returns {Function<Promise>}
 */
export const inboundParser = () => (req, _, next) => parseBody(req)
  .then(async () => {
    req.body.email = await simpleParser(req.body.email)
    req.envelope = normalizeMail(req.body)

    return next()
  })
  .catch((err) => next(err))
