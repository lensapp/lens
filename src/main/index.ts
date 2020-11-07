// Main process

import "../common/system-ca"
import "../common/prometheus-providers"
import * as Mobx from "mobx"
import * as LensExtensions from "../extensions/core-api";
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
import logger from "./logger"
import { clusterStore } from "../common/cluster-store"
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { appEventBus } from "../common/event-bus"
import { extensionLoader } from "../extensions/extension-loader";
import { extensionManager } from "../extensions/extension-manager";
import { extensionsStore } from "../extensions/extensions-store";

const workingDir = path.join(app.getPath("appData"), appName);
let proxyPort: number;
let proxyServer: LensProxy;
let clusterManager: ClusterManager;
let windowManager: WindowManager;

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

  const updater = new AppUpdater()
  updater.start();

  registerFileProtocol("static", __static);

  // preload
  await Promise.all([
    userStore.load(),
    clusterStore.load(),
    workspaceStore.load(),
    extensionsStore.load(),
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

  LensExtensionsApi.windowManager = windowManager = new WindowManager(proxyPort);
  extensionLoader.init(await extensionManager.load()); // call after windowManager to see splash earlier

  setTimeout(() => {
    appEventBus.emit({ name: "app", action: "start" })
  }, 1000)
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
  clusterManager?.stop(); // close cluster connections
  return; // skip exit to make tray work, to quit go to app's global menu or tray's menu
})

// Extensions-api runtime exports
export const LensExtensionsApi = {
  ...LensExtensions,
};

export {
  Mobx,
  LensExtensionsApi as LensExtensions,
}
