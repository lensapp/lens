/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Redirect, Route, Router, Switch } from "react-router";
import { UserManagementLayout } from "../../components/+user-management/layout";
import { ClusterOverview } from "../../components/+cluster/overview";
import { Events } from "../../components/+events/events";
import { ClusterPageRegistry, getExtensionPageUrl } from "../../../extensions/registries/page-registry";
import { ClusterPageMenuRegistration, ClusterPageMenuRegistry } from "../../../extensions/registries";
import { CommandContainer } from "../../components/command-palette/command-container";
import * as routes from "../../../common/routes";
import { TabLayout, TabLayoutRoute } from "../../components/layout/tab-layout";
import { ErrorBoundary } from "../../components/error-boundary";
import { MainLayout } from "../../components/layout/main-layout";
import { Notifications } from "../../components/notifications";
import { KubeObjectDetails } from "../../components/kube-object-details";
import { KubeConfigDialog } from "../../components/kubeconfig-dialog";
import { Sidebar } from "../../components/layout/sidebar";
import { Namespaces } from "../../components/+namespaces";
import { Nodes } from "../../components/+nodes";
import { watchHistoryState } from "../../remote-helpers/history-updater";
import { PortForwardDialog } from "../../port-forward";
import { DeleteClusterDialog } from "../../components/delete-cluster-dialog";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ClusterId } from "../../../common/cluster-types";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import type { NamespaceStore } from "../../components/+namespaces/store";
import type { KubeResource } from "../../../common/rbac";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import hostedClusterInjectable from "../../../common/cluster-store/hosted-cluster/hosted-cluster.injectable";
import { CronJobTriggerDialog } from "../../components/+cronjobs/trigger-dialog";
import { DeploymentScaleDialog } from "../../components/+deployments/scale-dialog";
import namespaceStoreInjectable from "../../components/+namespaces/store.injectable";
import { ReplicaSetScaleDialog } from "../../components/+replica-sets/scale-dialog";
import { StatefulSetScaleDialog } from "../../components/+stateful-sets/scale-dialog";
import { WorkloadsLayout } from "../../components/+workloads/layout";
import { ConfigLayout } from "../../components/+config/layout";
import { NetworkLayout } from "../../components/+network/layout";
import { StorageLayout } from "../../components/+storage/layout";
import { CustomResourcesLayout } from "../../components/+custom-resource/layout";
import { HelmAppsLayout } from "../../components/+helm-apps/layout";
import { Dock } from "../../components/dock/dock";
import historyInjectable from "../../navigation/history.injectable";
import type { History } from "history";
import { ConfirmDialog } from "../../components/confirm-dialog";
interface Dependencies {
  history: History;
  namespaceStore: NamespaceStore;
  hostedClusterId: ClusterId;
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  isAllowedResource: (resource: KubeResource | KubeResource[]) => boolean;
}

@observer
class NonInjectedClusterFrame extends React.Component<Dependencies> {
  static displayName = "ClusterFrame";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.namespaceStore,
      ]),

      watchHistoryState(),
    ]);
  }

  @observable startUrl = this.props.isAllowedResource(["events", "nodes", "pods"]) ? routes.clusterURL() : routes.workloadsURL();

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
      <Router history={this.props.history}>
        <ErrorBoundary>
          <MainLayout sidebar={<Sidebar />} footer={<Dock />}>
            <Switch>

              <Route component={ClusterOverview} {...routes.clusterRoute}/>
              <Route component={Nodes} {...routes.nodesRoute}/>
              <Route component={WorkloadsLayout} {...routes.workloadsRoute}/>
              <Route component={ConfigLayout} {...routes.configRoute}/>
              <Route component={NetworkLayout} {...routes.networkRoute}/>
              <Route component={StorageLayout} {...routes.storageRoute}/>
              <Route component={Namespaces} {...routes.namespacesRoute}/>
              <Route component={Events} {...routes.eventRoute}/>
              <Route component={CustomResourcesLayout} {...routes.crdRoute}/>
              <Route component={UserManagementLayout} {...routes.usersManagementRoute}/>
              <Route component={HelmAppsLayout} {...routes.appsRoute}/>
              {this.renderExtensionTabLayoutRoutes()}
              {this.renderExtensionRoutes()}
              <Redirect exact from="/" to={this.startUrl}/>

              <Route render={({ location }) => {
                Notifications.error(`Unknown location ${location.pathname}, redirecting to main page.`);

                return <Redirect to={this.startUrl} />;
              }} />

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
          <CommandContainer clusterId={this.props.hostedClusterId}/>
        </ErrorBoundary>
      </Router>
    );
  }
}

export const ClusterFrame = withInjectables<Dependencies>(NonInjectedClusterFrame, {
  getProps: di => ({
    history: di.inject(historyInjectable),
    namespaceStore: di.inject(namespaceStoreInjectable),
    hostedClusterId: di.inject(hostedClusterInjectable).id,
    subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
});
