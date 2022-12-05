/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import React from "react";
import ReactDOM, { render, unmountComponentAtNode } from "react-dom";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsRendererApi from "../extensions/renderer-api";
import { DefaultProps } from "./mui-base-theme";
import * as initializers from "./initializers";
import { getDi } from "./getDi";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import type { DiContainer } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import extensionInstallationStateStoreInjectable from "../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import initRootFrameInjectable from "./frames/root-frame/init-root-frame/init-root-frame.injectable";
import initClusterFrameInjectable from "./frames/cluster-frame/init-cluster-frame/init-cluster-frame.injectable";
import commandOverlayInjectable from "./components/command-palette/command-overlay.injectable";
import { Router } from "react-router";
import historyInjectable from "./navigation/history.injectable";
import themeStoreInjectable from "./themes/store.injectable";
import navigateToAddClusterInjectable  from "../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import addSyncEntriesInjectable from "./initializers/add-sync-entries.injectable";
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import openDeleteClusterDialogInjectable from "./components/delete-cluster-dialog/open.injectable";
import kubernetesClusterCategoryInjectable from "../common/catalog/categories/kubernetes-cluster.injectable";
import assert from "assert";
import startFrameInjectable from "./start-frame/start-frame.injectable";
import loggerInjectable from "../common/logger.injectable";
import isLinuxInjectable from "../common/vars/is-linux.injectable";
import isWindowsInjectable from "../common/vars/is-windows.injectable";

export async function bootstrap(di: DiContainer) {
  const startFrame = di.inject(startFrameInjectable);
  const logger = di.inject(loggerInjectable);

  await startFrame();

  const rootElem = document.getElementById("app");
  const logPrefix = `[BOOTSTRAP-${process.isMainFrame ? "ROOT" : "CLUSTER"}-FRAME]:`;

  assert(rootElem, "#app MUST exist");

  logger.info(`${logPrefix} initializing CatalogCategoryRegistryEntries`);
  initializers.initCatalogCategoryRegistryEntries({
    navigateToAddCluster: di.inject(navigateToAddClusterInjectable),
    addSyncEntries: di.inject(addSyncEntriesInjectable),
    kubernetesClusterCategory: di.inject(kubernetesClusterCategoryInjectable),
    isLinux: di.inject(isLinuxInjectable),
    isWindows: di.inject(isWindowsInjectable),
  });

  logger.info(`${logPrefix} initializing Catalog`);
  initializers.initCatalog({
    openCommandDialog: di.inject(commandOverlayInjectable).open,
    openDeleteClusterDialog: di.inject(openDeleteClusterDialogInjectable),
  });

  const extensionLoader = di.inject(extensionLoaderInjectable);

  logger.info(`${logPrefix} initializing IpcRendererListeners`);
  initializers.initIpcRendererListeners(extensionLoader);

  extensionLoader.init();

  const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

  extensionDiscovery.init();

  // ClusterStore depends on: UserStore
  const clusterStore = di.inject(clusterStoreInjectable);

  await clusterStore.loadInitialOnRenderer();

  // HotbarStore depends on: ClusterStore
  di.inject(hotbarStoreInjectable).load();

  // ThemeStore depends on: UserStore
  // TODO: Remove temporal dependencies
  di.inject(themeStoreInjectable);

  const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);

  extensionInstallationStateStore.bindIpcListeners();

  // Register additional store listeners
  clusterStore.registerIpcListener();

  let App;
  let initializeApp;

  // TODO: Introduce proper architectural boundaries between root and cluster iframes
  if (process.isMainFrame) {
    initializeApp = di.inject(initRootFrameInjectable);
    App = (await import("./frames/root-frame/root-frame")).RootFrame;
  } else {
    initializeApp = di.inject(initClusterFrameInjectable);
    App = (await import("./frames/cluster-frame/cluster-frame")).ClusterFrame;
  }

  try {
    await initializeApp(() => unmountComponentAtNode(rootElem));
  } catch (error) {
    console.error(`[BOOTSTRAP]: view initialization error: ${error}`, {
      origin: location.href,
      isTopFrameView: process.isMainFrame,
    });
  }

  const history = di.inject(historyInjectable);

  render(
    <DiContextProvider value={{ di }}>
      <Router history={history}>
        {DefaultProps(App)}
      </Router>
    </DiContextProvider>,
    rootElem,
  );
}

const di = getDi();

// run
bootstrap(di);

/**
 * Exports for virtual package "@k8slens/extensions" for renderer-process.
 * All exporting names available in global runtime scope:
 * e.g. Devtools -> Console -> window.LensExtensions (renderer)
 */
const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Renderer: LensExtensionsRendererApi,
};

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
