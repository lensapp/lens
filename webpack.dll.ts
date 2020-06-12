import path from "path";
import webpack from "webpack";
import { isDevelopment, outDir } from "./src/common/vars";

export const libName = "dll"
export const manifestPath = path.resolve(outDir, `${libName}.manifest.json`);

export const externalPackages = [
  "react", "react-dom",
  "ace-builds", "xterm",
  "moment",
];

export default function (): webpack.Configuration {
  return {
    mode: isDevelopment ? "development" : "production",
    cache: isDevelopment,
    entry: {
      [libName]: externalPackages
    },
    output: {
      library: libName,
      libraryTarget: "commonjs"
    },
    plugins: [
      new webpack.DllPlugin({
        name: libName,
        path: manifestPath,
      })
    ],
  }
}
