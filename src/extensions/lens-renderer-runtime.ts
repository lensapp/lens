// Lens extension runtime params available to renderer extensions after activation

import logger from "../main/logger";
import { navigate } from "../renderer/navigation";

export interface LensExtensionRendererRuntimeEnv {
  logger: typeof logger;
  navigate: typeof navigate;
}

export function getLensRuntimeRenderer(): LensExtensionRendererRuntimeEnv {
  return {
    logger,
    navigate
  }
}
