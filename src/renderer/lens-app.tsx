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
import React from "react";
import { Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { history } from "./navigation";
import { ClusterManager } from "./components/cluster-manager";
import { ErrorBoundary } from "./components/error-boundary";
import { Notifications } from "./components/notifications";
import { ConfirmDialog } from "./components/confirm-dialog";
import { ExtensionLoader } from "../extensions/extension-loader";
import { broadcastMessage } from "../common/ipc";
import { CommandContainer } from "./components/command-palette/command-container";
import { bindProtocolAddRouteHandlers, LensProtocolRouterRenderer } from "./protocol-handler";
import { registerIpcHandlers } from "./ipc";
import { ipcRenderer } from "electron";
import { IpcRendererNavigationEvents } from "./navigation/events";
import { catalogEntityRegistry } from "./api/catalog-entity-registry";
import { dsn, isProduction } from "../common/vars";
import { CaptureConsole, Dedupe, Offline } from "@sentry/integrations";

// Initializing Sentry
const Sentry = require("@sentry/electron/dist/renderer");

Sentry.init({
  dsn,
  integrations: [
    new CaptureConsole({ levels: ["error"] }),
    new Dedupe(),
    new Offline()
  ],
  initialScope: {
    tags: {
      "process": "renderer",
      "rocess.env.NODE_ENV": process.env.NODE_ENV,
      "process.env.CICD": process.env.CICD
    }
  },
  environment: isProduction ? "production" : "development"
});

@observer
export class LensApp extends React.Component {
  static async init() {
    catalogEntityRegistry.init();
    ExtensionLoader.getInstance().loadOnClusterManagerRenderer();
    LensProtocolRouterRenderer.createInstance().init();
    bindProtocolAddRouteHandlers();

    window.addEventListener("offline", () => broadcastMessage("network:offline"));
    window.addEventListener("online", () => broadcastMessage("network:online"));

    registerIpcHandlers();
  }

  componentDidMount() {
    ipcRenderer.send(IpcRendererNavigationEvents.LOADED);
  }

  render() {
    return (
      <Router history={history}>
        <ErrorBoundary>
          <Switch>
            <Route component={ClusterManager} />
          </Switch>
        </ErrorBoundary>
        <Notifications />
        <ConfirmDialog />
        <CommandContainer />
      </Router>
    );
  }
}
