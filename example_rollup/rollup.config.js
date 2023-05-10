import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/1_add_color.ts',
  output: {
    name: 'vgg-sdk-demo',
    file: pkg.browser,
    format: 'esm',
  },
  external: ['https://s3.vgg.cool/test/js/vgg-di-container.esm.js'],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
  ]
};