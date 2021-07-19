import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const external = Object.keys(Object.assign({}, pkg.dependencies, pkg.devDependencies))

export default {
  input: 'src/index.js',
  output: [{ file: pkg.main, format: 'cjs', sourcemap: true, exports: 'auto' }],
  external,
  plugins: [json(), commonjs(), nodeResolve(), terser()]
}
