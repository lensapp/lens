import { app } from "electron";
import { WindowManager } from "./window-manager";
import { appEventBus } from "../common/event-bus";
import { ClusterManager } from "./cluster-manager";
import logger from "./logger";

export function exitApp() {
  console.log("before windowManager");
  const windowManager = WindowManager.getInstance(false);

  console.log("before clusterManager");
  const clusterManager = ClusterManager.getInstance(false);

  console.log("after clusterManager");

  appEventBus.emit({ name: "service", action: "close" });
  windowManager?.hide();
  clusterManager?.stop();
  logger.info("SERVICE:QUIT");
  setTimeout(() => {
    app.exit();
  }, 1000);
}
