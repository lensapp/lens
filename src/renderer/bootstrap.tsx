import "./components/app.scss";

import React from "react";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import { render, unmountComponentAtNode } from "react-dom";
import { clusterStore } from "../common/cluster-store";
import { userStore } from "../common/user-store";
import { delay } from "../common/utils";
import { isMac, isDevelopment } from "../common/vars";
import { workspaceStore } from "../common/workspace-store";
import * as LensExtensions from "../extensions/extension-api";
import { extensionDiscovery } from "../extensions/extension-discovery";
import { extensionLoader } from "../extensions/extension-loader";
import { extensionsStore } from "../extensions/extensions-store";
import { filesystemProvisionerStore } from "../main/extension-filesystem";
import { App } from "./components/app";
import { LensApp } from "./lens-app";
import { themeStore } from "./theme.store";
import { NonceProvider as StyleCache } from "react-select";

/**
 * If this is a development buid, wait a second to attach
 * Chrome Debugger to renderer process
 * https://stackoverflow.com/questions/52844870/debugging-electron-renderer-process-with-vscode
 */
async function attachChromeDebugger() {
  if (isDevelopment) {
    await delay(1000);
  }
}

type AppComponent = React.ComponentType & {
  init?(): Promise<void>;
};

export {
  React,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions
};

export async function bootstrap(App: AppComponent) {
  const rootElem = document.getElementById("app");

  await attachChromeDebugger();
  rootElem.classList.toggle("is-mac", isMac);

  extensionLoader.init();
  extensionDiscovery.init();

  // preload common stores
  await Promise.all([
    userStore.load(),
    workspaceStore.load(),
    clusterStore.load(),
    extensionsStore.load(),
    filesystemProvisionerStore.load(),
    themeStore.init(),
  ]);

  // Register additional store listeners
  clusterStore.registerIpcListener();
  workspaceStore.registerIpcListener();

  // init app's dependencies if any
  if (App.init) {
    await App.init();
  }
  window.addEventListener("message", (ev: MessageEvent) => {
    if (ev.data === "teardown") {
      userStore.unregisterIpcListener();
      workspaceStore.unregisterIpcListener();
      clusterStore.unregisterIpcListener();
      unmountComponentAtNode(rootElem);
      window.location.href = "about:blank";
    }
  });

  const cacheProps = { nonce: "lens", cacheKey: "lens" };

  render(<>
    {isMac && <div id="draggable-top" />}
    <StyleCache {...cacheProps}>
      <App />
    </StyleCache>
  </>, rootElem);
}

// run
bootstrap(process.isMainFrame ? LensApp : App);
