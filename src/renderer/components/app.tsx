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
import { webFrame } from "electron";
import { clusterPageRegistry, getExtensionPageUrl, PageRegistration, RegisteredPage } from "../../extensions/registries/page-registry";
import { extensionLoader } from "../../extensions/extension-loader";
import { appEventBus } from "../../common/event-bus";
import { requestMain } from "../../common/ipc";
import whatInput from 'what-input';
import { clusterSetFrameIdHandler } from "../../common/cluster-ipc";
import { ClusterPageMenuRegistration, clusterPageMenuRegistry } from "../../extensions/registries";
import { TabLayoutRoute, TabLayout } from "./layout/tab-layout";
import { Trans } from "@lingui/macro";
import {StatefulSetScaleDialog} from "./+workloads-statefulsets/statefulset-scale-dialog";

@observer
export class App extends React.Component {
  static async init() {
    const frameId = webFrame.routingId;
    const clusterId = getHostedClusterId();
    logger.info(`[APP]: Init dashboard, clusterId=${clusterId}, frameId=${frameId}`);
    await Terminal.preloadFonts();

    await requestMain(clusterSetFrameIdHandler, clusterId, frameId);
    await getHostedCluster().whenReady; // cluster.activate() is done at this point
    extensionLoader.loadOnClusterRenderer();
    appEventBus.emit({
      name: "cluster",
      action: "open",
      params: {
        clusterId
      }
    });
    window.addEventListener("online", () => {
      window.location.reload();
    });
    whatInput.ask(); // Start to monitor user input device
  }

  get startURL() {
    if (isAllowedResource(["events", "nodes", "pods"])) {
      return clusterURL();
    }
    return workloadsURL();
  }

  getTabLayoutRoutes(menuItem: ClusterPageMenuRegistration) {
    const routes: TabLayoutRoute[] = [];
    if (!menuItem.id) {
      return routes;
    }
    clusterPageMenuRegistry.getSubItems(menuItem).forEach((item) => {
      const page = clusterPageRegistry.getByPageMenuTarget(item.target);
      if (page) {
        routes.push({
          routePath: page.routePath,
          url: getExtensionPageUrl({ extensionId: page.extensionId, pageId: page.id, params: item.target.params }),
          title: item.title,
          component: page.components.Page,
          exact: page.exact
        });
      }
    });
    return routes;
  }

  renderExtensionTabLayoutRoutes() {
    return clusterPageMenuRegistry.getRootItems().map((menu, index) => {
      const tabRoutes = this.getTabLayoutRoutes(menu);
      if (tabRoutes.length > 0) {
        const pageComponent = () => <TabLayout tabs={tabRoutes} />;
        return <Route key={"extension-tab-layout-route-" + index} component={pageComponent} path={tabRoutes.map((tab) => tab.routePath)} />;
      } else {
        const page = clusterPageRegistry.getByPageMenuTarget(menu.target);
        if (page) {
          const pageComponent = () => <page.components.Page />;
          return <Route key={"extension-tab-layout-route-" + index} path={page.routePath} exact={page.exact} component={pageComponent}/>;
        }
      }
    });
  }

  renderExtensionRoutes() {
    return clusterPageRegistry.getItems().map((page, index) => {
      const menu = clusterPageMenuRegistry.getByPage(page);
      if (!menu) {
        return <Route key={"extension-route-" + index} path={page.routePath} exact={page.exact} component={page.components.Page}/>;
      }
    });
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
                {this.renderExtensionTabLayoutRoutes()}
                {this.renderExtensionRoutes()}
                <Redirect exact from="/" to={this.startURL}/>
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
            <CronJobTriggerDialog/>
          </ErrorBoundary>
        </Router>
      </I18nProvider>
    );
  }
}
