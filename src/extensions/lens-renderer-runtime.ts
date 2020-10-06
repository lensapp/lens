// Lens extension runtime params available to renderer extensions after activation

import logger from "../main/logger";
import { navigate } from "../renderer/navigation";
import { PageRegistration } from "./page-store";

export interface PageStore {
  register(params: PageRegistration): () => void
}

export interface LensExtensionRuntimeEnv {
  logger: typeof logger;
  navigate: typeof navigate;
}

export function getLensRuntime(): LensExtensionRuntimeEnv {
  return {
    logger,
    navigate
  }
}
