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

export function normalize(email: ParsedMail & Record<string, any>): NormalizedMail {
  const normalized: NormalizedMail = {
    date: email.date as Date,
    envelope: {
      from: email.from?.value[0] as EmailAddress,
      to: normalizeAddress(email.to) as EmailAddress[],
    },
    subject: email.subject as string,
    attachments: email.attachments,
    headers: new Map<string, any>(),
    message: {},
  }

  email.headers.forEach((value, key) => {
    normalized.headers.set(key, value)
  })

  if (email.references) {
    const references = Array.isArray(email.references)
      ? email.references
      : email.references.split(',')

    normalized.references = references
      .reduce((arr, ref) => {
        arr.push(...ref.split(','))
        return arr.filter(ref => !ref.includes('.ref@mail.yahoo.com'))
      }, [] as string[])
      .filter(ref => ref.length > 0)
  }

  normalized.topic = email.headers.has('thread-topic')
    ? email.headers.get('thread-topic')?.toString()
    : email.subject?.toLowerCase().startsWith('re: ')
      ? email.subject.slice(4)
      : undefined

  const participants = ['cc', 'bcc', 'replyTo']
  const messages = ['html', 'text', 'textAsHtml']

  for (const key of ['messageId', 'inReplyTo', ...participants, ...messages]) {
    if (!email[key])
      continue

    if (participants.includes(key)) {
      normalized[key] = normalizeAddress(email[key])
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
