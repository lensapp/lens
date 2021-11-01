/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Main process

import { injectSystemCAs } from "../common/system-ca";
import { initialize as initializeRemote } from "@electron/remote/main";
import * as Mobx from "mobx";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsMainApi from "../extensions/main-api";
import { app, autoUpdater, dialog, powerMonitor } from "electron";
import { appName, isIntegrationTesting, isMac, isWindows, productName } from "../common/vars";
import { LensProxy } from "./lens-proxy";
import { WindowManager } from "./window-manager";
import { ClusterManager } from "./cluster-manager";
import { shellSync } from "./shell-sync";
import { mangleProxyEnv } from "./proxy-env";
import { registerFileProtocol } from "../common/register-protocol";
import logger from "./logger";
import { appEventBus } from "../common/event-bus";
import { ExtensionLoader } from "../extensions/extension-loader";
import { InstalledExtension, ExtensionDiscovery } from "../extensions/extension-discovery";
import type { LensExtensionId } from "../extensions/lens-extension";
import { installDeveloperTools } from "./developer-tools";
import { LensProtocolRouterMain } from "./protocol-handler";
import { disposer, getAppVersion, getAppVersionFromProxyServer, storedKubeConfigFolder } from "../common/utils";
import { bindBroadcastHandlers, ipcMainOn } from "../common/ipc";
import { startUpdateChecking } from "./app-updater";
import { IpcRendererNavigationEvents } from "../renderer/navigation/events";
import { pushCatalogToRenderer } from "./catalog-pusher";
import { catalogEntityRegistry } from "./catalog";
import { HelmRepoManager } from "./helm/helm-repo-manager";
import { syncGeneralEntities, syncWeblinks, KubeconfigSyncManager } from "./catalog-sources";
import configurePackages from "../common/configure-packages";
import { PrometheusProviderRegistry } from "./prometheus";
import * as initializers from "./initializers";
import { ClusterStore } from "../common/cluster-store";
import { HotbarStore } from "../common/hotbar-store";
import { UserStore } from "../common/user-store";
import { WeblinkStore } from "../common/weblink-store";
import { ExtensionsStore } from "../extensions/extensions-store";
import { FilesystemProvisionerStore } from "./extension-filesystem";
import { SentryInit } from "../common/sentry";
import { ensureDir } from "fs-extra";
import { Router } from "./router";
import { initMenu } from "./menu";
import { initTray } from "./tray";
import { kubeApiRequest, shellApiRequest } from "./proxy-functions";
import { AppPaths } from "../common/app-paths";

const onCloseCleanup = disposer();
const onQuitCleanup = disposer();


SentryInit();
app.setName(appName);

logger.info(`📟 Setting ${productName} as protocol client for lens://`);

if (app.setAsDefaultProtocolClient("lens")) {
  logger.info("📟 Protocol client register succeeded ✅");
} else {
  logger.info("📟 Protocol client register failed ❗");
}

AppPaths.init();

if (process.env.LENS_DISABLE_GPU) {
  app.disableHardwareAcceleration();
}

initializeRemote();
configurePackages();
mangleProxyEnv();
initializers.initIpcMainHandlers();

if (app.commandLine.getSwitchValue("proxy-server") !== "") {
  process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server");
}

if (!app.requestSingleInstanceLock()) {
  app.exit();
} else {
  const lprm = LensProtocolRouterMain.createInstance();

  for (const arg of process.argv) {
    if (arg.toLowerCase().startsWith("lens://")) {
      lprm.route(arg);
    }
  }
}

app.on("second-instance", (event, argv) => {
  const lprm = LensProtocolRouterMain.createInstance();

  for (const arg of argv) {
    if (arg.toLowerCase().startsWith("lens://")) {
      lprm.route(arg);
    }
  }

  WindowManager.getInstance(false)?.ensureMainWindow();
});

