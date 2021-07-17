import { assert } from 'chai'
import pkg from './package.json'

describe(pkg.name, () => {
  it('run the test', () => {
    assert.equal(true, true)
  })
})
