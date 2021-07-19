/* eslint-disable import/no-duplicates */

import { ViteSSGContext } from 'vite-ssg'

interface ImportMeta {
  env: {
    VITE_FIREBASE_APPID?: string;
    VITE_FIREBASE_APIKEY?: string;
    VITE_FIREBASE_MEASUREMENTID?: string;
    VITE_FIREBASE_MESSAGINGSENDERID?: string;
    VITE_FIREBASE_PROJECTID?: string;
    VITE_RECAPTCHA_SITEKEY?: string;
    VITE_RECAPTCHA_SECRETKEY?: string;
  }
}

export type UserModule = (ctx: ViteSSGContext) => Promise<void>

export { }
