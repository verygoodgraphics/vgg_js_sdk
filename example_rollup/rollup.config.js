import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const commonConfig = {
  output: {
    format: 'esm',
    dir: 'dist',
    entryFileNames: '[name].mjs',
  },
  external: ['https://s3.vgg.cool/test/js/vgg-di-container.esm.js'],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
  ]
};


export default [
  Object.assign({
    input: 'src/1_add_color.ts',
  }, commonConfig),

  Object.assign({
    input: 'src/11_event_listener.ts',
  }, commonConfig),

];