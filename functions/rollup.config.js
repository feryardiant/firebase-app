import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

const external = Object.keys(
  Object.assign({}, pkg.dependencies, pkg.devDependencies)
)

export default {
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'auto' }
  ],
  external,
  plugins: [
    terser()
  ]
}
