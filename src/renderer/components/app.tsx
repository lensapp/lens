import "./app.scss";
import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { autorun, computed, observable } from "mobx";
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
import { LandingPage, landingRoute } from "./+landing-page";
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

  @computed get clusterReady(): boolean {
    const cluster = getHostedCluster();
    if (cluster) {
      return cluster.initialized && cluster.accessible;
    }
  }

  async componentDidMount() {
    await clusterIpc.activate.invokeFromRenderer(); // refresh state, reconnect, etc.
    this.isReady = true;

    disposeOnUnmount(this, [
      autorun(() => {
        if (!this.clusterReady) {
          navigate(clusterStatusURL());
        } else if (clusterStatusURL() == navigation.getPath()) {
          navigate("/"); // redirect when cluster accessible
        }
      })
    ])
  }

  get startURL() {
    if (!this.clusterReady) {
      return clusterStatusURL();
    }
    if (isAllowedResource(["events", "nodes", "pods"])) {
      return clusterURL();
    }
    return workloadsURL();
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
