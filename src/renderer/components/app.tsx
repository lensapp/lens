/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Redirect, Route, Router, Switch } from "react-router";
import whatInput from "what-input";
import { setFrameId } from "../../common/cluster-ipc";
import { getHostedCluster } from "../../common/cluster-store";
import { getHostedClusterId } from "../../common/cluster-types";
import { appEventBus } from "../../common/event-bus";
import { requestMain } from "../../common/ipc";
import { ExtensionLoader } from "../../extensions/extension-loader";
import { ClusterPageMenuRegistration, ClusterPageMenuRegistry } from "../../extensions/registries";
import { ClusterPageRegistry, getExtensionPageUrl } from "../../extensions/registries/page-registry";
import type { Cluster } from "../../main/cluster";
import logger from "../../main/logger";
import { ApiManager } from "../api/api-manager";
import { podsApi, nodesApi, eventApi, namespacesApi } from "../api/endpoints";
import { KubeWatchApi } from "../api/kube-watch-api";
import { initApiManagerStores } from "../initializers/api-manager-stores";
import { history } from "../navigation";
import { NotFound } from "./+404";
import { Apps } from "./+apps";
import { ReleaseStore } from "./+apps-releases/release.store";
import { ClusterOverview } from "./+cluster/cluster-overview";
import { Config } from "./+config";
import { CustomResources } from "./+custom-resources/custom-resources";
import { Events } from "./+events/events";
import { Namespaces } from "./+namespaces";
import { Network } from "./+network";
import { Nodes } from "./+nodes";
import { Storage } from "./+storage";
import { AddRoleBindingDialog } from "./+user-management-roles-bindings";
import { UserManagement } from "./+user-management/user-management";
import { Workloads } from "./+workloads";
import { CronJobTriggerDialog } from "./+workloads-cronjobs/cronjob-trigger-dialog";
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { ReplicaSetScaleDialog } from "./+workloads-replicasets/replicaset-scale-dialog";
import { StatefulSetScaleDialog } from "./+workloads-statefulsets/statefulset-scale-dialog";
import { CommandContainer } from "./command-palette/command-container";
import { ConfirmDialog } from "./confirm-dialog";
import { Terminal } from "./dock/terminal";
import { ErrorBoundary } from "./error-boundary";
import { KubeObjectDetails } from "./kube-object/kube-object-details";
import { KubeConfigDialog } from "./kubeconfig-dialog/kubeconfig-dialog";
import { MainLayout } from "./layout/main-layout";
import { TabLayout, TabLayoutRoute } from "./layout/tab-layout";
import { Notifications } from "./notifications";
import * as routes from "../../common/routes";

@observer
export class ClusterFrame extends React.Component {
  static startUrl: string;
  static cluster: Cluster;

  static async init() {
    const frameId = Electron.webFrame.routingId;
    const clusterId = getHostedClusterId();

    logger.info(`[APP]: Init dashboard, clusterId=${clusterId}, frameId=${frameId}`);
    await Terminal.preloadFonts();
    await requestMain(setFrameId, clusterId);

    this.cluster = getHostedCluster();

    await this.cluster.whenReady; // cluster.activate() is done at this point

    this.startUrl = this.cluster.isAllowedResources("events", "nodes", "pods") ? routes.clusterURL() : routes.workloadsURL();

    ApiManager.createInstance(this.cluster);
    KubeWatchApi.createInstance(this.cluster);
    ReleaseStore.createInstance(this.cluster);
    initApiManagerStores();
    ExtensionLoader.getInstance().loadOnClusterRenderer();
    setTimeout(() => {
      appEventBus.emit({
        name: "cluster",
        action: "open",
        params: {
          clusterId
        }
      });
    });
    window.addEventListener("online", () => {
      window.location.reload();
    });
    whatInput.ask(); // Start to monitor user input device
  }

  componentDidMount() {
    const manager = ApiManager.getInstance();

    disposeOnUnmount(this, [
      KubeWatchApi.getInstance()
        .subscribeStores([
          manager.getStore(podsApi),
          manager.getStore(nodesApi),
          manager.getStore(eventApi),
          manager.getStore(namespacesApi),
        ], {
          preload: true,
        })
    ]);
  }

  getTabLayoutRoutes(menuItem: ClusterPageMenuRegistration) {
    const routes: TabLayoutRoute[] = [];

    if (!menuItem.id) {
      return routes;
    }
    ClusterPageMenuRegistry.getInstance().getSubItems(menuItem).forEach((subMenu) => {
      const page = ClusterPageRegistry.getInstance().getByPageTarget(subMenu.target);

      if (page) {
        routes.push({
          routePath: page.url,
          url: getExtensionPageUrl(subMenu.target),
          title: subMenu.title,
          component: page.components.Page,
        });
      }
    });

    return routes;
  }

  renderExtensionTabLayoutRoutes() {
    return ClusterPageMenuRegistry.getInstance().getRootItems().map((menu, index) => {
      const tabRoutes = this.getTabLayoutRoutes(menu);

      if (tabRoutes.length > 0) {
        const pageComponent = () => <TabLayout tabs={tabRoutes}/>;

        return <Route key={`extension-tab-layout-route-${index}`} component={pageComponent} path={tabRoutes.map((tab) => tab.routePath)}/>;
      } else {
        const page = ClusterPageRegistry.getInstance().getByPageTarget(menu.target);

        if (page) {
          return <Route key={`extension-tab-layout-route-${index}`} path={page.url} component={page.components.Page}/>;
        }
      }

      return null;
    });
  }

  renderExtensionRoutes() {
    return ClusterPageRegistry.getInstance().getItems().map((page, index) => {
      const menu = ClusterPageMenuRegistry.getInstance().getByPage(page);

      if (!menu) {
        return <Route key={`extension-route-${index}`} path={page.url} component={page.components.Page}/>;
      }

      return null;
    });
  }

  render() {
    return (
      <Router history={history}>
        <ErrorBoundary>
          <MainLayout>
            <Switch>
              <Route component={ClusterOverview} {...routes.clusterRoute}/>
              <Route component={Nodes} {...routes.nodesRoute}/>
              <Route component={Workloads} {...routes.workloadsRoute}/>
              <Route component={Config} {...routes.configRoute}/>
              <Route component={Network} {...routes.networkRoute}/>
              <Route component={Storage} {...routes.storageRoute}/>
              <Route component={Namespaces} {...routes.namespacesRoute}/>
              <Route component={Events} {...routes.eventRoute}/>
              <Route component={CustomResources} {...routes.crdRoute}/>
              <Route component={UserManagement} {...routes.usersManagementRoute}/>
              <Route component={Apps} {...routes.appsRoute}/>
              {this.renderExtensionTabLayoutRoutes()}
              {this.renderExtensionRoutes()}
              <Redirect exact from="/" to={ClusterFrame.startUrl}/>
              <Route component={NotFound}/>
            </Switch>
          </MainLayout>
          <Notifications/>
          <ConfirmDialog/>
          <KubeObjectDetails/>
          <KubeConfigDialog/>
          <AddRoleBindingDialog/>
          <DeploymentScaleDialog/>
          <StatefulSetScaleDialog/>
          <ReplicaSetScaleDialog/>
          <CronJobTriggerDialog/>
          <CommandContainer clusterId={getHostedCluster()?.id}/>
        </ErrorBoundary>
      </Router>
    );
  }
}
