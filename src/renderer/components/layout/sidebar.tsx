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

import "./sidebar.scss";
import type { TabLayoutRoute } from "./tab-layout";

import React from "react";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { Config } from "../+config";
import { Apps } from "../+apps";
import { namespaceUrlParam } from "../+namespaces/namespace.store";
import { Workloads } from "../+workloads";
import { UserManagement } from "../+user-management";
import { Storage } from "../+storage";
import { Network } from "../+network";
import { CustomResources } from "../+custom-resources/custom-resources";
import { isActiveRoute } from "../../navigation";
import { Spinner } from "../spinner";
import * as registries from "../../../extensions/registries";
import { SidebarItem } from "./sidebar-item";
import * as routes from "../../../common/routes";
import { getHostedCluster } from "../../../common/cluster-store";
import type { Cluster } from "../../../main/cluster";
import type { CrdStore } from "../+custom-resources";
import { ApiManager } from "../../api/api-manager";
import { crdApi } from "../../api/endpoints";

interface Props {
  className?: string;
  compact?: boolean; // compact-mode view: show only icons and expand on :hover
  toggle(): void; // compact-mode updater
}

interface SubTabs {
  tabRoutes(cluster: Cluster): TabLayoutRoute[];
}

interface ClusterScopedRenderArgs {
  className: string;
  text: string;
  isActive: boolean;
  url: string;
  icon: JSX.Element;
  component: React.ComponentType & SubTabs;
  additional?: () => React.ReactNode;
}

@observer
export class Sidebar extends React.Component<Props> {
  private get crdStore() {
    return ApiManager.getInstance().getStore<CrdStore>(crdApi);
  }

  static displayName = "Sidebar";
  cluster: Cluster;

  async componentDidMount() {
    this.crdStore.reloadAll();
    this.cluster = getHostedCluster();
  }

  renderCustomResources() {
    if (this.crdStore.isLoading) {
      return (
        <div className="flex justify-center">
          <Spinner />
        </div>
      );
    }

    return Object.entries(this.crdStore.groups).map(([group, crds]) => {
      const id = `crd-group:${group}`;
      const crdGroupsPageUrl = routes.crdURL({ query: { groups: group } });

      return (
        <SidebarItem key={id} id={id} text={group} url={crdGroupsPageUrl}>
          {crds.map((crd) => (
            <SidebarItem
              key={crd.getResourceApiBase()}
              id={`crd-resource:${crd.getResourceApiBase()}`}
              url={crd.getResourceUrl()}
              text={crd.getResourceTitle()}
            />
          ))}
        </SidebarItem>
      );
    });
  }

  renderTreeFromTabRoutes(tabRoutes: TabLayoutRoute[] = []): React.ReactNode {
    if (!tabRoutes.length) {
      return null;
    }

    return tabRoutes.map(({ title, routePath, url = routePath, exact = true }) => {
      const subMenuItemId = `tab-route-item-${url}`;

      return (
        <SidebarItem
          key={subMenuItemId}
          id={subMenuItemId}
          url={url}
          text={title}
          isActive={isActiveRoute({ path: routePath, exact })}
        />
      );
    });
  }

  getTabLayoutRoutes(menu: registries.ClusterPageMenuRegistration): TabLayoutRoute[] {
    const routes: TabLayoutRoute[] = [];

    if (!menu.id) {
      return routes;
    }

    registries.ClusterPageMenuRegistry.getInstance().getSubItems(menu).forEach((subMenu) => {
      const subPage = registries.ClusterPageRegistry.getInstance().getByPageTarget(subMenu.target);

      if (subPage) {
        const { extensionId, id: pageId } = subPage;

        routes.push({
          routePath: subPage.url,
          url: registries.getExtensionPageUrl({ extensionId, pageId, params: subMenu.target.params }),
          title: subMenu.title,
          component: subPage.components.Page,
        });
      }
    });

    return routes;
  }

  renderRegisteredMenus() {
    return registries.ClusterPageMenuRegistry.getInstance().getRootItems().map((menuItem, index) => {
      const registeredPage = registries.ClusterPageRegistry.getInstance().getByPageTarget(menuItem.target);
      const tabRoutes = this.getTabLayoutRoutes(menuItem);
      const id = `registered-item-${index}`;
      let pageUrl: string;
      let isActive = false;

      if (registeredPage) {
        const { extensionId, id: pageId } = registeredPage;

        pageUrl = registries.getExtensionPageUrl({ extensionId, pageId, params: menuItem.target.params });
        isActive = isActiveRoute(registeredPage.url);
      } else if (tabRoutes.length > 0) {
        pageUrl = tabRoutes[0].url;
        isActive = isActiveRoute(tabRoutes.map((tab) => tab.routePath));
      } else {
        return null;
      }

      return (
        <SidebarItem
          key={id}
          id={id}
          url={pageUrl}
          isActive={isActive}
          text={menuItem.title}
          icon={<menuItem.components.Icon/>}
        >
          {this.renderTreeFromTabRoutes(tabRoutes)}
        </SidebarItem>
      );
    });
  }

