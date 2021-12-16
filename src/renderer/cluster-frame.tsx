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
import React from "react";
import { observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Redirect, Route, Router, Switch } from "react-router";
import { history } from "./navigation";
import { NotFound } from "./components/+404";
import { UserManagement } from "./components/+user-management/user-management";
import { ConfirmDialog } from "./components/confirm-dialog";
import { ClusterOverview } from "./components/+cluster/cluster-overview";
import { Events } from "./components/+events/events";
import { DeploymentScaleDialog } from "./components/+workloads-deployments/deployment-scale-dialog";
import { CronJobTriggerDialog } from "./components/+workloads-cronjobs/cronjob-trigger-dialog";
import { CustomResources } from "./components/+custom-resources/custom-resources";
import { isAllowedResource } from "../common/utils/allowed-resource";
import logger from "../main/logger";
import { webFrame } from "electron";
import { ClusterPageRegistry, getExtensionPageUrl } from "../extensions/registries/page-registry";
import type { ExtensionLoader } from "../extensions/extension-loader";
import { appEventBus } from "../common/event-bus";
import { requestMain } from "../common/ipc";
import { clusterSetFrameIdHandler } from "../common/cluster-ipc";
import { ClusterPageMenuRegistration, ClusterPageMenuRegistry } from "../extensions/registries";
import { StatefulSetScaleDialog } from "./components/+workloads-statefulsets/statefulset-scale-dialog";
import { KubeWatchApi, kubeWatchApi } from "../common/k8s-api/kube-watch-api";
import { ReplicaSetScaleDialog } from "./components/+workloads-replicasets/replicaset-scale-dialog";
import { CommandContainer } from "./components/command-palette/command-container";
import { KubeObjectStore } from "../common/k8s-api/kube-object.store";
import { FrameContext } from "./components/context";
import * as routes from "../common/routes";
import { TabLayout, TabLayoutRoute } from "./components/layout/tab-layout";
import { ErrorBoundary } from "./components/error-boundary";
import { MainLayout } from "./components/layout/main-layout";
import { Notifications } from "./components/notifications";
import { KubeObjectDetails } from "./components/kube-object-details";
import { KubeConfigDialog } from "./components/kubeconfig-dialog";
import { Terminal } from "./components/dock/terminal";
import { namespaceStore } from "./components/+namespaces/namespace.store";
import { Sidebar } from "./components/layout/sidebar";
import { Dock } from "./components/dock";
import { Apps } from "./components/+apps";
import { Namespaces } from "./components/+namespaces";
import { Network } from "./components/+network";
import { Nodes } from "./components/+nodes";
import { Workloads } from "./components/+workloads";
import { Config } from "./components/+config";
import { Storage } from "./components/+storage";
import { catalogEntityRegistry } from "./api/catalog-entity-registry";
import { getHostedClusterId } from "./utils";
import { ClusterStore } from "../common/cluster-store";
import type { ClusterId } from "../common/cluster-types";
import { watchHistoryState } from "./remote-helpers/history-updater";
import { unmountComponentAtNode } from "react-dom";
import { PortForwardDialog } from "./port-forward";
import { DeleteClusterDialog } from "./components/delete-cluster-dialog";
import { WorkloadsOverview } from "./components/+workloads-overview/overview";
import { KubeObjectListLayout } from "./components/kube-object-list-layout";

@observer
export class ClusterFrame extends React.Component {
  static clusterId: ClusterId;
  static readonly logPrefix = "[CLUSTER-FRAME]:";
  static displayName = "ClusterFrame";

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  static async init(rootElem: HTMLElement, extensionLoader: ExtensionLoader) {
    catalogEntityRegistry.init();
    const frameId = webFrame.routingId;

    ClusterFrame.clusterId = getHostedClusterId();

    const cluster = ClusterStore.getInstance().getById(ClusterFrame.clusterId);

    logger.info(`${ClusterFrame.logPrefix} Init dashboard, clusterId=${ClusterFrame.clusterId}, frameId=${frameId}`);
    await Terminal.preloadFonts();
    await requestMain(clusterSetFrameIdHandler, ClusterFrame.clusterId);
    await cluster.whenReady; // cluster.activate() is done at this point

    catalogEntityRegistry.activeEntity = ClusterFrame.clusterId;

    extensionLoader.loadOnClusterRenderer();

    setTimeout(() => {
      appEventBus.emit({
        name: "cluster",
        action: "open",
        params: {
          clusterId: ClusterFrame.clusterId,
        },
      });
    });
    window.addEventListener("online", () => {
      window.location.reload();
    });

    window.onbeforeunload = () => {
      logger.info(`${ClusterFrame.logPrefix} Unload dashboard, clusterId=${ClusterFrame.clusterId}, frameId=${frameId}`);

      unmountComponentAtNode(rootElem);
    };

    const clusterContext = new FrameContext(cluster);

    // Setup hosted cluster context
    KubeObjectStore.defaultContext.set(clusterContext);
    WorkloadsOverview.clusterContext
      = KubeObjectListLayout.clusterContext
      = KubeWatchApi.context
      = clusterContext;
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([
        namespaceStore,
      ]),

      watchHistoryState(),
    ]);
  }

  @observable startUrl = isAllowedResource(["events", "nodes", "pods"]) ? routes.clusterURL() : routes.workloadsURL();

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
          <MainLayout sidebar={<Sidebar/>} footer={<Dock/>}>
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
              <Redirect exact from="/" to={this.startUrl}/>
              <Route component={NotFound}/>
            </Switch>
          </MainLayout>
          <Notifications/>
          <ConfirmDialog/>
          <KubeObjectDetails/>
          <KubeConfigDialog/>
          <DeploymentScaleDialog/>
          <StatefulSetScaleDialog/>
          <ReplicaSetScaleDialog/>
          <CronJobTriggerDialog/>
          <PortForwardDialog/>
          <DeleteClusterDialog/>
          <CommandContainer clusterId={ClusterFrame.clusterId}/>
        </ErrorBoundary>
      </Router>
    );
  }
}
