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
import { matches, noop } from "lodash/fp";
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

    return computed(() => {
      const extensionRoutes = routes.get().filter(matches({ extension }));

      return extension.clusterPageMenus.map((registration) => {
        const targetRoutePath = getExtensionRoutePath(
          extension,
          registration.target?.pageId,
        );

        const targetRoute = extensionRoutes.find(
          matches({ path: targetRoutePath }),
        );

        const isVisible = computed(() => {
          if (!extensionShouldBeEnabledForClusterFrame.value.get()) {
            return false;
          }

          if (!registration.visible) {
            return true;
          }

          return registration.visible.get();
        });

        const id = registration.id ?
          `${extension.sanitizedExtensionId}-${registration.id}`
          : extension.sanitizedExtensionId;

        return getInjectable({
          id: `${id}-sidebar-item`,
          instantiate: () => ({
            id,
            orderNumber: registration.orderNumber ?? 9999,

            parentId: registration.parentId
              ? `${extension.sanitizedExtensionId}-${registration.parentId}`
              : null,

            isVisible,

            title: registration.title,
            getIcon: registration.components.Icon
              ? () => <registration.components.Icon />
              : undefined,
            ...(targetRoute
              ? {
                onClick: () => navigateToRoute(targetRoute),

                isActive: di.inject(
                  routeIsActiveInjectable,
                  targetRoute,
                ),
              }
              : { onClick: noop }),
          }),
          injectionToken: sidebarItemInjectionToken,
        });
      });
    });
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionSidebarItemRegistratorInjectable;
