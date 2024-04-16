import { readFileSync } from 'fs'
import { resolve } from 'path'

export type Provider = 'gmail' | 'outlook' | 'yahoo'

export const providers: Provider[] = ['gmail', 'outlook', 'yahoo']

export async function fixture(provider: Provider) {
  const raw = readFileSync(resolve(__dirname, `./${provider}.raw.txt`))
  const { email: parsed, ...body } = await import(`./${provider}.parsed.json`)
  const { email: normalized } = await import(`./${provider}.normalized.json`)

  return {
    email: { raw, parsed, normalized },
    body,
  }
}

// 'gmail-attached.normalized.json',
// 'gmail-attached.parsed.json',
// 'gmail-attached.raw.txt',
// 'gmail-reply.normalized.json',
// 'gmail-reply.parsed.json',
// 'gmail-reply.raw.txt',
// 'gmail.normalized.json',
// 'gmail.parsed.json',
// 'gmail.raw.txt',
// 'outlook-attached.normalized.json',
// 'outlook-attached.parsed.json',
// 'outlook-attached.raw.txt',
// 'outlook-reply.normalized.json',
// 'outlook-reply.parsed.json',
// 'outlook-reply.txt',
// 'outlook.normalized.json',
// 'outlook.parsed.json',
// 'outlook.raw.txt',
// 'yahoo-attached.normalized.json',
// 'yahoo-attached.parsed.json',
// 'yahoo-attached.raw.txt',
// 'yahoo-reply.normalized.json',
// 'yahoo-reply.parsed.json',
// 'yahoo-reply.raw.txt',
// 'yahoo.normalized.json',
// 'yahoo.parsed.json',
// 'yahoo.raw.txt',
