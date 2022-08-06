import { https } from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { inboundHandler, mainHandler } from './handlers'

const app = initializeApp()

export const main = https.onRequest(mainHandler(app))

export const inbound = https.onRequest(inboundHandler(app))
