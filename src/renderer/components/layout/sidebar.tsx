import "./sidebar.scss";
import type { TabLayoutRoute } from "./tab-layout";

import React from "react";
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

  renderCustomResources() {
    if (crdStore.isLoading) {
      return (
        <div className="flex justify-center">
          <Spinner />
        </div>
      );
    }

    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const id = `crd-group:${group}`;
      const crdGroupsPageUrl = crdURL({ query: { groups: group } });

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
          text={menuItem.title}
          icon={<menuItem.components.Icon/>}
        >
          {this.renderTreeFromTabRoutes(tabRoutes)}
        </SidebarItem>
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
            text="Cluster"
            isActive={isActiveRoute(clusterRoute)}
            isHidden={!isAllowedResource("nodes")}
            url={clusterURL()}
            icon={<Icon svg="kube"/>}
          />
          <SidebarItem
            id="nodes"
            text="Nodes"
            isActive={isActiveRoute(nodesRoute)}
            isHidden={!isAllowedResource("nodes")}
            url={nodesURL()}
            icon={<Icon svg="nodes"/>}
          />
          <SidebarItem
            id="workloads"
            text="Workloads"
            isActive={isActiveRoute(workloadsRoute)}
            isHidden={Workloads.tabRoutes.length == 0}
            url={workloadsURL({ query })}
            icon={<Icon svg="workloads"/>}
          >
            {this.renderTreeFromTabRoutes(Workloads.tabRoutes)}
          </SidebarItem>
          <SidebarItem
            id="config"
            text="Configuration"
            isActive={isActiveRoute(configRoute)}
            isHidden={Config.tabRoutes.length == 0}
            url={configURL({ query })}
            icon={<Icon material="list"/>}
          >
            {this.renderTreeFromTabRoutes(Config.tabRoutes)}
          </SidebarItem>
          <SidebarItem
            id="networks"
            text="Network"
            isActive={isActiveRoute(networkRoute)}
            isHidden={Network.tabRoutes.length == 0}
            url={networkURL({ query })}
            icon={<Icon material="device_hub"/>}
          >
            {this.renderTreeFromTabRoutes(Network.tabRoutes)}
          </SidebarItem>
          <SidebarItem
            id="storage"
            text="Storage"
            isActive={isActiveRoute(storageRoute)}
            isHidden={Storage.tabRoutes.length == 0}
            url={storageURL({ query })}
            icon={<Icon svg="storage"/>}
          >
            {this.renderTreeFromTabRoutes(Storage.tabRoutes)}
          </SidebarItem>
          <SidebarItem
            id="namespaces"
            text="Namespaces"
            isActive={isActiveRoute(namespacesRoute)}
            isHidden={!isAllowedResource("namespaces")}
            url={namespacesURL()}
            icon={<Icon material="layers"/>}
          />
          <SidebarItem
            id="events"
            text="Events"
            isActive={isActiveRoute(eventRoute)}
            isHidden={!isAllowedResource("events")}
            url={eventsURL({ query })}
            icon={<Icon material="access_time"/>}
          />
          <SidebarItem
            id="apps"
            text="Apps" // helm charts
            isActive={isActiveRoute(appsRoute)}
            url={appsURL({ query })}
            icon={<Icon material="apps"/>}
          >
            {this.renderTreeFromTabRoutes(Apps.tabRoutes)}
          </SidebarItem>
          <SidebarItem
            id="users"
            text="Access Control"
            isActive={isActiveRoute(usersManagementRoute)}
            url={usersManagementURL({ query })}
            icon={<Icon material="security"/>}
          >
            {this.renderTreeFromTabRoutes(UserManagement.tabRoutes)}
          </SidebarItem>
          <SidebarItem
            id="custom-resources"
            text="Custom Resources"
            url={crdURL()}
            isActive={isActiveRoute(crdRoute)}
            isHidden={!isAllowedResource("customresourcedefinitions")}
            icon={<Icon material="extension"/>}
          >
            {this.renderTreeFromTabRoutes(CustomResources.tabRoutes)}
            {this.renderCustomResources()}
          </SidebarItem>
          {this.renderRegisteredMenus()}
        </div>
      </div>
    );
  }
}
