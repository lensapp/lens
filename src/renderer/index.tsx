import "../common/system-ca"
import React from "react";
import { render } from "react-dom";
import { Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { clusterStore } from "../common/cluster-store";
import { I18nProvider } from "@lingui/react";
import { history } from "./navigation";
import { isMac } from "../common/vars";
import { _i18n } from "./i18n";
import { ClusterManager } from "./components/cluster-manager";
import { ErrorBoundary } from "./components/error-boundary";
import { WhatsNew, whatsNewRoute } from "./components/+whats-new";

@observer
class LensApp extends React.Component {
  static async init() {
    const rootElem = document.getElementById("app");
    rootElem.classList.toggle("is-mac", isMac);
    await Promise.all([
      userStore.load(),
      workspaceStore.load(),
      clusterStore.load(),
    ]);
    await ClusterManager.init();
    render(<LensApp/>, rootElem);
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
        </Router>
      </I18nProvider>
    )
  }
}

// run
LensApp.init();
