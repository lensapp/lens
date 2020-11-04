import "../common/system-ca"
import React from "react";
import { ipcRenderer } from "electron";
import { Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { userStore } from "../common/user-store";
import { I18nProvider } from "@lingui/react";
import { history } from "./navigation";
import { _i18n } from "./i18n";
import { ClusterManager } from "./components/cluster-manager";
import { ErrorBoundary } from "./components/error-boundary";
import { WhatsNew, whatsNewRoute } from "./components/+whats-new";
import { Notifications } from "./components/notifications";
import { ConfirmDialog } from "./components/confirm-dialog";
import { extensionLoader } from "../extensions/extension-loader";

@observer
export class LensApp extends React.Component {
  static async init() {
    extensionLoader.loadOnClusterManagerRenderer();
    window.addEventListener("offline", () => {
      ipcRenderer.send("network:offline")
    })
    window.addEventListener("online", () => {
      ipcRenderer.send("network:online")
    })
  }

  render() {
    return (
      <I18nProvider i18n={_i18n}>
        <Router history={history}>
          <ErrorBoundary>
            <Switch>
              {userStore.isNewVersion && <Route component={WhatsNew}/>}
              <Route component={WhatsNew} {...whatsNewRoute}/>
              <Route component={ClusterManager}/>
            </Switch>
          </ErrorBoundary>
          <Notifications/>
          <ConfirmDialog/>
        </Router>
      </I18nProvider>
    )
  }
}
