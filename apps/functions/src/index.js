import { https, logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin'
import busboy from 'busboy'
// import { parseBody } from '@feryardiant/sendgrid-inbound-parser'
import { requestHandler } from './app'

const admin = initializeApp()

export const func = https.onRequest(requestHandler(admin, logger))

export const test = https.onRequest((req, res) => {
  const bb = busboy({ headers: req.headers })
  const bucket = admin.storage().bucket()
  const body = {}

  bb.on('field', (field, value) => {
    body[field] = value
  })

  bb.on('file', (name, file, info) => {
    console.info({ name, info }) // eslint-disable-line no-console
    const storage = bucket.file(`attachments/${name}`)

    file.pipe(storage.createWriteStream({
      public: true,
      metadata: {
        contentType: info.mimeType,
      },
    }))
  })

  bb.on('error', (error) => {
    console.error(error)
    res.json({
      ok: false,
      error,
    })
  })

  bb.on('finish', () => {
    console.log({ // eslint-disable-line no-console
      headers: req.headers,
      body,
    })
    res.json({
      ok: true,
    })
  })

  bb.on('close', () => {
    //
  })

  req.pipe(bb)
})
