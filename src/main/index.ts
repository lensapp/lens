// Main process

import "../common/system-ca"
import "../common/prometheus-providers"
import { app, dialog } from "electron"
import { appName } from "../common/vars";
import path from "path"
import { LensProxy } from "./lens-proxy"
import { WindowManager } from "./window-manager";
import { ClusterManager } from "./cluster-manager";
import { AppUpdater } from "./app-updater"
import { shellSync } from "./shell-sync"
import { getFreePort } from "./port"
import { mangleProxyEnv } from "./proxy-env"
import { registerFileProtocol } from "../common/register-protocol";
import { clusterStore } from "../common/cluster-store"
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { tracker } from "../common/tracker";
import logger from "./logger"

const workingDir = path.join(app.getPath("appData"), appName);
let proxyPort: number;
let proxyServer: LensProxy;
let windowManager: WindowManager;
let clusterManager: ClusterManager;

app.setName(appName);
if (!process.env.CICD) {
  app.setPath("userData", workingDir);
}

mangleProxyEnv()
if (app.commandLine.getSwitchValue("proxy-server") !== "") {
  process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server")
}

app.on("ready", async () => {
  logger.info(`🚀 Starting Lens from "${workingDir}"`)
  await shellSync();

  tracker.event("app", "start");
  const updater = new AppUpdater()
  updater.start();

  registerFileProtocol("static", __static);

  // preload isomorphic stores
  await Promise.all([
    userStore.load(),
    clusterStore.load(),
    workspaceStore.load(),
  ]);

  // find free port
  try {
    proxyPort = await getFreePort()
  } catch (error) {
    logger.error(error)
    dialog.showErrorBox("Lens Error", "Could not find a free port for the cluster proxy")
    app.exit();
  }

  // create cluster manager
  clusterManager = new ClusterManager(proxyPort);

  // run proxy
  try {
    proxyServer = LensProxy.create(proxyPort, clusterManager);
  } catch (error) {
    logger.error(`Could not start proxy (127.0.0:${proxyPort}): ${error.message}`)
    dialog.showErrorBox("Lens Error", `Could not start proxy (127.0.0:${proxyPort}): ${error.message || "unknown error"}`)
    app.exit();
  }

  windowManager = new WindowManager(proxyPort);
});

app.on("activate", (event, hasVisibleWindows) => {
  logger.info('APP:ACTIVATE', { hasVisibleWindows })
  if (!hasVisibleWindows) {
    windowManager.initMainWindow();
  }
});

// Quit app on Cmd+Q (MacOS)
app.on("will-quit", (event) => {
  logger.info('APP:QUIT');
  event.preventDefault(); // prevent app's default shutdown (e.g. required for telemetry, etc.)
  clusterManager?.stop();
  if (userStore.preferences.trayEnabled) {
    return; // with tray the app remains open
  } else {
    windowManager?.destroy();
    proxyServer?.close();
    app.exit(); // forced app.quit()
  }
})
