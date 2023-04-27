import path from "path";
import { getNodeConfig } from "./get-node-config";

export const configForNode = getNodeConfig({
  entrypointFilePath: "./index.ts",
  outputDirectory: path.resolve(process.cwd(), "dist"),
});
