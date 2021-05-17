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

import "../common/system-ca";
import "./components/root-frame.scss";

import React from "react";
import { Redirect, Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { history } from "./navigation";
import { Catalog } from "./components/+catalog";
import { Preferences } from "./components/+preferences";
import { AddCluster } from "./components/+add-cluster";
import { ClusterView } from "./components/cluster-view";
import { GlobalPageRegistry } from "../extensions/registries/page-registry";
import { Extensions } from "./components/+extensions";
import { EntitySettings } from "./components/+entity-settings";
import { Welcome } from "./components/+welcome";
import { ErrorBoundary } from "./components/error-boundary";
import { Notifications } from "./components/notifications";
import { ConfirmDialog } from "./components/confirm-dialog";
import { ExtensionLoader } from "../extensions/extension-loader";
import { broadcastMessage } from "../common/ipc";
import { CommandContainer } from "./components/command-palette/command-container";
import { LensProtocolRouterRenderer, bindProtocolAddRouteHandlers } from "./protocol-handler";
import { registerIpcHandlers } from "./ipc";
import { ipcRenderer } from "electron";
import { IpcRendererNavigationEvents } from "./navigation/events";
import { catalogEntityRegistry } from "./api/catalog-entity-registry";
import { CommandRegistry } from "../extensions/registries";
import { reaction } from "mobx";
import { HotbarMenu } from "./components/hotbar/hotbar-menu";
import { BottomBar } from "./components/bottom-bar";
import * as routes from "../common/routes";

@observer
export class RootFrame extends React.Component {
  static async init() {
    catalogEntityRegistry.init();
    ExtensionLoader.getInstance().loadOnClusterManagerRenderer();
    LensProtocolRouterRenderer.createInstance().init();
    bindProtocolAddRouteHandlers();

    window.addEventListener("offline", () => broadcastMessage("network:offline"));
    window.addEventListener("online", () => broadcastMessage("network:online"));

    registerIpcHandlers();
    ipcRenderer.send(IpcRendererNavigationEvents.LOADED);
  }

  componentDidMount() {
    reaction(() => catalogEntityRegistry.items, (items) => {
      const reg = CommandRegistry.getInstance();

      if (reg.activeEntity && items.includes(reg.activeEntity)) {
        reg.activeEntity = null;
      }
    });
  }

  render() {
    return (
      <Router history={history}>
        <ErrorBoundary>
          <div className="root-frame">
            <main>
              <div id="lens-views" />
              <Switch>
                <Route component={Welcome} {...routes.welcomeRoute} />
                <Route component={Catalog} {...routes.catalogRoute} />
                <Route component={Preferences} {...routes.preferencesRoute} />
                <Route component={Extensions} {...routes.extensionsRoute} />
                <Route component={AddCluster} {...routes.addClusterRoute} />
                <Route component={ClusterView} {...routes.clusterViewRoute} />
                <Route component={EntitySettings} {...routes.entitySettingsRoute} />
                {
                  GlobalPageRegistry.getInstance()
                    .getItems()
                    .map(({ url, components: { Page } }) => (
                      <Route key={url} path={url} component={Page} />
                    ))
                }
                <Redirect exact to={routes.welcomeURL()} />
              </Switch>
            </main>
            <HotbarMenu />
            <BottomBar />
          </div>
        </ErrorBoundary>
        <Notifications/>
        <ConfirmDialog/>
        <CommandContainer />
      </Router>
    );
  }
}
