/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { DefaultProps } from "./mui-base-theme";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import type { DiContainer } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../extensions/extension-loader/extension-loader.injectable";
import extensionDiscoveryInjectable from "../extensions/extension-discovery/extension-discovery.injectable";
import extensionInstallationStateStoreInjectable from "../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import { Router } from "react-router";
import historyInjectable from "./navigation/history.injectable";
import assert from "assert";
import startFrameInjectable from "./start-frame/start-frame.injectable";
import rootComponentInjectable from "./bootstrap/root-component.injectable";
import initializeAppInjectable from "./bootstrap/initialize-app.injectable";

export async function bootstrap(di: DiContainer) {
  const startFrame = di.inject(startFrameInjectable);

  await startFrame();

  const rootElem = document.getElementById("app");

  assert(rootElem, "#app MUST exist");

  const extensionLoader = di.inject(extensionLoaderInjectable);

  extensionLoader.init();

  const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

  extensionDiscovery.init();

  const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);

  extensionInstallationStateStore.bindIpcListeners();

  const App = di.inject(rootComponentInjectable);
  const initializeApp = di.inject(initializeAppInjectable);

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
