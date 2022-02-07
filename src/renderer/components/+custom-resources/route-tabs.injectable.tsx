/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { comparer, computed, IComputedValue } from "mobx";
import React from "react";
import type { RouteComponentProps } from "react-router";
import type { RequireExactlyOne } from "type-fest";
import type { CustomResourceDefinition } from "../../../common/k8s-api/endpoints";
import { customResourceDefinitionsURL, customResourceDefinitionsRoute, CustomResourceDefinitionsRouteParams } from "../../../common/routes";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { CustomResourceDefinitions } from "./crd-list";
import { CustomResourceDefinitionObjectList } from "./crd-resources";
import groupedCustomResourceDefinitionsInjectable from "./grouped-custom-resources.injectable";

export interface CustomResourceTabLayoutRoute extends Omit<TabLayoutRoute, "component"> {
  id: string;
  component: React.ComponentType<RouteComponentProps<CustomResourceDefinitionsRouteParams>>;
}

export type CustomResourceGroupTabLayoutRoute = Omit<TabLayoutRoute, "component"> & {
  id: string;
} & RequireExactlyOne<{
  subRoutes: CustomResourceTabLayoutRoute[];
  component: React.ComponentType<{}>;
}>;

interface Dependencies {
  customResourcesDefinitions: IComputedValue<Map<string, CustomResourceDefinition[]>>;
}

function getRouteTabs({ customResourcesDefinitions }: Dependencies): IComputedValue<CustomResourceGroupTabLayoutRoute[]> {
  return computed(() => {
    const definitionsUrl = customResourceDefinitionsURL();

    const tabs: CustomResourceGroupTabLayoutRoute[] = [
      {
        id: "definitions",
        title: "Definitions",
        component: () => <CustomResourceDefinitions />,
        url: definitionsUrl,
        routePath: definitionsUrl,
        exact: true,
      },
    ];

    for (const [group, definitions] of customResourcesDefinitions.get()) {
      const groupUrl = customResourceDefinitionsURL({ params: { group }});

      tabs.push({
        id: `crd-group:${group}`,
        title: group,
        url: groupUrl,
        routePath: groupUrl,
        subRoutes: definitions.map(crd => ({
          id: `crd-resource:${crd.getResourceApiBase()}`,
          title: crd.getResourceKind(),
          url: crd.getResourceUrl(),
          routePath: customResourceDefinitionsRoute.path,
          component: (props) => <CustomResourceDefinitionObjectList {...props} />,
        })),
      });
    }

    return tabs;
  }, {
    equals: comparer.shallow,
  });
}

const customResourcesRouteTabsInjectable = getInjectable({
  instantiate: (di) => getRouteTabs({
    customResourcesDefinitions: di.inject(groupedCustomResourceDefinitionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default customResourcesRouteTabsInjectable;
