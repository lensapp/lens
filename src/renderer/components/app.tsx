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
import { webFrame } from "electron";
import { disposeOnUnmount, observer } from "mobx-react";
import { Redirect, Route, Router, Switch } from "react-router";
import whatInput from "what-input";

import { clusterSetFrameIdHandler } from "../../common/cluster-ipc";
import { getHostedCluster, getHostedClusterId } from "../../common/cluster-store";
import { appEventBus } from "../../common/event-bus";
import { requestMain } from "../../common/ipc";
import { isAllowedResource } from "../../common/rbac";
import { ExtensionLoader } from "../../extensions/extension-loader";
import { ClusterPageMenuRegistration, clusterPageMenuRegistry } from "../../extensions/registries";
import { clusterPageRegistry, getExtensionPageUrl } from "../../extensions/registries/page-registry";
import logger from "../../main/logger";
import { kubeWatchApi } from "../api/kube-watch-api";
import { KubeObjectStore } from "../kube-object.store";
import { history } from "../navigation";
import { NotFound } from "./+404";
import { Apps, appsRoute } from "./+apps";
import { clusterRoute, clusterURL } from "./+cluster";
import { ClusterOverview } from "./+cluster/cluster-overview";
import { Config, configRoute } from "./+config";
import { crdRoute } from "./+custom-resources";
import { CustomResources } from "./+custom-resources/custom-resources";
import { eventRoute } from "./+events";
import { eventStore } from "./+events/event.store";
import { Events } from "./+events/events";
import { Namespaces, namespacesRoute } from "./+namespaces";
import { namespaceStore } from "./+namespaces/namespace.store";
import { Network, networkRoute } from "./+network";
import { Nodes, nodesRoute } from "./+nodes";
import { nodesStore } from "./+nodes/nodes.store";
import { Storage, storageRoute } from "./+storage";
import { UserManagement } from "./+user-management/user-management";
import { usersManagementRoute } from "./+user-management/user-management.route";
import { Workloads, workloadsRoute, workloadsURL } from "./+workloads";
import { CronJobTriggerDialog } from "./+workloads-cronjobs/cronjob-trigger-dialog";
import { DeploymentScaleDialog } from "./+workloads-deployments/deployment-scale-dialog";
import { podsStore } from "./+workloads-pods/pods.store";
import { ReplicaSetScaleDialog } from "./+workloads-replicasets/replicaset-scale-dialog";
import { StatefulSetScaleDialog } from "./+workloads-statefulsets/statefulset-scale-dialog";
import { CommandContainer } from "./command-palette/command-container";
import { ConfirmDialog } from "./confirm-dialog";
import { clusterContext } from "./context";
import { Terminal } from "./dock/terminal";
import { ErrorBoundary } from "./error-boundary";
import { KubeObjectDetails } from "./kube-object/kube-object-details";
import { KubeConfigDialog } from "./kubeconfig-dialog/kubeconfig-dialog";
import { MainLayout } from "./layout/main-layout";
import { TabLayout, TabLayoutRoute } from "./layout/tab-layout";
import { Notifications } from "./notifications";

@observer
export class App extends React.Component {
  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  static async init() {
    const frameId = webFrame.routingId;
    const clusterId = getHostedClusterId();

    logger.info(`[APP]: Init dashboard, clusterId=${clusterId}, frameId=${frameId}`);
    await Terminal.preloadFonts();

    await requestMain(clusterSetFrameIdHandler, clusterId);
    await getHostedCluster().whenReady; // cluster.activate() is done at this point
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

    // Setup hosted cluster context
    KubeObjectStore.defaultContext.set(clusterContext);
    kubeWatchApi.context = clusterContext;
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([podsStore, nodesStore, eventStore, namespaceStore], {
        preload: true,
      })
    ]);
  }

  @observable startUrl = isAllowedResource(["events", "nodes", "pods"]) ? clusterURL() : workloadsURL();

  getTabLayoutRoutes(menuItem: ClusterPageMenuRegistration) {
    const routes: TabLayoutRoute[] = [];

    if (!menuItem.id) {
      return routes;
    }
    clusterPageMenuRegistry.getSubItems(menuItem).forEach((subMenu) => {
      const page = clusterPageRegistry.getByPageTarget(subMenu.target);

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
    return clusterPageMenuRegistry.getRootItems().map((menu, index) => {
      const tabRoutes = this.getTabLayoutRoutes(menu);

      if (tabRoutes.length > 0) {
        const pageComponent = () => <TabLayout tabs={tabRoutes}/>;

        return <Route key={`extension-tab-layout-route-${index}`} component={pageComponent} path={tabRoutes.map((tab) => tab.routePath)}/>;
      } else {
        const page = clusterPageRegistry.getByPageTarget(menu.target);

        if (page) {
          return <Route key={`extension-tab-layout-route-${index}`} path={page.url} component={page.components.Page}/>;
        }
      }

      return null;
    });
  }

  renderExtensionRoutes() {
    return clusterPageRegistry.getItems().map((page, index) => {
      const menu = clusterPageMenuRegistry.getByPage(page);

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
              <Route component={ClusterOverview} {...clusterRoute}/>
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
          <CommandContainer clusterId={getHostedCluster()?.id}/>
        </ErrorBoundary>
      </Router>
    );
  }
}
