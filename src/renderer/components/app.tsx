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
import { history } from "../navigation";
import { NotFound } from "./+404";
import { UserManagement } from "./+user-management/user-management";
import { ConfirmDialog } from "./confirm-dialog";
import { ClusterOverview } from "./+cluster/cluster-overview";
import { Events } from "./+events/events";
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { CronJobTriggerDialog } from "./+workloads-cronjobs/cronjob-trigger-dialog";
import { CustomResources } from "./+custom-resources/custom-resources";
import { isAllowedResource } from "../../common/utils/allowed-resource";
import logger from "../../main/logger";
import { webFrame } from "electron";
import { ClusterPageRegistry, getExtensionPageUrl } from "../../extensions/registries/page-registry";
import { ExtensionLoader } from "../../extensions/extension-loader";
import { appEventBus } from "../../common/event-bus";
import { requestMain } from "../../common/ipc";
import whatInput from "what-input";
import { clusterSetFrameIdHandler } from "../../common/cluster-ipc";
import { ClusterPageMenuRegistration, ClusterPageMenuRegistry } from "../../extensions/registries";
import { StatefulSetScaleDialog } from "./+workloads-statefulsets/statefulset-scale-dialog";
import { kubeWatchApi } from "../../common/k8s-api/kube-watch-api";
import { ReplicaSetScaleDialog } from "./+workloads-replicasets/replicaset-scale-dialog";
import { CommandContainer } from "./command-palette/command-container";
import { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
import { clusterContext } from "./context";
import * as routes from "../../common/routes";
import { TabLayout, TabLayoutRoute } from "./layout/tab-layout";
import { ErrorBoundary } from "./error-boundary";
import { MainLayout } from "./layout/main-layout";
import { Notifications } from "./notifications";
import { KubeObjectDetails } from "./kube-object-details";
import { KubeConfigDialog } from "./kubeconfig-dialog";
import { Terminal } from "./dock/terminal";
import { namespaceStore } from "./+namespaces/namespace.store";
import { Sidebar } from "./layout/sidebar";
import { Dock } from "./dock";
import { Apps } from "./+apps";
import { Namespaces } from "./+namespaces";
import { Network } from "./+network";
import { Nodes } from "./+nodes";
import { Workloads } from "./+workloads";
import { Config } from "./+config";
import { Storage } from "./+storage";
import { catalogEntityRegistry } from "../api/catalog-entity-registry";
import { getHostedClusterId } from "../utils";
import { ClusterStore } from "../../common/cluster-store";
import type { ClusterId } from "../../common/cluster-types";
import { watchHistoryState } from "../remote-helpers/history-updater";
import { unmountComponentAtNode } from "react-dom";
import { PortForwardDialog } from "../port-forward";
import { DeleteClusterDialog } from "./delete-cluster-dialog";

@observer
export class App extends React.Component {
  static clusterId: ClusterId;

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  static async init(rootElem: HTMLElement) {
    catalogEntityRegistry.init();
    const frameId = webFrame.routingId;

    App.clusterId = getHostedClusterId();

    logger.info(`[APP]: Init dashboard, clusterId=${App.clusterId}, frameId=${frameId}`);
    await Terminal.preloadFonts();
    await requestMain(clusterSetFrameIdHandler, App.clusterId);

    const cluster = ClusterStore.getInstance().getById(App.clusterId);

    await cluster.whenReady; // cluster.activate() is done at this point

    catalogEntityRegistry.activeEntity = App.clusterId;

    ExtensionLoader.getInstance().loadOnClusterRenderer();
    setTimeout(() => {
      appEventBus.emit({
        name: "cluster",
        action: "open",
        params: {
          clusterId: App.clusterId,
        },
      });
    });
    window.addEventListener("online", () => {
      window.location.reload();
    });

    window.onbeforeunload = () => {
      logger.info(`[APP]: Unload dashboard, clusterId=${App.clusterId}, frameId=${frameId}`);

      unmountComponentAtNode(rootElem);
    };

    whatInput.ask(); // Start to monitor user input device

    // Setup hosted cluster context
    KubeObjectStore.defaultContext.set(clusterContext);
    kubeWatchApi.context = clusterContext;
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([namespaceStore], {
        preload: true,
      }),

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
          <CommandContainer clusterId={App.clusterId}/>
        </ErrorBoundary>
      </Router>
    );
  }
}
