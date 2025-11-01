import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const createConfig = (input, outputName) => ({
  input,
  output: [
    {
      file: `dist/${outputName}.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: `dist/${outputName}.esm.js`,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [resolve(), commonjs()],
});

export default [
  createConfig('src/index.js', 'index'),
  createConfig('src/script/index.js', 'script/index'),
  createConfig('src/weave/index.js', 'weave/index'),
  createConfig('src/mesh/index.js', 'mesh/index'),
];

