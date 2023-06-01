import { getNodeConfig } from "./get-node-config";
import { environment } from "./runtime-values/environment";
import { entrypointFilePath } from "./runtime-values/entrypoint-file-path";
import { outputDirectory } from "./runtime-values/output-directory";

export const configForNode = getNodeConfig({
  entrypointFilePath,
  outputDirectory,
  environment,
});
