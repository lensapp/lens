/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SidebarItemRegistration } from "@k8slens/cluster-sidebar";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import type { CustomResourceDefinition } from "@k8slens/kube-object";
import { iter, noop, computedAnd } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { matches } from "lodash";
import { computed } from "mobx";
import customResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources-route.injectable";
import navigateToCustomResourcesInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/navigate-to-custom-resources.injectable";
import { shouldShowResourceInjectionToken } from "../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import customResourcesSidebarItemInjectable from "../custom-resources/sidebar-item.injectable";
import customResourceDefinitionsInjectable from "./definitions.injectable";

const titleCaseSplitRegex = /(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/;

const formatResourceKind = (resourceKind: string) => (
  resourceKind.split(titleCaseSplitRegex).join(" ")
);

const customResourceDefinitionGroupsSidebarItemsComputedInjectable = getInjectable({
  id: "custom-resource-definition-groups-sidebar-items-computed",
  instantiate: (di) => {
    const customResourceDefinitions = di.inject(customResourceDefinitionsInjectable);
    const navigateToCustomResources = di.inject(navigateToCustomResourcesInjectable);
    const customResourcesRoute = di.inject(customResourcesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable, customResourcesRoute);

    const toCustomResourceGroupToSidebarItems = ([group, definitions]: [string, CustomResourceDefinition[]], index: number) => {
      const customResourceGroupSidebarItem = getInjectable({
        id: `sidebar-item-custom-resource-group-${group}`,
        instantiate: (): SidebarItemRegistration => ({
          parentId: customResourcesSidebarItemInjectable.id,
          onClick: noop,
          title: group.replaceAll(".", "\u200b."), // Replace dots with zero-width spaces to allow line breaks
          orderNumber: index + 1,
        }),
        injectionToken: sidebarItemInjectionToken,
      });
      const customResourceSidebarItems = definitions.map((definition, index) => {
        const parameters = {
          group: definition.getGroup(),
          name: definition.getPluralName(),
        };

        return getInjectable({
          id: `sidebar-item-custom-resource-group-${group}/${definition.getPluralName()}`,
          instantiate: (di): SidebarItemRegistration => ({
            parentId: customResourceGroupSidebarItem.id,
            onClick: () => navigateToCustomResources(parameters),
            title: formatResourceKind(definition.getResourceKind()),
            isActive: computedAnd(
              di.inject(routeIsActiveInjectable, customResourcesRoute),
              computed(() => matches(parameters)(pathParameters.get())),
            ),
            isVisible: di.inject(shouldShowResourceInjectionToken, {
              group: definition.getGroup(),
              apiName: definition.getPluralName(),
            }),
            orderNumber: index,
          }),
          injectionToken: sidebarItemInjectionToken,
        });
      });

      return [
        customResourceGroupSidebarItem,
        ...customResourceSidebarItems,
      ];
    };

    return computed(() => {
      const customResourceDefinitionGroups = (
        iter.chain(customResourceDefinitions.get().values())
          .map((crd) => [crd.getGroup(), crd] as const)
          .toMap()
      );

      return Array.from(customResourceDefinitionGroups.entries(), toCustomResourceGroupToSidebarItems)
        .flat();
    });
  },
});

export default customResourceDefinitionGroupsSidebarItemsComputedInjectable;
