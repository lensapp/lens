/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app } from "electron";
import type { WindowManager } from "./windows/manager";
import { appEventBus } from "../common/app-event-bus/event-bus";
import type { ClusterManager } from "./cluster-manager/cluster-manager";
import logger from "./logger";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../common/utils";
import clusterManagerInjectable from "./cluster-manager/cluster-manager.injectable";
import windowManagerInjectable from "./windows/manager.injectable";

export interface ExitAppDependencies {
  clusterManager: ClusterManager;
  windowManager: WindowManager;
}

function exitApp({ clusterManager, windowManager }: ExitAppDependencies) {
  appEventBus.emit({ name: "service", action: "close" });
  windowManager.hide();
  clusterManager.stop();
  logger.info("SERVICE:QUIT");
  setTimeout(() => {
    app.exit();
  }, 1000);
}

const exitAppInjectable = getInjectable({
  instantiate: (di) => bind(exitApp, null, {
    clusterManager: di.inject(clusterManagerInjectable),
    windowManager: di.inject(windowManagerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default exitAppInjectable;

