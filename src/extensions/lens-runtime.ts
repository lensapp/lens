// Lens renderer runtime params available to extensions after activation

import logger from "../main/logger";
import { dynamicPages } from "./register-page";
import { MainLayout } from "../renderer/components/layout/main-layout";

export interface LensRuntimeRendererEnv {
  logger: typeof logger;
  dynamicPages: typeof dynamicPages
  components: {
    MainLayout: typeof MainLayout
  }
}

export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    logger,
    dynamicPages,
    components: {
      MainLayout // fixme: refactor, import as pure component from "@lens/extensions"
    }
  }
}
