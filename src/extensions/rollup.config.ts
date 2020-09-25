// Generating declaration types for extensions-api
// Rollup: https://rollupjs.org/guide/en/
// Plugin docs: https://github.com/Swatinem/rollup-plugin-dts

import json from '@rollup/plugin-json';
import dts from "rollup-plugin-dts";
import ignoreImport from 'rollup-plugin-ignore-import'

const config = [
  {
    input: "./src/extensions/extension-api.ts",
    output: [
      { file: "./extension-api.d.ts", format: "cjs" }
    ],
    plugins: [
      json(),
      dts({ respectExternal: false }),
      ignoreImport({ extensions: ['.scss'] })
    ],
  },
];

export default config;