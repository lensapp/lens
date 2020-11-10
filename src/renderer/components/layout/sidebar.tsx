import type { TabRoute } from "./tab-layout";
import "./sidebar.scss";

import React from "react";
import { computed, observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { matchPath, NavLink } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { createStorage, cssNames } from "../../utils";
import { Icon } from "../icon";
import { workloadsRoute, workloadsURL } from "../+workloads/workloads.route";
import { namespacesURL } from "../+namespaces/namespaces.route";
import { nodesURL } from "../+nodes/nodes.route";
import { usersManagementRoute, usersManagementURL } from "../+user-management/user-management.route";
import { networkRoute, networkURL } from "../+network/network.route";
import { storageRoute, storageURL } from "../+storage/storage.route";
import { clusterURL } from "../+cluster";
import { Config, configRoute, configURL } from "../+config";
import { eventRoute, eventsURL } from "../+events";
import { Apps, appsRoute, appsURL } from "../+apps";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Workloads } from "../+workloads";
import { UserManagement } from "../+user-management";
import { Storage } from "../+storage";
import { Network } from "../+network";
import { crdStore } from "../+custom-resources/crd.store";
import { CrdList, crdResourcesRoute, crdRoute, crdURL } from "../+custom-resources";
import { CustomResources } from "../+custom-resources/custom-resources";
import { navigation } from "../../navigation";
import { clusterPageRegistry } from "../../../extensions/registries/page-registry";
import { isAllowedResource } from "../../../common/rbac";
import { Spinner } from "../spinner";

const SidebarContext = React.createContext<SidebarContextValue>({ pinned: false });
type SidebarContextValue = {
  pinned: boolean;
};

interface Props {
  className?: string;
  isPinned: boolean;
  toggle(): void;
}

@observer
export class Sidebar extends React.Component<Props> {
  async componentDidMount() {
    if (!crdStore.isLoaded && isAllowedResource("customresourcedefinitions")) {
      crdStore.loadAll();
    }
  }

  renderCustomResources() {
    if (crdStore.isLoading) {
      return <Spinner centerHorizontal />
    }

    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const submenus = crds.map((crd) => {
        return {
          title: crd.getResourceKind(),
          component: CrdList,
          url: crd.getResourceUrl(),
          path: crdResourcesRoute.path,
        };
      });
      return (
        <SidebarNavItem
          key={group}
          id={group}
          className="sub-menu-parent"
          url={crdURL({ query: { groups: group } })}
          subMenus={submenus}
          text={group}
        />
      );
    });
  }

  render() {
    const { toggle, isPinned, className } = this.props;
    const query = namespaceStore.getContextParams();
    return (
      <SidebarContext.Provider value={{ pinned: isPinned }}>
        <div className={cssNames("Sidebar flex column", className, { pinned: isPinned })}>
          <div className="header flex align-center">
            <NavLink exact to="/" className="box grow">
              <Icon svg="logo-lens" className="logo-icon" />
              <div className="logo-text">Lens</div>
            </NavLink>
            <Icon
              className="pin-icon"
              tooltip={<Trans>Compact view</Trans>}
              material={isPinned ? "keyboard_arrow_left" : "keyboard_arrow_right"}
              onClick={toggle}
              focusable={false}
            />
          </div>
          <div className="sidebar-nav flex column box grow-fixed">
            <SidebarNavItem
              id="cluster"
              isHidden={!isAllowedResource("nodes")}
              url={clusterURL()}
              text={<Trans>Cluster</Trans>}
              icon={<Icon svg="kube" />}
            />
            <SidebarNavItem
              id="nodes"
              isHidden={!isAllowedResource("nodes")}
              url={nodesURL()}
              text={<Trans>Nodes</Trans>}
              icon={<Icon svg="nodes" />}
            />
            <SidebarNavItem
              id="workloads"
              isHidden={Workloads.tabRoutes.length == 0}
              url={workloadsURL({ query })}
              routePath={workloadsRoute.path}
              subMenus={Workloads.tabRoutes}
              text={<Trans>Workloads</Trans>}
              icon={<Icon svg="workloads" />}
            />
            <SidebarNavItem
              id="config"
              isHidden={Config.tabRoutes.length == 0}
              url={configURL({ query })}
              routePath={configRoute.path}
              subMenus={Config.tabRoutes}
              text={<Trans>Configuration</Trans>}
              icon={<Icon material="list" />}
            />
            <SidebarNavItem
              id="networks"
              isHidden={Network.tabRoutes.length == 0}
              url={networkURL({ query })}
              routePath={networkRoute.path}
              subMenus={Network.tabRoutes}
              text={<Trans>Network</Trans>}
              icon={<Icon material="device_hub" />}
            />
            <SidebarNavItem
              id="storage"
              isHidden={Storage.tabRoutes.length == 0}
              url={storageURL({ query })}
              routePath={storageRoute.path}
              subMenus={Storage.tabRoutes}
              icon={<Icon svg="storage" />}
              text={<Trans>Storage</Trans>}
            />
            <SidebarNavItem
              id="namespaces"
              isHidden={!isAllowedResource("namespaces")}
              url={namespacesURL()}
              icon={<Icon material="layers" />}
              text={<Trans>Namespaces</Trans>}
            />
            <SidebarNavItem
              id="events"
              isHidden={!isAllowedResource("events")}
              url={eventsURL({ query })}
              routePath={eventRoute.path}
              icon={<Icon material="access_time" />}
              text={<Trans>Events</Trans>}
            />
            <SidebarNavItem
              id="apps"
              url={appsURL({ query })}
              subMenus={Apps.tabRoutes}
              routePath={appsRoute.path}
              icon={<Icon material="apps" />}
              text={<Trans>Apps</Trans>}
            />
            <SidebarNavItem
              id="users"
              url={usersManagementURL({ query })}
              routePath={usersManagementRoute.path}
              subMenus={UserManagement.tabRoutes}
              icon={<Icon material="security" />}
              text={<Trans>Access Control</Trans>}
            />
            <SidebarNavItem
              id="custom-resources"
              isHidden={!isAllowedResource("customresourcedefinitions")}
              url={crdURL()}
              subMenus={CustomResources.tabRoutes}
              routePath={crdRoute.path}
              icon={<Icon material="extension" />}
              text={<Trans>Custom Resources</Trans>}
            >
              {this.renderCustomResources()}
            </SidebarNavItem>
            {clusterPageRegistry.getItems().map(({ path, title, url = String(path), hideInMenu, components: { MenuIcon } }) => {
              if (!MenuIcon || hideInMenu) {
                return;
              }
              return (
                <SidebarNavItem
                  key={url} id={`sidebar_item_${url}`}
                  url={url}
                  routePath={path}
                  text={title}
                  icon={<MenuIcon />}
                />
              )
            })}
          </div>
        </div>
      </SidebarContext.Provider>
    );
  }
}

