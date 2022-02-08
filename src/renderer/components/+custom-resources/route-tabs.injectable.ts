/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { CustomResourceDefinition } from "../../../common/k8s-api/endpoints";
import { crdURL, crdDefinitionsRoute } from "../../../common/routes";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { CrdList } from "./crd-list";
import { CrdResources } from "./crd-resources";
import groupedCustomResourceDefinitionsInjectable from "./grouped-custom-resources.injectable";

export interface CustomResourceTabLayoutRoute extends TabLayoutRoute {
  id: string;
}

export interface CustomResourceGroupTabLayoutRoute extends CustomResourceTabLayoutRoute {
  subRoutes?: CustomResourceTabLayoutRoute[];
}

interface Dependencies {
  customResourcesDefinitions: IComputedValue<Map<string, CustomResourceDefinition[]>>;
}

function getRouteTabs({ customResourcesDefinitions }: Dependencies) {
  return computed(() => {
    const tabs: CustomResourceGroupTabLayoutRoute[] = [
      {
        id: "definitions",
        title: "Definitions",
        component: CrdList,
        url: crdURL(),
        routePath: String(crdDefinitionsRoute.path),
        exact: true,
      },
    ];

    for (const [group, definitions] of customResourcesDefinitions.get()) {
      tabs.push({
        id: `crd-group:${group}`,
        title: group,
        routePath: crdURL({ query: { groups: group }}),
        component: CrdResources,
        subRoutes: definitions.map(crd => ({
          id: `crd-resource:${crd.getResourceApiBase()}`,
          title: crd.getResourceKind(),
          routePath: crd.getResourceUrl(),
          component: CrdResources,
        })),
      });
    }

    return tabs;
  });
}

const customResourcesRouteTabsInjectable = getInjectable({
  instantiate: (di) => getRouteTabs({
    customResourcesDefinitions: di.inject(groupedCustomResourceDefinitionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default customResourcesRouteTabsInjectable;
