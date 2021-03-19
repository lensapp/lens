import "./sidebar.scss";
import type { TabLayoutRoute } from "./tab-layout";

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { workloadsRoute, workloadsURL } from "../+workloads/workloads.route";
import { namespacesRoute, namespacesURL } from "../+namespaces/namespaces.route";
import { nodesRoute, nodesURL } from "../+nodes/nodes.route";
import { usersManagementRoute, usersManagementURL } from "../+user-management/user-management.route";
import { networkRoute, networkURL } from "../+network/network.route";
import { storageRoute, storageURL } from "../+storage/storage.route";
import { clusterRoute, clusterURL } from "../+cluster";
import { Config, configRoute, configURL } from "../+config";
import { eventRoute, eventsURL } from "../+events";
import { Apps, appsRoute, appsURL } from "../+apps";
import { namespaceUrlParam } from "../+namespaces/namespace.store";
import { Workloads } from "../+workloads";
import { UserManagement } from "../+user-management";
import { Storage } from "../+storage";
import { Network } from "../+network";
import { crdStore } from "../+custom-resources/crd.store";
import { crdRoute, crdURL } from "../+custom-resources";
import { CustomResources } from "../+custom-resources/custom-resources";
import { isActiveRoute } from "../../navigation";
import { isAllowedResource } from "../../../common/rbac";
import { Spinner } from "../spinner";
import { ClusterPageMenuRegistration, clusterPageMenuRegistry, clusterPageRegistry, getExtensionPageUrl } from "../../../extensions/registries";
import { SidebarItem } from "./sidebar-item";

interface Props {
  className?: string;
  compact?: boolean; // compact-mode view: show only icons and expand on :hover
  toggle(): void; // compact-mode updater
}

@observer
export class Sidebar extends React.Component<Props> {
  static displayName = "Sidebar";

  async componentDidMount() {
    crdStore.reloadAll();
  }

