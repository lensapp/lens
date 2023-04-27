import path from "path";
import { getReactConfigFor } from "./get-react-config-for";

export const configForReact = getReactConfigFor()({
  entrypointFilePath: "./index.ts",
  outputDirectory: path.resolve(process.cwd(), "dist"),
});
