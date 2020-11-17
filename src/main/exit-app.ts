import { app } from "electron";
import { WindowManager } from "./window-manager";
import { appEventBus } from "../common/event-bus";
import { ClusterManager } from "./cluster-manager";
import logger from "./logger";
import { closingURL } from "../renderer/components/+closing-page/closing-page.route";


export function exitApp() {
  const windowManager = WindowManager.getInstance<WindowManager>()
  const clusterManager = ClusterManager.getInstance<ClusterManager>()
  appEventBus.emit({ name: "service", action: "close" })
  windowManager.navigate(closingURL());
  clusterManager?.stop();
  logger.info('SERVICE:QUIT');
  setTimeout(() => {
     app.exit()
  }, 1000)
}