  renderClusterScoped({ component, className, additional, ...args }: ClusterScopedRenderArgs): React.ReactNode {
    const tabRoutes = this.cluster ? component.tabRoutes(this.cluster) : [];

    return (
      <SidebarItem
        {...args}
        id={className.toLowerCase()}
        isHidden={tabRoutes.length == 0}
      >
        {this.renderTreeFromTabRoutes(tabRoutes)}
        {additional?.()}
      </SidebarItem>
    );
  }

  render() {
    const { toggle, compact, className } = this.props;
    const query = namespaceUrlParam.toObjectParam();

    return (
      <div className={cssNames(Sidebar.displayName, "flex column", { compact }, className)}>
        <div className="header flex align-center">
          <NavLink exact to="/" className="box grow">
            <Icon svg="logo-lens" className="logo-icon"/>
            <div className="logo-text">Lens</div>
          </NavLink>
          <Icon
            focusable={false}
            className="pin-icon"
            tooltip="Compact view"
            material={compact ? "keyboard_arrow_right" : "keyboard_arrow_left"}
            onClick={toggle}
          />
        </div>
        <div className={cssNames("sidebar-nav flex column box grow-fixed", { compact })}>
          <SidebarItem
            id="cluster"
            text="Cluster"
            isActive={isActiveRoute(routes.clusterRoute)}
            isHidden={!this.cluster?.isAllowedResource("nodes")}
            url={routes.clusterURL()}
            icon={<Icon svg="kube"/>}
          />
          <SidebarItem
            id="nodes"
            text="Nodes"
            isActive={isActiveRoute(routes.nodesRoute)}
            isHidden={!this.cluster?.isAllowedResource("nodes")}
            url={routes.nodesURL()}
            icon={<Icon svg="nodes"/>}
          />
          {this.renderClusterScoped({
            className: "workloads",
            text: "Workloads",
            isActive: isActiveRoute(routes.workloadsRoute),
            url: routes.workloadsURL({ query }),
            icon: <Icon svg="workloads" />,
            component: Workloads,
          })}
          {this.renderClusterScoped({
            className: "config",
            text: "Configuration",
            isActive: isActiveRoute(routes.configRoute),
            url: routes.configURL({ query }),
            icon: <Icon svg="list" />,
            component: Config,
          })}
          {this.renderClusterScoped({
            className: "networks",
            text: "Network",
            isActive: isActiveRoute(routes.networkRoute),
            url: routes.networkURL({ query }),
            icon: <Icon svg="device_hub" />,
            component: Network,
          })}
          {this.renderClusterScoped({
            className: "storage",
            text: "Storage",
            isActive: isActiveRoute(routes.storageRoute),
            url: routes.storageURL({ query }),
            icon: <Icon svg="storage" />,
            component: Storage,
          })}
          <SidebarItem
            id="namespaces"
            text="Namespaces"
            isActive={isActiveRoute(routes.namespacesRoute)}
            isHidden={!this.cluster?.isAllowedResource("namespaces")}
            url={routes.namespacesURL()}
            icon={<Icon material="layers"/>}
          />
          <SidebarItem
            id="events"
            text="Events"
            isActive={isActiveRoute(routes.eventRoute)}
            isHidden={!this.cluster?.isAllowedResource("events")}
            url={routes.eventsURL({ query })}
            icon={<Icon material="access_time"/>}
          />
          {this.renderClusterScoped({
            className: "apps",
            text: "Apps",
            isActive: isActiveRoute(routes.appsRoute),
            url: routes.appsURL({ query }),
            icon: <Icon material="apps" />,
            component: Apps,
          })}
          {this.renderClusterScoped({
            className: "users",
            text: "Access Control",
            isActive: isActiveRoute(routes.usersManagementRoute),
            url: routes.usersManagementURL({ query }),
            icon: <Icon material="security" />,
            component: UserManagement,
          })}
          {this.renderClusterScoped({
            className: "custom-resources",
            text: "Custom Resources",
            isActive: isActiveRoute(routes.crdRoute),
            url: routes.crdURL(),
            icon: <Icon material="extension" />,
            component: CustomResources,
            additional: () => this.renderCustomResources(),
          })}
          {this.renderRegisteredMenus()}
        </div>
      </div>
    );
  }
}
