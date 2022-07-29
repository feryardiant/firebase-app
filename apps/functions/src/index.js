import { https, logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin'
import { inboundHandler } from './email'

const admin = initializeApp()

export const inbound = https.onRequest(inboundHandler(admin, logger))
