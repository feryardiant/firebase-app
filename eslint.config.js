'use strict'

import antfu from '@antfu/eslint-config'

export default antfu({}, {
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    }
  },
  ignores: [
    '**/fixtures/**',
  ]
})
