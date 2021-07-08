import firebase from 'firebase/app'
import 'firebase/analytics'

const app = firebase.initializeApp({
  appId: import.meta.env.VITE_FIREBASE_APPID,
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
})

export const analytics = import.meta.env.PROD
  ? firebase.analytics(app)
  : null
