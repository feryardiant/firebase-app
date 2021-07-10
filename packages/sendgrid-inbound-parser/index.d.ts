import { File } from '@google-cloud/storage'
import { ParsedMail, EmailAddress, Attachment } from 'mailparser'
import { Request } from 'express'

export interface AttachmentFile extends Attachment {
  /**
   * Is file uploaded
   */
  isUploaded?: boolean;
  /**
   * The uploaded file
   */
  uploadedFile?: File;
}

export interface EmailRequest extends Request {
  body: IncomingMail;
  envelope: Envelope;
}

export interface IncomingMail {
  email: ParsedMail;
  spam_report: string;
  spam_score: string;
  sender_ip: string;
  subject: string;
}

export interface Envelope {
  spamReport: string;
  spamScore: number;
  senderIp: string;
  messageId: string;
  subject: string;
  topic: string;
  date: string;
  from: EmailAddress;
  to: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress | EmailAddress[];
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  inReplyTo?: string;
  references?: string[];
  html?: string;
  text?: string;
  textAsHtml?: string;
  attachments: AttachmentFile[];
}
