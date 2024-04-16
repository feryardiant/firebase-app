import pkg from '../package.json'
import { main } from '../src'

describe(pkg.name, () => {
  it('should be ok', async () => {
    const req: any = { url: '/' }
    const res: any = {
      json: (obj: any) => {
        expect(obj.status).equal('OK')
      },
    }

    return main(req, res)
  })
})
