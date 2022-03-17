/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Main process

import { injectSystemCAs } from "../common/system-ca";
import * as Mobx from "mobx";
import httpProxy from "http-proxy";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsMainApi from "../extensions/main-api";
import { app, autoUpdater, dialog, powerMonitor } from "electron";
import { appName, isIntegrationTesting, isMac, isWindows, productName, staticFilesDirectory } from "../common/vars";
import { LensProxy } from "./lens-proxy";
import { WindowManager } from "./window-manager";
import { ClusterManager } from "./cluster-manager";
import { shellSync } from "./shell-sync";
import { mangleProxyEnv } from "./proxy-env";
import { registerFileProtocol } from "../common/register-protocol";
import logger from "./logger";
import { appEventBus } from "../common/app-event-bus/event-bus";
import type { InstalledExtension } from "../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../extensions/lens-extension";
import { installDeveloperTools } from "./developer-tools";
import { disposer, getAppVersion, getAppVersionFromProxyServer } from "../common/utils";
import { ipcMainOn } from "../common/ipc";
import { startUpdateChecking } from "./app-updater";
import { IpcRendererNavigationEvents } from "../renderer/navigation/events";
import { startCatalogSyncToRenderer } from "./catalog-pusher";
import { catalogEntityRegistry } from "./catalog";
import { HelmRepoManager } from "./helm/helm-repo-manager";
import { syncWeblinks } from "./catalog-sources";
import configurePackages from "../common/configure-packages";
import { PrometheusProviderRegistry } from "./prometheus";
import * as initializers from "./initializers";
import { WeblinkStore } from "../common/weblink-store";
import { initializeSentryReporting } from "../common/sentry";
import { ensureDir } from "fs-extra";
import { initMenu } from "./menu/menu";
import { kubeApiUpgradeRequest } from "./proxy-functions";
import { initTray } from "./tray/tray";
import { ShellSession } from "./shell-session/shell-session";
import { getDi } from "./getDi";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import lensProtocolRouterMainInjectable from "./protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import directoryForExesInjectable from "../common/app-paths/directory-for-exes/directory-for-exes.injectable";
import initIpcMainHandlersInjectable from "./initializers/init-ipc-main-handlers/init-ipc-main-handlers.injectable";
import directoryForKubeConfigsInjectable from "../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import kubeconfigSyncManagerInjectable from "./catalog-sources/kubeconfig-sync-manager/kubeconfig-sync-manager.injectable";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import routerInjectable from "./router/router.injectable";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request/shell-api-request.injectable";
import userStoreInjectable from "../common/user-store/user-store.injectable";
import trayMenuItemsInjectable from "./tray/tray-menu-items.injectable";
import { broadcastNativeThemeOnUpdate } from "./native-theme";
import assert from "assert";
import windowManagerInjectable from "./window-manager.injectable";
import navigateToPreferencesInjectable from "../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import syncGeneralCatalogEntitiesInjectable from "./catalog-sources/sync-general-catalog-entities.injectable";
import hotbarStoreInjectable from "../common/hotbar-store.injectable";
import applicationMenuItemsInjectable from "./menu/application-menu-items.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { init } from "@sentry/electron/main";

