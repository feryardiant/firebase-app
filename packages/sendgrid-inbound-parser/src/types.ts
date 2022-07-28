import type { File } from '@google-cloud/storage'
import type { Attachment, EmailAddress, MessageText, ParsedMail } from 'mailparser'

export interface IncomingEmail extends Record<string, any> {
  SPF: string
  dkim: string
  to: string
  from: string
  sender_ip: string
  spam_report: string
  spam_score: number
  envelope: string
  subject: string
  charsets: string
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

export interface Envelope extends Record<string, EmailAddress | EmailAddress[] | undefined> {
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress | EmailAddress[]
}

export interface NormalizedMail extends Record<string, any> {
  date: Date
  envelope: Envelope
  headers: Map<string, any>
  messageId?: string
  // spamReport: string
  // spamScore: number
  // headerLines: HeaderLines
  subject: string
  topic?: string
  replyTo?: EmailAddress | EmailAddress[]
  inReplyTo?: string
  references?: string[]
  message: Record<keyof MessageText | string, string>
  attachments: AttachmentFile[]
}

export interface ParsedEmail extends IncomingEmail {
  email: ParsedMail
}

export interface NormalizedEmail extends IncomingEmail {
  email: NormalizedMail
}
