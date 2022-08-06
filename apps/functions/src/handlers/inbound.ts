import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import logger from 'firebase-functions/logger'
import type { App } from 'firebase-admin/app'
import { parseEmail, storeAttachment } from '@feryardiant/sendgrid-inbound-parser'
import type { Attachment, Envelope } from '@feryardiant/sendgrid-inbound-parser'
import type { Handler, Person } from '../types'

export default function handler(app: App): Handler {
  const db = getFirestore(app)
  const bucket = getStorage(app).bucket()
  const convCol = db.collection('conversations')
  const peopleCol = db.collection('people')

  async function getConversation(refs: string[]) {
    if (refs.length === 0)
      return convCol.doc()

    const convs = await convCol.where('messageId', 'in', refs).get()

    return convs.empty ? convCol.doc() : convs.docs[0].ref
  }

  async function getPerson(address: string, name: string) {
    const person = await peopleCol.doc(address).get()
    const existing = person.exists ? person.data() : { address, name }

    return {
      address: existing?.address,
      name: existing?.name || name,
      messages: existing?.message || [],
    } as Person
  }

  return async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(404).json({
        ok: false,
      })
    }
    const people: Person[] = []
    const msgCol = db.collection('messages')
    const attCol = db.collection('attachments')

    try {
      const { email: { attachments, envelope, headers, message, references, ...mail } } = await parseEmail(req)
      const messageRef = msgCol.doc(mail.messageId)
      const convRef = await getConversation(references)

      for (const [field, party] of Object.entries<any>(envelope)) {
        const parties = Array.isArray(party) ? party : [party]

        await Promise.all(parties.map(async ({ address, name }, i) => {
          const person = await getPerson(address, name)

          if (field !== 'from' && !name) {
            const envlp = envelope[field][i] as Envelope
            envlp.name = person.name
          }

          people.push(person)
        }))
      }

      await db.runTransaction(async (trans) => {
        const convData = await convRef.get()
        const email = {
          headers: Object.fromEntries(headers),
          envelope,
          message,
          ...mail,
        }

        trans.set(convRef, {
          messageId: convData.exists ? convData.data()?.messageId : mail.messageId,
          date: mail.date,
          topic: mail.topic || mail.subject,
        })

        trans.set(messageRef, email)
        trans.set(convRef.collection('messages').doc(mail.messageId), email)

        await Promise.all(people.map(async (person) => {
          person.messages.push(mail.messageId)
          trans.set(peopleCol.doc(person.address), person)
        }))

        await Promise.all(attachments.map(async ({ headers, ...file }) => {
          const ref = attCol.doc(file.checksum)
          const stored = await storeAttachment(file as Attachment, bucket)
          const attachment = {
            headers: Object.fromEntries(headers),
            publicUrl: stored.publicUrl(),
            ...file,
          }

          trans.set(messageRef.collection('attachments').doc(file.checksum), attachment)
          trans.set(ref, {
            messageId: mail.messageId,
            ...attachment,
          })
        }))
      })

      logger.info('Message recieved', mail)

      res.json({
        ok: true,
      })
    }
    catch (error) {
      logger.error(error)

      res.status(500).json({
        ok: false,
      })
    }
  }
}
