import express from 'express'
import cookieParser from 'cookie-parser'
import { inboundParser, storeAttachment } from '@feryardiant/sendgrid-inbound-parser'

/**
 * @param {import('firebase-functions').logger} logger
 * @returns {express.ErrorRequestHandler}
 */
export function useLogger(logger) {
  return (err, _, res, __) => {
    logger.error(err)

    res.status(500)
    res.send('Internal server Error')
  }
}

/**
 * @param {import('firebase-admin').app.App} admin
 * @param {import('firebase-functions').logger} logger
 * @returns {express.Application}
 */
export function requestHandler(admin, logger) {
  const app = express()
  const db = admin.firestore()
  const bucket = admin.storage().bucket()

  app.use(cookieParser())
  app.use(useLogger(logger))

  app.get('/mail', (req, res) => {
    res.status(200).send('OK')
  })

  app.post('/inbound', inboundParser(), inboundHandler(db, bucket, logger))

  app.all('*', (req, res) => {
    res.cookie('redirect', req.path, {
      path: '/',
      expires: new Date(Date.now() + 5 * 60000),
      sameSite: true,
      secure: req.secure
    })

    return res.redirect('/')
  })

  return app
}

/**
 * @param {import('firebase-admin').firestore.Firestore} db
 * @param {import('@google-cloud/storage').Bucket} bucket
 * @param {import('firebase-functions').logger} logger
 * @returns {express.RequestHandler<import('@feryardiant/sendgrid-inbound-parser').EmailRequest>}
 */
const inboundHandler = (db, bucket, logger) => async (req, res) => {
  const messageCol = db.collection('messages')
  const attachmentCol = db.collection('attachments')
  const conversationCol = db.collection('conversations')
  const peopleCol = db.collection('people')

  try {
    /** @type {import('@feryardiant/sendgrid-inbound-parser').Envelope} */
    const { messageId, attachments, headers, ...envelope } = req.envelope

    await db.runTransaction(async (trans) => {
      const conversationRef = conversationCol.doc(envelope.topic || envelope.subject)
      const convMessageCol = conversationRef.collection('messages')
      const convParticipantCol = conversationRef.collection('participants')
      const convAttachmentCol = conversationRef.collection('attachments')
      const parties = []
      const message = {
        headers: Object.fromEntries(headers),
        attachments: [],
        ...envelope
      }

      const getExistingPerson = async (person) => {
        const sender = await trans.get(peopleCol.doc(person.address))
        const existing = sender.exists ? sender.data() : person

        return {
          address: person.address,
          name: person.name || existing.name,
          messages: existing.messages || []
        }
      }

      const sender = await getExistingPerson(envelope.from)

      parties.push(sender)

      for (const field of ['to', 'cc', 'bcc']) {
        if (!envelope[field]) continue

        for (let participant of envelope[field]) {
          if (participant.address.endsWith('@feryardiant.id')) continue

          participant = await getExistingPerson(participant)

          parties.push(participant)
        }
      }

      await Promise.all(
        attachments.map(async ({ headers, ...attachment }) => {
          if (attachment.contentDisposition === 'inline') return

          const uploadedFile = await storeAttachment(attachment, bucket)
          const attachmentFile = {
            messageId,
            filename: attachment.filename,
            contentId: attachment.contentId,
            contentType: attachment.contentType,
            size: attachment.size,
            isUploaded: attachment.isUploaded,
            headers: Object.fromEntries(headers),
            publicUrl: uploadedFile.publicUrl()
          }

          trans.set(attachmentCol.doc(attachment.checksum), attachmentFile)
          trans.set(convAttachmentCol.doc(attachment.checksum), attachmentFile)
          message.attachments.push(attachmentFile)
        })
      )

      for (const party of parties) {
        if (!party.messages.includes(messageId)) {
          party.messages.push(messageId)
        }

        trans.set(peopleCol.doc(party.address), party)
        trans.set(convParticipantCol.doc(party.address), party)
      }

      trans.set(messageCol.doc(messageId), message)
      trans.set(convMessageCol.doc(messageId), message)
    })

    logger.info('message recieved', { messageId })

    res.sendStatus(200)
  } catch (err) {
    logger.error(err)

    res.sendStatus(500)
  }
}