app.on("ready", async () => {
  await injectSystemCAs();
  
  logger.info(`🚀 Starting ${productName} from "${AppPaths.get("exe")}"`);
  logger.info("🐚 Syncing shell environment");
  await shellSync();

  bindBroadcastHandlers();

  powerMonitor.on("shutdown", () => app.exit());

  registerFileProtocol("static", __static);

  PrometheusProviderRegistry.createInstance();
  initializers.initPrometheusProviderRegistry();

  /**
   * The following sync MUST be done before HotbarStore creation, because that
   * store has migrations that will remove items that previous migrations add
   * if this is not present
   */
  syncGeneralEntities();

  logger.info("💾 Loading stores");

  UserStore.createInstance().startMainReactions();

  // ClusterStore depends on: UserStore
  ClusterStore.createInstance().provideInitialFromMain();

  // HotbarStore depends on: ClusterStore
  HotbarStore.createInstance();

  ExtensionsStore.createInstance();
  FilesystemProvisionerStore.createInstance();
  WeblinkStore.createInstance();

  syncWeblinks();

  HelmRepoManager.createInstance(); // create the instance

  const lensProxy = LensProxy.createInstance(new Router(), {
    getClusterForRequest: req => ClusterManager.getInstance().getClusterForRequest(req),
    kubeApiRequest,
    shellApiRequest,
  });

  ClusterManager.createInstance().init();
  KubeconfigSyncManager.createInstance();

  initializers.initClusterMetadataDetectors();

  try {
    logger.info("🔌 Starting LensProxy");
    await lensProxy.listen();
  } catch (error) {
    dialog.showErrorBox("Lens Error", `Could not start proxy: ${error?.message || "unknown error"}`);

    return app.exit();
  }

  // test proxy connection
  try {
    logger.info("🔎 Testing LensProxy connection ...");
    const versionFromProxy = await getAppVersionFromProxyServer(lensProxy.port);

    if (getAppVersion() !== versionFromProxy) {
      logger.error("Proxy server responded with invalid response");

      return app.exit();
    }

    logger.info("⚡ LensProxy connection OK");
  } catch (error) {
    logger.error(`🛑 LensProxy: failed connection test: ${error}`);

    const hostsPath = isWindows
      ? "C:\\windows\\system32\\drivers\\etc\\hosts"
      : "/etc/hosts";
    const message = [
      `Failed connection test: ${error}`,
      "Check to make sure that no other versions of Lens are running",
      `Check ${hostsPath} to make sure that it is clean and that the localhost loopback is at the top and set to 127.0.0.1`,
      "If you have HTTP_PROXY or http_proxy set in your environment, make sure that the localhost and the ipv4 loopback address 127.0.0.1 are added to the NO_PROXY environment variable.",
    ];

    dialog.showErrorBox("Lens Proxy Error", message.join("\n\n"));

    return app.exit();
  }

  initializers.initRegistries();
  const extensionDiscovery = ExtensionDiscovery.createInstance();

  ExtensionLoader.createInstance().init();
  extensionDiscovery.init();

  // Start the app without showing the main window when auto starting on login
  // (On Windows and Linux, we get a flag. On MacOS, we get special API.)
  const startHidden = process.argv.includes("--hidden") || (isMac && app.getLoginItemSettings().wasOpenedAsHidden);

  logger.info("🖥️  Starting WindowManager");
  const windowManager = WindowManager.createInstance();

  onQuitCleanup.push(
    initMenu(windowManager),
    initTray(windowManager),
  );

  installDeveloperTools();

  if (!startHidden) {
    windowManager.ensureMainWindow();
  }

  ipcMainOn(IpcRendererNavigationEvents.LOADED, async () => {
    onCloseCleanup.push(pushCatalogToRenderer(catalogEntityRegistry));
    await ensureDir(storedKubeConfigFolder());
    KubeconfigSyncManager.getInstance().startSync();
    startUpdateChecking();
    LensProtocolRouterMain.getInstance().rendererLoaded = true;
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
    WindowManager.getInstance(false)?.ensureMainWindow(false);
  }
});

/**
 * This variable should is used so that `autoUpdater.installAndQuit()` works
 */
let blockQuit = !isIntegrationTesting;

autoUpdater.on("before-quit-for-update", () => blockQuit = false);

app.on("will-quit", (event) => {
  // This is called when the close button of the main window is clicked

  const lprm = LensProtocolRouterMain.getInstance(false);

  logger.info("APP:QUIT");
  appEventBus.emit({ name: "app", action: "close" });
  ClusterManager.getInstance(false)?.stop(); // close cluster connections
  KubeconfigSyncManager.getInstance(false)?.stopSync();
  onCloseCleanup();

  if (lprm) {
    // This is set to false here so that LPRM can wait to send future lens://
    // requests until after it loads again
    lprm.rendererLoaded = false;
  }

  if (blockQuit) {
    // Quit app on Cmd+Q (MacOS)

    event.preventDefault(); // prevent app's default shutdown (e.g. required for telemetry, etc.)

    return; // skip exit to make tray work, to quit go to app's global menu or tray's menu
  }

  lprm?.cleanup();
  onQuitCleanup();
});

app.on("open-url", (event, rawUrl) => {
  // lens:// protocol handler
  event.preventDefault();
  LensProtocolRouterMain.getInstance().route(rawUrl);
});

/**
 * Exports for virtual package "@k8slens/extensions" for main-process.
 * All exporting names available in global runtime scope:
 * e.g. global.Mobx, global.LensExtensions
 */
const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Main: LensExtensionsMainApi,
};

export {
  Mobx,
  LensExtensions,
};
