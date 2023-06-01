import { getReactConfigFor } from "./get-react-config-for";
import { environment } from "./runtime-values/environment";
import { outputDirectory } from "./runtime-values/output-directory";
import { entrypointFilePath } from "./runtime-values/entrypoint-file-path";

export const configForReact = getReactConfigFor()({
  entrypointFilePath,
  outputDirectory,
  environment,
});
