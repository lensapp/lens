/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { crdURL, crdRoute } from "../../../common/routes";
import { isAllowedResource } from "../../../extensions/renderer-api/k8s-api";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRouteTree } from "../layout/tab-route-tree";
import { Spinner } from "../spinner";
import customResourceRoutesInjectable from "./routes.injectable";
import type { CustomResourceDefinitionStore } from "./store";
import customResourceDefinitionStoreInjectable from "./store.injectable";

export interface CustomResourcesSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  kubeWatchApi: KubeWatchApi;
  customResourceDefinitionStore: CustomResourceDefinitionStore;
}

const NonInjectedCustomResourcesSidebarItem = observer(({ customResourceDefinitionStore, kubeWatchApi, routes }: Dependencies & CustomResourcesSidebarItemProps) => {
  useEffect(() => kubeWatchApi.subscribeStores([
    customResourceDefinitionStore,
  ]), []);

  const tabRoutes = routes.get();

  const renderCustomResources = () => {
    if (customResourceDefinitionStore.isLoading) {
      return (
        <div className="flex justify-center">
          <Spinner/>
        </div>
      );
    }

    return Object.entries(customResourceDefinitionStore.groups).map(([group, crds]) => {
      const id = `crd-group:${group}`;
      const crdGroupsPageUrl = crdURL({ query: { groups: group }});

      return (
        <SidebarItem key={id} id={id} text={group} url={crdGroupsPageUrl}>
          {crds.map((crd) => (
            <SidebarItem
              key={crd.getResourceApiBase()}
              id={`crd-resource:${crd.getResourceApiBase()}`}
              url={crd.getResourceUrl()}
              text={crd.getResourceKind()}
            />
          ))}
        </SidebarItem>
      );
    });
  };

  return (
    <SidebarItem
      id="custom-resources"
      text="Custom Resources"
      url={crdURL()}
      isActive={isActiveRoute(crdRoute)}
      isHidden={!isAllowedResource("customresourcedefinitions")}
      icon={<Icon material="extension"/>}
    >
      <TabRouteTree tabRoutes={tabRoutes} />
      {renderCustomResources()}
    </SidebarItem>
  );
});

export const CustomResourcesSidebarItem = withInjectables<Dependencies, CustomResourcesSidebarItemProps>(NonInjectedCustomResourcesSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(customResourceRoutesInjectable),
    customResourceDefinitionStore: di.inject(customResourceDefinitionStoreInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
