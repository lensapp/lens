/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { ConfigMaps, configMapsRoute, configMapsURL } from "../+config-maps";
import { Secrets, secretsRoute, secretsURL } from "../+config-secrets";
import { resourceQuotaRoute, ResourceQuotas, resourceQuotaURL } from "../+config-resource-quotas";
import { pdbRoute, pdbURL, PodDisruptionBudgets } from "../+config-pod-disruption-budgets";
import { HorizontalPodAutoscalers, hpaRoute, hpaURL } from "../+config-autoscalers";
import { isAllowedResource } from "../../../common/rbac";
import { LimitRanges, limitRangesRoute, limitRangeURL } from "../+config-limit-ranges";

@observer
export class Config extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const routes: TabLayoutRoute[] = [];

    if (isAllowedResource("configmaps")) {
      routes.push({
        title: "ConfigMaps",
        component: ConfigMaps,
        url: configMapsURL(),
        routePath: configMapsRoute.path.toString(),
      });
    }

    if (isAllowedResource("secrets")) {
      routes.push({
        title: "Secrets",
        component: Secrets,
        url: secretsURL(),
        routePath: secretsRoute.path.toString(),
      });
    }

    if (isAllowedResource("resourcequotas")) {
      routes.push({
        title: "Resource Quotas",
        component: ResourceQuotas,
        url: resourceQuotaURL(),
        routePath: resourceQuotaRoute.path.toString(),
      });
    }

    if (isAllowedResource("limitranges")) {
      routes.push({
        title: "Limit Ranges",
        component: LimitRanges,
        url: limitRangeURL(),
        routePath: limitRangesRoute.path.toString(),
      });
    }

    if (isAllowedResource("horizontalpodautoscalers")) {
      routes.push({
        title: "HPA",
        component: HorizontalPodAutoscalers,
        url: hpaURL(),
        routePath: hpaRoute.path.toString(),
      });
    }

    if (isAllowedResource("poddisruptionbudgets")) {
      routes.push({
        title: "Pod Disruption Budgets",
        component: PodDisruptionBudgets,
        url: pdbURL(),
        routePath: pdbRoute.path.toString(),
      });
    }

    return routes;
  }

  render() {
    return (
      <TabLayout className="Config" tabs={Config.tabRoutes}/>
    );
  }
}
