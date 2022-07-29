import { parseEmail, storeAttachment } from '@feryardiant/sendgrid-inbound-parser'

/**
 * @param {import('firebase-admin').app.App} admin
 * @param {import('firebase-functions').logger} logger
 * @returns {import('firebase-functions').HttpsFunction}
 */
export const inboundHandler = (admin, logger) => {
  const db = admin.firestore()
  const bucket = admin.storage().bucket()
  const convCol = db.collection('conversations')
  const peopleCol = db.collection('people')

  /**
   * @param {String[]} refs
   * @returns {Promise<import('firebase-admin').firestore.DocumentReference>}
   */
  async function getConversation(refs) {
    if (refs.length === 0)
      return convCol.doc()

    const convs = await convCol.where('messageId', 'in', refs).get()

    return convs.empty ? convCol.doc() : convs.docs[0].ref
  }

  /**
   * @typedef {Object} Person
   * @property {String} address
   * @property {String} name
   * @property {String[]} messages
   *
   * @param {String} address
   * @param {String} name
   * @returns {Promise<Person>}
   */
  async function getPerson(address, name) {
    const person = await peopleCol.doc(address).get()
    const existing = person.exists ? person.data() : { address, name }

    return {
      address: existing.address,
      name: existing.name || name,
      messages: existing.message || [],
    }
  }

  return async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(404).json({
        ok: false,
      })
    }

    /** @type {Person[]} */
    const people = []
    const msgCol = db.collection('messages')
    const attCol = db.collection('attachments')

    try {
      const { email: { attachments, envelope, headers, message, references, ...mail } } = await parseEmail(req)
      const messageRef = msgCol.doc(mail.messageId)
      const convRef = await getConversation(references)

      for (const [field, party] of Object.entries(envelope)) {
        const parties = Array.isArray(party) ? party : [party]

        await Promise.all(parties.map(async ({ address, name }, i) => {
          const person = await getPerson(address, name)

          if (field !== 'from' && !name)
            envelope[field][i].name = person.name

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
          messageId: convData.exists ? convData.data().messageId : mail.messageId,
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
          const stored = await storeAttachment(file, bucket)
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
