/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useEffect } from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import customResourcesRouteTabsInjectable, { type CustomResourceGroupTabLayoutRoute } from "./route-tabs.injectable";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import { crdURL, crdRoute } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import { crdStore } from "./crd.store";
import { Spinner } from "../spinner";

export interface CustomResourcesSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<CustomResourceGroupTabLayoutRoute[]>;
  isAllowedResource: IsAllowedResource;
  subscribeStores: SubscribeStores;
}

const NonInjectedCustomResourcesSidebarItem = observer(({ routes, isAllowedResource, subscribeStores }: Dependencies & CustomResourcesSidebarItemProps) => {
  useEffect(() => subscribeStores([
    crdStore,
  ]), []);

  return (
    <SidebarItem
      id="custom-resources"
      text="Custom Resources"
      url={crdURL()}
      isActive={isActiveRoute(crdRoute)}
      isHidden={!isAllowedResource("customresourcedefinitions")}
      icon={<Icon material="extension"/>}
    >
      {routes.get().map((route) => (
        <SidebarItem
          key={route.id}
          id={route.id}
          text={route.title}
          url={route.routePath}
        >
          {route.subRoutes?.map((subRoute) => (
            <SidebarItem
              key={subRoute.id}
              id={subRoute.id}
              url={subRoute.routePath}
              text={subRoute.title}
            />
          ))}
        </SidebarItem>
      ))}
      {crdStore.isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
    </SidebarItem>
  );
});

export const CustomResourcesSidebarItem = withInjectables<Dependencies, CustomResourcesSidebarItemProps>(NonInjectedCustomResourcesSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(customResourcesRouteTabsInjectable),
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    subscribeStores: di.inject(subscribeStoresInjectable),
    ...props,
  }),
});
