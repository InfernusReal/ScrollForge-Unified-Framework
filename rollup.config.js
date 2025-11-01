import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const createConfig = (input, outputName, external = []) => ({
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
  external, // Don't bundle these
  plugins: [
    resolve({ 
      browser: true, // Use browser versions when available
      preferBuiltins: false // Don't prefer Node.js built-ins
    }), 
    commonjs()
  ],
});

// Browser-safe client bundle (no Node.js modules)
const createClientConfig = (input, outputName) => ({
  input,
  output: {
    file: `dist/${outputName}.browser.js`,
    format: 'es',
    sourcemap: true,
  },
  external: ['http', 'url', 'querystring', 'child_process', 'fs', 'path', 'ws'], // Exclude Node.js modules
  plugins: [
    resolve({ 
      browser: true,
      preferBuiltins: false
    }), 
    commonjs()
  ],
});

export default [
  // Original builds (for Node.js)
  createConfig('src/index.js', 'index', ['http', 'url', 'querystring']),
  createConfig('src/script/index.js', 'script/index', ['http', 'url', 'querystring']),
  createConfig('src/weave/index.js', 'weave/index'),
  createConfig('src/mesh/index.js', 'mesh/index'),
  
  // Browser-only build (NEW!)
  createClientConfig('src/script/client.js', 'client'),
  createClientConfig('src/weave/core.js', 'weave-core'),
  createClientConfig('src/mesh/index.js', 'mesh-full'),
];

