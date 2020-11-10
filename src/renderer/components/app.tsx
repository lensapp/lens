import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Router, Switch } from "react-router";
import { I18nProvider } from "@lingui/react";
import { _i18n } from "../i18n";
import { history } from "../navigation";
import { Notifications } from "./notifications";
import { NotFound } from "./+404";
import { UserManagement } from "./+user-management/user-management";
import { ConfirmDialog } from "./confirm-dialog";
import { usersManagementRoute } from "./+user-management/user-management.route";
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
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { CronJobTriggerDialog } from "./+workloads-cronjobs/cronjob-trigger-dialog";
import { CustomResources } from "./+custom-resources/custom-resources";
import { crdRoute } from "./+custom-resources";
import { isAllowedResource } from "../../common/rbac";
import { MainLayout } from "./layout/main-layout";
import { ErrorBoundary } from "./error-boundary";
import { Terminal } from "./dock/terminal";
import { getHostedCluster, getHostedClusterId } from "../../common/cluster-store";
import logger from "../../main/logger";
import { clusterIpc } from "../../common/cluster-ipc";
import { webFrame } from "electron";
import { clusterPageRegistry } from "../../extensions/registries/page-registry";
import { DynamicPage } from "../../extensions/dynamic-page";
import { extensionLoader } from "../../extensions/extension-loader";
import { appEventBus } from "../../common/event-bus";
import whatInput from 'what-input';

@observer
export class App extends React.Component {
  static async init() {
    const frameId = webFrame.routingId;
    const clusterId = getHostedClusterId();
    logger.info(`[APP]: Init dashboard, clusterId=${clusterId}, frameId=${frameId}`)
    await Terminal.preloadFonts()

    await clusterIpc.setFrameId.invokeFromRenderer(clusterId, frameId);
    await getHostedCluster().whenReady; // cluster.activate() is done at this point
    extensionLoader.loadOnClusterRenderer();
    appEventBus.emit({name: "cluster", action: "open", params: {
      clusterId: clusterId
    }})
    window.addEventListener("online", () => {
      window.location.reload()
    })
    whatInput.ask() // Start to monitor user input device
  }

  get startURL() {
    if (isAllowedResource(["events", "nodes", "pods"])) {
      return clusterURL();
    }
    return workloadsURL();
  }

  render() {
    return (
      <I18nProvider i18n={_i18n}>
        <Router history={history}>
          <ErrorBoundary>
            <MainLayout>
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
                {clusterPageRegistry.getItems().map(page => {
                  return <Route {...page} key={String(page.path)} render={() => <DynamicPage page={page}/>}/>
                })}
                <Redirect exact from="/" to={this.startURL}/>
                <Route component={NotFound}/>
              </Switch></MainLayout>
            <Notifications/>
            <ConfirmDialog/>
            <KubeObjectDetails/>
            <KubeConfigDialog/>
            <AddRoleBindingDialog/>
            <DeploymentScaleDialog/>
            <CronJobTriggerDialog/>
          </ErrorBoundary>
        </Router>
      </I18nProvider>
    )
  }
}
