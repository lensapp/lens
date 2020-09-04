// Lens runtime params provider to hook up into extensions
import { apiManager, ApiManager } from "../renderer/api/api-manager";

export interface LensRendererRuntimeEnv {
  apiManager: ApiManager;
}

// todo: expose more public runtime apis: stores, managers, etc.
export function getExtensionRuntime(): LensRendererRuntimeEnv {
  return {
    apiManager,
  }
}
