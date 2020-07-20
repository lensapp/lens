import "./app.scss";
import React from "react";
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
import { AddCluster, addClusterRoute } from "./+add-cluster";
import { LandingPage, landingRoute, landingURL } from "./+landing-page";
import { clusterStore } from "../../common/cluster-store";
import { ClusterSettings, clusterSettingsRoute } from "./+cluster-settings";
import { Workspaces, workspacesRoute } from "./+workspaces";
import { ErrorBoundary } from "./error-boundary";

@observer
export class App extends React.Component {
  static async init() {
    await i18nStore.init();
    await configStore.init();
    await Terminal.preloadFonts();
  }

  get startURL() {
    if (!clusterStore.clusters.size) {
      return landingURL();
    }
    if (isAllowedResource(["events", "nodes", "pods"])) {
      return clusterURL();
    }
    return workloadsURL();
  }

  render() {
    return (
      <ErrorBoundary>
        <Switch>
          <Route component={LandingPage} {...landingRoute}/>
          <Route component={AddCluster} {...addClusterRoute}/>
          <Route component={Workspaces} {...workspacesRoute}/>
          <Route component={ClusterSettings} {...clusterSettingsRoute}/>
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
          <Redirect exact from="/" to={this.startURL}/>
          <Route component={NotFound}/>
        </Switch>
        <KubeObjectDetails/>
        <Notifications/>
        <ConfirmDialog/>
        <KubeConfigDialog/>
        <AddRoleBindingDialog/>
        <PodLogsDialog/>
        <DeploymentScaleDialog/>
      </ErrorBoundary>
    )
  }
}
