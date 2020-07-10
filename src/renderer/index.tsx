import "../common/system-ca"
import React from "react";
import { render } from "react-dom";
import { Router } from "react-router";
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { clusterStore } from "../common/cluster-store";
import { I18nProvider } from "@lingui/react";
import { browserHistory } from "./navigation";
import { _i18n } from "./i18n";
import { App } from "./components/app";
import { ClusterManager } from "./components/cluster-manager";
import { ErrorBoundary } from "./components/error-boundary";

class LensApp extends React.Component {
  static async init() {
    await Promise.all([
      userStore.load(),
      workspaceStore.load(),
      clusterStore.load(),
    ]);
    await App.init();
    render(<LensApp/>, App.rootElem);
  }

  render() {
    return (
      <I18nProvider i18n={_i18n}>
        <Router history={browserHistory}>
          <ErrorBoundary>
            <ClusterManager>
              <App/>
            </ClusterManager>
          </ErrorBoundary>
        </Router>
      </I18nProvider>
    )
  }
}

window.addEventListener("load", LensApp.init);
