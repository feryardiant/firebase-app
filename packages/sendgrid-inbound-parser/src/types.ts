import type { File } from '@google-cloud/storage'
import type { Attachment, EmailAddress, MessageText, ParsedMail } from 'mailparser'

export interface IncomingEmail extends Record<string, any> {
  SPF: string
  dkim: string
  to: string
  from: string
  sender_ip: string
  spam_report: string
  envelope: string
  subject: string
  email: Record<string, any>
  attachments: any[]
}

export interface AttachmentFile extends Attachment {
  /**
   * Is file uploaded
   */
  isUploaded?: boolean
  /**
   * The uploaded file
   */
  uploadedFile?: File
}

export interface Envelope extends Record<string, any> {
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress | EmailAddress[]
}

export type Recipients = keyof Envelope | string

export interface NormalizedMail extends Record<string, any> {
  date: Date
  envelope: Envelope
  headers: Map<string, any>
  messageId: string
  // spamReport: string
  // spamScore: number
  // headerLines: HeaderLines
  subject: string
  topic?: string
  inReplyTo?: string
  references: string[]
  message: Record<keyof MessageText | string, string>
  attachments: Attachment[]
}

export interface ParsedEmail extends IncomingEmail {
  charsets: string
  spam_score: string
  email: ParsedMail
}

export interface NormalizedEmail extends IncomingEmail {
  charsets: any
  spam_score: number
  email: NormalizedMail
}
