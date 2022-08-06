import type { App } from 'firebase-admin/app'
import type { Handler } from '../types'

export default function handler(admin: App): Handler {
  console.log(admin.name) // eslint-disable-line no-console

  return async (req, res) => {
    res.json({
      name: process.env.APP_NAME,
      status: 'OK',
      url: req.url,
    })
  }
}
