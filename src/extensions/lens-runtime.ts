// Lens runtime for injecting to extension on activation
import { apiManager } from "../renderer/api/api-manager";
import logger from "../main/logger";
import { dynamicPages } from "../renderer/components/cluster-manager/register-page";

export interface LensRuntimeRendererEnv {
  apiManager: typeof apiManager;
  logger: typeof logger;
  dynamicPages: typeof dynamicPages
}

// todo: expose more public runtime apis: stores, managers, etc.
export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    apiManager,
    logger,
    dynamicPages,
  }
}
