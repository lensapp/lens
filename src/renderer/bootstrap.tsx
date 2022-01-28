/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import React from "react";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsRendererApi from "../extensions/renderer-api";
import { render } from "react-dom";
import { delay } from "../common/utils";
import { isMac, isDevelopment } from "../common/vars";
import { HelmRepoManager } from "../main/helm/helm-repo-manager";
import { DefaultProps } from "./mui-base-theme";
import configurePackages from "../common/configure-packages";
import * as initializers from "./initializers";
import logger from "../common/logger";
import { registerCustomThemes } from "./components/monaco-editor";
import { getDi } from "./getDi";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import extensionInstallationStateStoreInjectable from "../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import clusterStoreInjectable from "../common/cluster-store/store.injectable";
import userPreferencesStoreInjectable from "../common/user-preferences/store.injectable";
import initRootFrameInjectable from "./frames/root-frame/init-root-frame/init-root-frame.injectable";
import initClusterFrameInjectable from "./frames/cluster-frame/init-cluster-frame/init-cluster-frame.injectable";
import isAllowedResourceInjectable from "./utils/allowed-resource.injectable";
import initializeSentryReportingInjectable from "../common/sentry.injectable";

configurePackages(); // global packages
registerCustomThemes(); // monaco editor themes

/**
 * If this is a development build, wait a second to attach
 * Chrome Debugger to renderer process
 * https://stackoverflow.com/questions/52844870/debugging-electron-renderer-process-with-vscode
 */
async function attachChromeDebugger() {
  if (isDevelopment) {
    await delay(1000);
  }
}

async function bootstrap() {
  const rootElem = document.getElementById("app");
  const logPrefix = `[BOOTSTRAP-${process.isMainFrame ? "ROOT" : "CLUSTER"}-FRAME]:`;
  const di = getDi();

  await di.runSetups();

  // TODO: Remove temporal dependencies to make timing of initialization not important
  di.inject(userPreferencesStoreInjectable);

  if (process.isMainFrame) {
    di.inject(initializeSentryReportingInjectable);
  }

  await attachChromeDebugger();
  rootElem.classList.toggle("is-mac", isMac);

  logger.info(`${logPrefix} initializing Registries`);
  initializers.initRegistries();

  logger.info(`${logPrefix} initializing EntitySettingsRegistry`);
  initializers.initEntitySettingsRegistry();

  logger.info(`${logPrefix} initializing KubeObjectMenuRegistry`);
  initializers.initKubeObjectMenuRegistry();

  logger.info(`${logPrefix} initializing WorkloadsOverviewDetailRegistry`);
  initializers.initWorkloadsOverviewDetailRegistry(di.inject(isAllowedResourceInjectable));

  const extensionLoader = di.inject(extensionLoaderInjectable);

  logger.info(`${logPrefix} initializing IpcRendererListeners`);
  initializers.initIpcRendererListeners(extensionLoader);

  extensionLoader.init();

  const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

  extensionDiscovery.init();

  // ClusterStore depends on: UserStore
  const clusterStore = di.inject(clusterStoreInjectable);

  await clusterStore.loadInitialOnRenderer();

  const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);

  extensionInstallationStateStore.bindIpcListeners();

  HelmRepoManager.createInstance(); // initialize the manager

  // Register additional store listeners
  clusterStore.registerIpcListener();

  // TODO: Remove iframes
  const [App, initializeApp] = process.isMainFrame
    ? [
      (await import("./frames/root-frame/root-frame")).RootFrame,
      di.inject(initRootFrameInjectable),
    ]
    : [
      (await import("./frames/cluster-frame/cluster-frame")).ClusterFrame,
      di.inject(initClusterFrameInjectable),
    ];

  await initializeApp(rootElem);

  render(
    <DiContextProvider value={{ di }}>
      {DefaultProps(App)}
    </DiContextProvider>,

    rootElem,
  );
}

// run
bootstrap();

/**
 * Exports for virtual package "@k8slens/extensions" for renderer-process.
 * All exporting names available in global runtime scope:
 * e.g. Devtools -> Console -> window.LensExtensions (renderer)
 */
export const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Renderer: LensExtensionsRendererApi,
};

export {
  React,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
};
