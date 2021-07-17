const dotenv = require('dotenv')

function loadEnvFile (path, env) {
  const { parsed } = dotenv.config({ path })

  for (const [key, val] of Object.entries(parsed)) {
    env[key] = getEnv(key, val)
  }

  return env
}

function ensureEnv (env) {
  const fbaseConfEnv = getEnv('FIREBASE_CONFIG', '{}', JSON.parse)
  const fbaseConf = {
    appId: getEnv('FIREBASE_APPID'),
    apiKey: getEnv('FIREBASE_APIKEY'),
    messagingSenderId: getEnv('FIREBASE_MEASUREMENTID'),
    measurementId: getEnv('FIREBASE_MESSAGINGSENDERID'),
    projectId: getEnv('PROJECT_ID'),
  }

  for (const [key, val] of Object.entries(fbaseConf)) {
    fbaseConfEnv[key] = fbaseConfEnv[key] || val
  }

  env.GCLOUD_PROJECT = getEnv('GCLOUD_PROJECT', fbaseConf.projectId)
  env.APP_NAME = getEnv('APP_NAME', fbaseConf.projectId)
  env.BASE_URL = getEnv('BASE_URL', '/')
  env.FIREBASE_CONFIG = JSON.stringify(fbaseConfEnv)

  for (const [key, val] of Object.entries(env)) {
    if (key in process.env) continue

    process.env[key] = val
  }

  return env
}

function getEnv (key, defaults, cb) {
  const val = process.env[key] || defaults

  return typeof cb === 'function' ? cb(val) : val
}

function loadEnv (path) {
  const env = loadEnvFile(path, {})

  return ensureEnv(env)
}

module.exports = {
  loadEnvFile,
  ensureEnv,
  getEnv,
  loadEnv
}
