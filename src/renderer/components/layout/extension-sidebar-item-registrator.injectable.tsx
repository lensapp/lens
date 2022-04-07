/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import React from "react";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { SidebarItemRegistration } from "./sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "./sidebar-items.injectable";
import { computed } from "mobx";
import routesInjectable from "../../routes/routes.injectable";
import { matches, noop } from "lodash/fp";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import { getExtensionRoutePath } from "../../routes/get-extension-route-path";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";

const extensionSidebarItemRegistratorInjectable = getInjectable({
  id: "extension-sidebar-item-registrator",

  instantiate:
    (di: DiContainer) =>
      (
        extension: LensRendererExtension,
        extensionInstallationCount: number,
      ) => {
        const sidebarItemsForExtensionInjectable = getInjectable({
          id: `sidebar-items-for-extension-${extension.sanitizedExtensionId}-instance-${extensionInstallationCount}`,
          injectionToken: sidebarItemsInjectionToken,

          instantiate: (di) => {
            const navigateToRoute = di.inject(navigateToRouteInjectionToken);
            const routes = di.inject(routesInjectable);

            return computed((): SidebarItemRegistration[] => {
              const extensionRoutes = routes.get().filter(matches({ extension }));

              return extension.clusterPageMenus.map((registration) => {
                const targetRoutePath = getExtensionRoutePath(
                  extension,
                  registration.target?.pageId,
                );

                const targetRoute = extensionRoutes.find(
                  matches({ path: targetRoutePath }),
                );

                return {
                  id: `${extension.sanitizedExtensionId}-${registration.id}`,
                  extension,
                  orderNumber: 9999,

                  parentId: registration.parentId
                    ? `${extension.sanitizedExtensionId}-${registration.parentId}`
                    : null,

                  title: registration.title,
                  getIcon: registration.components.Icon
                    ? () => <registration.components.Icon />
                    : null,

                  ...(targetRoute
                    ? {
                      onClick: () => navigateToRoute(targetRoute),

                      isActive: di.inject(
                        routeIsActiveInjectable,
                        targetRoute,
                      ),
                    }
                    : { onClick: noop }),
                };
              });
            });
          },
        });

        di.register(sidebarItemsForExtensionInjectable);
      },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionSidebarItemRegistratorInjectable;
