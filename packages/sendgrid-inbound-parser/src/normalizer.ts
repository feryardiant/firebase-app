import type { AddressObject, EmailAddress, ParsedMail } from 'mailparser'
import type { NormalizedMail } from './types'

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

function normalizeReferences(refs?: string | string[]) {
  if (!refs)
    return []

  const references = Array.isArray(refs) ? refs : refs.split(',')

  return references
    .reduce((arr, ref) => {
      arr.push(...ref.split(','))
      return arr.filter(ref => !ref.includes('.ref@mail.yahoo.com'))
    }, [] as string[])
    .filter(ref => ref.length > 0)
}

const excludedHeaders: string[] = [
  'content-type',
  'date',
  'from',
  'to',
  'cc',
  'bcc',
  'mime-version',
  'in-reply-to',
  'message-id',
  'references',
  'reply-to',
  'subject',
]

/**
 * Normalize parsed-mail from 'mailparser' package
 */
export function normalize(email: ParsedMail & Record<string, any>): NormalizedMail {
  const normalized: NormalizedMail = {
    date: email.date as Date,
    envelope: {
      from: email.from?.value[0] as EmailAddress,
      to: normalizeAddress(email.to) as EmailAddress[],
    },
    subject: email.subject as string,
    attachments: email.attachments,
    messageId: email.messageId as string,
    headers: new Map<string, any>(),
    references: normalizeReferences(email.references),
    message: {},
  }

  email.headers.forEach((value, key) => {
    if (!excludedHeaders.includes(key))
      normalized.headers.set(key, value)
  })

  normalized.topic = email.headers.has('thread-topic')
    ? email.headers.get('thread-topic')?.toString()
    : email.subject?.toLowerCase().startsWith('re: ')
      ? email.subject.slice(4)
      : email.subject

  const participants = ['cc', 'bcc', 'replyTo']
  const messages = ['html', 'text', 'textAsHtml']

  for (const key of ['inReplyTo', ...participants, ...messages]) {
    if (!email[key])
      continue

    if (participants.includes(key)) {
      normalized.envelope[key] = normalizeAddress(email[key])
      continue
    }

    if (messages.includes(key)) {
      normalized.message[key] = email[key]
      continue
    }

    normalized[key] = email[key]
  }

  return normalized
}
