import "./app.scss";
import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { observable, reaction } from "mobx";
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
import { isAllowedResource } from "../../common/rbac";
import { AddCluster, addClusterRoute } from "./+add-cluster";
import { LandingPage, landingRoute, landingURL } from "./+landing-page";
import { ClusterSettings, clusterSettingsRoute } from "./+cluster-settings";
import { Workspaces, workspacesRoute } from "./+workspaces";
import { ErrorBoundary } from "./error-boundary";
import { clusterIpc } from "../../common/cluster-ipc";
import { getHostedCluster } from "../../common/cluster-store";
import { clusterStatusRoute, clusterStatusURL } from "./cluster-manager/cluster-status.route";
import { Preferences, preferencesRoute } from "./+preferences";
import { ClusterStatus } from "./cluster-manager/cluster-status";
import { CubeSpinner } from "./spinner";
import { navigate, navigation } from "../navigation";

@observer
export class App extends React.Component {
  @observable isReady = false;

  get cluster() {
    return getHostedCluster()
  }

  async componentDidMount() {
    if (this.cluster) {
      await clusterIpc.activate.invokeFromRenderer(); // refresh state, reconnect, etc.
      disposeOnUnmount(this, [
        reaction(() => this.cluster.accessible, this.onClusterAccessChange, {
          fireImmediately: true
        })
      ])
    }
    this.isReady = true;
  }

  protected onClusterAccessChange = (accessible: boolean) => {
    const path = navigation.getPath();
    if (!accessible || path === "/") {
      navigate(this.startURL);
    }
  }

  get startURL() {
    if (this.cluster) {
      if (!this.cluster.accessible) {
        return clusterStatusURL();
      }
      if (isAllowedResource(["events", "nodes", "pods"])) {
        return clusterURL();
      }
      return workloadsURL();
    }
    return landingURL();
  }

  render() {
    if (!this.isReady) {
      return <CubeSpinner className="box center"/>
    }
    return (
      <ErrorBoundary>
        <Switch>
          <Route component={LandingPage} {...landingRoute}/>
          <Route component={Preferences} {...preferencesRoute}/>
          <Route component={Workspaces} {...workspacesRoute}/>
          <Route component={AddCluster} {...addClusterRoute}/>
          <Route component={Cluster} {...clusterRoute}/>
          <Route component={ClusterStatus} {...clusterStatusRoute}/>
          <Route component={ClusterSettings} {...clusterSettingsRoute}/>
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
