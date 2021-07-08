import { https, logger } from 'firebase-functions'
import admin from 'firebase-admin'

admin.initializeApp()

export const api = https.onRequest(async (req, res) => {
  logger.info(req.ip)

  return res.status(200).send('OK')
})
