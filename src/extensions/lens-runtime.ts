// Lens runtime for injecting to extension on activation
import { apiManager, ApiManager } from "../renderer/api/api-manager";

export interface LensRuntimeRendererEnv {
  apiManager: ApiManager;
}

// todo: expose more public runtime apis: stores, managers, etc.
export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    apiManager,
  }
}
