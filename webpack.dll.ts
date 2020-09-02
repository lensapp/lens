import path from "path";
import webpack, { LibraryTarget } from "webpack";
import { isDevelopment, buildDir } from "./src/common/vars";
import ProgressBarPlugin from "progress-bar-webpack-plugin";

export const library = "dll"
export const libraryTarget: LibraryTarget = "commonjs2"
export const manifestPath = path.resolve(buildDir, `${library}.manifest.json`);

export const packages = [
  "react", "react-dom",
  "ace-builds", "xterm",
  "moment",
];

export default function (): webpack.Configuration {
  return {
    context: path.dirname(manifestPath),
    mode: isDevelopment ? "development" : "production",
    cache: isDevelopment,
    entry: {
      [library]: packages,
    },
    output: {
      library,
      libraryTarget,
    },
    plugins: [
      new ProgressBarPlugin(),
      new webpack.DllPlugin({
        name: library,
        path: manifestPath,
      })
    ],
  }
}
