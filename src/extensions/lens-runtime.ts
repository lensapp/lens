// Lens extension runtime params available to extensions after activation

import logger from "../main/logger";
import { PageRegistration } from "./page-store";

export interface PageStore {
  register(params: PageRegistration): () => void
}

export interface LensExtensionRuntimeEnv {
  logger: typeof logger;
}

export function getLensRuntime(): LensExtensionRuntimeEnv {
  return {
    logger,
  }
}
