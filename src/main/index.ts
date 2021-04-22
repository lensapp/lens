// Main process

import "../common/system-ca";
import "../common/prometheus-providers";
import * as Mobx from "mobx";
import * as LensExtensions from "../extensions/core-api";
import { app, autoUpdater, ipcMain, dialog, powerMonitor } from "electron";
import { appName, isMac, productName } from "../common/vars";
import path from "path";
import { LensProxy } from "./lens-proxy";
import { WindowManager } from "./window-manager";
import { ClusterManager } from "./cluster-manager";
import { shellSync } from "./shell-sync";
import { getFreePort } from "./port";
import { mangleProxyEnv } from "./proxy-env";
import { registerFileProtocol } from "../common/register-protocol";
import logger from "./logger";
import { ClusterStore } from "../common/cluster-store";
import { UserStore } from "../common/user-store";
import { appEventBus } from "../common/event-bus";
import { ExtensionLoader } from "../extensions/extension-loader";
import { ExtensionsStore } from "../extensions/extensions-store";
import { InstalledExtension, ExtensionDiscovery } from "../extensions/extension-discovery";
import type { LensExtensionId } from "../extensions/lens-extension";
import { FilesystemProvisionerStore } from "./extension-filesystem";
import { installDeveloperTools } from "./developer-tools";
import { LensProtocolRouterMain } from "./protocol-handler";
import { getAppVersion, getAppVersionFromProxyServer } from "../common/utils";
import { bindBroadcastHandlers } from "../common/ipc";
import { startUpdateChecking } from "./app-updater";
import { IpcRendererNavigationEvents } from "../renderer/navigation/events";
import { CatalogPusher } from "./catalog-pusher";
import { catalogEntityRegistry } from "../common/catalog-entity-registry";
import { HotbarStore } from "../common/hotbar-store";

const workingDir = path.join(app.getPath("appData"), appName);

app.setName(appName);

logger.info(`📟 Setting ${productName} as protocol client for lens://`);

if (app.setAsDefaultProtocolClient("lens")) {
  logger.info("📟 Protocol client register succeeded ✅");
} else {
  logger.info("📟 Protocol client register failed ❗");
}

if (!process.env.CICD) {
  app.setPath("userData", workingDir);
}

if (process.env.LENS_DISABLE_GPU) {
  app.disableHardwareAcceleration();
}

mangleProxyEnv();

if (app.commandLine.getSwitchValue("proxy-server") !== "") {
  process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server");
}

if (!app.requestSingleInstanceLock()) {
  app.exit();
} else {
  const lprm = LensProtocolRouterMain.createInstance();

  for (const arg of process.argv) {
    if (arg.toLowerCase().startsWith("lens://")) {
      lprm.route(arg)
        .catch(error => logger.error(`${LensProtocolRouterMain.LoggingPrefix}: an error occured`, { error, rawUrl: arg }));
    }
  }
}

app.on("second-instance", (event, argv) => {
  const lprm = LensProtocolRouterMain.createInstance();

  for (const arg of argv) {
    if (arg.toLowerCase().startsWith("lens://")) {
      lprm.route(arg)
        .catch(error => logger.error(`${LensProtocolRouterMain.LoggingPrefix}: an error occured`, { error, rawUrl: arg }));
    }
  }

  WindowManager.getInstance(false)?.ensureMainWindow();
});

