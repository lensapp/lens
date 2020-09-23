// Lens renderer runtime params available to extensions after activation

import logger from "../main/logger";
import { dynamicPages } from "./register-page";
import { TabLayout } from "../renderer/components/layout/tab-layout";
import { navigate } from "../renderer/navigation";

export interface LensRuntimeRendererEnv {
  navigate: typeof navigate;
  logger: typeof logger;
  dynamicPages: typeof dynamicPages
  components: {
    TabLayout: typeof TabLayout
  }
}

export function getLensRuntime(): LensRuntimeRendererEnv {
  return {
    logger,
    navigate,
    dynamicPages,
    components: {
      TabLayout // fixme: refactor, import as pure component from "@lens/extensions"
    }
  }
}
