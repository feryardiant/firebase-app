import sgMail from '@sendgrid/mail'

import { author } from '../package.json'

/**
 * @param {import('firebase-functions').config.Config} config
 * @returns {sgMail}
 */
export function useMailer(config) {
  sgMail.setApiKey(config.sendgrid.key)

  return sgMail
}
