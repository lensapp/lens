// Lens renderer runtime params available to the extension after activation
import logger from "../main/logger";
import { dynamicPages } from "./register-page";

export interface LensRuntimeRendererEnv {
  logger: typeof logger;
  dynamicPages: typeof dynamicPages
}

export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    logger,
    dynamicPages,
  }
}
