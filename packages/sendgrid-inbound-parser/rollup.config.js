import pkg from './package.json'

const external = Object.keys(Object.assign({}, pkg.dependencies, pkg.devDependencies))

/**
 * Suppresses unresolved dependency
 * @link https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
 */
external.push('path')

export default {
  input: 'index.js',
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'auto' },
  ],
  external,
}
