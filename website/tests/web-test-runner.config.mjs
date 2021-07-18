import vite from 'vite-web-test-runner-plugin'

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  nodeResolve: true,

  groups: [
    {
      name: 'unit',
      files: 'tests/unit/**/*.spec.js'
    }
  ],

  plugins: [
    vite()
  ],

  coverageConfig: {
    include: [
      'src/**/*.{js,vue}'
    ]
  }
}