async function main(di: DiContainer) {
  app.setName(appName);

  /**
   * Note: this MUST be called before electron's "ready" event has been emitted.
   */
  initializeSentryReporting(init);
  await di.runSetups();
  await app.whenReady();

  injectSystemCAs();

  const onCloseCleanup = disposer();
  const onQuitCleanup = disposer();

  logger.info(`📟 Setting ${productName} as protocol client for lens://`);

  if (app.setAsDefaultProtocolClient("lens")) {
    logger.info("📟 Protocol client register succeeded ✅");
  } else {
    logger.info("📟 Protocol client register failed ❗");
  }

  if (process.env.LENS_DISABLE_GPU) {
    app.disableHardwareAcceleration();
  }

  logger.debug("[APP-MAIN] configuring packages");
  configurePackages();

  mangleProxyEnv();

  const initIpcMainHandlers = di.inject(initIpcMainHandlersInjectable);

  logger.debug("[APP-MAIN] initializing ipc main handlers");
  initIpcMainHandlers();

  if (app.commandLine.getSwitchValue("proxy-server") !== "") {
    process.env.HTTPS_PROXY = app.commandLine.getSwitchValue("proxy-server");
  }

  logger.debug("[APP-MAIN] Lens protocol routing main");

  const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

  if (!app.requestSingleInstanceLock()) {
    app.exit();
  } else {
    for (const arg of process.argv) {
      if (arg.toLowerCase().startsWith("lens://")) {
        lensProtocolRouterMain.route(arg);
      }
    }
  }

  broadcastNativeThemeOnUpdate();

  app.on("second-instance", (event, argv) => {
    logger.debug("second-instance message");

    for (const arg of argv) {
      if (arg.toLowerCase().startsWith("lens://")) {
        lensProtocolRouterMain.route(arg);
      }
    }

    WindowManager.getInstance(false)?.ensureMainWindow();
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

  autoUpdater.on("before-quit-for-update", () => {
    logger.debug("Unblocking quit for update");
    blockQuit = false;
  });

  app.on("will-quit", (event) => {
    logger.debug("will-quit message");

    // This is called when the close button of the main window is clicked


    logger.info("APP:QUIT");
    appEventBus.emit({ name: "app", action: "close" });
    ClusterManager.getInstance(false)?.stop(); // close cluster connections

    const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);

    kubeConfigSyncManager.stopSync();

    onCloseCleanup();

    // This is set to false here so that LPRM can wait to send future lens://
    // requests until after it loads again
    lensProtocolRouterMain.rendererLoaded = false;

    if (blockQuit) {
      // Quit app on Cmd+Q (MacOS)

      event.preventDefault(); // prevent app's default shutdown (e.g. required for telemetry, etc.)

      return; // skip exit to make tray work, to quit go to app's global menu or tray's menu
    }

    lensProtocolRouterMain.cleanup();
    onQuitCleanup();
  });

  app.on("open-url", (event, rawUrl) => {
    logger.debug("open-url message");

    // lens:// protocol handler
    event.preventDefault();
    lensProtocolRouterMain.route(rawUrl);
  });

  const directoryForExes = di.inject(directoryForExesInjectable);

  logger.info(`🚀 Starting ${productName} from "${directoryForExes}"`);
  logger.info("🐚 Syncing shell environment");
  await shellSync();

  powerMonitor.on("shutdown", () => app.exit());

  registerFileProtocol("static", staticFilesDirectory);

  PrometheusProviderRegistry.createInstance();
  initializers.initPrometheusProviderRegistry();

  /**
   * The following sync MUST be done before HotbarStore creation, because that
   * store has migrations that will remove items that previous migrations add
   * if this is not present
   */
  const syncGeneralCatalogEntities = di.inject(syncGeneralCatalogEntitiesInjectable);

  syncGeneralCatalogEntities();

  logger.info("💾 Loading stores");

  const userStore = di.inject(userStoreInjectable);

  userStore.startMainReactions();

  // ClusterStore depends on: UserStore
  const clusterStore = di.inject(clusterStoreInjectable);

  clusterStore.provideInitialFromMain();

  // HotbarStore depends on: ClusterStore
  di.inject(hotbarStoreInjectable);

  WeblinkStore.createInstance();

  syncWeblinks();

  HelmRepoManager.createInstance(); // create the instance

  const router = di.inject(routerInjectable);
  const shellApiRequest = di.inject(shellApiRequestInjectable);

  const lensProxy = LensProxy.createInstance(router, httpProxy.createProxy(), {
    getClusterForRequest: (req) => ClusterManager.getInstance().getClusterForRequest(req),
    kubeApiUpgradeRequest,
    shellApiRequest,
  });

  ClusterManager.createInstance().init();

  initializers.initClusterMetadataDetectors();

  try {
    logger.info("🔌 Starting LensProxy");
    await lensProxy.listen(); // lensProxy.port available
  } catch (error) {
    dialog.showErrorBox("Lens Error", `Could not start proxy: ${error ? String(error) : "unknown error"}`);

    return app.exit();
  }

  assert(lensProxy.port, "Lens Proxy failed to start");

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

  const extensionLoader = di.inject(extensionLoaderInjectable);

  extensionLoader.init();

  const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

  extensionDiscovery.init();

  // Start the app without showing the main window when auto starting on login
  // (On Windows and Linux, we get a flag. On MacOS, we get special API.)
  const startHidden = process.argv.includes("--hidden") || (isMac && app.getLoginItemSettings().wasOpenedAsHidden);

  logger.info("🖥️  Starting WindowManager");
  const windowManager = di.inject(windowManagerInjectable);

  const applicationMenuItems = di.inject(applicationMenuItemsInjectable);
  const trayMenuItems = di.inject(trayMenuItemsInjectable);
  const navigateToPreferences = di.inject(navigateToPreferencesInjectable);

  onQuitCleanup.push(
    initMenu(applicationMenuItems),
    await initTray(windowManager, trayMenuItems, navigateToPreferences),
    () => ShellSession.cleanup(),
  );

  installDeveloperTools();

  if (!startHidden) {
    windowManager.ensureMainWindow();
  }

  ipcMainOn(IpcRendererNavigationEvents.LOADED, async () => {
    onCloseCleanup.push(startCatalogSyncToRenderer(catalogEntityRegistry));

    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);

    await ensureDir(directoryForKubeConfigs);

    const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);

    kubeConfigSyncManager.startSync();

    startUpdateChecking();
    lensProtocolRouterMain.rendererLoaded = true;
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
        extensionLoader.addExtension(extension);
      })
      .on("remove", (lensExtensionId: LensExtensionId) => {
        extensionLoader.removeExtension(lensExtensionId);
      });

    extensionLoader.initExtensions(extensions);
  } catch (error) {
    dialog.showErrorBox("Lens Error", `Could not load extensions${error ? `: ${String(error)}` : ""}`);
    console.error(error);
    console.trace();
  }

  setTimeout(() => {
    appEventBus.emit({ name: "service", action: "start" });
  }, 1000);
}

main(getDi());

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
