import "./components/app.scss";

import React from "react";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import { render, unmountComponentAtNode } from "react-dom";
import { delay } from "../common/utils";
import { isMac, isDevelopment } from "../common/vars";
import { HotbarStore } from "../common/hotbar-store";
import { ClusterStore } from "../common/cluster-store";
import { UserStore } from "../common/user-store";
import * as LensExtensions from "../extensions/extension-api";
import { ExtensionDiscovery } from "../extensions/extension-discovery";
import { ExtensionLoader } from "../extensions/extension-loader";
import { ExtensionsStore } from "../extensions/extensions-store";
import { FilesystemProvisionerStore } from "../main/extension-filesystem";
import { App } from "./components/app";
import { LensApp } from "./lens-app";
import { ThemeStore } from "./theme.store";
import { HelmRepoManager } from "../main/helm/helm-repo-manager";

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

  ExtensionLoader.getInstanceOrCreate().init();
  ExtensionDiscovery.getInstanceOrCreate().init();

  const userStore = UserStore.getInstanceOrCreate();
  const clusterStore = ClusterStore.getInstanceOrCreate();
  const extensionsStore = ExtensionsStore.getInstanceOrCreate();
  const filesystemStore = FilesystemProvisionerStore.getInstanceOrCreate();
  const themeStore = ThemeStore.getInstanceOrCreate();
  const hotbarStore = HotbarStore.getInstanceOrCreate();
  const helmRepoManager = HelmRepoManager.getInstanceOrCreate();

  // preload common stores
  await Promise.all([
    userStore.load(),
    hotbarStore.load(),
    clusterStore.load(),
    extensionsStore.load(),
    filesystemStore.load(),
    themeStore.init(),
    helmRepoManager.init(),
  ]);

  // Register additional store listeners
  clusterStore.registerIpcListener();

  // init app's dependencies if any
  if (App.init) {
    await App.init();
  }
  window.addEventListener("message", (ev: MessageEvent) => {
    if (ev.data === "teardown") {
      UserStore.getInstance(false)?.unregisterIpcListener();
      ClusterStore.getInstance(false)?.unregisterIpcListener();
      unmountComponentAtNode(rootElem);
      window.location.href = "about:blank";
    }
  });
  render(<>
    {isMac && <div id="draggable-top" />}
    <App />
  </>, rootElem);
}

// run
bootstrap(process.isMainFrame ? LensApp : App);
