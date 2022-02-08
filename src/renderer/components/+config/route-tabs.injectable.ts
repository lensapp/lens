/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { HorizontalPodAutoscalers } from "../+config-autoscalers";
import { LimitRanges } from "../+config-limit-ranges";
import { ConfigMaps } from "../+config-maps";
import { PodDisruptionBudgets } from "../+config-pod-disruption-budgets";
import { ResourceQuotas } from "../+config-resource-quotas";
import { Secrets } from "../+config-secrets";
import isAllowedResourceInjectable, { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import type { TabLayoutRoute } from "../layout/tab-layout";
import * as routes from "../../../common/routes";

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

function getRouteTabs({ isAllowedResource }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [];

    if (isAllowedResource("configmaps")) {
      tabs.push({
        title: "ConfigMaps",
        component: ConfigMaps,
        url: routes.configMapsURL(),
        routePath: routes.configMapsRoute.path.toString(),
      });
    }

    if (isAllowedResource("secrets")) {
      tabs.push({
        title: "Secrets",
        component: Secrets,
        url: routes.secretsURL(),
        routePath: routes.secretsRoute.path.toString(),
      });
    }

    if (isAllowedResource("resourcequotas")) {
      tabs.push({
        title: "Resource Quotas",
        component: ResourceQuotas,
        url: routes.resourceQuotaURL(),
        routePath: routes.resourceQuotaRoute.path.toString(),
      });
    }

    if (isAllowedResource("limitranges")) {
      tabs.push({
        title: "Limit Ranges",
        component: LimitRanges,
        url: routes.limitRangeURL(),
        routePath: routes.limitRangesRoute.path.toString(),
      });
    }

    if (isAllowedResource("horizontalpodautoscalers")) {
      tabs.push({
        title: "HPA",
        component: HorizontalPodAutoscalers,
        url: routes.hpaURL(),
        routePath: routes.hpaRoute.path.toString(),
      });
    }

    if (isAllowedResource("poddisruptionbudgets")) {
      tabs.push({
        title: "Pod Disruption Budgets",
        component: PodDisruptionBudgets,
        url: routes.pdbURL(),
        routePath: routes.pdbRoute.path.toString(),
      });
    }

    return tabs;
  });
}

const configRoutesInjectable = getInjectable({
  instantiate: (di) => getRouteTabs({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default configRoutesInjectable;