  @computed get crdSubMenu(): React.ReactNode {
    if (!crdStore.isLoaded) {
      return <Spinner centerHorizontal/>;
    }

    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const crdGroupSubMenu: React.ReactNode = crds.map((crd) => {
        return (
          <SidebarItem
            key={crd.getResourceApiBase()}
            id={`crd-resource:${crd.getResourceApiBase()}`}
            url={crd.getResourceUrl()}
            title={crd.getResourceTitle()}
          />
        );
      });

      return (
        <SidebarItem
          key={group}
          title={group}
          id={`crd-group:${group}`}
          url={crdURL({ query: { groups: group } })}
          subMenu={crdGroupSubMenu}
        />
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
          title={title}
          isActive={isActiveRoute({ path: routePath, exact })}
        />
      );
    });
  }

  getTabLayoutRoutes(menu: ClusterPageMenuRegistration): TabLayoutRoute[] {
    const routes: TabLayoutRoute[] = [];

    if (!menu.id) {
      return routes;
    }

    clusterPageMenuRegistry.getSubItems(menu).forEach((subMenu) => {
      const subPage = clusterPageRegistry.getByPageTarget(subMenu.target);

      if (subPage) {
        const { extensionId, id: pageId } = subPage;

        routes.push({
          routePath: subPage.url,
          url: getExtensionPageUrl({ extensionId, pageId, params: subMenu.target.params }),
          title: subMenu.title,
          component: subPage.components.Page,
        });
      }
    });

    return routes;
  }

  renderRegisteredMenus() {
    return clusterPageMenuRegistry.getRootItems().map((menuItem, index) => {
      const registeredPage = clusterPageRegistry.getByPageTarget(menuItem.target);
      const tabRoutes = this.getTabLayoutRoutes(menuItem);
      const id = `registered-item-${index}`;
      let pageUrl: string;
      let isActive = false;

      if (registeredPage) {
        const { extensionId, id: pageId } = registeredPage;

        pageUrl = getExtensionPageUrl({ extensionId, pageId, params: menuItem.target.params });
        isActive = isActiveRoute(registeredPage.url);
      } else if (tabRoutes.length > 0) {
        pageUrl = tabRoutes[0].url;
        isActive = isActiveRoute(tabRoutes.map((tab) => tab.routePath));
      } else {
        return;
      }

      return (
        <SidebarItem
          key={id}
          id={id}
          url={pageUrl}
          isActive={isActive}
          title={menuItem.title}
          icon={<menuItem.components.Icon/>}
          subMenu={this.renderTreeFromTabRoutes(tabRoutes)}
        />
      );
    });
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
            title="Cluster"
            isActive={isActiveRoute(clusterRoute)}
            isHidden={!isAllowedResource("nodes")}
            url={clusterURL()}
            icon={<Icon svg="kube"/>}
          />
          <SidebarItem
            id="nodes"
            title="Nodes"
            isActive={isActiveRoute(nodesRoute)}
            isHidden={!isAllowedResource("nodes")}
            url={nodesURL()}
            icon={<Icon svg="nodes"/>}
          />
          <SidebarItem
            id="workloads"
            title="Workloads"
            isActive={isActiveRoute(workloadsRoute)}
            isHidden={Workloads.tabRoutes.length == 0}
            url={workloadsURL({ query })}
            icon={<Icon svg="workloads"/>}
            subMenu={this.renderTreeFromTabRoutes(Workloads.tabRoutes)}
          />
          <SidebarItem
            id="config"
            title="Configuration"
            isActive={isActiveRoute(configRoute)}
            isHidden={Config.tabRoutes.length == 0}
            url={configURL({ query })}
            icon={<Icon material="list"/>}
            subMenu={this.renderTreeFromTabRoutes(Config.tabRoutes)}
          />
          <SidebarItem
            id="networks"
            title="Network"
            isActive={isActiveRoute(networkRoute)}
            isHidden={Network.tabRoutes.length == 0}
            url={networkURL({ query })}
            icon={<Icon material="device_hub"/>}
            subMenu={this.renderTreeFromTabRoutes(Network.tabRoutes)}
          />
          <SidebarItem
            id="storage"
            title="Storage"
            isActive={isActiveRoute(storageRoute)}
            isHidden={Storage.tabRoutes.length == 0}
            url={storageURL({ query })}
            icon={<Icon svg="storage"/>}
            subMenu={this.renderTreeFromTabRoutes(Storage.tabRoutes)}
          />
          <SidebarItem
            id="namespaces"
            title="Namespaces"
            isActive={isActiveRoute(namespacesRoute)}
            isHidden={!isAllowedResource("namespaces")}
            url={namespacesURL()}
            icon={<Icon material="layers"/>}
          />
          <SidebarItem
            id="events"
            title="Events"
            isActive={isActiveRoute(eventRoute)}
            isHidden={!isAllowedResource("events")}
            url={eventsURL({ query })}
            icon={<Icon material="access_time"/>}
          />
          <SidebarItem
            id="apps"
            title="Apps"
            isActive={isActiveRoute(appsRoute)}
            url={appsURL({ query })}
            subMenu={this.renderTreeFromTabRoutes(Apps.tabRoutes)}
            icon={<Icon material="apps"/>}
          />
          <SidebarItem
            id="users"
            title="Access Control"
            isActive={isActiveRoute(usersManagementRoute)}
            url={usersManagementURL({ query })}
            icon={<Icon material="security"/>}
            subMenu={this.renderTreeFromTabRoutes(UserManagement.tabRoutes)}
          />
          <SidebarItem
            id="custom-resources"
            title="Custom Resources"
            url={crdURL()}
            isActive={isActiveRoute(crdRoute)}
            isHidden={!isAllowedResource("customresourcedefinitions")}
            icon={<Icon material="extension"/>}
          >
            {this.renderTreeFromTabRoutes(CustomResources.tabRoutes)}
            {this.crdSubMenu}
          </SidebarItem>
          {this.renderRegisteredMenus()}
        </div>
      </div>
    );
  }
}
