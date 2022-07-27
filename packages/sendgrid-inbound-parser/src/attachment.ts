import { extname } from 'path'
import type { Attachment } from 'mailparser'
import type { Bucket, File } from '@google-cloud/storage'

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

export const store = (attachment: AttachmentFile, bucket: Bucket): Promise<File> => {
  const ext = extname(attachment.filename as string).toLowerCase()
  const filename = `${attachment.checksum}${ext}`
  const file = bucket.file(`attachments/${filename}`)

  return new Promise((resolve, reject) => {
    const stream = file.createWriteStream({
      public: true,
      metadata: {
        contentType: attachment.contentType,
      },
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
}
