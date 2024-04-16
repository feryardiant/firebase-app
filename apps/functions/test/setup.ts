import testInit from 'firebase-functions-test'

export async function setup() {
  const test = testInit()

  return async () => {
    test.cleanup()
  }
}