interface SidebarNavItemProps {
  id: string;
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  routePath?: string | string[];
  subMenus?: TabRoute[];
}

const navItemStorage = createStorage<[string, boolean][]>("sidebar_menu_item", []);
const navItemState = observable.map<string, boolean>(navItemStorage.get());
reaction(
  () => [...navItemState],
  (value) => navItemStorage.set(value)
);

@observer
class SidebarNavItem extends React.Component<SidebarNavItemProps> {
  static contextType = SidebarContext;
  public context: SidebarContextValue;

  @computed get isExpanded() {
    return navItemState.get(this.props.id);
  }

  toggleSubMenu = () => {
    navItemState.set(this.props.id, !this.isExpanded);
  };

  isActive = () => {
    const { routePath, url } = this.props;
    const { pathname } = navigation.location;
    return !!matchPath(pathname, {
      path: routePath || url,
    });
  };

  render() {
    const { id, isHidden, subMenus = [], icon, text, url, children, className } = this.props;
    if (isHidden) {
      return null;
    }
    const extendedView = (subMenus.length > 0 || children) && this.context.pinned;
    if (extendedView) {
      const isActive = this.isActive();
      return (
        <div id={id} className={cssNames("SidebarNavItem", className)}>
          <div className={cssNames("nav-item", { active: isActive })} onClick={this.toggleSubMenu}>
            {icon}
            <span className="link-text">{text}</span>
            <Icon className="expand-icon" material={this.isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
          </div>
          <ul className={cssNames("sub-menu", { active: isActive })}>
            {subMenus.map(({ title, url }) => (
              <NavLink key={url} to={url} className={cssNames({ visible: this.isExpanded })}>
                {title}
              </NavLink>
            ))}
            {React.Children.toArray(children).map((child: React.ReactElement<any>) => {
              return React.cloneElement(child, {
                className: cssNames(child.props.className, { visible: this.isExpanded }),
              });
            })}
          </ul>
        </div>
      );
    }
    return (
      <NavLink className={cssNames("SidebarNavItem", className)} to={url} isActive={this.isActive}>
        {icon}
        <span className="link-text">{text}</span>
      </NavLink>
    );
  }
}
