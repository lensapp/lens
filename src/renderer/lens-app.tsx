import "../common/system-ca";
import React from "react";
import { Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { userStore } from "../common/user-store";
import { history } from "./navigation";
import { ClusterManager } from "./components/cluster-manager";
import { ErrorBoundary } from "./components/error-boundary";
import { WhatsNew, whatsNewRoute } from "./components/+whats-new";
import { Notifications } from "./components/notifications";
import { ConfirmDialog } from "./components/confirm-dialog";
import { extensionLoader } from "../extensions/extension-loader";
import { broadcastMessage } from "../common/ipc";
import { CommandContainer } from "./components/command-palette/command-container";
import { LensProtocolRouterRenderer, bindProtocolAddRouteHandlers } from "./protocol-handler";
import { registerIpcHandlers } from "./ipc";
import { ipcRenderer } from "electron";
import { CacheProvider } from "@emotion/react";
import { IpcRendererNavigationEvents } from "./navigation/events";
import createCache from "@emotion/cache";

@observer
export class LensApp extends React.Component {
  static async init() {
    extensionLoader.loadOnClusterManagerRenderer();
    LensProtocolRouterRenderer.getInstance<LensProtocolRouterRenderer>().init();
    bindProtocolAddRouteHandlers();
    window.addEventListener("offline", () => {
      broadcastMessage("network:offline");
    });
    window.addEventListener("online", () => {
      broadcastMessage("network:online");
    });

    registerIpcHandlers();
    ipcRenderer.send(IpcRendererNavigationEvents.LOADED);
  }

  render() {
    return (
      <Router history={history}>
        <CacheProvider value={createCache({ key: "app" })}>
          <ErrorBoundary>
            <Switch>
              {userStore.isNewVersion && <Route component={WhatsNew}/>}
              <Route component={WhatsNew} {...whatsNewRoute}/>
              <Route component={ClusterManager}/>
            </Switch>
          </ErrorBoundary>
          <Notifications/>
          <ConfirmDialog/>
          <CommandContainer />
        </CacheProvider>
      </Router>
    );
  }
}
