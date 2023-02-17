/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import React from "react";
import { render } from "react-dom";
import { DefaultProps } from "./mui-base-theme";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import type { DiContainer } from "@ogre-tools/injectable";
import initRootFrameInjectable from "./frames/root-frame/init-root-frame.injectable";
import { Router } from "react-router";
import historyInjectable from "./navigation/history.injectable";
import startFrameInjectable from "./start-frame/start-frame.injectable";
import rootElementInjectable from "./window/root-element.injectable";
import { RootFrame } from "./frames/root-frame/root-frame";
import { ClusterFrame } from "./frames/cluster-frame/cluster-frame";

export async function bootstrap(di: DiContainer) {
  const startFrame = di.inject(startFrameInjectable);

  await startFrame();

  try {
    // TODO: Introduce proper architectural boundaries between root and cluster iframes
    if (process.isMainFrame) {
      const initRootFrame = di.inject(initRootFrameInjectable);

      await initRootFrame();
    }
  } catch (error) {
    console.error(`[BOOTSTRAP]: view initialization error: ${error}`, {
      origin: location.href,
      isTopFrameView: process.isMainFrame,
    });
  }

  const App = process.isMainFrame
    ? RootFrame
    : ClusterFrame;

  render(
    <DiContextProvider value={{ di }}>
      <Router history={di.inject(historyInjectable)}>
        {DefaultProps(App)}
      </Router>
    </DiContextProvider>,
    di.inject(rootElementInjectable),
  );
}