app.on("ready", async () => {
  logger.info(`🚀 Starting ${productName} from "${workingDir}"`);
  logger.info("🐚 Syncing shell environment");
  await shellSync();

  bindBroadcastHandlers();

  powerMonitor.on("shutdown", () => {
    app.exit();
  });

  registerFileProtocol("static", __static);

  const userStore = UserStore.createInstance();
  const clusterStore = ClusterStore.createInstance();
  const hotbarStore = HotbarStore.createInstance();
  const extensionsStore = ExtensionsStore.createInstance();
  const filesystemStore = FilesystemProvisionerStore.createInstance();

  logger.info("💾 Loading stores");
  // preload
  await Promise.all([
    userStore.load(),
    clusterStore.load(),
    hotbarStore.load(),
    extensionsStore.load(),
    filesystemStore.load(),
  ]);

  try {
    logger.info("🔑 Getting free port for LensProxy server");
    const proxyPort = await getFreePort();

    // create cluster manager
    ClusterManager.createInstance(proxyPort);
  } catch (error) {
    logger.error(error);
    dialog.showErrorBox("Lens Error", "Could not find a free port for the cluster proxy");
    app.exit();
  }

  const clusterManager = ClusterManager.getInstance();

  // run proxy
  try {
    logger.info("🔌 Starting LensProxy");
    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    LensProxy.createInstance(clusterManager.port).listen();
  } catch (error) {
    logger.error(`Could not start proxy (127.0.0:${clusterManager.port}): ${error?.message}`);
    dialog.showErrorBox("Lens Error", `Could not start proxy (127.0.0:${clusterManager.port}): ${error?.message || "unknown error"}`);
    app.exit();
  }

  // test proxy connection
  try {
    logger.info("🔎 Testing LensProxy connection ...");
    const versionFromProxy = await getAppVersionFromProxyServer(clusterManager.port);

    if (getAppVersion() !== versionFromProxy) {
      logger.error(`Proxy server responded with invalid response`);
    }
    logger.info("⚡ LensProxy connection OK");
  } catch (error) {
    logger.error("Checking proxy server connection failed", error);
  }

  const extensionDiscovery = ExtensionDiscovery.createInstance();

  ExtensionLoader.createInstance().init();
  extensionDiscovery.init();

  // Start the app without showing the main window when auto starting on login
  // (On Windows and Linux, we get a flag. On MacOS, we get special API.)
  const startHidden = process.argv.includes("--hidden") || (isMac && app.getLoginItemSettings().wasOpenedAsHidden);

  logger.info("🖥️  Starting WindowManager");
  const windowManager = WindowManager.createInstance(clusterManager.port);

  installDeveloperTools();

  if (!startHidden) {
    windowManager.initMainWindow();
  }

  ipcMain.on(IpcRendererNavigationEvents.LOADED, () => {
    CatalogPusher.init(catalogEntityRegistry);
    startUpdateChecking();
    LensProtocolRouterMain
      .getInstance()
      .rendererLoaded = true;
  });

  ExtensionLoader.getInstance().whenLoaded.then(() => {
    LensProtocolRouterMain
      .getInstance()
      .extensionsLoaded = true;
  });

  logger.info("🧩 Initializing extensions");

  // call after windowManager to see splash earlier
  try {
    const extensions = await extensionDiscovery.load();

    // Start watching after bundled extensions are loaded
    extensionDiscovery.watchExtensions();

    // Subscribe to extensions that are copied or deleted to/from the extensions folder
    extensionDiscovery.events
      .on("add", (extension: InstalledExtension) => {
        ExtensionLoader.getInstance().addExtension(extension);
      })
      .on("remove", (lensExtensionId: LensExtensionId) => {
        ExtensionLoader.getInstance().removeExtension(lensExtensionId);
      });

    ExtensionLoader.getInstance().initExtensions(extensions);
  } catch (error) {
    dialog.showErrorBox("Lens Error", `Could not load extensions${error?.message ? `: ${error.message}` : ""}`);
    console.error(error);
    console.trace();
  }

  setTimeout(() => {
    appEventBus.emit({ name: "service", action: "start" });
  }, 1000);
});

app.on("activate", (event, hasVisibleWindows) => {
  logger.info("APP:ACTIVATE", { hasVisibleWindows });

  if (!hasVisibleWindows) {
    WindowManager.getInstance(false)?.initMainWindow(false);
  }
});

/**
 * This variable should is used so that `autoUpdater.installAndQuit()` works
 */
let blockQuit = true;

autoUpdater.on("before-quit-for-update", () => blockQuit = false);

app.on("will-quit", (event) => {
  // Quit app on Cmd+Q (MacOS)
  logger.info("APP:QUIT");
  appEventBus.emit({name: "app", action: "close"});
  ClusterManager.getInstance(false)?.stop(); // close cluster connections

  if (blockQuit) {
    event.preventDefault(); // prevent app's default shutdown (e.g. required for telemetry, etc.)

    return; // skip exit to make tray work, to quit go to app's global menu or tray's menu
  }
});

app.on("open-url", (event, rawUrl) => {
  // lens:// protocol handler
  event.preventDefault();

  LensProtocolRouterMain
    .getInstance()
    .route(rawUrl)
    .catch(error => logger.error(`${LensProtocolRouterMain.LoggingPrefix}: an error occured`, { error, rawUrl }));
});

// Extensions-api runtime exports
export const LensExtensionsApi = {
  ...LensExtensions,
};

export {
  Mobx,
  LensExtensionsApi as LensExtensions,
};
