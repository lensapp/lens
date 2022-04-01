/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import crdListRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/crd-list/crd-list-route.injectable";
import customResourceDefinitionsInjectable from "./custom-resources.injectable";
import { groupBy, matches, noop, some, toPairs } from "lodash/fp";
import customResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources/custom-resources-route.injectable";
import currentPathParametersInjectable from "../../routes/current-path-parameters.injectable";
import type { SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToCustomResourcesInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources/navigate-to-custom-resources.injectable";

const sidebarItemsForDefinitionGroupsInjectable = getInjectable({
  id: "sidebar-items-for-definition-groups",

  instantiate: (di) => {
    const customResourceDefinitions = di.inject(
      customResourceDefinitionsInjectable,
    );

    const crdRoute = di.inject(customResourcesRouteInjectable);
    const crdRouteIsActive = di.inject(routeIsActiveInjectable, crdRoute);
    const crdListRoute = di.inject(crdListRouteInjectable);
    const pathParameters = di.inject(currentPathParametersInjectable);
    const navigateToCustomResources = di.inject(navigateToCustomResourcesInjectable);

    return computed((): SidebarItemRegistration[] => {
      const definitions = customResourceDefinitions.get();

      const groupedCrds = toPairs(
        groupBy((crd) => crd.getGroup(), definitions),
      );

      return groupedCrds.flatMap(([group, definitions]) => {
        const childItems = definitions.map((crd) => {
          const title = crd.getResourceKind();

          const crdPathParameters = {
            group: crd.getGroup(),
            name: crd.getPluralName(),
          };

          return {
            id: `custom-resource-definition-group-${group}-crd-${crd.getId()}`,
            parentId: `custom-resource-definition-group-${group}`,
            title,

            onClick: () => navigateToCustomResources(crdPathParameters),

            isActive: computed(
              () =>
                crdRouteIsActive.get() &&
                matches(crdPathParameters, pathParameters.get()),
            ),

            isVisible: crdListRoute.isEnabled,
            orderNumber: 10,
          };
        });

        return [
          {
            id: `custom-resource-definition-group-${group}`,
            parentId: "custom-resources",
            title: group,
            onClick: noop,
            isVisible: computed(() => some(item => item.isVisible.get(), childItems)),
            orderNumber: 10,
          },

          ...childItems,
        ];
      });
    });
  },
});

export default sidebarItemsForDefinitionGroupsInjectable;
