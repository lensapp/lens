/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { computed } from "mobx";
import routesInjectable from "../../routes/routes.injectable";
import { matches } from "lodash/fp";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import { getExtensionRoutePath } from "../../routes/for-extension";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";

const extensionSidebarItemRegistratorInjectable = getInjectable({
  id: "extension-sidebar-item-registrator",

  instantiate: (di) => (ext) => {
    const extension = ext as LensRendererExtension;
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const routes = di.inject(routesInjectable);
    const extensionShouldBeEnabledForClusterFrame = di.inject(extensionShouldBeEnabledForClusterFrameInjectable, extension);
    const extensionRoutes = computed(() => routes.get().filter(matches({ extension })));

    return computed(() => extension.clusterPageMenus.map((registration) => {
      const {
        components,
        title,
        orderNumber = 9999,
        parentId: rawParentId,
        visible,
        id: rawId,
        target,
      } = registration;
      const id = rawId
        ? `sidebar-item-${extension.sanitizedExtensionId}-${rawId}`
        : `sidebar-item-${extension.sanitizedExtensionId}`;
      const parentId = rawParentId
        ? `sidebar-item-${extension.sanitizedExtensionId}-${rawParentId}`
        : null;
      const targetRoutePath = getExtensionRoutePath(extension, target?.pageId);
      const targetRoute = computed(() => extensionRoutes.get().find(matches({ path: targetRoutePath })));

      return getInjectable({
        id,
        instantiate: () => ({
          orderNumber,
          parentId,
          isVisible: computed(() => extensionShouldBeEnabledForClusterFrame.value.get() && (visible?.get() ?? true)),
          title,
          getIcon: () => (components.Icon && <components.Icon />),
          onClick: () => {
            const route = targetRoute.get();

            if (route) {
              navigateToRoute(route);
            }
          },
          isActive: computed(() => {
            const route = targetRoute.get();

            if (!route) {
              return false;
            }

            return di.inject(routeIsActiveInjectable, route).get();
          }),
        }),
        injectionToken: sidebarItemInjectionToken,
      });
    }));
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionSidebarItemRegistratorInjectable;
