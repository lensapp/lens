// Lens-extensions api developer's kit
export * from "../lens-main-extension"
export * from "../lens-renderer-extension"

import type { WindowManager } from "../../main/window-manager";

// APIs
import * as EventBus from "./event-bus"
import * as Store from "./stores"
import * as Util from "./utils"
import * as Registry from "../registries"
import * as CommonVars from "../../common/vars";

export let windowManager: WindowManager;

export {
  EventBus,
  Store,
  Util,
  Registry,
  CommonVars,
}
