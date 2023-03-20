/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import type {
  DiContainerForInjection,
} from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import extensionInstallationStateStoreInjectable from "../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import initRootFrameInjectable from "./frames/root-frame/init-root-frame.injectable";
import initClusterFrameInjectable from "./frames/cluster-frame/init-cluster-frame/init-cluster-frame.injectable";
import assert from "assert";

export async function bootstrap(di: DiContainerForInjection) {
  const rootElem = document.getElementById("app");

  assert(rootElem, "#app MUST exist");

  await di.inject(extensionLoaderInjectable).init();
  await di.inject(extensionDiscoveryInjectable).init();
  di.inject(extensionInstallationStateStoreInjectable).bindIpcListeners();

  let initializeApp;

  // TODO: Introduce proper architectural boundaries between root and cluster iframes
  if (process.isMainFrame) {
    initializeApp = di.inject(initRootFrameInjectable);
  } else {
    initializeApp = di.inject(initClusterFrameInjectable);
  }

  try {
    await initializeApp();
  } catch (error) {
    console.error(`[BOOTSTRAP]: view initialization error: ${error}`, {
      origin: location.href,
      isTopFrameView: process.isMainFrame,
    });
  }
}
