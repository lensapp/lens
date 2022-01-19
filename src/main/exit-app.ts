/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app } from "electron";
import { WindowManager } from "./window-manager";
import { appEventBus } from "../common/app-event-bus/event-bus";
import { ClusterManager } from "./cluster-manager";
import logger from "./logger";

export function exitApp() {
  const windowManager = WindowManager.getInstance(false);
  const clusterManager = ClusterManager.getInstance(false);

  appEventBus.emit({ name: "service", action: "close" });
  windowManager?.hide();
  clusterManager?.stop();
  logger.info("SERVICE:QUIT");
  setTimeout(() => {
    app.exit();
  }, 1000);
}
