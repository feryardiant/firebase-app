import type { Request, Response } from 'firebase-functions'

export interface Handler<T = any> {
  (req: Request, res: Response): Promise<Response<T> | T>
}

export interface Person {
  name: string
  address: string
  messages: string[]
}
