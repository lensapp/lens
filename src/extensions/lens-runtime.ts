// Lens extension runtime params available to extensions after activation

import logger from "../main/logger";

export interface LensExtensionRuntimeEnv {
  logger: typeof logger;
}

export function getLensRuntime(): LensExtensionRuntimeEnv {
  return {
    logger
  }
}
