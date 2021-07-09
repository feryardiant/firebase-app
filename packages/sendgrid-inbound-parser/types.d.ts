import type { File } from '@google-cloud/storage'

declare type Person = {
  name: String,
  address: String
}

declare type Attachment = {
  filename?: String,
  size: Number,
  content: Buffer,
  contentId: String,
  contentType?: String,
  contentDisposition: String,
  cid?: String,
  checksum: String,
  related: Boolean,
  isUploaded?: Boolean,
  uploadedFile?: File,
}

declare type Mail = {
  spamReport: String,
  spamScore: Number,
  senderIp: String,
  messageId: String,
  subject: String,
  topic: String,
  date: String,
  to: Person[],
  from: Person,
  replyTo?: Person,
  cc?: Person[],
  inReplyTo?: String,
  references?: String[],
  html?: String,
  text?: String,
  textAsHtml?: String,
  attachments: Attachment[],
}

export { Person, Attachment, Mail }
