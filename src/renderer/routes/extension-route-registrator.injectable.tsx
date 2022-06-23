/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";

import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import { observer } from "mobx-react";
import React from "react";
import { isEmpty, matches } from "lodash/fp";
import type { PageRegistration } from "../../extensions/registries";
import { extensionRegistratorInjectionToken } from "../../extensions/extension-loader/extension-registrator-injection-token";
import { SiblingsInTabLayout } from "../components/layout/siblings-in-tab-layout";
import extensionPageParametersInjectable from "./extension-page-parameters.injectable";
import { routeSpecificComponentInjectionToken } from "./route-specific-component-injection-token";
import { computed } from "mobx";
import { frontEndRouteInjectionToken } from "../../common/front-end-routing/front-end-route-injection-token";
import { getExtensionRoutePath } from "./for-extension";

const extensionRouteRegistratorInjectable = getInjectable({
  id: "extension-route-registrator",

  instantiate: (di) => {
    return (ext) => {
      const extension = ext as LensRendererExtension;
      const toRouteInjectable = toRouteInjectableFor(
        di,
        extension,
      );

      return [
        ...extension.globalPages.map(toRouteInjectable(false)),
        ...extension.clusterPages.map(toRouteInjectable(true)),
      ].flat();
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionRouteRegistratorInjectable;

const toRouteInjectableFor =
  (
    di: DiContainerForInjection,
    extension: LensRendererExtension,
  ) =>
    (clusterFrame: boolean) =>
      (registration: PageRegistration) => {
        const routeInjectable = getInjectable({
          id: `route-${registration.id}-for-extension-${extension.sanitizedExtensionId}`,

          instantiate: () => ({
            path: getExtensionRoutePath(extension, registration.id),
            clusterFrame,
            isEnabled: computed(() => true),
            extension,
          }),

          injectionToken: frontEndRouteInjectionToken,
        });

        const normalizedParams = di.inject(extensionPageParametersInjectable, {
          extension,
          registration,
        });

        const currentSidebarRegistration = extension.clusterPageMenus.find(
          matches({ target: { pageId: registration.id }}),
        );

        const siblingRegistrations = currentSidebarRegistration?.parentId
          ? extension.clusterPageMenus.filter(
            matches({ parentId: currentSidebarRegistration.parentId }),
          )
          : [];

        const ObserverPage = observer(registration.components.Page);

        const Component = () => {
          if (isEmpty(siblingRegistrations)) {
            return <ObserverPage params={normalizedParams} />;
          }

          return (
            <SiblingsInTabLayout>
              <ObserverPage params={normalizedParams} />
            </SiblingsInTabLayout>
          );
        };

        const routeSpecificComponentInjectable = getInjectable({
          id: `route-${registration.id}-component-for-extension-${extension.sanitizedExtensionId}`,

          instantiate: (di) => ({
            route: di.inject(routeInjectable),
            Component,
          }),

          injectionToken: routeSpecificComponentInjectionToken,
        });

        return [routeInjectable, routeSpecificComponentInjectable];
      };
