import { https, logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin'
import { requestHandler } from './app'

const admin = initializeApp()

export const func = https.onRequest(requestHandler(admin, logger))
