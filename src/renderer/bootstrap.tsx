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
import { ClusterStore } from "../common/cluster-store";
import { UserStore } from "../common/user-store";
import { ExtensionDiscovery } from "../extensions/extension-discovery";
import { ExtensionLoader } from "../extensions/extension-loader";
import { HelmRepoManager } from "../main/helm/helm-repo-manager";
import { ExtensionInstallationStateStore } from "./components/+extensions/extension-install.store";
import { DefaultProps } from "./mui-base-theme";
import configurePackages from "../common/configure-packages";
import * as initializers from "./initializers";
import logger from "../common/logger";
import { HotbarStore } from "../common/hotbar-store";
import { WeblinkStore } from "../common/weblink-store";
import { ExtensionsStore } from "../extensions/extensions-store";
import { FilesystemProvisionerStore } from "../main/extension-filesystem";
import { ThemeStore } from "./theme.store";
import { SentryInit } from "../common/sentry";
import { TerminalStore } from "./components/dock/terminal.store";
import { AppPaths } from "../common/app-paths";
import { registerCustomThemes } from "./components/monaco-editor";
import { getDi } from "./components/getDi";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import type { IDependencyInjectionContainer } from "@ogre-tools/injectable";

if (process.isMainFrame) {
  SentryInit();
}

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

type AppComponent = React.ComponentType & {
  init(rootElem: HTMLElement): Promise<void>;
};

export async function bootstrap(comp: () => Promise<AppComponent>, di: IDependencyInjectionContainer) {
  const rootElem = document.getElementById("app");
  const logPrefix = `[BOOTSTRAP-${process.isMainFrame ? "ROOT" : "CLUSTER"}-FRAME]:`;

  await AppPaths.init();
  UserStore.createInstance();

  await attachChromeDebugger();
  rootElem.classList.toggle("is-mac", isMac);

  logger.info(`${logPrefix} initializing Registries`);
  initializers.initRegistries();

  logger.info(`${logPrefix} initializing CommandRegistry`);
  initializers.initCommandRegistry();

  logger.info(`${logPrefix} initializing EntitySettingsRegistry`);
  initializers.initEntitySettingsRegistry();

  logger.info(`${logPrefix} initializing KubeObjectMenuRegistry`);
  initializers.initKubeObjectMenuRegistry();

  logger.info(`${logPrefix} initializing KubeObjectDetailRegistry`);
  initializers.initKubeObjectDetailRegistry();

  logger.info(`${logPrefix} initializing WelcomeMenuRegistry`);
  initializers.initWelcomeMenuRegistry();

  logger.info(`${logPrefix} initializing WorkloadsOverviewDetailRegist`);
  initializers.initWorkloadsOverviewDetailRegistry();

  logger.info(`${logPrefix} initializing CatalogEntityDetailRegistry`);
  initializers.initCatalogEntityDetailRegistry();

  logger.info(`${logPrefix} initializing CatalogCategoryRegistryEntrie`);
  initializers.initCatalogCategoryRegistryEntries();

  logger.info(`${logPrefix} initializing Catalog`);
  initializers.initCatalog();

  logger.info(`${logPrefix} initializing IpcRendererListeners`);
  initializers.initIpcRendererListeners();

  ExtensionLoader.createInstance().init();
  ExtensionDiscovery.createInstance().init();

  // ClusterStore depends on: UserStore
  const clusterStore = ClusterStore.createInstance();

  await clusterStore.loadInitialOnRenderer();

  // HotbarStore depends on: ClusterStore
  HotbarStore.createInstance();
  ExtensionsStore.createInstance();
  FilesystemProvisionerStore.createInstance();

  // ThemeStore depends on: UserStore
  ThemeStore.createInstance();

  // TerminalStore depends on: ThemeStore
  TerminalStore.createInstance();
  WeblinkStore.createInstance();

  ExtensionInstallationStateStore.bindIpcListeners();
  HelmRepoManager.createInstance(); // initialize the manager

  // Register additional store listeners
  clusterStore.registerIpcListener();

  // init app's dependencies if any
  const App = await comp();

  await App.init(rootElem);

  render(
    <DiContextProvider value={{ di }}>
      {isMac && <div id="draggable-top" />}

      {DefaultProps(App)}
    </DiContextProvider>,

    rootElem,
  );
}

const di = getDi();

// run
bootstrap(
  async () =>
    process.isMainFrame
      ? (await import("./root-frame")).RootFrame
      : (await import("./cluster-frame")).ClusterFrame,
  di,
);


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
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
