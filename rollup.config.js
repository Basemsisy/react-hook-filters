import rollup from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    babel({ exclude: 'node_modules/**' })
  ]
};