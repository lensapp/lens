// Lens renderer runtime apis exposed to extensions once activated

import logger from "../main/logger";
import { dynamicPages } from "./register-page";
import { navigate } from "../renderer/navigation";

export interface LensRuntimeRendererEnv {
  navigate: typeof navigate;
  logger: typeof logger;
  dynamicPages: typeof dynamicPages
}

export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    logger,
    navigate,
    dynamicPages,
  }
}
