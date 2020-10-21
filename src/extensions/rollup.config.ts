// Generating declaration types for extensions-api
// Rollup: https://rollupjs.org/guide/en/
// Plugin docs: https://github.com/Swatinem/rollup-plugin-dts

import { OutputChunk, Plugin, RollupOptions } from 'rollup';
import json from '@rollup/plugin-json';
import dts from "rollup-plugin-dts";
import ignoreImport from 'rollup-plugin-ignore-import'

const config: RollupOptions = {
  input: "src/extensions/extension-api.ts",
  output: [
    { file: "src/extensions/npm/extensions/api.d.ts", format: "es", }
  ],
  plugins: [
    dts(),
    dtsModuleWrap({ name: "@k8slens/extensions" }),
    ignoreImport({ extensions: ['.scss'] }),
    json(),
  ],
};

function dtsModuleWrap({ name }: { name: string }): Plugin {
  return {
    name,
    generateBundle: (options, bundle) => {
      const apiTypes = Object.values(bundle)[0] as OutputChunk; // extension-api.d.ts
      const typeRefs: string[] = []
      const declarations: string[] = []
      const apiLines = apiTypes.code.split("\n")
      let outputCode = ""

      apiLines.forEach(line => {
        if (line.startsWith("///")) {
          typeRefs.push(line)
        } else {
          declarations.push(line)
        }
      })

      // print external @types refs first
      if (typeRefs.length) {
        outputCode += typeRefs.join("\n") + "\n\n"
      }

      // wrap declarations into global module definition
      outputCode += `declare module "${name}" {\n`
      outputCode += declarations.map(line => `\t${line}`).join("\n")
      outputCode += `\n}`

      // save
      apiTypes.code = outputCode;
    }
  }
}

export default [config];
