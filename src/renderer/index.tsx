// todo: remove when app.tsx re-used
import "./components/app.scss"
import "./theme.store";

import "../common/system-ca"
import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router";
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { clusterStore } from "../common/cluster-store";
import { Workspaces } from "./components/+workspaces/workspaces";
import { I18nProvider } from "@lingui/react";
import { _i18n } from "./i18n";
import { browserHistory } from "./navigation";

class App extends React.Component {
  static async init() {
    await Promise.all([
      userStore.load(),
      workspaceStore.load(),
      clusterStore.load(),
    ]);
    ReactDOM.render(<App/>, document.getElementById("app"),)
  }

  render() {
    return (
      <I18nProvider i18n={_i18n}>
        <Router history={browserHistory}>
          <Workspaces/>
        </Router>
      </I18nProvider>
    )
  }
}

window.addEventListener("load", App.init);
