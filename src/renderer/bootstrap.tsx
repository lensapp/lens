import "./components/app.scss"

import React from "react";
import * as Mobx from "mobx"
import * as MobxReact from "mobx-react"
import * as LensExtensions from "../extensions/extension-api"
import { App } from "./components/app";
import { LensApp } from "./lens-app";
import { render, unmountComponentAtNode } from "react-dom";
import { isMac } from "../common/vars";
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { clusterStore } from "../common/cluster-store";
import { i18nStore } from "./i18n";
import { themeStore } from "./theme.store";
import { extensionsStore } from "../extensions/extensions-store";

type AppComponent = React.ComponentType & {
  init?(): Promise<void>;
}

export {
  React,
  Mobx,
  MobxReact,
  LensExtensions
}

export async function bootstrap(App: AppComponent) {
  const rootElem = document.getElementById("app")
  rootElem.classList.toggle("is-mac", isMac);

  // preload common stores
  await Promise.all([
    userStore.load(),
    workspaceStore.load(),
    clusterStore.load(),
    extensionsStore.load(),
    i18nStore.init(),
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
      userStore.unregisterIpcListener()
      workspaceStore.unregisterIpcListener()
      clusterStore.unregisterIpcListener()
      unmountComponentAtNode(rootElem)
      window.location.href = "about:blank"
    }
  })
  render(<>
    {isMac && <div id="draggable-top" />}
    <App />
  </>, rootElem);
}

// run
bootstrap(process.isMainFrame ? LensApp : App);
