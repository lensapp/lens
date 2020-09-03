// Lens runtime params provider to hook up into extensions
import { apiManager, ApiManager } from "../renderer/api/api-manager";

export interface LensRendererRuntimeEnv {
  apiManager: ApiManager;
}

// todo: expose more renderer runtime variables, stores, etc.
export function getExtensionRuntime(): LensRendererRuntimeEnv {
  return {
    apiManager,
  }
}
