// Main process

import "../common/system-ca"
import "../common/prometheus-providers"
import { app, dialog, protocol } from "electron"
import { PromiseIpc } from "electron-promise-ipc"
import path from "path"
import { format as formatUrl } from "url"
import logger from "./logger"
import initMenu from "./menu"
import * as proxy from "./proxy"
import { WindowManager } from "./window-manager";
import { clusterStore } from "../common/cluster-store"
import { tracker } from "./tracker"
import { ClusterManager } from "./cluster-manager";
import AppUpdater from "./app-updater"
import { shellSync } from "./shell-sync"
import { getFreePort } from "./port"
import { mangleProxyEnv } from "./proxy-env"
import { findMainWebContents } from "./webcontents"
import { registerStaticProtocol } from "../common/register-static";
import { isMac, vueAppName } from "../common/vars";

mangleProxyEnv()
if (app.commandLine.getSwitchValue("proxy-server") !== "") {
  process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server")
}

const promiseIpc = new PromiseIpc({ timeout: 2000 })
let windowManager: WindowManager = null;
let clusterManager: ClusterManager = null;
let proxyServer: proxy.LensProxy = null;

const vmURL = formatUrl({
  pathname: path.join(__dirname, `${vueAppName}.html`),
  protocol: "file",
  slashes: true,
})

async function main() {
  shellSync(app.getLocale())

  const updater = new AppUpdater()
  updater.start();

  tracker.event("app", "start");

  registerStaticProtocol();
  protocol.registerFileProtocol('store', (request, callback) => {
    const url = request.url.substr(8)
    callback(path.normalize(`${app.getPath("userData")}/${url}`))
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  })

  let port: number = null
  // find free port
  try {
    port = await getFreePort()
  } catch (error) {
    logger.error(error)
    await dialog.showErrorBox("Lens Error", "Could not find a free port for the cluster proxy")
    app.quit();
  }

  // create cluster manager
  clusterManager = new ClusterManager(clusterStore.getAllClusterObjects(), port)
  // run proxy
  try {
    proxyServer = proxy.listen(port, clusterManager)
  } catch (error) {
    logger.error(`Could not start proxy (127.0.0:${port}): ${error.message}`)
    await dialog.showErrorBox("Lens Error", `Could not start proxy (127.0.0:${port}): ${error.message || "unknown error"}`)
    app.quit();
  }

  // boot windowmanager
  windowManager = new WindowManager();
  windowManager.showMain(vmURL)

  initMenu({
    logoutHook: async () => {
      // IPC send needs webContents as we're sending it to renderer
      promiseIpc.send('logout', findMainWebContents(), {}).then((data: any) => {
        logger.debug("logout IPC sent");
      })
    },
    showPreferencesHook: async () => {
      // IPC send needs webContents as we're sending it to renderer
      promiseIpc.send('navigate', findMainWebContents(), { name: 'preferences-page' }).then((data: any) => {
        logger.debug("navigate: preferences IPC sent");
      })
    },
    addClusterHook: async () => {
      promiseIpc.send('navigate', findMainWebContents(), { name: "add-cluster-page" }).then((data: any) => {
        logger.debug("navigate: add-cluster-page  IPC sent");
      })
    },
    showWhatsNewHook: async () => {
      promiseIpc.send('navigate', findMainWebContents(), { name: "whats-new-page" }).then((data: any) => {
        logger.debug("navigate: whats-new-page  IPC sent");
      })
    },
    clusterSettingsHook: async () => {
      promiseIpc.send('navigate', findMainWebContents(), { name: "cluster-settings-page" }).then((data: any) => {
        logger.debug("navigate: cluster-settings-page  IPC sent");
      })
    },
  }, promiseIpc)
}

app.on("ready", main)
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) {
    app.quit();
  } else {
    windowManager = null
    if (clusterManager) clusterManager.stop()
  }
})
app.on("activate", () => {
  if (!windowManager) {
    logger.debug("activate main window")
    windowManager = new WindowManager({ showSplash: false })
    windowManager.showMain(vmURL)
  }
})
app.on("will-quit", async (event) => {
  event.preventDefault(); // To allow mixpanel sending to be executed
  if (clusterManager) clusterManager.stop()
  if (proxyServer) proxyServer.close()
  app.exit(0);
})
