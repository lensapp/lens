// Lens runtime for injecting to extension on activation
import { apiManager, ApiManager } from "../renderer/api/api-manager";
import logger from "../main/logger";

export interface LensRuntimeRendererEnv {
  apiManager: ApiManager;
  logger: typeof logger;
}

// todo: expose more public runtime apis: stores, managers, etc.
export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    apiManager,
    logger,
  }
}
