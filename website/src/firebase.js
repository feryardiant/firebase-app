import firebase from 'firebase/app'

const initialized = {}
const isDev = import.meta.env.DEV
const $app = firebase.initializeApp(FIREBASE_CONFIG)

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.analytics.Analytics?>}
 */
export const useAnalytics = async (app = $app) => {
  if (isDev) return null

  if (initialized.analytics) {
    return initialized.analytics
  }

  await import('firebase/analytics')
  initialized.analytics = firebase.analytics(app)

  return initialized.analytics
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.auth.Auth>}
 */
export const useAuth = async (app = $app) => {
  if (initialized.auth) {
    return initialized.auth
  }

  await import('firebase/auth')
  const auth = firebase.auth(app)

  if (isDev) {
    auth.useEmulator('http://localhost:9099')
  }

  return initialized.auth = auth
}

/**
 * @returns {Promise<firebase.User>}
 */
export const getCurrentUser = async () => {
  const auth = await useAuth()

  if (auth.currentUser) {
    return auth.currentUser
  }

  return new Promise((resolve, reject) => {
    const sub = auth.onAuthStateChanged(user => {
      sub()
      resolve(user)
    }, reject)
  })
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.database.Database>}
 */
export const useDatabase = async (app = $app) => {
  if (initialized.database) {
    return initialized.database
  }

  await import('firebase/database')
  const database = firebase.database(app)

  if (isDev) {
    database.useEmulator('localhost', 9000)
  }

  return initialized.database = database
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.firestore.Firestore>}
 */
export const useFirestore = async (app = $app) => {
  if (initialized.firestore) {
    return initialized.firestore
  }

  await import('firebase/firestore')
  const firestore = firebase.firestore(app)

  if (isDev) {
    firestore.useEmulator('localhost', 8080)
  }

  return initialized.firestore = firestore
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.functions.Functions>}
 */
export const useFunctions = async (app = $app) => {
  if (initialized.functions) {
    return initialized.functions
  }

  await import('firebase/functions')
  const functions = firebase.functions(app)

  if (isDev) {
    functions.useEmulator('localhost', 5001)
  }

  return initialized.functions = functions
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.messaging.Messaging>}
 */
export const useMessaging = async (app = $app) => {
  if (initialized.messaging) {
    return initialized.messaging
  }

  await import('firebase/messaging')
  initialized.messaging = firebase.messaging(app)

  return initialized.messaging
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.storage.Storage>}
 */
export const useStorage = async (app = $app) => {
  if (initialized.storage) {
    return initialized.storage
  }

  await import('firebase/storage')
  initialized.storage = firebase.storage(app)

  return initialized.storage
}
