/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Main process

import { injectSystemCAs } from "../common/system-ca";
import { initialize as initializeRemote } from "@electron/remote/main";
import * as Mobx from "mobx";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsMainApi from "../extensions/main-api";
import { app, autoUpdater, dialog, powerMonitor } from "electron";
import { appName, isIntegrationTesting, isMac, isWindows, productName } from "../common/vars";
import { shellSync } from "./shell-sync";
import { mangleProxyEnv } from "./proxy-env";
import { registerFileProtocol } from "../common/register-protocol";
import logger from "./logger";
import { appEventBus } from "../common/app-event-bus/event-bus";
import type { InstalledExtension } from "../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../extensions/lens-extension";
import { installDeveloperTools } from "./developer-tools";
import { disposer, getAppVersion, getAppVersionFromProxyServer } from "../common/utils";
import { bindBroadcastHandlers, ipcMainOn } from "../common/ipc";
import { IpcRendererNavigationEvents } from "../renderer/navigation/events";
import { pushCatalogToRenderer } from "./catalog-pusher";
import { HelmRepoManager } from "./helm/helm-repo-manager";
import configurePackages from "../common/configure-packages";
import { PrometheusProviderRegistry } from "./prometheus";
import { ensureDir } from "fs-extra";
import { ShellSession } from "./shell-sessions/shell-session";
import { getDi } from "./getDi";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import lensProtocolRouterMainInjectable from "./protocol-handler/router.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import directoryForExesInjectable from "../common/app-paths/directory-for-exes.injectable";
import initIpcMainHandlersInjectable from "./initializers/init-ipc-main-handlers.injectable";
import directoryForKubeConfigsInjectable from "../common/app-paths/directory-for-kube-configs.injectable";
import clusterStoreInjectable from "../common/cluster-store/store.injectable";
import userPreferencesStoreInjectable from "../common/user-preferences/store.injectable";
import kubeconfigSyncManagerInjectable from "./catalog-sources/kubeconfig-sync/manager.injectable";
import lensProxyInjectableInjectable from "./lens-proxy/lens-proxy.injectable";
import { initPrometheusProviderRegistry } from "./initializers/metrics-providers";
import catalogEntityRegistryInjectable from "./catalog/entity-registry.injectable";
import { generalEntities } from "./catalog-sources/general";
import getProxyPortInjectable from "./lens-proxy/get-proxy-port.injectable";
import clusterManagerInjectable from "./cluster-manager/cluster-manager.injectable";
import initAppMenuInjectable from "./menu/init-app-menu.injectable";
import windowManagerInjectable from "./windows/manager.injectable";
import initTrayIconInjectable from "./tray/init-tray-icon.injectable";
import getWeblinksSourceInjectable from "./catalog-sources/weblinks-source.injectable";
import initializeSentryReportingInjectable from "../common/sentry.injectable";
import startUpdateCheckingInjectable from "./app-updater/start-update-checking.injectable";

app.setName(appName);

async function main() {
  console.log("1");
  const di = getDi();

  console.log("2");
  const onCloseCleanup = disposer();
  const onQuitCleanup = disposer();

  await di.runSetups();
  console.log("3");

  injectSystemCAs();
  di.inject(initializeSentryReportingInjectable)();

  logger.info(`📟 Setting ${productName} as protocol client for lens://`);

  if (app.setAsDefaultProtocolClient("lens")) {
    logger.info("📟 Protocol client register succeeded ✅");
  } else {
    logger.info("📟 Protocol client register failed ❗");
  }

  if (process.env.LENS_DISABLE_GPU) {
    app.disableHardwareAcceleration();
  }

  console.log("4");

  logger.debug("[APP-MAIN] initializing remote");
  initializeRemote();

  logger.debug("[APP-MAIN] configuring packages");
  configurePackages();

  mangleProxyEnv();

  const initIpcMainHandlers = di.inject(initIpcMainHandlersInjectable);

  console.log("5");

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

  app.on("second-instance", (event, argv) => {
    logger.debug("second-instance message");

    for (const arg of argv) {
      if (arg.toLowerCase().startsWith("lens://")) {
        lensProtocolRouterMain.route(arg);
      }
    }

    di.inject(windowManagerInjectable).ensureMainWindow();
  });

  app.on("ready", async () => {
    console.log("4");

    const directoryForExes = di.inject(directoryForExesInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    logger.info(`🚀 Starting ${productName} from "${directoryForExes}"`);
    logger.info("🐚 Syncing shell environment");
    await shellSync();

    bindBroadcastHandlers();

    powerMonitor.on("shutdown", () => app.exit());

    registerFileProtocol("static", __static);

    PrometheusProviderRegistry.createInstance();
    initPrometheusProviderRegistry();

    /**
     * The following sync MUST be done before HotbarStore creation, because that
     * store has migrations that will remove items that previous migrations add
     * if this is not present
     */
    const getWeblinksSource = di.inject(getWeblinksSourceInjectable);

    catalogEntityRegistry.addObservableSource(generalEntities);
    catalogEntityRegistry.addComputedSource(getWeblinksSource());

    logger.info("💾 Loading stores");

    const userStore = di.inject(userPreferencesStoreInjectable);

    userStore.startMainReactions();

    // ClusterStore depends on: UserStore
    const clusterStore = di.inject(clusterStoreInjectable);

    clusterStore.provideInitialFromMain();

    HelmRepoManager.createInstance();

    const lensProxy = di.inject(lensProxyInjectableInjectable);

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
      const getProxyPort = di.inject(getProxyPortInjectable);
      const versionFromProxy = await getAppVersionFromProxyServer(getProxyPort.get());

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
    installDeveloperTools();

    logger.info("🖥️  Starting WindowManager");

    // Start the app without showing the main window when auto starting on login
    // (On Windows and Linux, we get a flag. On MacOS, we get special API.)
    const startHidden = process.argv.includes("--hidden") || (isMac && app.getLoginItemSettings().wasOpenedAsHidden);

    if (!startHidden) {
      di.inject(windowManagerInjectable).ensureMainWindow();
    }

    const initAppMenu = di.inject(initAppMenuInjectable);
    const initTrayIcon = di.inject(initTrayIconInjectable);

    onQuitCleanup.push(
      initAppMenu(),
      initTrayIcon(),
      () => ShellSession.cleanup(),
    );

    ipcMainOn(IpcRendererNavigationEvents.LOADED, async () => {
      onCloseCleanup.push(pushCatalogToRenderer(catalogEntityRegistry));

      const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);

      await ensureDir(directoryForKubeConfigs);

      const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);

      kubeConfigSyncManager.startSync();

      di.inject(startUpdateCheckingInjectable)();
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
      di.inject(windowManagerInjectable).ensureMainWindow(false);
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
    di.inject(clusterManagerInjectable).stop(); // close cluster connections

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

  logger.debug("[APP-MAIN] waiting for 'ready' and other messages");
}

main();

/**
 * Exports for virtual package "@k8slens/extensions" for main-process.
 * All exporting names available in global runtime scope:
 * e.g. global.Mobx, global.LensExtensions
 */
export const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Main: LensExtensionsMainApi,
};

export { Mobx };
