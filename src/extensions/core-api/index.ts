// Lens-extensions api developer's kit
export * from "../lens-main-extension"
export * from "../lens-renderer-extension"

import type { WindowManager } from "../../main/window-manager";

// APIs
import * as App from "./app"
import * as EventBus from "./event-bus"
import * as Store from "./stores"
import * as Util from "./utils"
import * as ClusterFeature from "./cluster-feature"

// TODO: allow to expose windowManager.navigate() as Navigation.navigate() in runtime
export let windowManager: WindowManager;

export {
  App,
  EventBus,
  ClusterFeature,
  Store,
  Util,
}
