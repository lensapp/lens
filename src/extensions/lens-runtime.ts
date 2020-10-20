// Lens extension runtime params available to extensions after activation

import logger from "../main/logger";

export interface LensExtensionMainRuntimeEnv {
  logger: typeof logger;
}

export function getLensRuntime(): LensExtensionMainRuntimeEnv {
  return {
    logger
  }
}
