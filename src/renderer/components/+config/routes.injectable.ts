/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import { ConfigMaps } from "../+config-maps";
import { Secrets } from "../+secrets";
import { ResourceQuotas } from "../+resource-quotas";
import { PodDisruptionBudgets } from "../+pod-disruption-budgets";
import { HorizontalPodAutoscalers } from "../+autoscalers";
import { LimitRanges } from "../+limit-ranges";
import * as routes from "../../../common/routes";
import type { KubeResource } from "../../../common/rbac";
import type { TabLayoutRoute } from "../layout/tab-layout";

interface Dependencies {
  isAllowedResource: (resource: KubeResource) => boolean;
}

function getConfigRoutes({ isAllowedResource }: Dependencies): IComputedValue<TabLayoutRoute[]> {
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
  instantiate: (di) => getConfigRoutes({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default configRoutesInjectable;
