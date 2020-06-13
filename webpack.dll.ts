import path from "path";
import webpack from "webpack";
import { isDevelopment, outDir } from "./src/common/vars";

export const fileName = "dll"
export const manifestPath = path.resolve(outDir, `${fileName}.manifest.json`);

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
      [fileName]: externalPackages
    },
    output: {
      library: fileName,
      libraryTarget: "commonjs2"
    },
    plugins: [
      new webpack.DllPlugin({
        name: fileName,
        path: manifestPath,
      })
    ],
  }
}
