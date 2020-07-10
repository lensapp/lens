import "./app.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { i18nStore } from "../i18n";
import { configStore } from "../config.store";
import { Terminal } from "./dock/terminal";
import { Redirect, Route, Switch } from "react-router";
import { Notifications } from "./notifications";
import { NotFound } from "./+404";
import { UserManagement } from "./+user-management/user-management";
import { ConfirmDialog } from "./confirm-dialog";
import { usersManagementRoute } from "./+user-management/user-management.routes";
import { clusterRoute, clusterURL } from "./+cluster";
import { KubeConfigDialog } from "./kubeconfig-dialog/kubeconfig-dialog";
import { Nodes, nodesRoute } from "./+nodes";
import { Workloads, workloadsRoute, workloadsURL } from "./+workloads";
import { Namespaces, namespacesRoute } from "./+namespaces";
import { Network, networkRoute } from "./+network";
import { Storage, storageRoute } from "./+storage";
import { Cluster } from "./+cluster/cluster";
import { Config, configRoute } from "./+config";
import { Events } from "./+events/events";
import { eventRoute } from "./+events";
import { Apps, appsRoute } from "./+apps";
import { KubeObjectDetails } from "./kube-object/kube-object-details";
import { AddRoleBindingDialog } from "./+user-management-roles-bindings";
import { PodLogsDialog } from "./+workloads-pods/pod-logs-dialog";
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { CustomResources } from "./+custom-resources/custom-resources";
import { crdRoute } from "./+custom-resources";
import { isAllowedResource } from "../api/rbac";

@observer
export class App extends React.Component {
  static rootElem = document.getElementById('app');

  static async init() {
    await i18nStore.init();
    await configStore.init();
    await Terminal.preloadFonts();
  }

  render() {
    const homeUrl = isAllowedResource(["events", "nodes", "pods"]) ? clusterURL() : workloadsURL();
    return (
      <Fragment>
        <Switch>
          <Switch>
            {/* todo: remove */}
            <Route children={() => <p className="info">App is running!</p>}/>

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
        <KubeConfigDialog/>
        <AddRoleBindingDialog/>
        <PodLogsDialog/>
        <DeploymentScaleDialog/>
      </Fragment>
    )
  }
}
