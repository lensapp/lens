import "./app.scss";

import React from "react";
import { render } from "react-dom";
import { Redirect, Route, Router, Switch } from "react-router";
import { observer } from "mobx-react";
import { I18nProvider } from '@lingui/react'
import { _i18n, i18nStore } from "../i18n";
import { browserHistory } from "../navigation";
import { Notifications } from "./notifications";
import { NotFound } from "./+404";
import { configStore } from "../config.store";
import { UserManagement } from "./+user-management/user-management";
import { ConfirmDialog } from "./confirm-dialog";
import { usersManagementRoute } from "./+user-management/user-management.routes";
import { clusterRoute, clusterURL } from "./+cluster";
import { Nodes, nodesRoute } from "./+nodes";
import { Workloads, workloadsRoute, workloadsURL } from "./+workloads";
import { Namespaces, namespacesRoute } from "./+namespaces";
import { Network, networkRoute } from "./+network";
import { Storage, storageRoute } from "./+storage";
import { Cluster } from "./+cluster/cluster";
import { Config, configRoute } from "./+config";
import { Events } from "./+events/events";
import { eventRoute } from "./+events";
import { ErrorBoundary } from "./error-boundary";
import { Apps, appsRoute } from "./+apps";
import { KubeObjectDetails } from "./kube-object/kube-object-details";
import { AddRoleBindingDialog } from "./+user-management-roles-bindings";
import { PodLogsDialog } from "./+workloads-pods/pod-logs-dialog";
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { CustomResources } from "./+custom-resources/custom-resources";
import { crdRoute } from "./+custom-resources";

@observer
class App extends React.Component {
  static rootElem = document.getElementById('app');

  static async init() {
    await i18nStore.init();
    await configStore.load();

    // render app
    render(<App/>, App.rootElem);
  };

  render() {
    const homeUrl = configStore.isClusterAdmin ? clusterURL() : workloadsURL();
    return (
      <I18nProvider i18n={_i18n}>
        <Router history={browserHistory}>
          <ErrorBoundary>
            <Switch>
              <Switch>
                <Route component={Cluster} {...clusterRoute}/>
                <Route component={Nodes} {...nodesRoute}/>
                <Route component={Workloads} {...workloadsRoute}/>
                <Route component={Config} {...configRoute}/>
                <Route component={Network} {...networkRoute}/>
                <Route component={Storage} {...storageRoute}/>
                <Route component={Namespaces} {...namespacesRoute}/>
                <Route component={Events} {...eventRoute}/>
                <Route component={CustomResources} {...crdRoute}/>
                <Route component={UserManagement} {...usersManagementRoute}/>
                <Route component={Apps} {...appsRoute}/>
                <Redirect exact from="/" to={homeUrl}/>
                <Route path="*" component={NotFound}/>
              </Switch>
            </Switch>
            <KubeObjectDetails/>
            <Notifications/>
            <ConfirmDialog/>
            <AddRoleBindingDialog/>
            <PodLogsDialog/>
            <DeploymentScaleDialog/>
          </ErrorBoundary>
        </Router>
      </I18nProvider>
    )
  }
}

// run app
App.init();
