import { initializeApp } from 'firebase/app'
import type { Analytics } from 'firebase/analytics'
import type { Auth, User } from 'firebase/auth'
import type { Database } from 'firebase/database'
import type { Firestore } from 'firebase/firestore'
import type { Functions } from 'firebase/functions'
import type { Messaging } from 'firebase/messaging'
import type { FirebaseStorage } from 'firebase/storage'

interface FirebaseInstances {
  analytics?: Analytics
  auth?: Auth
  database?: Database
  firestore?: Firestore
  functions?: Functions
  messaging?: Messaging
  storage?: FirebaseStorage
}

const instances: FirebaseInstances = {}
const $app = initializeApp(FIREBASE_CONFIG)

export async function useAnalytics(): Promise<Analytics> {
  if (instances.analytics)
    return instances.analytics

  const { initializeAnalytics } = await import('firebase/analytics')

  return instances.analytics = initializeAnalytics($app)
}

export async function useAuth(): Promise<Auth> {
  if (instances.auth)
    return instances.auth

  const { getAuth, connectAuthEmulator } = await import('firebase/auth')
  instances.auth = getAuth($app)

  if (import.meta.env.DEV)
    connectAuthEmulator(instances.auth, 'http://localhost:9099')

  return instances.auth
}

export async function getCurrentUser(): Promise<User | null> {
  const auth = await useAuth()

  if (auth.currentUser)
    return auth.currentUser

  return new Promise((resolve, reject) => {
    const sub = auth.onAuthStateChanged((user) => {
      sub()
      resolve(user)
    }, reject)
  })
}

export async function useDatabase(): Promise<Database> {
  if (instances.database)
    return instances.database

  const { getDatabase, connectDatabaseEmulator } = await import('firebase/database')
  instances.database = getDatabase($app)

  if (import.meta.env.DEV)
    connectDatabaseEmulator(instances.database, 'localhost', 9000)

  return instances.database
}

export async function useFirestore(): Promise<Firestore> {
  if (instances.firestore)
    return instances.firestore

  const { initializeFirestore, connectFirestoreEmulator } = await import('firebase/firestore')
  instances.firestore = initializeFirestore($app, {
    ignoreUndefinedProperties: true,
  })

  if (import.meta.env.DEV)
    connectFirestoreEmulator(instances.firestore, 'localhost', 8080)

  return instances.firestore
}

export async function useFunctions(): Promise<Functions> {
  if (instances.functions)
    return instances.functions

  const { getFunctions, connectFunctionsEmulator } = await import('firebase/functions')
  instances.functions = getFunctions($app)

  if (import.meta.env.DEV)
    connectFunctionsEmulator(instances.functions, 'localhost', 5001)

  return instances.functions
}

export async function useMessaging(): Promise<Messaging> {
  if (instances.messaging)
    return instances.messaging

  const { getMessaging } = await import('firebase/messaging')
  instances.messaging = getMessaging($app)

  return instances.messaging
}

export async function useFirebaseStorage(): Promise<FirebaseStorage> {
  if (instances.storage)
    return instances.storage

  const { getStorage, connectStorageEmulator } = await import('firebase/storage')
  instances.storage = getStorage($app)

  if (import.meta.env.DEV)
    connectStorageEmulator(instances.storage, 'localhost', 9199)

  return instances.storage
}
