import type { TabLayoutRoute } from "./tab-layout";
import "./sidebar.scss";

import React from "react";
import { computed, observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { createStorage, cssNames } from "../../utils";
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
import { namespaceStore } from "../+namespaces/namespace.store";
import { Workloads } from "../+workloads";
import { UserManagement } from "../+user-management";
import { Storage } from "../+storage";
import { Network } from "../+network";
import { crdStore } from "../+custom-resources/crd.store";
import { CrdList, crdResourcesRoute, crdRoute, crdURL } from "../+custom-resources";
import { CustomResources } from "../+custom-resources/custom-resources";
import { isActiveRoute, navigation } from "../../navigation";
import { isAllowedResource } from "../../../common/rbac";
import { Spinner } from "../spinner";
import { clusterPageMenuRegistry, clusterPageRegistry, getExtensionPageUrl } from "../../../extensions/registries";

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
      return <Spinner centerHorizontal/>;
    }

    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const submenus: TabLayoutRoute[] = crds.map((crd) => {
        return {
          title: crd.getResourceKind(),
          component: CrdList,
          url: crd.getResourceUrl(),
          routePath: String(crdResourcesRoute.path),
        };
      });
      return (
        <SidebarNavItem
          key={group}
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
              <Icon svg="logo-lens" className="logo-icon"/>
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
              testId="cluster"
              isActive={isActiveRoute(clusterRoute)}
              isHidden={!isAllowedResource("nodes")}
              url={clusterURL()}
              text={<Trans>Cluster</Trans>}
              icon={<Icon svg="kube"/>}
            />
            <SidebarNavItem
              testId="nodes"
              isActive={isActiveRoute(nodesRoute)}
              isHidden={!isAllowedResource("nodes")}
              url={nodesURL()}
              text={<Trans>Nodes</Trans>}
              icon={<Icon svg="nodes"/>}
            />
            <SidebarNavItem
              testId="workloads"
              isActive={isActiveRoute(workloadsRoute)}
              isHidden={Workloads.tabRoutes.length == 0}
              url={workloadsURL({ query })}
              subMenus={Workloads.tabRoutes}
              text={<Trans>Workloads</Trans>}
              icon={<Icon svg="workloads"/>}
            />
            <SidebarNavItem
              testId="config"
              isActive={isActiveRoute(configRoute)}
              isHidden={Config.tabRoutes.length == 0}
              url={configURL({ query })}
              subMenus={Config.tabRoutes}
              text={<Trans>Configuration</Trans>}
              icon={<Icon material="list"/>}
            />
            <SidebarNavItem
              testId="networks"
              isActive={isActiveRoute(networkRoute)}
              isHidden={Network.tabRoutes.length == 0}
              url={networkURL({ query })}
              subMenus={Network.tabRoutes}
              text={<Trans>Network</Trans>}
              icon={<Icon material="device_hub"/>}
            />
            <SidebarNavItem
              testId="storage"
              isActive={isActiveRoute(storageRoute)}
              isHidden={Storage.tabRoutes.length == 0}
              url={storageURL({ query })}
              subMenus={Storage.tabRoutes}
              icon={<Icon svg="storage"/>}
              text={<Trans>Storage</Trans>}
            />
            <SidebarNavItem
              testId="namespaces"
              isActive={isActiveRoute(namespacesRoute)}
              isHidden={!isAllowedResource("namespaces")}
              url={namespacesURL()}
              icon={<Icon material="layers"/>}
              text={<Trans>Namespaces</Trans>}
            />
            <SidebarNavItem
              testId="events"
              isActive={isActiveRoute(eventRoute)}
              isHidden={!isAllowedResource("events")}
              url={eventsURL({ query })}
              icon={<Icon material="access_time"/>}
              text={<Trans>Events</Trans>}
            />
            <SidebarNavItem
              testId="apps"
              isActive={isActiveRoute(appsRoute)}
              url={appsURL({ query })}
              subMenus={Apps.tabRoutes}
              icon={<Icon material="apps"/>}
              text={<Trans>Apps</Trans>}
            />
            <SidebarNavItem
              testId="users"
              isActive={isActiveRoute(usersManagementRoute)}
              url={usersManagementURL({ query })}
              subMenus={UserManagement.tabRoutes}
              icon={<Icon material="security"/>}
              text={<Trans>Access Control</Trans>}
            />
            <SidebarNavItem
              testId="custom-resources"
              isActive={isActiveRoute(crdRoute)}
              isHidden={!isAllowedResource("customresourcedefinitions")}
              url={crdURL()}
              subMenus={CustomResources.tabRoutes}
              icon={<Icon material="extension"/>}
              text={<Trans>Custom Resources</Trans>}
            >
              {this.renderCustomResources()}
            </SidebarNavItem>
            {clusterPageMenuRegistry.getItems().map(({ title, target, components: { Icon } }) => {
              const registeredPage = clusterPageRegistry.getByPageMenuTarget(target);
              if (!registeredPage) return;
              const { extensionId, id: pageId } = registeredPage;
              const pageUrl = getExtensionPageUrl({ extensionId, pageId, params: target.params });
              const isActive = pageUrl === navigation.location.pathname;
              return (
                <SidebarNavItem
                  key={pageUrl} url={pageUrl}
                  text={title} icon={<Icon/>}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>
      </SidebarContext.Provider>
    );
  }
}

interface SidebarNavItemProps {
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  isActive?: boolean;
  subMenus?: TabLayoutRoute[];
  testId?: string; // data-test-id="" property for integration tests
}

const navItemStorage = createStorage<[string, boolean][]>("sidebar_menu_item", []);
const navItemState = observable.map<string, boolean>(navItemStorage.get());
reaction(() => [...navItemState], (value) => navItemStorage.set(value));

@observer
class SidebarNavItem extends React.Component<SidebarNavItemProps> {
  static contextType = SidebarContext;
  public context: SidebarContextValue;

  get itemId() {
    return this.props.url;
  }

  @computed get isExpanded() {
    return navItemState.get(this.itemId);
  }

  toggleSubMenu = () => {
    navItemState.set(this.itemId, !this.isExpanded);
  };

  render() {
    const { isHidden, isActive, subMenus = [], icon, text, url, children, className, testId } = this.props;
    if (isHidden) {
      return null;
    }
    const extendedView = (subMenus.length > 0 || children) && this.context.pinned;
    if (extendedView) {
      return (
        <div className={cssNames("SidebarNavItem", className)} data-test-id={testId}>
          <div className={cssNames("nav-item", { active: isActive })} onClick={this.toggleSubMenu}>
            {icon}
            <span className="link-text">{text}</span>
            <Icon className="expand-icon" material={this.isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}/>
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
      <NavLink className={cssNames("SidebarNavItem", className)} to={url} isActive={() => isActive}>
        {icon}
        <span className="link-text">{text}</span>
      </NavLink>
    );
  }
}
