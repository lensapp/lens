// Main process

import "../common/system-ca"
import "../common/prometheus-providers"
import { app, dialog } from "electron"
import { appName, appProto, isMac, staticDir, staticProto } from "../common/vars";
import path from "path"
import initMenu from "./menu"
import { LensProxy, listen } from "./proxy"
import { WindowManager } from "./window-manager";
import { ClusterManager } from "./cluster-manager";
import AppUpdater from "./app-updater"
import { shellSync } from "./shell-sync"
import { getFreePort } from "./port"
import { mangleProxyEnv } from "./proxy-env"
import { registerFileProtocol } from "../common/register-protocol";
import { clusterStore } from "../common/cluster-store"
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { tracker } from "../common/tracker";
import logger from "./logger"

let windowManager: WindowManager;
let clusterManager: ClusterManager;
let proxyServer: LensProxy;

mangleProxyEnv()
if (app.commandLine.getSwitchValue("proxy-server") !== "") {
  process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server")
}

async function main() {
  shellSync(app.getLocale());

  const workingDir = path.join(app.getPath("appData"), appName);
  app.setName(appName);
  app.setPath("userData", workingDir);
  logger.info(`Start app from "${workingDir}"`)

  tracker.event("app", "start");
  const updater = new AppUpdater()
  updater.start();

  initMenu();
  registerFileProtocol(appProto, app.getPath("userData"));
  registerFileProtocol(staticProto, staticDir);

  // find free port
  let port: number
  try {
    port = await getFreePort()
  } catch (error) {
    logger.error(error)
    await dialog.showErrorBox("Lens Error", "Could not find a free port for the cluster proxy")
    app.quit();
  }

  // preload configuration from stores
  await Promise.all([
    userStore.load(),
    clusterStore.load(),
    workspaceStore.load(),
  ]);

  // create cluster manager
  clusterManager = new ClusterManager(port)

  // run proxy
  try {
    proxyServer = listen(port, clusterManager)
  } catch (error) {
    logger.error(`Could not start proxy (127.0.0:${port}): ${error.message}`)
    await dialog.showErrorBox("Lens Error", `Could not start proxy (127.0.0:${port}): ${error.message || "unknown error"}`)
    app.quit();
  }

  // create window manager and open app
  windowManager = new WindowManager();
  windowManager.showSplash();
}

// Events
app.on("ready", main)

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) {
    app.quit();
  } else {
    // windowManager.destroy();
    // clusterManager.stop()
  }
})

app.on("activate", (event, hasVisibleWindows) => {
  // todo: something
})

app.on("will-quit", async (event) => {
  event.preventDefault(); // To allow mixpanel sending to be executed
  if (clusterManager) clusterManager.stop()
  if (proxyServer) proxyServer.close()
  app.exit(0);
})
