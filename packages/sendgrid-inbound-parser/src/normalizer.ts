import type { AddressObject, EmailAddress, ParsedMail } from 'mailparser'
import type { AttachmentFile } from './attachment'

export interface Envelope extends Record<string, any> {
  date: Date
  from: EmailAddress
  to?: EmailAddress | EmailAddress[]
  messageId?: string
  // spamReport: string
  // spamScore: number
  // headers: Headers
  // headerLines: HeaderLines
  // subject: string
  topic?: string
  replyTo?: EmailAddress | EmailAddress[]
  cc?: EmailAddress | EmailAddress[]
  bcc?: EmailAddress | EmailAddress[]
  inReplyTo?: string
  references?: string[]
  contents: Record<string, string>
  attachments: AttachmentFile[]
}

export interface IncomingMail extends Record<string, any> {
  email: ParsedMail & Record<string, any>
  envelope: Envelope
  spam_report: string
  spam_score: string
  sender_ip: string
  subject: string
}

function normalizeAddress(address?: AddressObject | AddressObject[]) {
  const normalized = Array.isArray(address)
    ? address.map(part => part.value).reduce((prev, curr) => {
      Array.isArray(curr)
        ? prev.push(...curr)
        : prev.push(curr)

      return prev
    }, [])
    : address?.value

  return normalized
}

export function normalize(body: IncomingMail): Envelope {
  const mail: Envelope = {
    date: body.email.date as Date,
    from: body.email.from?.value[0] as EmailAddress,
    to: normalizeAddress(body.email.to),
    attachments: body.email.attachments,
    contents: {},
  }

  if (body.email.headers.has('thread-topic'))
    mail.topic = body.email.headers.get('thread-topic')?.toString()

  const participants = ['to', 'cc', 'bcc', 'replyTo']
  const types = ['html', 'text', 'textAsHtml']

  for (const key of ['messageId', 'inReplyTo', ...participants, ...types]) {
    if (!body.email[key])
      continue

    if (participants.includes(key)) {
      mail[key] = normalizeAddress(body.email[key])
      continue
    }

    if (types.includes(key)) {
      mail.contents[key] = body.email[key]
      continue
    }

    mail[key] = body.email[key]
  }

  return mail
}
