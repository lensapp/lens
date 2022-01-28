/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./sidebar.module.scss";
import type { TabLayoutRoute } from "./tab-layout";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { isActiveRoute } from "../../navigation";
import { ClusterPageMenuRegistration, ClusterPageMenuRegistry, ClusterPageRegistry, getExtensionPageUrl } from "../../../extensions/registries";
import { SidebarItem } from "./sidebar-item";
import * as routes from "../../../common/routes";
import { SidebarCluster } from "./sidebar-cluster";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubernetesCluster } from "../../../common/catalog-entities";
import activeEntityInjectable from "../../catalog/active-entity.injectable";
import type { IComputedValue } from "mobx";
import type { KubeResource } from "../../../common/rbac";
import { UserManagementSidebarItem } from "../+user-management/sidebar-item";
import { ConfigSidebarItem } from "../+config/sidebar-item";
import { NetworkSidebarItem } from "../+network/sidebar-item";
import { TabRouteTree } from "./tab-route-tree";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import { StorageSidebarItem } from "../+storage/sidebar-item";
import { WorkloadsSidebarItem } from "../+workloads/sidebar-item";
import { HelmAppsSidebarItem } from "../+helm-apps/sidebar-item";
import { CustomResourcesSidebarItem } from "../+custom-resource/sidebar-item";

export interface SidebarProps {
  className?: string;
}

interface Dependencies {
  clusterEntity: IComputedValue<KubernetesCluster>;
  clusterPageMenuRegistry: ClusterPageMenuRegistry;
  clusterPageRegistry: ClusterPageRegistry;
  isAllowedResource: (resource: KubeResource | KubeResource[]) => boolean;
}

const NonInjectedSidebar = observer(({ isAllowedResource, clusterEntity, className, clusterPageMenuRegistry, clusterPageRegistry }: Dependencies & SidebarProps) => {
  const getTabLayoutRoutes = (menu: ClusterPageMenuRegistration): TabLayoutRoute[] => {
    if (!menu.id) {
      return [];
    }

    const routes: TabLayoutRoute[] = [];
    const subMenus = clusterPageMenuRegistry.getSubItems(menu);

    for (const subMenu of subMenus) {
      const page = clusterPageRegistry.getByPageTarget(subMenu.target);

      if (!page) {
        continue;
      }

      const { extensionId, id: pageId, url, components } = page;

      if (subMenu.components.Icon) {
        console.warn(
          "ClusterPageMenuRegistration has components.Icon defined and a valid parentId. Icon will not be displayed",
          {
            id: subMenu.id,
            parentId: subMenu.parentId,
            target: subMenu.target,
          },
        );
      }

      routes.push({
        routePath: url,
        url: getExtensionPageUrl({ extensionId, pageId, params: subMenu.target.params }),
        title: subMenu.title,
        component: components.Page,
      });
    }

    return routes;
  };

  const renderRegisteredMenus = () => {
    return clusterPageMenuRegistry.getRootItems().map((menuItem, index) => {
      const registeredPage = clusterPageRegistry.getByPageTarget(menuItem.target);
      const tabRoutes = getTabLayoutRoutes(menuItem);
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
          <TabRouteTree tabRoutes={tabRoutes} />
        </SidebarItem>
      );
    });
  };

  return (
    <div className={cssNames("flex flex-col", className)} data-testid="cluster-sidebar">
      <SidebarCluster clusterEntity={clusterEntity.get()}/>
      <div className={styles.sidebarNav}>
        <SidebarItem
          id="cluster"
          text="Cluster"
          isActive={isActiveRoute(routes.clusterRoute)}
          isHidden={!isAllowedResource("nodes")}
          url={routes.clusterURL()}
          icon={<Icon svg="kube"/>}
        />
        <SidebarItem
          id="nodes"
          text="Nodes"
          isActive={isActiveRoute(routes.nodesRoute)}
          isHidden={!isAllowedResource("nodes")}
          url={routes.nodesURL()}
          icon={<Icon svg="nodes"/>}
        />
        <WorkloadsSidebarItem />
        <ConfigSidebarItem />
        <NetworkSidebarItem />
        <StorageSidebarItem />
        <SidebarItem
          id="namespaces"
          text="Namespaces"
          isActive={isActiveRoute(routes.namespacesRoute)}
          isHidden={!isAllowedResource("namespaces")}
          url={routes.namespacesURL()}
          icon={<Icon material="layers"/>}
        />
        <SidebarItem
          id="events"
          text="Events"
          isActive={isActiveRoute(routes.eventRoute)}
          isHidden={!isAllowedResource("events")}
          url={routes.eventsURL()}
          icon={<Icon material="access_time"/>}
        />
        <HelmAppsSidebarItem />
        <UserManagementSidebarItem />
        <CustomResourcesSidebarItem />
        {renderRegisteredMenus()}
      </div>
    </div>
  );
});

export const Sidebar = withInjectables<Dependencies, SidebarProps>(NonInjectedSidebar, {
  getProps: (di, props) => ({
    clusterEntity: di.inject(activeEntityInjectable) as IComputedValue<KubernetesCluster>,
    clusterPageMenuRegistry: ClusterPageMenuRegistry.getInstance(),
    clusterPageRegistry: ClusterPageRegistry.getInstance(),
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    ...props,
  }),
});
